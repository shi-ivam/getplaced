import sys
import time
import json
import subprocess
import os
import re
from typing import Dict, Any, List, Optional

EXECUTION_TIMEOUT = 4.0  # seconds

def extract_syntax_error(stderr_str: str) -> str:
    """Extracts concise syntax or runtime error message."""
    lines = [l for l in stderr_str.strip().split("\n") if l.strip()]
    if not lines:
        return "Unknown error occurred during execution."
    return "\n".join(lines[-4:])

def run_sample_tests(
    problem_data: Dict[str, Any],
    user_code: str,
    custom_cases: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    prompt = problem_data.get("prompt", "")
    entry_point = problem_data.get("entry_point", "Solution().solve")
    starter_code = problem_data.get("starter_code", "")
    
    test_cases_to_run = []
    if custom_cases and len(custom_cases) > 0:
        test_cases_to_run = custom_cases[:5]
    else:
        try:
            raw_io = problem_data.get("input_output", "[]")
            io_list = json.loads(raw_io) if isinstance(raw_io, str) else raw_io
            test_cases_to_run = io_list[:4] # Up to 4 sample cases
        except Exception:
            test_cases_to_run = []

    if not test_cases_to_run:
        return {
            "status": "Success",
            "results": [],
            "message": "No sample test cases available to run."
        }

    is_list_node = "ListNode" in starter_code
    is_tree_node = "TreeNode" in starter_code

    # Preprocess test cases
    processed_cases = []
    for tc in test_cases_to_run:
        inp = tc.get("input", "")
        out = tc.get("output", "")
        call_expr = inp
        if is_list_node:
            call_expr = re.sub(r'=\s*(\[[^\]]*\])', r'= list_node(\1)', call_expr)
        if is_tree_node:
            call_expr = re.sub(r'=\s*(\[[^\]]*\])', r'= tree_node(\1)', call_expr)
        
        processed_cases.append({
            "original_input": inp,
            "call_expr": call_expr,
            "expected_output": out
        })

    cases_json = json.dumps(processed_cases)

    script_content = f"""
import sys, io, time, json, traceback
from collections import deque

null = None
true = True
false = False

{prompt}

# User code
{user_code}

test_cases = {cases_json}
results = []
all_passed = True

candidate = {entry_point}

def serialize_result(val):
    if val is None:
        return "None"
    if hasattr(val, "val") and hasattr(val, "next"):
        curr = val
        items = []
        visited = set()
        while curr and id(curr) not in visited and len(items) < 500:
            visited.add(id(curr))
            items.append(curr.val)
            curr = curr.next
        return str(items)
    if hasattr(val, "val") and hasattr(val, "left") and hasattr(val, "right"):
        res = []
        q = deque([val])
        while q:
            node = q.popleft()
            if node:
                res.append(node.val)
                q.append(node.left)
                q.append(node.right)
            else:
                res.append(None)
        while res and res[-1] is None:
            res.pop()
        return str(res)
    if isinstance(val, (list, tuple)):
        return str(list(val))
    return str(val)

def normalize_compare(actual_val, expected_str, formatted_actual):
    exp_clean = expected_str.strip()
    if exp_clean in ["None", "null", "none"]:
        return actual_val is None or actual_val == [] or formatted_actual in ["None", "[]", "null"]
    if exp_clean == "[]" and (actual_val == [] or actual_val is None or formatted_actual in ["[]", "None"]):
        return True
    if exp_clean.lower() in ["true", "false"]:
        return str(actual_val).lower() == exp_clean.lower()
    
    act_str = str(formatted_actual).strip()
    if act_str == exp_clean or act_str.replace(" ", "") == exp_clean.replace(" ", ""):
        return True
    try:
        exp_eval_str = exp_clean.replace("null", "None").replace("true", "True").replace("false", "False")
        act_eval_str = act_str.replace("null", "None").replace("true", "True").replace("false", "False")
        exp_eval = eval(exp_eval_str)
        act_eval = eval(act_eval_str)
        if act_eval == exp_eval:
            return True
        if isinstance(act_eval, (float, int)) and isinstance(exp_eval, (float, int)):
            if abs(float(act_eval) - float(exp_eval)) < 1e-5:
                return True
        if isinstance(act_eval, list) and isinstance(exp_eval, list):
            if sorted(str(x) for x in act_eval) == sorted(str(x) for x in exp_eval):
                return True
    except Exception:
        pass
    return False

for idx, tc in enumerate(test_cases):
    inp_orig = tc.get('original_input', '')
    call_expr = tc.get('call_expr', '')
    exp_str = tc.get('expected_output', '')
    
    old_stdout = sys.stdout
    capture_out = io.StringIO()
    sys.stdout = capture_out
    
    t0 = time.time()
    res_entry = {{
        'case_index': idx + 1,
        'input': inp_orig,
        'expected': exp_str,
        'actual': None,
        'passed': False,
        'stdout': '',
        'runtime_ms': 0,
        'error': None
    }}
    
    try:
        call_code = f"candidate({{call_expr}})"
        call_scope = {{
            'candidate': candidate,
            'list_node': globals().get('list_node'),
            'tree_node': globals().get('tree_node'),
            'ListNode': globals().get('ListNode'),
            'TreeNode': globals().get('TreeNode'),
            'is_same_list': globals().get('is_same_list'),
            'is_same_tree': globals().get('is_same_tree'),
            'null': None,
            'true': True,
            'false': False,
            'None': None,
            'True': True,
            'False': False,
        }}
        
        actual_val = eval(call_code, globals(), call_scope)
        elapsed_ms = round((time.time() - t0) * 1000, 2)
        
        formatted_actual = serialize_result(actual_val)
        res_entry['actual'] = formatted_actual
        res_entry['runtime_ms'] = elapsed_ms
        
        is_match = normalize_compare(actual_val, exp_str, formatted_actual)
        res_entry['passed'] = is_match
        if not is_match:
            all_passed = False
            
    except Exception as e:
        elapsed_ms = round((time.time() - t0) * 1000, 2)
        res_entry['runtime_ms'] = elapsed_ms
        res_entry['error'] = str(e)
        res_entry['passed'] = False
        all_passed = False
    finally:
        sys.stdout = old_stdout
        res_entry['stdout'] = capture_out.getvalue()
        results.append(res_entry)

print("__TEST_RESULTS_JSON_START__")
print(json.dumps({{'results': results, 'all_passed': all_passed}}))
print("__TEST_RESULTS_JSON_END__")
"""

    t_start = time.time()
    try:
        proc = subprocess.run(
            [sys.executable, "-c", script_content],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT
        )
        total_time_ms = round((time.time() - t_start) * 1000, 2)

        stdout = proc.stdout
        stderr = proc.stderr

        if "__TEST_RESULTS_JSON_START__" in stdout:
            json_part = stdout.split("__TEST_RESULTS_JSON_START__")[1].split("__TEST_RESULTS_JSON_END__")[0].strip()
            parsed = json.loads(json_part)
            passed_cases = sum(1 for r in parsed["results"] if r.get("passed"))
            total_cases = len(parsed["results"])
            
            return {
                "status": "Success" if parsed.get("all_passed") else "Wrong Answer",
                "all_passed": parsed.get("all_passed", False),
                "passed_count": passed_cases,
                "total_count": total_cases,
                "total_time_ms": total_time_ms,
                "results": parsed["results"]
            }
        else:
            error_msg = extract_syntax_error(stderr or stdout)
            return {
                "status": "Compile / Runtime Error",
                "all_passed": False,
                "passed_count": 0,
                "total_count": len(test_cases_to_run),
                "total_time_ms": total_time_ms,
                "error": error_msg,
                "results": []
            }
    except subprocess.TimeoutExpired:
        return {
            "status": "Time Limit Exceeded",
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases_to_run),
            "total_time_ms": round(EXECUTION_TIMEOUT * 1000, 2),
            "error": f"Time Limit Exceeded: Execution took longer than {EXECUTION_TIMEOUT}s.",
            "results": []
        }
    except Exception as e:
        return {
            "status": "Internal Error",
            "all_passed": False,
            "passed_count": 0,
            "total_count": len(test_cases_to_run),
            "error": str(e),
            "results": []
        }

