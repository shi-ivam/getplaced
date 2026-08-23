import os
import sqlite3
import json
import re
from typing import Optional, List, Dict, Any

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
ARTICLES_DB_PATH = os.path.join(DATA_DIR, "articles.db")
LEETCODE_DB_PATH = os.path.join(DATA_DIR, "leetcode.db")
MASTER_JSON_PATH = os.path.join(DATA_DIR, "takeuforward_sheets_and_playlists.json")
SUMMARY_JSON_PATH = os.path.join(DATA_DIR, "takeuforward_summary.json")

_CACHED_MASTER_DATA = None
_CACHED_LEETCODE_SLUGS = None


def get_articles_db():
    conn = sqlite3.connect(ARTICLES_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_leetcode_slugs() -> set:
    global _CACHED_LEETCODE_SLUGS
    if _CACHED_LEETCODE_SLUGS is not None:
        return _CACHED_LEETCODE_SLUGS

    slugs = set()
    if os.path.exists(LEETCODE_DB_PATH):
        try:
            conn = sqlite3.connect(LEETCODE_DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT task_id FROM problems")
            slugs = set(r[0] for r in cur.fetchall())
            conn.close()
        except Exception as e:
            print(f"Error loading leetcode slugs: {e}")
    _CACHED_LEETCODE_SLUGS = slugs
    return slugs


def get_master_data() -> Dict[str, Any]:
    global _CACHED_MASTER_DATA
    if _CACHED_MASTER_DATA is not None:
        return _CACHED_MASTER_DATA

    if os.path.exists(MASTER_JSON_PATH):
        with open(MASTER_JSON_PATH, "r", encoding="utf-8") as f:
            _CACHED_MASTER_DATA = json.load(f)
            return _CACHED_MASTER_DATA

    return {}


def extract_leetcode_slug(url: Optional[str]) -> Optional[str]:
    if not url or url == "$undefined" or "leetcode.com/problems/" not in url:
        return None
    try:
        part = url.split("leetcode.com/problems/")[1]
        slug = part.strip("/").split("?")[0].split("/")[0].strip()
        return slug if slug else None
    except Exception:
        return None


def get_all_sheets_overview() -> Dict[str, Any]:
    master = get_master_data()
    lc_slugs = get_leetcode_slugs()

    categories_meta = [
        {"id": "dsa_sheets", "title": "DSA Sheets", "description": "Curated interview prep & mastery sheets by Striver", "badge": "Core"},
        {"id": "dsa_playlists", "title": "DSA Topic Playlists", "description": "Focused deep-dive pathways by algorithmic topic", "badge": "Playlists"},
        {"id": "tuf_plus_courses", "title": "TUF+ Comprehensive Courses", "description": "Full end-to-end curriculums for DSA, LLD, OOPS, SQL & Core CS", "badge": "Mastery"},
        {"id": "core_cs_subjects", "title": "Core CS Subjects", "description": "Operating Systems, DBMS, and Computer Networks interview questions", "badge": "CS Fundamentals"},
        {"id": "system_design", "title": "System Design", "description": "Complete High Level Design (HLD) roadmap with architecture deep-dives", "badge": "Architecture"},
        {"id": "competitive_programming", "title": "Competitive Programming", "description": "Advanced CP patterns and constructive problem solving", "badge": "Advanced"},
    ]

    grouped_results = []
    total_sheets_count = 0
    total_problems_count = 0
    total_ide_runnable = 0

    for cat_meta in categories_meta:
        cat_key = cat_meta["id"]
        lists = master.get(cat_key, [])
        sheets_list = []

        for item in lists:
            sheet_id = item.get("id")
            sheet_title = item.get("title")
            sheet_type = item.get("type", "sheet")
            sheet_desc = item.get("description", "")
            sections = item.get("sections", [])

            easy_count = 0
            medium_count = 0
            hard_count = 0
            ide_runnable_count = 0
            items_count = 0

            for sec in sections:
                probs = []
                if "subcategories" in sec:
                    for sub in sec["subcategories"]:
                        probs.extend(sub.get("problems", []))
                if "problems" in sec:
                    probs.extend(sec["problems"])

                for p in probs:
                    items_count += 1
                    diff = str(p.get("difficulty", "")).lower()
                    if "easy" in diff:
                        easy_count += 1
                    elif "medium" in diff:
                        medium_count += 1
                    elif "hard" in diff:
                        hard_count += 1

                    lc_slug = extract_leetcode_slug(p.get("leetcode_url"))
                    if lc_slug and lc_slug in lc_slugs:
                        ide_runnable_count += 1

            total_sheets_count += 1
            total_problems_count += items_count
            total_ide_runnable += ide_runnable_count

            sheets_list.append({
                "id": sheet_id,
                "title": sheet_title,
                "name": sheet_title,
                "type": sheet_type,
                "category_id": cat_key,
                "categoryId": cat_key,
                "category_title": cat_meta["title"],
                "categoryTitle": cat_meta["title"],
                "category_name": cat_meta["title"],
                "categoryName": cat_meta["title"],
                "description": sheet_desc,
                "total_sections": len(sections),
                "sections_count": len(sections),
                "sectionsCount": len(sections),
                "topics_count": len(sections),
                "topicsCount": len(sections),
                "total_items": items_count,
                "total_problems": items_count,
                "problems_count": items_count,
                "problemsCount": items_count,
                "stats": {
                    "total_problems": items_count,
                    "total_subsections": len(sections),
                    "total_sections": len(sections),
                    "topics_count": len(sections),
                    "easy": easy_count,
                    "medium": medium_count,
                    "hard": hard_count,
                },
                "difficulty_breakdown": {
                    "easy": easy_count,
                    "medium": medium_count,
                    "hard": hard_count,
                    "other": max(0, items_count - (easy_count + medium_count + hard_count))
                },
                "ide_runnable_count": ide_runnable_count,
                "ideRunnableCount": ide_runnable_count,
                "original_url": item.get("url")
            })

        grouped_results.append({
            **cat_meta,
            "name": cat_meta["title"],
            "sheets_count": len(sheets_list),
            "sheetsCount": len(sheets_list),
            "sheets": sheets_list
        })

    return {
        "summary": {
            "total_sheets": total_sheets_count,
            "total_problems_and_topics": total_problems_count,
            "total_ide_runnable": total_ide_runnable,
            "total_articles": 2088
        },
        "categories": grouped_results
    }


def get_sheet_details(sheet_id: str) -> Optional[Dict[str, Any]]:
    master = get_master_data()
    lc_slugs = get_leetcode_slugs()

    found_sheet = None
    category_id = None
    category_title = None

    categories = ["dsa_sheets", "core_cs_subjects", "system_design", "competitive_programming", "dsa_playlists", "tuf_plus_courses"]
    for cat in categories:
        for item in master.get(cat, []):
            if item.get("id") == sheet_id:
                found_sheet = item
                category_id = cat
                category_title = cat.replace("_", " ").title()
                break
        if found_sheet:
            break

    if not found_sheet:
        return None

    enriched_sections = []
    total_problems = 0
    easy_count = 0
    medium_count = 0
    hard_count = 0
    ide_runnable_count = 0

    for sec in found_sheet.get("sections", []):
        sec_copy = {
            "section_id": sec.get("section_id"),
            "section_name": sec.get("section_name"),
            "sectionName": sec.get("section_name")
        }

        if "subcategories" in sec:
            subcats = []
            for sub in sec["subcategories"]:
                sub_probs = []
                for p in sub.get("problems", []):
                    total_problems += 1
                    diff = str(p.get("difficulty", "Easy")).capitalize()
                    if "easy" in diff.lower():
                        easy_count += 1
                    elif "medium" in diff.lower():
                        medium_count += 1
                    elif "hard" in diff.lower():
                        hard_count += 1

                    lc_slug = extract_leetcode_slug(p.get("leetcode_url"))
                    is_runnable = bool(lc_slug and lc_slug in lc_slugs)
                    if is_runnable:
                        ide_runnable_count += 1

                    practice_link = p.get("practice_url") or p.get("link") or p.get("leetcode_url")

                    sub_probs.append({
                        "problem_id": p.get("problem_id"),
                        "problemId": p.get("problem_id"),
                        "problem_name": p.get("problem_name"),
                        "problemName": p.get("problem_name"),
                        "title": p.get("problem_name"),
                        "difficulty": diff if diff and diff != "$undefined" else "Medium",
                        "article_slug": p.get("article_slug"),
                        "articleSlug": p.get("article_slug"),
                        "has_article": bool(p.get("article_slug")),
                        "hasArticle": bool(p.get("article_slug")),
                        "youtube_url": None if p.get("youtube_url") == "$undefined" else p.get("youtube_url"),
                        "youtubeUrl": None if p.get("youtube_url") == "$undefined" else p.get("youtube_url"),
                        "leetcode_url": None if p.get("leetcode_url") == "$undefined" else p.get("leetcode_url"),
                        "leetcodeUrl": None if p.get("leetcode_url") == "$undefined" else p.get("leetcode_url"),
                        "leetcode_slug": lc_slug,
                        "leetcodeSlug": lc_slug,
                        "is_ide_runnable": is_runnable,
                        "isIdeRunnable": is_runnable,
                        "codeforces_url": p.get("codeforces_url"),
                        "practice_url": practice_link,
                        "practiceUrl": practice_link,
                        "problem_url": practice_link,
                        "plus_url": p.get("plus_url"),
                        "editorial_url": p.get("editorial_url"),
                        "problem_type": p.get("problem_type", "problem")
                    })

                subcats.append({
                    "subcategory_id": sub.get("subcategory_id"),
                    "subcategory_name": sub.get("subcategory_name"),
                    "subcategoryName": sub.get("subcategory_name"),
                    "problems_count": len(sub_probs),
                    "problemsCount": len(sub_probs),
                    "problems": sub_probs
                })
            sec_copy["subcategories"] = subcats
            sec_copy["problems_count"] = sum(s["problems_count"] for s in subcats)
            sec_copy["problemsCount"] = sec_copy["problems_count"]

        elif "problems" in sec:
            direct_probs = []
            for p in sec["problems"]:
                total_problems += 1
                diff = str(p.get("difficulty", "Easy")).capitalize()
                if "easy" in diff.lower():
                    easy_count += 1
                elif "medium" in diff.lower():
                    medium_count += 1
                elif "hard" in diff.lower():
                    hard_count += 1

                lc_slug = extract_leetcode_slug(p.get("leetcode_url"))
                is_runnable = bool(lc_slug and lc_slug in lc_slugs)
                if is_runnable:
                    ide_runnable_count += 1

                practice_link = p.get("practice_url") or p.get("link") or p.get("leetcode_url")

                direct_probs.append({
                    "problem_id": p.get("problem_id"),
                    "problemId": p.get("problem_id"),
                    "problem_name": p.get("problem_name"),
                    "problemName": p.get("problem_name"),
                    "title": p.get("problem_name"),
                    "difficulty": diff if diff and diff != "$undefined" else "Medium",
                    "article_slug": p.get("article_slug"),
                    "articleSlug": p.get("article_slug"),
                    "has_article": bool(p.get("article_slug")),
                    "hasArticle": bool(p.get("article_slug")),
                    "youtube_url": None if p.get("youtube_url") == "$undefined" else p.get("youtube_url"),
                    "youtubeUrl": None if p.get("youtube_url") == "$undefined" else p.get("youtube_url"),
                    "leetcode_url": None if p.get("leetcode_url") == "$undefined" else p.get("leetcode_url"),
                    "leetcodeUrl": None if p.get("leetcode_url") == "$undefined" else p.get("leetcode_url"),
                    "leetcode_slug": lc_slug,
                    "leetcodeSlug": lc_slug,
                    "is_ide_runnable": is_runnable,
                    "isIdeRunnable": is_runnable,
                    "codeforces_url": p.get("codeforces_url"),
                    "practice_url": practice_link,
                    "practiceUrl": practice_link,
                    "problem_url": practice_link,
                    "plus_url": p.get("plus_url"),
                    "editorial_url": p.get("editorial_url"),
                    "problem_type": p.get("problem_type", "problem")
                })
            sec_copy["problems"] = direct_probs
            sec_copy["problems_count"] = len(direct_probs)
            sec_copy["problemsCount"] = len(direct_probs)

        enriched_sections.append(sec_copy)

    sheet_title = found_sheet.get("title")
    return {
        "id": found_sheet.get("id"),
        "title": sheet_title,
        "name": sheet_title,
        "type": found_sheet.get("type", "sheet"),
        "category_id": category_id,
        "categoryId": category_id,
        "category_title": category_title,
        "categoryTitle": category_title,
        "category_name": category_title,
        "categoryName": category_title,
        "description": found_sheet.get("description", ""),
        "total_sections": len(enriched_sections),
        "sections_count": len(enriched_sections),
        "sectionsCount": len(enriched_sections),
        "topics_count": len(enriched_sections),
        "topicsCount": len(enriched_sections),
        "total_problems": total_problems,
        "problems_count": total_problems,
        "problemsCount": total_problems,
        "total_items": total_problems,
        "stats": {
            "total_problems": total_problems,
            "total_subsections": len(enriched_sections),
            "total_sections": len(enriched_sections),
            "topics_count": len(enriched_sections),
            "easy": easy_count,
            "medium": medium_count,
            "hard": hard_count,
        },
        "difficulty_breakdown": {
            "easy": easy_count,
            "medium": medium_count,
            "hard": hard_count,
            "other": max(0, total_problems - (easy_count + medium_count + hard_count))
        },
        "ide_runnable_count": ide_runnable_count,
        "ideRunnableCount": ide_runnable_count,
        "original_url": found_sheet.get("url"),
        "sections": enriched_sections
    }


def get_article_content(slug_or_id: str) -> Optional[Dict[str, Any]]:
    conn = get_articles_db()
    cur = conn.cursor()

    article = None
    if slug_or_id.isdigit():
        cur.execute("SELECT * FROM articles WHERE id = ?", (int(slug_or_id),))
        row = cur.fetchone()
        if row:
            article = dict(row)
    
    if not article:
        cur.execute("SELECT * FROM articles WHERE slug = ?", (slug_or_id,))
        row = cur.fetchone()
        if row:
            article = dict(row)

    if not article:
        # Check by problem_name or article_slug in problems table
        try:
            cur.execute("""
                SELECT article_slug FROM problems 
                WHERE (problem_name = ? OR problem_id = ? OR article_slug = ?) 
                  AND article_slug IS NOT NULL AND article_slug != '' 
                LIMIT 1
            """, (slug_or_id, slug_or_id, slug_or_id))
            p_row = cur.fetchone()
            if p_row and p_row[0]:
                cur.execute("SELECT * FROM articles WHERE slug = ?", (p_row[0],))
                row = cur.fetchone()
                if row:
                    article = dict(row)
        except Exception:
            pass

    if not article:
        cur.execute("SELECT * FROM articles WHERE slug LIKE ? OR title LIKE ? LIMIT 1", (f"%{slug_or_id}%", f"%{slug_or_id}%"))
        row = cur.fetchone()
        if row:
            article = dict(row)

    if not article:
        conn.close()
        return None

    code_snippets = {}
    if article.get("code_snippets_json"):
        try:
            code_snippets = json.loads(article["code_snippets_json"])
        except Exception:
            code_snippets = {}

    cur.execute("""
        SELECT problem_name, sheet_title, sheet_id, section_name, difficulty, youtube_url, leetcode_url
        FROM problems
        WHERE article_slug = ? OR article_id = ?
    """, (article["slug"], article["id"]))
    related_probs = [dict(r) for r in cur.fetchall()]

    conn.close()

    lc_slugs = get_leetcode_slugs()
    for rp in related_probs:
        slug = extract_leetcode_slug(rp.get("leetcode_url"))
        rp["leetcode_slug"] = slug
        rp["leetcodeSlug"] = slug
        rp["is_ide_runnable"] = bool(slug and slug in lc_slugs)
        rp["isIdeRunnable"] = bool(slug and slug in lc_slugs)

    return {
        "id": article["id"],
        "slug": article["slug"],
        "article_slug": article["slug"],
        "articleSlug": article["slug"],
        "title": article["title"],
        "problem_title": article["title"],
        "problemTitle": article["title"],
        "category": article["category"],
        "original_url": article["original_url"],
        "summary": article["summary"],
        "problem_statement": article["problem_statement"],
        "problemStatement": article["problem_statement"],
        "content_markdown": article["content_markdown"],
        "contentMarkdown": article["content_markdown"],
        "code_snippets": code_snippets,
        "codeSnippets": code_snippets,
        "related_problems": related_probs,
        "relatedProblems": related_probs
    }


def search_all_problems(
    query: str = "",
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    sheet_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 25
) -> Dict[str, Any]:
    conn = get_articles_db()
    cur = conn.cursor()

    conditions = []
    params = []

    if query and query.strip():
        q_wild = f"%{query.strip()}%"
        conditions.append("(p.problem_name LIKE ? OR p.sheet_title LIKE ? OR p.section_name LIKE ? OR p.article_slug LIKE ?)")
        params.extend([q_wild, q_wild, q_wild, q_wild])

    if difficulty and difficulty.lower() != "all":
        conditions.append("LOWER(p.difficulty) = ?")
        params.append(difficulty.strip().lower())

    if sheet_id and sheet_id.lower() != "all":
        conditions.append("p.sheet_id = ?")
        params.append(sheet_id.strip())

    where_clause = " WHERE " + " AND ".join(conditions) if conditions else ""

    count_sql = f"SELECT COUNT(*) FROM problems p{where_clause}"
    cur.execute(count_sql, params)
    total_count = cur.fetchone()[0]

    offset = max(0, (page - 1) * page_size)
    data_sql = f"""
        SELECT p.*
        FROM problems p
        {where_clause}
        ORDER BY p.id ASC
        LIMIT ? OFFSET ?
    """
    cur.execute(data_sql, params + [page_size, offset])
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    lc_slugs = get_leetcode_slugs()
    results = []
    for r in rows:
        slug = extract_leetcode_slug(r.get("leetcode_url"))
        topic_title = r["section_name"] or r["subcategory_name"] or "General"
        practice_url = r.get("practice_url") or r.get("leetcode_url")

        results.append({
            "id": r["id"],
            "problem_id": r["problem_id"],
            "problemId": r["problem_id"],
            "problem_name": r["problem_name"],
            "problemName": r["problem_name"],
            "title": r["problem_name"],
            "sheet_id": r["sheet_id"],
            "sheetId": r["sheet_id"],
            "sheet_title": r["sheet_title"],
            "sheetTitle": r["sheet_title"],
            "sheet_name": r["sheet_title"],
            "sheetName": r["sheet_title"],
            "section_name": r["section_name"],
            "sectionName": r["section_name"],
            "subcategory_name": r["subcategory_name"],
            "subcategoryName": r["subcategory_name"],
            "topic_title": topic_title,
            "topicTitle": topic_title,
            "category": topic_title,
            "difficulty": r["difficulty"] if r["difficulty"] != "$undefined" else "Medium",
            "article_slug": r["article_slug"],
            "articleSlug": r["article_slug"],
            "has_article": bool(r["article_slug"]),
            "hasArticle": bool(r["article_slug"]),
            "youtube_url": None if r["youtube_url"] == "$undefined" else r["youtube_url"],
            "youtubeUrl": None if r["youtube_url"] == "$undefined" else r["youtube_url"],
            "leetcode_url": None if r["leetcode_url"] == "$undefined" else r["leetcode_url"],
            "leetcodeUrl": None if r["leetcode_url"] == "$undefined" else r["leetcode_url"],
            "leetcode_slug": slug,
            "leetcodeSlug": slug,
            "is_ide_runnable": bool(slug and slug in lc_slugs),
            "isIdeRunnable": bool(slug and slug in lc_slugs),
            "practice_url": practice_url,
            "practiceUrl": practice_url,
            "problem_url": practice_url
        })

    return {
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if total_count > 0 else 1,
        "problems": results
    }
