import os
import re
import shutil
import tempfile
import requests
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai

# Load environment variables (from local backend-Py/.env and root .env)
load_dotenv(override=True)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

# Configure Gemini AI
api_key = (os.getenv("GOOGLE_API_KEY") or "").strip()
if api_key:
    genai.configure(api_key=api_key)

# Initialize FastAPI app
app = FastAPI(title="GetPlaced Resume & Job API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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

# Optional: Run server directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

        