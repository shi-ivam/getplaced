# getPlaced

AI-powered placement preparation and career development platform designed to supercharge interview readiness, resume optimization, and DSA progress tracking.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19 • Vite • Tailwind CSS v4 • Inter & DM Sans • Framer Motion • Recharts • Lucide Icons |
| **Node Backend** | Node.js • Express • MongoDB • Mongoose • JWT |
| **Python AI Backend** | Python 3.10+ • FastAPI • Gemini API • OpenCV • Tesseract OCR |
| **Containerization** | Docker • Docker Compose • Nginx |

## 🚀 Quick Start

### Docker Compose (Recommended)

```bash
# 1. Clone & enter directory
git clone https://github.com/Tejas-Santosh-Nalawade/Dev-Clash.git
cd Dev-Clash

# 2. Setup environment variables
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

#### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 2. Node Backend
```bash
cd backend-Node
npm install
npm start
```

#### 3. Python AI Backend
```bash
cd backend-Py
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```