def submit_solution(
    problem_data: Dict[str, Any],
    user_code: str
) -> Dict[str, Any]:
    prompt = problem_data.get("prompt", "")
    test_code = problem_data.get("test", "")
    entry_point = problem_data.get("entry_point", "Solution().solve")

    assert_lines = [l for l in test_code.split("\n") if l.strip().startswith("assert ")]
    total_assertions = len(assert_lines) if assert_lines else 1

    script_content = f"""
import sys, io, time, traceback, resource

null = None
true = True
false = False

{prompt}

# User solution code
{user_code}

candidate = {entry_point}

# Test suite from dataset
{test_code}

t0 = time.time()
try:
    check(candidate)
    elapsed_ms = round((time.time() - t0) * 1000, 2)
    mem_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    mem_mb = round(mem_kb / 1024.0, 2)
    print("__SUBMISSION_SUCCESS__" + str(elapsed_ms) + "__" + str({total_assertions}) + "__" + str(mem_mb))
except AssertionError as e:
    tb = traceback.format_exc()
    lines = [l.strip() for l in tb.split("\\n") if l.strip()]
    failed_assert = lines[-2] if len(lines) >= 2 else "Assertion failed"
    print("__ASSERTION_FAILED__" + str(failed_assert))
except Exception as e:
    tb = traceback.format_exc()
    lines = [l.strip() for l in tb.split("\\n") if l.strip()]
    err = lines[-1] if lines else str(e)
    print("__RUNTIME_ERROR__" + str(err))
"""

    t_start = time.time()
    try:
        proc = subprocess.run(
            [sys.executable, "-c", script_content],
            capture_output=True,
            text=True,
            timeout=EXECUTION_TIMEOUT
        )
        total_time_ms = round((time.time() - t_start) * 1000, 2)

        stdout = proc.stdout
        stderr = proc.stderr

        if "__SUBMISSION_SUCCESS__" in stdout:
            parts = stdout.split("__SUBMISSION_SUCCESS__")[1].strip().split("__")
            run_ms = float(parts[0]) if len(parts) > 0 and parts[0] else total_time_ms
            passed = int(parts[1]) if len(parts) > 1 and parts[1] else total_assertions
            if len(parts) > 2 and parts[2]:
                memory_mb = float(parts[2])
            else:
                import resource
                memory_mb = round(resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss / 1024.0, 2)
            
            beats_runtime = round(max(60.0, min(99.4, 100.0 - (run_ms / 50.0) * 20.0)), 1)
            
            return {
                "status": "Accepted",
                "passed_count": passed,
                "total_count": passed,
                "runtime_ms": run_ms,
                "beats_runtime_pct": beats_runtime,
                "memory_mb": memory_mb,
                "error": None
            }
        elif "__ASSERTION_FAILED__" in stdout:
            failed_msg = stdout.split("__ASSERTION_FAILED__")[1].strip()
            return {
                "status": "Wrong Answer",
                "passed_count": 0,
                "total_count": total_assertions,
                "runtime_ms": total_time_ms,
                "error": f"Failed on test assertion: {failed_msg}"
            }
        elif "__RUNTIME_ERROR__" in stdout:
            err_msg = stdout.split("__RUNTIME_ERROR__")[1].strip()
            return {
                "status": "Runtime Error",
                "passed_count": 0,
                "total_count": total_assertions,
                "runtime_ms": total_time_ms,
                "error": err_msg
            }
        else:
            err = extract_syntax_error(stderr or stdout)
            return {
                "status": "Compile / Runtime Error",
                "passed_count": 0,
                "total_count": total_assertions,
                "runtime_ms": total_time_ms,
                "error": err
            }
    except subprocess.TimeoutExpired:
        return {
            "status": "Time Limit Exceeded",
            "passed_count": 0,
            "total_count": total_assertions,
            "runtime_ms": round(EXECUTION_TIMEOUT * 1000, 2),
            "error": f"Time Limit Exceeded: Execution took longer than {EXECUTION_TIMEOUT}s."
        }
    except Exception as e:
        return {
            "status": "Internal Error",
            "passed_count": 0,
            "total_count": total_assertions,
            "runtime_ms": 0,
            "error": str(e)
        }
