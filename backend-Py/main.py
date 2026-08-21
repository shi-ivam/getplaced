import os
import re
import shutil
import tempfile
from typing import Optional, List, Dict, Any
import requests
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai

# Import LeetCode service modules
from services.leetcode_service import (
    get_problems,
    get_problem_by_slug_or_id,
    get_problem_internal,
    get_tags,
    get_stats,
    get_solution,
    get_random_problem,
    init_db
)
from services.code_runner import run_sample_tests, submit_solution
from services.ai_assistant import get_ai_code_assistance

# Load environment variables
load_dotenv(override=True)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

# Configure Gemini AI
api_key = (os.getenv("GOOGLE_API_KEY") or "").strip()
if api_key:
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        print(f"Warning: Gemini config error: {e}")

# Initialize FastAPI app
app = FastAPI(title="GetPlaced AI & LeetCode Coding Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Initialize SQLite database from LeetCode dataset on start
    try:
        init_db()
    except Exception as e:
        print(f"Error during startup DB init: {e}")

@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )


# ---------- Resume Analysis Logic ----------

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print("PDFPlumber error:", e)

    if not text.strip():
        try:
            images = convert_from_path(pdf_path)
            for image in images:
                text += pytesseract.image_to_string(image) + "\n"
        except Exception as e:
            print("OCR fallback error:", e)

    return text.strip()

def clean_gemini_output(text):
    if not text:
        return ""
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"[*•📚⚠️💼✅🔹🔸📊🛠️📝⬇️🚀🔍]+", "", text)
    text = re.sub(r"#+\s?", "", text)
    text = re.sub(r"[-–—]{1,3}\s?", "", text)
    text = re.sub(r"\n{2,}", "\n\n", text)
    return text.strip()

def analyze_resume_text(resume_text, job_description=None):
    load_dotenv(override=True)
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)
    current_key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if not current_key:
        raise HTTPException(
            status_code=500,
            detail="Google Gemini API key is missing. Please set GOOGLE_API_KEY in .env"
        )

    genai.configure(api_key=current_key)

    prompt = f"""
Assume you are a professional resume analyst and career coach.
You are tasked with analyzing a resume and providing a detailed report.

Analyze the following resume and provide report including:
- Overall profile strength
- Key skills
- Areas for improvement
- Recommended courses
- ATS Score (between 0 and 100)
- Job recommendations

give brief and concise answers.

Resume:
{resume_text if resume_text else "[Note: No textual content could be extracted from the resume PDF. Provide guidance on formatting and ATS-friendly PDF design.]"}
"""

    if job_description:
        prompt += f"\n\nCompare with this job description:\n{job_description}"

    models_to_try = [
        "gemini-flash-latest",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
    ]

    last_error = None
    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            if hasattr(response, "text") and response.text:
                return clean_gemini_output(response.text)
            elif hasattr(response, "candidates") and response.candidates:
                parts = response.candidates[0].content.parts
                combined = "".join(getattr(p, "text", "") for p in parts)
                return clean_gemini_output(combined)
        except Exception as e:
            last_error = e
            print(f"Model '{model_name}' failed: {e}")
            continue

    raise HTTPException(
        status_code=500,
        detail=f"Gemini AI generation failed: {last_error}"
    )

@app.post("/analyze-resume/")
async def analyze_resume_api(file: UploadFile = File(...), job_description: str = Form("")):
    temp_dir = tempfile.mkdtemp()
    try:
        file_path = os.path.join(temp_dir, file.filename or "resume.pdf")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text_from_pdf(file_path)
        analysis = analyze_resume_text(resume_text, job_description)

        return {"analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_resume_api: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

# ---------- Job Recommendations Logic ----------

@app.get("/job-recommendations")
def get_jobs():
    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {"query": "developer in India", "page": "1", "num_pages": "2"}
    headers = {
        "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()
        return {"jobs": data.get("data", [])}
    except Exception as e:
        print(f"Error in job-recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch jobs: {str(e)}")


# ---------- LeetCode Platform Endpoints ----------

class CodeRunRequest(BaseModel):
    code: str
    custom_cases: Optional[List[Dict[str, str]]] = None

class CodeSubmitRequest(BaseModel):
    code: str

class AIAssistRequest(BaseModel):
    code: str
    query_type: str = "hint"  # hint, explain, debug, optimize
    error_message: Optional[str] = None

@app.get("/api/problems")
def list_problems(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    difficulty: Optional[str] = None,
    tag: Optional[str] = None,
    sort_by: str = Query("question_id"),
    sort_order: str = Query("asc")
):
    """Returns paginated problems list filtered by search, difficulty, tag."""
    try:
        return get_problems(
            page=page,
            page_size=page_size,
            search=search,
            difficulty=difficulty,
            tag=tag,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch problems: {str(e)}")

@app.get("/api/problems/tags")
def list_tags():
    """Returns all available problem tags with their counts."""
    try:
        return {"tags": get_tags()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tags: {str(e)}")

@app.get("/api/problems/stats")
def problem_stats():
    """Returns problem count totals across difficulties."""
    try:
        return get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@app.get("/api/problems/random")
def random_problem(difficulty: Optional[str] = None, tag: Optional[str] = None):
    """Returns a random problem matching criteria."""
    try:
        prob = get_random_problem(difficulty=difficulty, tag=tag)
        if not prob:
            raise HTTPException(status_code=404, detail="No matching problem found.")
        return prob
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch random problem: {str(e)}")

@app.get("/api/problems/{slug_or_id}")
def get_single_problem(slug_or_id: str):
    """Fetches details for a single problem by slug or ID."""
    prob = get_problem_by_slug_or_id(slug_or_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{slug_or_id}' not found.")
    return prob

@app.get("/api/problems/{slug_or_id}/solution")
def get_problem_solution_endpoint(slug_or_id: str):
    """Fetches reference solution and editorial explanation."""
    sol = get_solution(slug_or_id)
    if not sol:
        raise HTTPException(status_code=404, detail=f"Solution for '{slug_or_id}' not found.")
    return sol

@app.post("/api/problems/{slug_or_id}/run")
def run_problem_code(slug_or_id: str, req: CodeRunRequest):
    """Runs code against sample or custom test cases."""
    prob = get_problem_internal(slug_or_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{slug_or_id}' not found.")
    
    try:
        result = run_sample_tests(prob, req.code, req.custom_cases)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

@app.post("/api/problems/{slug_or_id}/submit")
def submit_problem_code(slug_or_id: str, req: CodeSubmitRequest):
    """Submits code against the full assertion test suite."""
    prob = get_problem_internal(slug_or_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{slug_or_id}' not found.")
    
    try:
        result = submit_solution(prob, req.code)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission error: {str(e)}")

@app.post("/api/problems/{slug_or_id}/ai-assist")
def ai_assist_endpoint(slug_or_id: str, req: AIAssistRequest):
    """Provides AI hints, explanations, debugging, or optimization."""
    prob = get_problem_by_slug_or_id(slug_or_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{slug_or_id}' not found.")
    
    try:
        feedback = get_ai_code_assistance(
            problem_title=prob["title"],
            problem_description=prob["problem_description"],
            user_code=req.code,
            query_type=req.query_type,
            error_message=req.error_message
        )
        return {"response": feedback, "query_type": req.query_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assistance failed: {str(e)}")


# Optional: Run server directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
