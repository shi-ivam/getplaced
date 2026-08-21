import os
import sqlite3
import json
import math
import urllib.request
import pandas as pd
from typing import Optional, List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DB_PATH = os.path.join(DATA_DIR, "leetcode.db")
TRAIN_PARQUET = os.path.join(DATA_DIR, "leetcode_train.parquet")
TEST_PARQUET = os.path.join(DATA_DIR, "leetcode_test.parquet")

def format_title(task_id: str) -> str:
    """Converts slug 'two-sum' to 'Two Sum'."""
    return " ".join(word.capitalize() for word in task_id.split("-"))

def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM problems")
            count = cur.fetchone()[0]
            conn.close()
            if count > 0:
                return
        except Exception:
            pass

    print("[LeetCode Service] Initializing database from parquet dataset...")
    
    if not os.path.exists(TRAIN_PARQUET):
        print("[LeetCode Service] Downloading train parquet from Hugging Face...")
        urllib.request.urlretrieve(
            "https://huggingface.co/datasets/newfacade/LeetCodeDataset/resolve/refs%2Fconvert%2Fparquet/default/train/0000.parquet",
            TRAIN_PARQUET
        )
    if not os.path.exists(TEST_PARQUET):
        print("[LeetCode Service] Downloading test parquet from Hugging Face...")
        urllib.request.urlretrieve(
            "https://huggingface.co/datasets/newfacade/LeetCodeDataset/resolve/refs%2Fconvert%2Fparquet/default/test/0000.parquet",
            TEST_PARQUET
        )

    df_train = pd.read_parquet(TRAIN_PARQUET)
    df_test = pd.read_parquet(TEST_PARQUET)
    df = pd.concat([df_train, df_test], ignore_index=True).drop_duplicates(subset=["task_id"]).sort_values(by="question_id")

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS problems")
    cur.execute("""
        CREATE TABLE problems (
            id INTEGER PRIMARY KEY,
            task_id TEXT UNIQUE NOT NULL,
            question_id INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            tags TEXT NOT NULL,
            problem_description TEXT NOT NULL,
            starter_code TEXT NOT NULL,
            prompt TEXT NOT NULL,
            completion TEXT NOT NULL,
            entry_point TEXT NOT NULL,
            test TEXT NOT NULL,
            input_output TEXT NOT NULL,
            query TEXT,
            response TEXT
        )
    """)
    cur.execute("CREATE INDEX idx_task_id ON problems(task_id)")
    cur.execute("CREATE INDEX idx_question_id ON problems(question_id)")
    cur.execute("CREATE INDEX idx_difficulty ON problems(difficulty)")

    for _, row in df.iterrows():
        tags_json = json.dumps(list(row["tags"]) if hasattr(row["tags"], "__iter__") and not isinstance(row["tags"], str) else (json.loads(row["tags"]) if isinstance(row["tags"], str) and row["tags"].startswith("[") else []))
        io_json = json.dumps(list(row["input_output"]) if hasattr(row["input_output"], "__iter__") and not isinstance(row["input_output"], str) else (json.loads(row["input_output"]) if isinstance(row["input_output"], str) and row["input_output"].startswith("[") else []))
        
        cur.execute("""
            INSERT INTO problems (
                task_id, question_id, difficulty, tags, problem_description,
                starter_code, prompt, completion, entry_point, test, input_output, query, response
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            str(row["task_id"]),
            int(row["question_id"]),
            str(row["difficulty"]),
            tags_json,
            str(row["problem_description"]),
            str(row["starter_code"]),
            str(row["prompt"]),
            str(row["completion"]),
            str(row["entry_point"]),
            str(row["test"]),
            io_json,
            str(row.get("query", "") or ""),
            str(row.get("response", "") or "")
        ))

    conn.commit()
    conn.close()
    print(f"[LeetCode Service] Database ready with {len(df)} problems.")

def get_db_connection():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_problems(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    sort_by: str = "question_id",
    sort_order: str = "asc"
) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()

    conditions = []
    params = []

    if search and search.strip():
        raw_search = search.strip().lower()
        if raw_search.isdigit():
            # Match exact question number or id
            conditions.append("(question_id = ? OR id = ?)")
            params.extend([int(raw_search), int(raw_search)])
        else:
            # Multi-token search with space / hyphen flexibility
            s_wild = f"%{raw_search}%"
            s_hyphen = f"%{raw_search.replace(' ', '-')}%"
            s_space = f"%{raw_search.replace('-', ' ')}%"
            conditions.append("""(
                LOWER(task_id) LIKE ? OR 
                LOWER(task_id) LIKE ? OR 
                LOWER(tags) LIKE ? OR 
                LOWER(problem_description) LIKE ? OR
                LOWER(REPLACE(task_id, '-', ' ')) LIKE ?
            )""")
            params.extend([s_wild, s_hyphen, s_wild, s_wild, s_space])

    if difficulty and difficulty.lower() != "all":
        conditions.append("LOWER(difficulty) = ?")
        params.append(difficulty.strip().lower())

    if tag and tag.lower() != "all":
        conditions.append("LOWER(tags) LIKE ?")
        params.append(f"%\"{tag.strip().lower()}\"%")

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    # Total count query
    count_query = f"SELECT COUNT(*) FROM problems{where_clause}"
    cur.execute(count_query, params)
    total_count = cur.fetchone()[0]

    # Sorting
    allowed_sort = {
        "question_id": "question_id",
        "difficulty": "CASE LOWER(difficulty) WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 ELSE 4 END",
        "title": "task_id"
    }
    order_col = allowed_sort.get(sort_by, "question_id")
    order_dir = "DESC" if sort_order.lower() == "desc" else "ASC"

    # Pagination
    offset = max(0, (page - 1) * page_size)
    data_query = f"""
        SELECT id, task_id, question_id, difficulty, tags, SUBSTR(problem_description, 1, 180) as preview
        FROM problems
        {where_clause}
        ORDER BY {order_col} {order_dir}
        LIMIT ? OFFSET ?
    """
    cur.execute(data_query, params + [page_size, offset])
    rows = cur.fetchall()

    problems = []
    for r in rows:
        try:
            parsed_tags = json.loads(r["tags"])
        except Exception:
            parsed_tags = []
        problems.append({
            "id": r["id"],
            "task_id": r["task_id"],
            "question_id": r["question_id"],
            "title": format_title(r["task_id"]),
            "difficulty": r["difficulty"],
            "tags": parsed_tags,
            "preview": r["preview"].strip() + ("..." if len(r["preview"]) >= 180 else "")
        })

    conn.close()
    return {
        "problems": problems,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, math.ceil(total_count / page_size)) if total_count > 0 else 1
    }

def get_problem_by_slug_or_id(slug_or_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()

    if slug_or_id.isdigit():
        cur.execute("SELECT * FROM problems WHERE question_id = ? OR id = ?", (int(slug_or_id), int(slug_or_id)))
    else:
        cur.execute("SELECT * FROM problems WHERE task_id = ?", (slug_or_id.strip().lower(),))

    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    try:
        parsed_tags = json.loads(row["tags"])
    except Exception:
        parsed_tags = []

    try:
        parsed_io = json.loads(row["input_output"])
    except Exception:
        parsed_io = []

    return {
        "id": row["id"],
        "task_id": row["task_id"],
        "question_id": row["question_id"],
        "title": format_title(row["task_id"]),
        "difficulty": row["difficulty"],
        "tags": parsed_tags,
        "problem_description": row["problem_description"],
        "starter_code": row["starter_code"],
        "sample_test_cases": parsed_io[:10],
        "total_test_cases": len(parsed_io)
    }

def get_problem_internal(task_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM problems WHERE task_id = ?", (task_id.strip().lower(),))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def get_tags() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT tags FROM problems")
    rows = cur.fetchall()
    conn.close()

    tag_counts: Dict[str, int] = {}
    for r in rows:
        try:
            tags = json.loads(r["tags"])
            for t in tags:
                if t:
                    tag_counts[t] = tag_counts.get(t, 0) + 1
        except Exception:
            continue

    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    return [{"tag": t[0], "count": t[1]} for t in sorted_tags]

def get_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM problems")
    total = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM problems WHERE LOWER(difficulty) = 'easy'")
    easy = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM problems WHERE LOWER(difficulty) = 'medium'")
    medium = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM problems WHERE LOWER(difficulty) = 'hard'")
    hard = cur.fetchone()[0]

    conn.close()
    return {
        "total": total,
        "easy": easy,
        "medium": medium,
        "hard": hard
    }

def get_solution(task_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT task_id, question_id, difficulty, tags, starter_code, completion, query, response FROM problems WHERE task_id = ?", (task_id.strip().lower(),))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None

    try:
        parsed_tags = json.loads(row["tags"])
    except Exception:
        parsed_tags = []

    return {
        "task_id": row["task_id"],
        "question_id": row["question_id"],
        "title": format_title(row["task_id"]),
        "difficulty": row["difficulty"],
        "tags": parsed_tags,
        "starter_code": row["starter_code"],
        "completion": row["completion"],
        "explanation": row["response"] if row["response"] else "Optimal solution provided in completion code."
    }

def get_random_problem(difficulty: Optional[str] = None, tag: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()

    conditions = []
    params = []
    if difficulty and difficulty.lower() != "all":
        conditions.append("LOWER(difficulty) = ?")
        params.append(difficulty.strip().lower())
    if tag and tag.lower() != "all":
        conditions.append("LOWER(tags) LIKE ?")
        params.append(f"%\"{tag.strip().lower()}\"%")

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""
    query = f"SELECT task_id, question_id FROM problems{where_clause} ORDER BY RANDOM() LIMIT 1"
    cur.execute(query, params)
    row = cur.fetchone()
    conn.close()

    if row:
        return {"task_id": row["task_id"], "question_id": row["question_id"], "title": format_title(row["task_id"])}
    return None
