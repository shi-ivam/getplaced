# getPlaced

🌐 **Live Deployment:** [https://getplaced.siqht.in](https://getplaced.siqht.in)

AI-powered placement preparation and career development platform designed to supercharge interview readiness, resume optimization, and DSA progress tracking.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19 • Vite • Tailwind CSS v4 • Inter & DM Sans • Framer Motion • Recharts • Lucide Icons |
| **Node Backend** | Node.js • Express • MongoDB • Mongoose • JWT |
| **Python AI Backend** | Python 3.10+ • FastAPI • Google Gemini API • pdfplumber • Tesseract OCR |
| **Containerization** | Docker • Docker Compose • Nginx |

---

## Environment Variables & AI Configuration

All AI-related features (including **Resume Analyzer**, ATS scoring, profile strength assessment, and career advice) require a valid Google Cloud / Gemini API key. Ensure `GOOGLE_API_KEY` is configured in your `.env` file before running the application.

### Key Configuration in `.env`

Copy `.env.example` to create your root `.env` file:
```bash
cp .env.example .env
```

| Variable | Required For | Description |
|---|---|---|
| `GOOGLE_API_KEY` | **All AI Features** (Resume Analysis, Gemini models) | Google Cloud / Google AI Studio API key used by the Python backend (`gemini-flash-latest`, `gemini-3.7-flash`, etc.) |
| `RAPIDAPI_KEY` | Job Recommendations | RapidAPI JSearch API key for live developer job search |
| `MONGO_URI` | Node.js Backend & Auth | MongoDB connection URI |
| `JWT_SECRET` | Authentication | Secret key for JWT signing |
| `VITE_NODE_API_URL` | Frontend | URL of the Node.js API (default: `http://localhost:3000`) |
| `VITE_PY_API_URL` | Frontend | URL of the Python AI API (default: `http://localhost:8000`) |

> **Important**: For any AI-related functionality, make sure `GOOGLE_API_KEY` is set to your active API key in `.env` (or `backend-Py/.env`). The Python backend dynamically reads this key to power all resume analysis and AI features.

---

## Quick Start

### Docker Compose (Recommended)

```bash
# 1. Clone & enter directory
git clone https://github.com/Tejas-Santosh-Nalawade/Dev-Clash.git
cd Dev-Clash

# 2. Setup environment variables (add your GOOGLE_API_KEY in .env)
cp .env.example .env

# 3. Spin up services
docker compose up --build -d
```

Access the services:
- **Frontend App**: `http://localhost` (Port 80)
- **Node.js API**: `http://localhost:3000`
- **Python FastAPI**: `http://localhost:8000` (`http://localhost:8000/docs`)

---

### Local Development

#### 1. Setup Environment
Make sure `.env` in the root directory (and/or `backend-Py/.env`) has your Google API key configured:
```env
GOOGLE_API_KEY=your_actual_google_api_key_here
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 3. Node Backend
```bash
cd backend-Node
npm install
npm start
```

#### 4. Python AI Backend
```bash
cd backend-Py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

