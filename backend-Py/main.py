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
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Body
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

# Import Group-B Intelligence Services
from services.resume_service import (
    analyze_resume_comprehensive,
    improve_bullet_point,
    optimize_resume_section,
    generate_action_previews,
    apply_resume_actions,
    recalculate_ats_score
)
from services.interview_service import (
    generate_interview_questions,
    evaluate_interview_answer,
    generate_session_report
)
from services.communication_service import (
    analyze_communication_skills
)
from services.company_intelligence_service import (
    get_company_intelligence,
    list_featured_companies
)

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
app = FastAPI(title="getPlaced AI & Intelligence Platform API")

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


# ==========================================
# 1. Resume Intelligence API Endpoints
# ==========================================

def extract_text_from_pdf(pdf_path: str) -> str:
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

class ResumeAnalyzeJsonRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None
    target_role: Optional[str] = None

class BulletImproveRequest(BaseModel):
    bullet: str
    target_role: Optional[str] = "Software Engineer"
    keywords: Optional[List[str]] = None

class SectionOptimizeRequest(BaseModel):
    section_type: str
    content: str
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None

@app.post("/analyze-resume/")
async def analyze_resume_legacy(file: UploadFile = File(...), job_description: str = Form("")):
    """Legacy compatibility endpoint returning analysis and detailed JSON payload."""
    temp_dir = tempfile.mkdtemp()
    try:
        file_path = os.path.join(temp_dir, file.filename or "resume.pdf")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text_from_pdf(file_path)
        result = analyze_resume_comprehensive(resume_text, job_description)

        # Formulate readable text for legacy clients
        text_summary = f"""ATS Score: {result.get('ats_score')}/100 ({result.get('score_tier')})
Summary: {result.get('summary_critique')}

Category Scores:
- Formatting & Structure: {result.get('category_scores', {}).get('formatting_structure')}%
- Keyword Match: {result.get('category_scores', {}).get('keyword_relevance')}%
- Impact & Metrics: {result.get('category_scores', {}).get('impact_metrics')}%
- Skills Alignment: {result.get('category_scores', {}).get('skills_alignment')}%
- Experience Match: {result.get('category_scores', {}).get('experience_relevance')}%

Matched Keywords: {', '.join([k['keyword'] for k in result.get('matched_keywords', [])])}
Missing Keywords: {', '.join([k['keyword'] for k in result.get('missing_keywords', [])])}

Top Recommendations:
{chr(10).join(['• ' + rec for rec in result.get('actionable_recommendations', [])])}
"""
        return {
            "analysis": text_summary,
            "data": result,
            "extracted_text": resume_text
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_resume_legacy: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {str(e)}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/api/resume/analyze-upload")
async def analyze_resume_upload_api(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    target_role: str = Form("")
):
    """Multipart PDF upload endpoint for rich ATS evaluation."""
    temp_dir = tempfile.mkdtemp()
    try:
        file_path = os.path.join(temp_dir, file.filename or "resume.pdf")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_text_from_pdf(file_path)
        analysis_data = analyze_resume_comprehensive(resume_text, job_description)
        return {
            "success": True,
            "filename": file.filename,
            "extracted_text": resume_text,
            "evaluation": analysis_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume file: {str(e)}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/api/resume/analyze-text")
def analyze_resume_text_api(req: ResumeAnalyzeJsonRequest):
    """Direct JSON payload ATS evaluation."""
    try:
        analysis_data = analyze_resume_comprehensive(req.resume_text, req.job_description)
        return {
            "success": True,
            "evaluation": analysis_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/api/resume/improve-bullet")
def improve_bullet_api(req: BulletImproveRequest):
    """Rewrites a weak bullet point into high-impact Google XYZ formula."""
    try:
        result = improve_bullet_point(req.bullet, req.target_role, req.keywords)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bullet improvement failed: {str(e)}")

@app.post("/api/resume/optimize-section")
def optimize_section_api(req: SectionOptimizeRequest):
    """Optimizes a resume section (Summary, Experience, Projects, Skills) with keyword injection."""
    try:
        result = optimize_resume_section(req.section_type, req.content, req.target_role, req.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Section optimization failed: {str(e)}")

class ActionPreviewRequest(BaseModel):
    resume_text: str
    actions: List[Dict[str, Any]]
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None

class ActionApplyRequest(BaseModel):
    resume_text: str
    actions: List[Dict[str, Any]]
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None
    previous_score: Optional[int] = None
    previous_category_scores: Optional[Dict[str, int]] = None

class RecalculateAtsRequest(BaseModel):
    resume_text: str
    previous_score: Optional[int] = None
    previous_category_scores: Optional[Dict[str, int]] = None
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None

@app.post("/api/resume/actions/preview")
@app.post("/resume/actions/preview")
def actions_preview_api(req: ActionPreviewRequest):
    """Generates structured before/after diff previews for chosen action items."""
    try:
        previews = generate_action_previews(
            resume_text=req.resume_text,
            actions=req.actions,
            target_role=req.target_role,
            job_description=req.job_description
        )
        return {"success": True, "previews": previews}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate action previews: {str(e)}")

@app.post("/api/resume/actions/apply")
@app.post("/resume/actions/apply")
@app.post("/api/resume/actions/apply-selected")
@app.post("/resume/actions/apply-selected")
def actions_apply_api(req: ActionApplyRequest):
    """Applies confirmed action edits to resume text and recalculates verified ATS score."""
    try:
        result = apply_resume_actions(
            resume_text=req.resume_text,
            applied_actions=req.actions,
            target_role=req.target_role,
            job_description=req.job_description,
            previous_score=req.previous_score,
            previous_category_scores=req.previous_category_scores
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply actions: {str(e)}")

@app.post("/api/resume/recalculate-ats")
@app.post("/resume/recalculate-ats")
def recalculate_ats_api(req: RecalculateAtsRequest):
    """Recalculates ATS score for updated resume without artificial inflation."""
    try:
        result = recalculate_ats_score(
            resume_text=req.resume_text,
            previous_score=req.previous_score,
            previous_category_scores=req.previous_category_scores,
            target_role=req.target_role,
            job_description=req.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to recalculate ATS: {str(e)}")



# ==========================================
# 2. AI Mock Interview & HR Prep API Endpoints
# ==========================================

class GenerateQuestionsRequest(BaseModel):
    company: Optional[str] = "Generic Tech"
    role: Optional[str] = "Software Engineer"
    interview_type: Optional[str] = "Mixed"  # HR, Behavioral, Technical, Mixed, System Design
    difficulty: Optional[str] = "Medium"
    count: Optional[int] = 5
    resume_text: Optional[str] = None

class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    company: Optional[str] = "Tech Company"
    role: Optional[str] = "Software Engineer"
    interview_type: Optional[str] = "behavioral"
    audio_duration_seconds: Optional[float] = None

class SessionReportRequest(BaseModel):
    company: str
    role: str
    interview_type: str
    answers: List[Dict[str, Any]]

@app.post("/api/interview/generate-questions")
def generate_questions_api(req: GenerateQuestionsRequest):
    """Generates personalized interview questions tailored to company & role."""
    try:
        questions = generate_interview_questions(
            company=req.company,
            role=req.role,
            interview_type=req.interview_type,
            difficulty=req.difficulty,
            count=req.count or 5,
            resume_text=req.resume_text
        )
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")

@app.post("/api/interview/evaluate-answer")
def evaluate_answer_api(req: EvaluateAnswerRequest):
    """Evaluates candidate's answer with STAR compliance, communication metrics & dynamic follow-up."""
    try:
        result = evaluate_interview_answer(
            question=req.question,
            answer=req.answer,
            company=req.company,
            role=req.role,
            interview_type=req.interview_type,
            audio_duration_seconds=req.audio_duration_seconds
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Answer evaluation failed: {str(e)}")

@app.post("/api/interview/session-report")
def session_report_api(req: SessionReportRequest):
    """Generates comprehensive post-session hiring report and radar scores."""
    try:
        report = generate_session_report(
            company=req.company,
            role=req.role,
            interview_type=req.interview_type,
            answers=req.answers
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")


# ==========================================
# 3. Communication Skill Analysis API
# ==========================================

class CommunicationAnalyzeRequest(BaseModel):
    text: str
    audio_duration_seconds: Optional[float] = None
    target_context: Optional[str] = "Technical / Behavioral Interview"

@app.post("/api/communication/analyze")
def analyze_communication_api(req: CommunicationAnalyzeRequest):
    """Deep communication analysis: filler words, STAR compliance, clarity, confidence, WPM."""
    try:
        result = analyze_communication_skills(
            text=req.text,
            audio_duration_seconds=req.audio_duration_seconds,
            target_context=req.target_context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Communication analysis failed: {str(e)}")


# ==========================================
# 4. Company Research & Intelligence API
# ==========================================

@app.get("/api/company/featured")
def list_featured_companies_api():
    """Lists curated top tech companies with quick metrics."""
    try:
        companies = list_featured_companies()
        return {"companies": companies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list companies: {str(e)}")

@app.get("/api/company/intelligence")
def get_company_intelligence_api(company: str = Query("Google", description="Company name or slug")):
    """Fetches deep profile, tech stack, interview rounds, and commonly asked patterns."""
    try:
        intel = get_company_intelligence(company)
        return intel
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Company intelligence lookup failed: {str(e)}")


# ==========================================
# 5. Job Recommendations & LeetCode Platform
# ==========================================

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
    try:
        return {"tags": get_tags()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tags: {str(e)}")

@app.get("/api/problems/stats")
def problem_stats():
    try:
        return get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

@app.get("/api/problems/random")
def random_problem(difficulty: Optional[str] = None, tag: Optional[str] = None):
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
    prob = get_problem_by_slug_or_id(slug_or_id)
    if not prob:
        raise HTTPException(status_code=404, detail=f"Problem '{slug_or_id}' not found.")
    return prob

@app.get("/api/problems/{slug_or_id}/solution")
def get_problem_solution_endpoint(slug_or_id: str):
    sol = get_solution(slug_or_id)
    if not sol:
        raise HTTPException(status_code=404, detail=f"Solution for '{slug_or_id}' not found.")
    return sol

@app.post("/api/problems/{slug_or_id}/run")
def run_problem_code(slug_or_id: str, req: CodeRunRequest):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
