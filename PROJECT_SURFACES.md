# 🌐 getPlaced — Project Surfaces & Architecture Specification

> **Purpose of this Document:**  
> This document serves as the single source of truth for all surfaces, routes, APIs, data structures, and implementation statuses across the **getPlaced** codebase. It is written with precise technical accuracy to eliminate guesswork and hallucinations when onboarding engineers or planning new features.

---

## 📑 Table of Contents
1. [System Architecture & Topology](#1-system-architecture--topology)
2. [Environment Configuration Matrix](#2-environment-configuration-matrix)
3. [Surface Inventory & Status Overview](#3-surface-inventory--status-overview)
4. [Deep Surface Breakdown](#4-deep-surface-breakdown)
   - [Surface 1: Marketing & Landing Surface (`/`)](#surface-1-marketing--landing-surface-)
   - [Surface 2: Authentication Surface (`/login`, `/register`)](#surface-2-authentication-surface-login-register)
   - [Surface 3: Application Shell & Sidebar Navigation (`/app/*`)](#surface-3-application-shell--sidebar-navigation-app)
   - [Surface 4: Candidate Dashboard Surface (`/app`)](#surface-4-candidate-dashboard-surface-app)
   - [Surface 5: AI Resume Analyzer Surface (`/resume`, `/app/resume`)](#surface-5-ai-resume-analyzer-surface-resume-appresume)
   - [Surface 6: Job Recommendations Surface (`/app/job`)](#surface-6-job-recommendations-surface-appjob)
   - [Surface 7: DSA Learning Hub (`DSAcontent.jsx`)](#surface-7-dsa-learning-hub-dsacontentjsx)
   - [Surface 8: AI Mock Interview Surface (Prototype / Hero)](#surface-8-ai-mock-interview-surface-prototype--hero)
5. [Backend APIs & Data Schemas](#5-backend-apis--data-schemas)
   - [Node.js Express API (`backend-Node`)](#nodejs-express-api-backend-node)
   - [Python FastAPI Service (`backend-Py`)](#python-fastapi-service-backend-py)
   - [MongoDB Schemas](#mongodb-schemas)
6. [Known Code Discrepancies & Anti-Hallucination Warnings](#6-known-code-discrepancies--anti-hallucination-warnings)
7. [Engineering Guide for Planning New Features](#7-engineering-guide-for-planning-new-features)

---

## 1. System Architecture & Topology

The **getPlaced** platform is a polyglot microservice/monorepo application organized into three primary layers:

```
                                  ┌─────────────────────────────────────────┐
                                  │           React 19 Frontend             │
                                  │      (Vite 6 + Tailwind CSS v4)         │
                                  │  Port 80 (Docker) / 5173 (Dev Server)   │
                                  └───────────────┬─────────────────┬───────┘
                                                  │                 │
                         HTTP / Cookie Auth       │                 │  Multipart Form / REST
                                                  ▼                 ▼
             ┌──────────────────────────────────────┐     ┌───────────────────────────────────────┐
             │       Node.js / Express Backend      │     │      Python / FastAPI Backend         │
             │        (Authentication & Jobs)       │     │    (Gemini AI Resume OCR & ATS)       │
             │           Port 3000 (Docker/Dev)     │     │        Port 8000 (Docker/Dev)         │
             └──────────────────┬───────────────────┘     └───────────────────┬───────────────────┘
                                │                                             │
                                │ Mongoose                                    │ External APIs
                                ▼                                             ▼
             ┌──────────────────────────────────────┐     ┌───────────────────────────────────────┐
             │         MongoDB Database             │     │      • Google Gemini 1.5 Flash        │
             │          (Mongo v7.0)                │     │      • RapidAPI (JSearch)             │
             │           Port 27017                 │     │      • Tesseract OCR / Poppler        │
             └──────────────────┘     └───────────────────────────────────────┘
```

### Component Details
* **Frontend (`/frontend`)**: React 19, React Router DOM v7, Tailwind CSS v4, Radix UI Primitives (`@radix-ui/react-*`), Lucide Icons, Framer Motion, Recharts, `react-calendar`, `react-player`, `jspdf`, `react-tsparticles`.
* **Node.js Backend (`/backend-Node`)**: Node.js (ES Modules), Express v5, Mongoose v8, JWT auth (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`, `axios`.
* **Python Backend (`/backend-Py`)**: FastAPI, Uvicorn, Google Generative AI SDK (`google-generativeai` with `gemini-1.5-flash`), `pdfplumber`, `pdf2image`, `pytesseract` (OCR), `requests`, `python-dotenv`.
* **Containerization (`docker-compose.yml`)**:
  * `mongodb`: Image `mongo:7.0` (Volume: `mongo_data`).
  * `backend-node`: Builds `backend-Node/Dockerfile` on port `3000`.
  * `backend-py`: Builds `backend-Py/Dockerfile` on port `8000`.
  * `frontend`: Builds `frontend/Dockerfile` (Nginx) serving production bundle on port `80`.

---

## 2. Environment Configuration Matrix

| Variable Name | Required By | Purpose | Default / Example Value |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | `backend-Node` | Connection string to MongoDB instance | `mongodb://mongodb:27017/getplaced` |
| `JWT_SECRET` | `backend-Node` | Secret string for signing auth JWT cookies | `your_super_secret_jwt_key` |
| `PORT` | `backend-Node` | Port for Express HTTP server | `3000` |
| `RAPIDAPI_KEY` | `backend-Node`, `backend-Py` | API Key for RapidAPI JSearch job listings | `your_rapidapi_key` |
| `GOOGLE_API_KEY` | `backend-Py` | Google Gemini API key for resume parsing | `your_gemini_api_key` |
| `ADZUNA_API_ID` | `backend-Py` | *Configured in env for future job integrations* | `your_adzuna_api_id` |
| `ADZUNA_API_KEY`| `backend-Py` | *Configured in env for future job integrations* | `your_adzuna_api_key` |
| `VITE_NODE_API_URL` | `frontend` | Base URL targeting Express backend | `http://localhost:3000` |
| `VITE_PY_API_URL` | `frontend` | Base URL targeting FastAPI backend | `http://localhost:8000` |

---

## 3. Surface Inventory & Status Overview

| Surface Identifier | Route / Path | Primary Component(s) | Backend Services Used | Current Implementation Status |
| :--- | :--- | :--- | :--- | :--- |
| **Landing & Marketing** | `/` | `LandingPage.jsx`<br>`Hero.jsx`<br>`Feature.jsx`<br>`Meeting.jsx`<br>`ResumeAnalyzer.jsx`<br>`PrivacyProtection.jsx`<br>`Footer.jsx` | None (Client-side animations & static copy) | **Active / Production Ready UI** |
| **User Login** | `/login` | `Login.jsx`<br>`components/login-form.jsx` | `backend-Node`<br>`POST /api/users/auth` | **Fully Functional** (JWT cookie set, redirects to `/app`) |
| **User Registration** | `/register` | `Register.jsx`<br>`components/register-form.jsx` | `backend-Node`<br>`POST /api/users/` | **Fully Functional** (Creates Mongo user, redirects to `/app`) |
| **App Shell & Nav** | `/app/*` | `PageRouting/Layout.jsx`<br>`components/app-sidebar.jsx` | None | **Active** (Collapsible sidebar with dynamic routing) |
| **Candidate Dashboard**| `/app` | `pages/Dashboard.jsx` | `backend-Node`<br>`GET /api/readiness`<br>`GET /api/users/profile` | **Fully Functional** (Dynamic 7-dimension readiness engine, target gap analysis, re-normalized weighting) |
| **Resume Analyzer** | `/resume`<br>`/app/resume` | `pages/AnalyzeResume.jsx` | `backend-Py`<br>`POST /analyze-resume/`<br>Google Gemini 1.5 Flash + OCR | **Fully Functional** (PDF upload, OCR fallback, AI prompt, PDF export) |
| **Job Recommendations**| `/app/job` | `pages/JobRecommendations.jsx` | `backend-Node`<br>`GET /job-recommendations`<br>RapidAPI JSearch | **Fully Functional** (Real-time RapidAPI fetch + client-side search) |
| **DSA Learning Hub** | *Dormant (Not in Router)* | `pages/DSAcontent.jsx`<br>`components/dsa_content/*`<br>`data/dsaContent.js` | None (Comprehensive client-side dataset) | **Fully Implemented UI & Data, Disconnected Route** |
| **AI Mock Interview** | `/app/interview` *(Sidebar link)* | `Hero.jsx` (Mockup)<br>`Meeting.jsx` (Calendar) | Planned (MediaPipe / WebRTC / Gemini) | **Visual Prototype / Planned Surface** |

---

## 4. Deep Surface Breakdown

### Surface 1: Marketing & Landing Surface (`/`)
* **Entry Point:** `frontend/src/PageRouting/Routings.jsx` -> `frontend/src/pages/LandingPage.jsx`
* **Sub-components Rendered:**
  1. **Navigation Bar (`Navbar.jsx`)**: Sticky header with glassmorphism blur (`backdrop-blur-md`). Displays branding and links (`Product`, `Company`, `Blog`, `Changelog`). Includes desktop & mobile drawer buttons navigating to `/login` and `/register`.
  2. **Hero Section (`Hero.jsx`)**:
     * Video background looping `blackhole.webm`.
     * Title: *"Get Placed with getPlaced"*.
     * **Simulated AI Feedback Widget**: Uses a 3-second `setInterval` state updater displaying live analysis indicators (`Speech: Clear and steady`, `Eye Contact: Good eye contact`, `Posture: Straight posture`, `Confidence: Confident tone`).
     * Video call UI frame representing Richard Gomez with fake recording and media control buttons.
  3. **Feature Grid (`Feature.jsx`)**: 8 feature cards with Framer Motion 3D tilt effects (`Built for speed`, `Networked notes`, `iOS app`, `End-to-end encryption`, `Calendar integration`, `Publishing`, `Instant capture`, `Frictionless search`).
  4. **Study Plan Calendar Showcase (`Meeting.jsx`)**:
     * Interactive 3D tilt container wrapping `react-calendar`.
     * Date picker state displaying selected date string in real time.
  5. **Resume Radar Preview (`ResumeAnalyzer.jsx`)**:
     * Presentation card featuring an ATS score gauge (86%) and a Recharts `RadarChart` mapping 5 sample skills (`React`, `JavaScript`, `CSS`, `Testing`, `Communication`).
  6. **Hardened Security Matrix (`PrivacyProtection.jsx`)**:
     * Canvas running `react-tsparticles` with floating monospaced alphanumeric particles.
     * FaLock icon with security assurances.
  7. **Footer (`Footer.jsx`)**: 4-column layout containing company information, resource links, contact details, and bottom gradient accent.

---

### Surface 2: Authentication Surface (`/login`, `/register`)
* **Files:** `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`, `frontend/src/components/login-form.jsx`, `frontend/src/components/register-form.jsx`.
* **Login Workflow:**
  1. User enters `email` and `password`.
  2. Frontend executes: `axios.post(`${NODE_API_URL}/api/users/auth`, { email, password })`.
  3. Backend checks credentials via `bcrypt.compare`.
  4. On success, backend sets an `httpOnly`, `sameSite: strict` cookie named `jwt` (valid for 30 days) and returns `{ _id, name, email }`.
  5. Frontend triggers `navigate('/app')`.
* **Registration Workflow:**
  1. User enters `name`, `email`, `password`.
  2. Frontend executes: `axios.post(`${NODE_API_URL}/api/users/`, { name, email, password })`.
  3. Backend verifies non-existence, hashes password with `bcrypt.genSalt(10)`, saves document, sets `jwt` cookie, and returns `{ _id, name, email }`.
  4. Frontend triggers `navigate('/app')`.

---

### Surface 3: Application Shell & Sidebar Navigation (`/app/*`)
* **Files:** `frontend/src/PageRouting/Layout.jsx`, `frontend/src/components/app-sidebar.jsx`.
* **Mechanism:**
  * Uses shadcn `SidebarProvider` with collapsible drawer on mobile devices (`SidebarTrigger`).
  * Dark themed `#121212` background with subtle radial grid dots.
* **Navigation Links in Sidebar:**
  * 🏠 **Dashboard** (`/app`): Linked to `Dashboard.jsx`.
  * 🧠 **Interview** (`/app/interview`): Menu item configured with `BrainCog` icon (Needs route registration in `Routings.jsx`).
  * 📄 **Resume** (`/app/resume`): Linked to `AnalyzeResume.jsx`.
  * 💼 **Job Recommendation** (`/app/job`): Linked to `JobRecommendations.jsx`.
  * 👤 **Profile** (`#`), ⚙️ **Setting** (`#`), 🚪 **Log Out** (`#`): Currently placeholder anchors.

---

### Surface 4: Candidate Dashboard Surface (`/app`)
* **File:** `frontend/src/pages/Dashboard.jsx`.
* **Sections Present:**
  1. **Greeting Header:** Currently static (`👋 Welcome, Pravin!`).
  2. **KPI Stats Grid:** 4 `StatCard` widgets:
     * Resume Score (`82%`)
     * Interviews Given (`5`)
     * Past Interview Score (`74%`)
     * Courses Completed (`3`)
  3. **AI Interview Widget:** Displays score `74%` with a *"Start Mock Interview"* button.
  4. **Calendar Widget Placeholder:** Container reserved for upcoming deadlines / study calendar.
  5. **Course Recommendations:** List with 4 courses (`DSA Mastery`, `System Design Basics`, `Resume Writing Workshop`, `Mock Interview Bootcamp`) each with an *"Enroll"* action button.
  6. **Todo Checklist:** Static tasks (`Update Resume`, `Practice 2 DSA problems`, `Attempt Mock Interview`).
* **Implementation Note:** All metrics on this page are currently client-side dummy values; connecting this to MongoDB user progress models is a prime expansion target.

---

### Surface 5: AI Resume Analyzer Surface (`/resume`, `/app/resume`)
* **File:** `frontend/src/pages/AnalyzeResume.jsx`
* **Workflow & Data Flow:**
  1. User selects a PDF document via standard file input.
  2. User optionally pastes a Target Job Description into the textarea.
  3. On clicking *"Analyze Resume"*, frontend builds a `FormData` object with `file` and `job_description`.
  4. Sends `POST ${PY_API_URL}/analyze-resume/` with `Content-Type: multipart/form-data`.
  5. **FastAPI Processing Pipeline:**
     * File written to temporary disk directory.
     * Step 1 Text Extraction: `pdfplumber.open()` iterates over all pages to extract text.
     * Step 2 OCR Fallback: If extracted text is blank, converts PDF pages to images via `pdf2image.convert_from_path()` and runs `pytesseract.image_to_string()`.
     * Step 3 Gemini Reasoning: Submits prompt to `gemini-1.5-flash` asking for Overall Profile Strength, Key Skills, Improvement Areas, Recommended Courses, ATS Score (0-100), and Job Recommendations.
     * Step 4 Sanitization: Cleans markdown formatting, emojis, headers, and excessive dashes via regex.
     * Response payload: `{ "analysis": "<clean analysis string>" }`.
  6. **Frontend Result Display & Export:**
     * Displays analysis inside a styled monospaced output block.
     * Provides a *"⬇️ Download PDF Report"* button that utilizes `jspdf` (`doc.splitTextToSize` with standard A4 layout) to generate and download `Resume_Analysis_Report.pdf` directly in the browser.

---

### Surface 6: Job Recommendations Surface (`/app/job`)
* **File:** `frontend/src/pages/JobRecommendations.jsx`
* **Workflow & Features:**
  1. On component mount (`useEffect`), makes a `GET` request to `${NODE_API_URL}/job-recommendations`.
  2. **Backend Proxy Execution:**
     * Express backend calls `https://jsearch.p.rapidapi.com/search` with parameters `query: "developer in India"`, `page: "1"`, `num_pages: "2"`.
     * Passes `X-RapidAPI-Key` and `X-RapidAPI-Host: jsearch.p.rapidapi.com`.
     * Returns `{ jobs: [...] }`.
  3. **Interactive Search & Filter:**
     * Includes a real-time search input.
     * Filters array client-side by matching substring on `job.job_title`, `job.employer_name`, `job.job_city`, or `job.job_country`.
  4. **Card UI Elements:**
     * Displays `job_title`, `employer_name`, `job_city`, `job_country`, `job_employment_type`, formatted `job_posted_at_datetime_utc`.
     * Direct link button *"Apply Now"* opening `job.job_apply_link` in a new tab (`target="_blank" rel="noopener noreferrer"`).

---

### Surface 7: DSA Learning Hub (`DSAcontent.jsx`)
* **Files:**
  * Page: `frontend/src/pages/DSAcontent.jsx`
  * Components: `frontend/src/components/dsa_content/TopicCard.jsx`, `VideoPlayer.jsx`, `AssignmentList.jsx`
  * Dataset: `frontend/src/data/dsaContent.js`
* **Current Status:** Fully coded and interactive, but **not included in `PageRouting/Routings.jsx`**.
* **Dataset Scope (`dsaContent.js`):** Contains 15 comprehensive curriculum modules:
  1. Arrays (2 Video Lectures, 10 LeetCode Problems)
  2. Strings (3 Video Lectures, 10 LeetCode Problems)
  3. Binary Search (2 Video Lectures, 6 LeetCode Problems)
  4. Recursion (2 Video Lectures, 9 LeetCode Problems)
  5. Bit Manipulation (2 Video Lectures, 9 LeetCode Problems)
  6. Sliding Window (2 Video Lectures, 8 LeetCode Problems)
  7. Greedy Algorithms (2 Video Lectures, 9 LeetCode Problems)
  8. Linked Lists (1 Video Lecture, 10 LeetCode Problems)
  9. Stacks & Queues (1 Video Lecture, 6 LeetCode Problems)
  10. Heaps (3 Video Lectures, 8 LeetCode Problems)
  11. Binary Trees (3 Video Lectures, 9 LeetCode Problems)
  12. Binary Search Trees (BST) (3 Video Lectures, 8 LeetCode Problems)
  13. Backtracking (3 Video Lectures, 10 LeetCode Problems)
  14. Graphs (4 Video Lectures, 8 LeetCode Problems)
  15. Dynamic Programming (3 Video Lectures, 10 LeetCode Problems)
* **Interactive Features:**
  * **Module Grid:** Shows completion counters (`X/Y lectures`, `X/Y assignments`).
  * **Tab Navigation:** Toggle between *Lectures* and *Assignments*.
  * **Embedded Player (`VideoPlayer.jsx`):** Wraps `react-player` for YouTube URLs, custom play/pause button, animated progress bar, auto-triggers `onComplete` when playback finishes.
  * **Assignment Checklist (`AssignmentList.jsx`):** Lists problem name, platform badge (`LeetCode` / `GeeksForGeeks`), colored difficulty pill (`Easy` green, `Medium` yellow, `Hard` red), external problem link icon, and toggleable completion checkmark.

---

### Surface 8: AI Mock Interview Surface (Prototype / Hero)
* **Mentioned In:** `README.md`, `Hero.jsx`, `AppSidebar.jsx` (`/app/interview`), `Dashboard.jsx`.
* **Concept & Scope:**
  * AI-driven video mock interviews analyzing candidate answers, voice tone, eye contact, and head posture.
  * Planned technologies cited in README: OpenCV, MediaPipe, TensorFlow, OpenAI / Gemini.
* **Current Codebase Implementation:**
  * Represented visually on the Landing Page Hero as a mock UI with Richard Gomez's photo and simulated feedback cycling via JavaScript timer.
  * Sidebar has the menu entry `/app/interview` ready to link to a real interview room component.
  * No WebRTC or MediaPipe camera stream backend has been connected to date.

---

## 5. Backend APIs & Data Schemas

### Node.js Express API (`backend-Node`)
Base URL: `http://localhost:3000` (or `process.env.VITE_NODE_API_URL`)

| HTTP Method | Route | Middleware | Request Body | Response Body | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | None | `{ name, email, password }` | `{ _id, name, email }` | Registers a new user, hashes password, sets `jwt` cookie. |
| `POST` | `/api/users/auth` | None | `{ email, password }` | `{ _id, name, email }` | Validates credentials, sets `jwt` cookie. |
| `POST` | `/api/users/logout` | None | None | `{ message: "User logged out" }` | Clears `jwt` cookie. |
| `GET` | `/api/users/profile` | `protect` | None | `{ _id, name, email }` | Returns authenticated user info extracted from cookie. |
| `PUT` | `/api/users/profile` | `protect` | `{ name?, email?, password? }` | `{ _id, name, email }` | Updates authenticated user profile and password. |
| `GET` | `/api/users/get` | None | None | `"backend working"` | Health check endpoint. |
| `GET` | `/api/readiness` | `protect` | None | `{ hasSufficientData, overallScore, overallStatus, targetScore, overallGap, dimensions, topGaps, explainability }` | Computes dynamic 7-dimension placement readiness score, re-normalized weighting, and gap breakdown. |
| `GET` | `/job-recommendations` | None | Query params optional | `{ jobs: [...] }` | Proxies RapidAPI JSearch query for developer jobs in India. |

#### Auth Middleware & Token Specification
* **Token Utility:** `backend-Node/utils/generateToken.js` signs JWT containing `{ userId }` with `process.env.JWT_SECRET`, expiring in `30d`.
* **Cookie Options:**
  ```javascript
  res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'strict'
  })
  ```
* **Guard Middleware:** `backend-Node/middlewares/authMiddleware.js` extracts `req.cookies.jwt`, verifies token, queries `User.findById(decoded.userId).select("-password")`, and sets `req.user`.

---

### Python FastAPI Service (`backend-Py`)
Base URL: `http://localhost:8000` (or `process.env.VITE_PY_API_URL`)  
Interactive Swagger Docs: `http://localhost:8000/docs`

| HTTP Method | Route | Input Parameters | Output Schema | Processing Details |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/analyze-resume/` | `file`: `UploadFile` (multipart)<br>`job_description`: `str` (Form, optional) | `{"analysis": str}` | Extracts text via `pdfplumber` or `pytesseract` OCR, sends prompt to Gemini 1.5 Flash, formats ATS score & advice. |
| `GET` | `/job-recommendations` | None | `{"jobs": [...]}` | Direct Python request to RapidAPI JSearch (`query: "developer in India"`). |

---

### MongoDB Schemas

#### User Schema (`backend-Node/models/userModel.js`)
Collection: `users`

```javascript
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Auto adds createdAt, updatedAt
  }
);
```

---

## 6. Known Code Discrepancies & Anti-Hallucination Warnings

When architecting or coding new features, be aware of the following nuances:

1. **Dormant DSA Surface (`DSAcontent.jsx`):**
   * The DSA curriculum component is completely built with extensive question sets and video players, but is **missing from `Routings.jsx`**.
   * To make it accessible, add `<Route path="dsa" element={<DSAContent />} />` under `/app` in `Routings.jsx` and add an item to `AppSidebar.jsx`.
2. **Missing Interview Route:**
   * `app-sidebar.jsx` lists `/app/interview`, but `Routings.jsx` does not define an `/app/interview` route. Clicking this sidebar link currently leads to an empty layout or broken view.
3. **Dual `/job-recommendations` Endpoints:**
   * Both `backend-Node/index.js` (line 43) and `backend-Py/main.py` (line 113) implement a `/job-recommendations` endpoint calling RapidAPI. The frontend `JobRecommendations.jsx` is currently wired to `NODE_API_URL`.
4. **Calendar Data in `Meeting.jsx`:**
   * In `frontend/src/pages/Meeting.jsx`, `meetingData` array is defined at lines 9–25 but is not rendered in the JSX return block.
5. **Dashboard Hardcoded Greeting & Metrics:**
   * `Dashboard.jsx` hardcodes `"Welcome, Pravin!"` and static numbers (82% ATS, 5 interviews). It currently does not make an authenticated API call to `GET /api/users/profile` or a user analytics collection.
6. **Frontend State vs JWT Cookies:**
   * The frontend does not save the JWT token in `localStorage`. Requests relying on authentication must ensure Axios passes credentials (`withCredentials: true`) to send the `jwt` HttpOnly cookie cross-origin.

---

## 7. Engineering Guide for Planning New Features

### A. Adding a New Surface to the Dashboard App
1. **Create Page Component:** Add `frontend/src/pages/YourFeature.jsx`.
2. **Register Sub-Route:** In `frontend/src/PageRouting/Routings.jsx`:
   ```jsx
   <Route path="/app" element={<Layout />}>
       <Route index element={<Dashboard />} />
       <Route path="resume" element={<AnalyzeResume />} />
       <Route path="job" element={<JobRecommendations />} />
       <Route path="dsa" element={<DSAContent />} /> {/* Example */}
       <Route path="your-feature" element={<YourFeature />} />
   </Route>
   ```
3. **Register Sidebar Item:** In `frontend/src/components/app-sidebar.jsx`, append to `mainItems`:
   ```javascript
   {
     title: "Your Feature",
     url: "/app/your-feature",
     icon: YourLucideIcon,
   }
   ```

### B. Adding a New Backend Endpoint
* **For Authentication / User Data / Business Logic:** Add controller and route in `backend-Node/controllers/` and `backend-Node/routes/`.
* **For AI / ML / Document Processing / Computer Vision:** Add route in `backend-Py/main.py` using FastAPI async handlers.

### C. Persistent User Analytics (Recommended Next Step)
* Create `backend-Node/models/progressModel.js` linked to `userSchema._id`.
* Store completed DSA lecture IDs, LeetCode assignment toggles, past resume scores, and mock interview transcripts.
* Wire `frontend/src/pages/Dashboard.jsx` to fetch real metrics upon mount.
