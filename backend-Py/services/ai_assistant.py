import os
import re
import json
from typing import Optional, Dict, Any, Generator
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(override=True)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=True)

def clean_ai_text(text: str) -> str:
    if not text:
        return ""
    return text.strip()

def stream_ai_code_assistance(
    problem_title: str,
    problem_description: str,
    user_code: str,
    query_type: str = "hint",
    error_message: Optional[str] = None
) -> Generator[str, None, None]:
    """
    Streams intelligent AI guidance token chunks using Gemini:
    - 'hint': Progressive hint without revealing full solution.
    - 'explain': Algorithmic logic, structure, Big-O bounds.
    - 'debug': Diagnoses logic/syntax bugs with edge-case checks.
    - 'optimize': Memory/time bottlenecks and algorithmic optimization.
    """
    load_dotenv(override=True)
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=True)
    
    api_key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not configured.")

    genai.configure(api_key=api_key)

    if query_type == "hint":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Current Student Code:
```python
{user_code}
```

Task: Provide 2-3 progressive, intuitive hints to nudge the student in the right direction. 
Do NOT give away the full code solution. Focus on intuition, patterns, or data structures that can help them solve it themselves.
"""
    elif query_type == "explain":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Task: Provide a crystal clear, structured explanation of the optimal approach:
1. Core Intuition & Pattern (e.g. Two Pointers, Monotonic Stack, Sliding Window, DP)
2. Step-by-step algorithm walkthrough
3. Time Complexity and Space Complexity breakdown with mathematical reasoning
"""
    elif query_type == "debug":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Current Student Code:
```python
{user_code}
```

Failure / Error Information:
{error_message if error_message else "The code fails on some test cases or produces incorrect results."}

Task: Diagnose the student's code. 
- Point out the exact line(s) or logical flaw where the bug is occurring.
- Explain why it fails on edge cases.
- Explain how to correct the logic without rewriting the whole code.
"""
    elif query_type == "optimize":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Current Student Code:
```python
{user_code}
```

Task: Review the time and space complexity of this solution. 
Identify any inefficiencies, unnecessary allocations, or redundant loops, and describe how to optimize it to reach optimal Big-O bounds.
"""
    else:
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Code:
```python
{user_code}
```

Provide helpful guidance on how to solve or improve this problem.
"""

    models_to_try = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-flash-lite-latest",
    ]

    last_err = None
    for m in models_to_try:
        try:
            model = genai.GenerativeModel(m)
            response = model.generate_content(prompt, stream=True)
            for chunk in response:
                if hasattr(chunk, "text") and chunk.text:
                    yield chunk.text
                elif hasattr(chunk, "candidates") and chunk.candidates:
                    parts = chunk.candidates[0].content.parts
                    text = "".join(getattr(p, "text", "") for p in parts)
                    if text:
                        yield text
            return
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"AI Assistance streaming unavailable: {last_err}")


def get_ai_code_assistance(
    problem_title: str,
    problem_description: str,
    user_code: str,
    query_type: str = "hint",
    error_message: Optional[str] = None
) -> str:
    """
    Generates intelligent AI guidance using Gemini:
    - 'hint': Subtle progressive hint without revealing the complete solution.
    - 'explain': Algorithmic logic, data structures, Time & Space Complexity analysis.
    - 'debug': Diagnoses logic/syntax/runtime error in user's current code.
    - 'optimize': Suggestions to optimize time/space bottlenecks.
    """
    load_dotenv(override=True)
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=True)
    
    api_key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not configured.")

    genai.configure(api_key=api_key)

    system_instruction = "You are an elite DSA interviewer and coding mentor at a top tech company."
    
    if query_type == "hint":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Current Student Code:
```python
{user_code}
```

Task: Provide 2-3 progressive, intuitive hints to nudge the student in the right direction. 
Do NOT give away the full code solution. Focus on intuition, patterns, or data structures that can help them solve it themselves.
"""
    elif query_type == "explain":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Task: Provide a crystal clear, structured explanation of the optimal approach:
1. Core Intuition & Pattern (e.g. Two Pointers, Monotonic Stack, Sliding Window, DP)
2. Step-by-step algorithm walkthrough
3. Time Complexity and Space Complexity breakdown with mathematical reasoning
"""
    elif query_type == "debug":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Current Student Code:
```python
{user_code}
```

Failure / Error Information:
{error_message if error_message else "The code fails on some test cases or produces incorrect results."}

Task: Diagnose the student's code. 
- Point out the exact line(s) or logical flaw where the bug is occurring.
- Explain why it fails on edge cases.
- Explain how to correct the logic without rewriting the whole code.
"""
    elif query_type == "optimize":
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Current Student Code:
```python
{user_code}
```

Task: Review the time and space complexity of this solution. 
Identify any inefficiencies, unnecessary allocations, or redundant loops, and describe how to optimize it to reach optimal Big-O bounds.
"""
    else:
        prompt = f"""
Problem: {problem_title}
Description:
{problem_description}

Code:
```python
{user_code}
```

Provide helpful guidance on how to solve or improve this problem.
"""

    models_to_try = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-3.7-flash",
        "gemini-flash-lite-latest",
    ]

    last_err = None
    for m in models_to_try:
        try:
            model = genai.GenerativeModel(m)
            resp = model.generate_content(prompt)
            if hasattr(resp, "text") and resp.text:
                return clean_ai_text(resp.text)
            elif hasattr(resp, "candidates") and resp.candidates:
                parts = resp.candidates[0].content.parts
                return clean_ai_text("".join(getattr(p, "text", "") for p in parts))
        except Exception as e:
            last_err = e
            continue

    raise RuntimeError(f"AI Assistance service unavailable: {last_err}")
