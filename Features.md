# getPlaced — Comprehensive Platform Features & Metrics Specification

> **Platform Overview:**  
> **getPlaced** is an enterprise-grade, AI-powered placement preparation and career development ecosystem. It synthesizes algorithmic problem solving, real-time code execution, ATS resume intelligence, audio/behavioral mock interview simulations, university academic record synchronization (VTOP), GitHub portfolio analysis, and autonomous AI career coaching into a unified candidate readiness engine.

---

## Table of Contents

1. [System Architecture & Core Topology](#1-system-architecture--core-topology)
2. [Master Feature Catalog](#2-master-feature-catalog)
3. [Deep Feature Breakdown & Metric Specifications](#3-deep-feature-breakdown--metric-specifications)
   - [Feature 1: Placement Readiness Engine (7-Dimension Scoring)](#feature-1-placement-readiness-engine-7-dimension-scoring)
   - [Feature 2: Level Gap Analysis & Competency Benchmarking (9 Categories)](#feature-2-level-gap-analysis--competency-benchmarking-9-categories)
   - [Feature 3: getPlacedAI Autonomous Career Coach (18-Tool Gemini Agentic Engine)](#feature-3-getplacedai-autonomous-career-coach-18-tool-gemini-agentic-engine)
   - [Feature 4: AI Resume ATS Analyzer, Action Center & Builder](#feature-4-ai-resume-ats-analyzer-action-center--builder)
   - [Feature 5: AI Mock Interview Simulator & Voice Telemetry](#feature-5-ai-mock-interview-simulator--voice-telemetry)
   - [Feature 6: HR & Behavioral Preparation Hub (STAR Framework)](#feature-6-hr--behavioral-preparation-hub-star-framework)
   - [Feature 7: Company Intelligence & Technical Research](#feature-7-company-intelligence--technical-research)
   - [Feature 8: Coding Arena & Algorithmic Problem Catalog (2,800+ Problems)](#feature-8-coding-arena--algorithmic-problem-catalog-2800-problems)
   - [Feature 9: Live Monaco Coding Workspace & Execution Sandbox](#feature-9-live-monaco-coding-workspace--execution-sandbox)
   - [Feature 10: Striver Placement Sheets & Curricula Hub (28 Curricula, 3,150 Problems, 2,088 Tutorials)](#feature-10-striver-placement-sheets--curricula-hub-28-curricula-3150-problems-2088-tutorials)
   - [Feature 11: Development & Engineering Portfolio Hub (GitHub Sync & Live Tester)](#feature-11-development--engineering-portfolio-hub-github-sync--live-tester)
   - [Feature 12: Which Role Fits Me? Multi-Evidence AI Role Fit Engine (9 Canonical Tracks)](#feature-12-which-role-fits-me-multi-evidence-ai-role-fit-engine-9-canonical-tracks)
   - [Feature 13: Can I Apply? Shortlisting Probability & Eligibility Engine](#feature-13-can-i-apply-shortlisting-probability--eligibility-engine)
   - [Feature 14: Academic Profile & CGPA Cutoff Calculator (35+ Corporate Cutoffs)](#feature-14-academic-profile--cgpa-cutoff-calculator-35-corporate-cutoffs)
   - [Feature 15: VTOP University Academic Integration (Reverse-Engineered Auth & Safe Bunks)](#feature-15-vtop-university-academic-integration-reverse-engineered-auth--safe-bunks)
   - [Feature 16: Placement Roadmap & Timeline Planner (Multi-Phase Sprints)](#feature-16-placement-roadmap--timeline-planner-multi-phase-sprints)
   - [Feature 17: Gamified Milestones & Prestige Tier Engine (Bronze to Diamond)](#feature-17-gamified-milestones--prestige-tier-engine-bronze-to-diamond)
   - [Feature 18: Progress Tracker & Study Velocity Analytics](#feature-18-progress-tracker--study-velocity-analytics)
   - [Feature 19: Placement Arena, Campus Leaderboard & Peer Squads](#feature-19-placement-arena-campus-leaderboard--peer-squads)
   - [Feature 20: Job Recommendations & Placement Market (Live RapidAPI + MongoDB)](#feature-20-job-recommendations--placement-market-live-rapidapi--mongodb)
   - [Feature 21: Candidate Profile & Target Calibration Center](#feature-21-candidate-profile--target-calibration-center)
   - [Feature 22: Spotlight Global Command Palette (Ctrl+K Navigation)](#feature-22-spotlight-global-command-palette-ctrlk-navigation)
   - [Feature 23: Authentication & Security Architecture](#feature-23-authentication--security-architecture)
4. [Comprehensive Metrics & Telemetry Reference Table](#4-comprehensive-metrics--telemetry-reference-table)
5. [Summary & Competitive Advantage Matrix](#5-summary--competitive-advantage-matrix)

---

## 1. System Architecture & Core Topology

The **getPlaced** platform is constructed across three high-performance layers:

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
              │   (Auth, Readiness, Gap Engine,      │     │   (Gemini AI Intelligence, LeetCode   │
              │    Coach Agent, Roadmap & Squads)    │     │    Sandbox, OCR, Sheets & Articles)   │
              │           Port 3000 (Docker/Dev)     │     │        Port 8000 (Docker/Dev)         │
              └──────────────────┬───────────────────┘     └───────────────────┬───────────────────┘
                                 │                                             │
                                 │ Mongoose                                    │ External APIs & SQLite
                                 ▼                                             ▼
              ┌──────────────────────────────────────┐     ┌───────────────────────────────────────┐
              │         MongoDB Database             │     │      • Google Gemini (3.7 / 1.5 Flash)│
              │   (Users, Profiles, Progress, Jobs)  │     │      • RapidAPI (JSearch)             │
              │           Port 27017                 │     │      • SQLite (articles.db, 2,088 tut)│
              │                                      │     │      • SQLite (leetcode.db, 2,800+ q) │
              └──────────────────────────────────────┘     └───────────────────────────────────────┘
```

---

## 2. Master Feature Catalog

| # | Feature Name | Primary Route(s) | Primary Technology | Key Function |
|---|---|---|---|---|
| **1** | **Placement Readiness Engine** | `/app`, `/api/readiness` | Node.js, Mongoose, Math Engine | Computes dynamic 7-dimension weighted readiness score with non-penalizing re-normalization. |
| **2** | **Level Gap Analysis Engine** | `/app/gap-analysis`, `/api/gap-analysis` | Node.js, Custom Taxonomy | Compares candidate proficiency (0-10) against Tier-1/2/3 company bars across 9 categories. |
| **3** | **getPlacedAI Career Coach** | `/app/coach`, `/onboarding` | Google GenAI SDK, Gemini Cascade | Multi-turn autonomous agent with 18 callable tools for database mutation, gap analysis & strategy. |
| **4** | **AI Resume ATS Analyzer & Builder** | `/app/resume`, `/resume` | FastAPI, Gemini 1.5, pdfplumber, Tesseract | Parses resumes via PDF OCR, evaluates ATS score (0-100), executes Google XYZ bullet rewrites. |
| **5** | **AI Mock Interview Simulator** | `/app/interview`, `/interview` | FastAPI, Gemini AI, Web Speech API | Multi-turn speech-to-text interview simulation with audio timer, STAR evaluation & PDF export. |
| **6** | **HR & Leadership Prep Hub** | `/app/hr-prep`, `/hr-prep` | FastAPI, Gemini AI, Speech Rec | Behavioral question trainer mapped to Amazon LPs, Google Googliness, and STAR framework. |
| **7** | **Company Intelligence & Research** | `/app/company-intel`, `/company-intel` | FastAPI, Gemini AI, Web Grounding | Deep company intelligence dossiers covering interview rounds, tech stacks, and DSA frequencies. |
| **8** | **Coding Arena & Problem Catalog** | `/app/coding`, `/app/problems` | FastAPI, SQLite (`leetcode.db`) | 2,800+ problem catalog with Blind 75, Top 150, tags, difficulty filters, and solved tracker. |
| **9** | **Live Monaco Coding Workspace** | `/app/coding/:slug` | React Monaco Editor, FastAPI Sandbox | Full IDE with multi-language runner, custom test cases, AI code assistant, and official solutions. |
| **10** | **Striver Placement Sheets Hub** | `/app/sheets`, `/app/dsa` | FastAPI, SQLite (`articles.db`) | 28 master curricula (3,150 problems), 2,088 offline tutorials, video lecture modals, and IDE launchers. |
| **11** | **Development & Engineering Portfolio** | `/app/development` | Node.js, GitHub REST API, Axios | Syncs GitHub repos, calculates project score (0-100), tests live URLs, and provides 6 learning tracks. |
| **12** | **Which Role Fits Me? (Role Fit AI)** | `/app/role-fit`, `/role-fit` | Node.js, Multi-Evidence Engine | Matches candidate across 9 canonical tech tracks with 5-tier evidence weighting & 1-click adoption. |
| **13** | **Can I Apply? Eligibility Engine** | `/app/can-i-apply`, `/can-i-apply` | Node.js, Multi-Tier Scoring | Simulates shortlisting probability across 4 dimensions and identifies hard eligibility blockers. |
| **14** | **Academic Profile & Cutoff Calculator** | `/app/academics` | Node.js, Mathematical Model | Calculates required future SGPA for target CGPA and evaluates 35+ corporate cutoffs. |
| **15** | **VTOP University Academic Sync** | `/app/vtop` | Node.js, Reverse-Engineered Session Auth | Multi-step captcha login, attendance debarment warning (<75%), and safe bunks calculator. |
| **16** | **Placement Roadmap & Timeline** | `/app/roadmap` | Node.js, Roadmap Service | Multi-phase sprint generator (4, 8, 12 weeks) with week-by-week interactive task checklists. |
| **17** | **Gamified Milestones & Prestige Tiers**| `/app/milestones` | Node.js, Milestone Model | 5 prestige tiers (Bronze to Diamond), XP rewards claiming, and 30+ achievement badges. |
| **18** | **Progress Tracker & Velocity Analytics**| `/app/progress` | Node.js, Recharts, Area Charts | Daily study streaks, problem-solving velocity charts, custom activity logging, and XP logs. |
| **19** | **Placement Arena & Peer Squads** | `/app/arena` | Node.js, MongoDB, Squad Model | Campus/Global leaderboards, peer squad creation/joining via code, real-time chat, and sprint goals. |
| **20** | **Job Recommendations & Market** | `/app/job`, `/app/jobs` | Node.js, RapidAPI JSearch, MongoDB | Live job search in India/Remote with salary benchmarks, skill matching, and 1-click apply. |
| **21** | **Candidate Profile & Target Center** | `/app/profile` | Node.js, Mongoose, User Model | Central dashboard managing target company, target role, education, LeetCode, GitHub, and skills. |
| **22** | **Spotlight Global Command Palette** | `Ctrl+K` / `Cmd+K` across all views | React, Radix UI Primitives | Instant search and navigation across all platform features, problems, tools, and actions. |
| **23** | **Authentication & Security Suite** | `/login`, `/register` | Node.js, JWT HttpOnly, Bcrypt | Secure authentication with 30-day HttpOnly cookie lifecycle and password encryption. |

---

## 3. Deep Feature Breakdown & Metric Specifications

---

### Feature 1: Placement Readiness Engine (7-Dimension Scoring)

#### Purpose & How It Helps
The Placement Readiness Engine is the core analytical brain of getPlaced. It provides candidates with an objective, holistic, and explainable placement readiness score (0–100%) by analyzing their progress across seven fundamental hiring dimensions.

Unlike naive scoring algorithms that penalize candidates for unstarted modules (giving artificial zeroes), getPlaced uses a **Dynamic Re-Normalized Weighting Algorithm**:
$$\text{Overall Score} = \frac{\sum (\text{Available Category Score} \times \text{Canonical Weight})}{\sum (\text{Available Category Weights})}$$

This ensures that candidate scores accurately reflect completed assessments without negative bias while clearly showing active framework coverage.

#### Metrics Provided
* **Overall Composite Readiness Score (0–100%)**: Single calibrated index indicating placement probability.
* **Target Benchmark Score (0–100%)**: Threshold dynamically determined by company tier (Tier-1: 90%, Tier-2: 85%, Tier-3: 75%).
* **Overall Placement Gap (pts)**: Difference between the target benchmark and candidate composite score ($\max(0, \text{Target} - \text{Score})$).
* **Overall Status Level**: Tiered classification (`Highly Ready` [90-100], `Interview Ready` [75-89], `Developing` [60-74], `Needs Major Improvement` [40-59], `Not Ready` [0-39]).
* **Active Weight Coverage (%)**: Percentage of the 7 dimensions currently evaluated ($\sum \text{Available Canonical Weights} \times 100$).
* **7 Dimensional Scores & Sub-Metrics**:
  1. **DSA Dimension (25% Weight)**: Derived from LeetCode synced counts (Easy/Med/Hard) or curriculum progress.
  2. **Technical Skills Dimension (20% Weight)**: Degree rigor, verified core stack, and target role alignment.
  3. **Projects & GitHub Dimension (15% Weight)**: Repositories, stars, forks, architectural complexity, and deployment verification.
  4. **Resume ATS Dimension (15% Weight)**: Parse rate, keyword density, and quantified impact bullets.
  5. **Academics Dimension (10% Weight)**: Weighted formula: $0.7 \times (\text{CGPA} \times 10) + 0.15 \times 10\text{th}\% + 0.15 \times 12\text{th}\%$.
  6. **Communication Dimension (7.5% Weight)**: Spoken clarity, pacing (WPM), filler word density, and articulation.
  7. **Mock Interview Dimension (7.5% Weight)**: Live coding simulation, technical depth, and STAR delivery scores.
* **Top 3 Priority Gap Areas**: Ordered by impact priority ($\text{Gap} \times \frac{\text{Dimension Weight}}{0.25}$), with recommended direct action links.

---

### Feature 2: Level Gap Analysis & Competency Benchmarking (9 Categories)

#### Purpose & How It Helps
Level Gap Analysis translates qualitative placement advice into granular numerical skill benchmarks (0.0 to 10.0 scale). It compares candidate skills against specific corporate expectations for Tier-1 (Google, Microsoft, Meta, Uber, Amazon), Tier-2 (Oracle, Adobe, Cisco, Razorpay), and Tier-3 (TCS, Infosys, Wipro, Accenture) companies.

#### Metrics Provided
* **Exact Numerical Level Gap**: Calculated as $\text{Gap} = \text{Current Level} - \text{Required Level}$ (e.g., $-1.5$ levels).
* **Status Classification**: `Above Requirement` ($\text{Gap} > 0$), `Meets Requirement` ($\text{Gap} = 0$), `Needs Improvement` ($-2.5 < \text{Gap} < 0$), `Major Gap` ($\text{Gap} \le -2.5$), `Not Analyzed` (data pending).
* **9 Category Assessments & 25+ Specific Competencies**:
  1. **Data Structures & Algorithms (DSA)**: Overall DSA, Arrays/Hashing, Binary Search, Trees/BST, Graphs (BFS/DFS), Dynamic Programming.
  2. **Technologies & Role Stack**: Role-tailored stacks (Frontend: React/TS; Backend: Node/Java/SQL; ML: Python/PyTorch; DevOps: Docker/K8s).
  3. **Projects & Portfolio**: Architectural complexity, live deployment URLs, commit hygiene, and testing.
  4. **Resume ATS Strength**: Parse rate, target role keyword density, quantified action bullets.
  5. **Academics & Eligibility**: Undergraduate CGPA vs cutoff, 10th/12th percentages, core CS coursework.
  6. **Communication & Articulation**: Spoken clarity, think-out-loud protocol, STAR structured delivery.
  7. **HR & Behavioral Readiness**: Company values alignment, conflict resolution, crisis management.
  8. **Core CS & Technical Interview**: DBMS/SQL indexing, OS virtual memory/threads, Computer Networks (TCP/HTTP), System Design scalability.
  9. **Professional Competencies**: Analytical problem solving, fast learning, adaptability.
* **Evidence & Action Trail**: Every analyzed competency includes recorded evidence bullets and 2 actionable improvement steps.

---

### Feature 3: getPlacedAI Autonomous Career Coach (18-Tool Gemini Agentic Engine)

#### Purpose & How It Helps
The AI Career Coach (`getPlacedAI`) is an autonomous multi-turn career advisor. Powered by a Google GenAI cascade (`gemini-3.7-flash` $\rightarrow$ `gemini-3.5-flash` $\rightarrow$ `gemini-3.5-flash-lite` $\rightarrow$ `gemini-3.1-flash-lite`), it doesn't just chat—it possesses 18 real callable tools to inspect candidate data, query external databases, recalculate readiness, and execute mutations directly on the platform.

#### Metrics & Agent Capabilities
* **18 Canonical Tool Call Dispatchers**:
  1. `get_user_profile`: Retrieves candidate profile, targets, CGPA, and resume scores.
  2. `get_placement_readiness`: Calculates dynamic 7-dimension readiness and top gap priorities.
  3. `get_company_gap_analysis`: Runs level gap analysis against target company benchmarks.
  4. `get_dsa_analytics_and_problems`: Inspects LeetCode distribution and searches 28 Striver curricula.
  5. `get_github_project_analysis`: Evaluates connected GitHub portfolio, repositories, and languages.
  6. `get_academic_vtop_status`: Retrieves verified university marks, credits, and active arrears.
  7. `get_resume_analysis`: Fetches ATS evaluations, matched skills, and missing keywords.
  8. `get_roadmap_and_milestones`: Inspects active multi-phase sprint tasks and completion percentages.
  9. `get_job_recommendations`: Searches matching live job and internship openings.
  10. `get_mock_interview_history`: Retrieves past interview scores and speech metrics.
  11. `get_progress_analytics`: Inspects daily streaks, study hours, problem velocity, and XP.
  12. `update_target_ambition`: **Mutation tool** updating target company, role, or timeline and recalibrating roadmaps.
  13. `update_academic_profile`: **Mutation tool** updating candidate CGPA, college, and percentages.
  14. `sync_github_profile`: **Mutation tool** triggering live GitHub account sync and project scoring.
  15. `sync_leetcode_profile`: **Mutation tool** triggering live LeetCode stats sync and problem counts.
  16. `generate_or_update_roadmap`: **Mutation tool** generating customized 4, 8, or 12-week preparation roadmaps.
  17. `update_milestone_status`: **Mutation tool** claiming milestone rewards and toggling tasks.
  18. `add_action_item_todo`: **Mutation tool** inserting tasks directly into the candidate's dashboard checklist.
* **Autonomous Multi-Turn Execution**: Executes up to 5 tool-calling turns per user message.
* **Global Floating Coach Sidekick (`GlobalCoachSidekick.jsx`)**: Context-aware drawer available across all dashboard routes, providing proactive hints based on current page URL.
* **Action Cards & Interactive Chips**: Generates 1-click interactive prompt chips and visual action cards for fast decision execution.

---

### Feature 4: AI Resume ATS Analyzer, Action Center & Builder

#### Purpose & How It Helps
The Resume Intelligence suite provides end-to-end resume evaluation and real-time optimization. It converts standard PDF resumes into actionable insights, detects missing industry keywords, scores ATS compliance, and rewrites weak bullet points using Google's XYZ formula without artificial score inflation.

```
                  ┌────────────────────────────────────────┐
                  │          Uploaded Resume PDF           │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       pdfplumber Text Extraction       │
                  │       (pytesseract OCR Fallback)       │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       Google Gemini 1.5 Flash          │
                  │   Multi-Category ATS Scoring Engine    │
                  └───────────────────┬────────────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
┌──────────────┐             ┌──────────────────┐           ┌──────────────────┐
│  ATS Score   │             │ Matched/Missing  │           │ Google XYZ Action│
│ (0-100 Tier) │             │     Keywords     │           │ Center & PDF Doc │
└──────────────┘             └──────────────────┘           └──────────────────┘
```

#### Metrics Provided
* **Overall ATS Score (0–100)**: Composite parse and recruitment score with tier classification (`Exceptional`, `Strong`, `Competitive`, `Needs Work`, `Poor`).
* **5 Category Sub-Scores (0–100%)**:
  1. **Formatting & Structure**: Layout simplicity, single-column alignment, header hierarchy, and OCR readability.
  2. **Keyword Relevance**: Keyword density matching target job roles and recruiter search queries.
  3. **Impact & Metrics**: Presence of numbers, percentages, dollar amounts, and latency benchmarks.
  4. **Skills Alignment**: Coverage of programming languages, frameworks, databases, and cloud tools.
  5. **Experience Relevance**: Relevance of work history, internships, and technical projects.
* **Keyword Matching Matrix**:
  * **Matched Keywords**: Extracted tools and concepts categorized into Languages, Frameworks, Cloud/DevOps, Databases, Core CS.
  * **Missing Critical Keywords**: Missing high-frequency skills with importance ratings (High/Medium/Low) and rationale.
* **Structured Action Center (`ResumeActionCenter.jsx`)**:
  * Generates structured before/after diff previews for identified deficiencies.
  * 1-Click "Apply Selected Actions" with verified score recalculation ($\Delta \text{ATS Score}$, $\Delta \text{Category Scores}$).
* **Google XYZ Formula Bullet Optimizer**: Transforms passive statements into high-impact bullets: *"Accomplished [X], as measured by [Y], by doing [Z]"*.
* **PDF Export Utility**: One-click generation of formatted `Resume_Analysis_Report.pdf` directly in the browser via `jspdf`.

---

### Feature 5: AI Mock Interview Simulator & Voice Telemetry

#### Purpose & How It Helps
The AI Mock Interview Simulator replicates high-pressure technical and behavioral screening rounds. It provides candidates with real-time video/microphone practice, dynamic question sequencing, conversational AI follow-ups, and comprehensive post-interview hiring scorecards.

#### Metrics Provided
* **Live Question Engine**: Tailors question banks to target company (Google, Amazon, Meta, Microsoft, etc.), role (Full Stack, Backend, SDE-1), and round type (Technical, Behavioral/HR, System Design, Mixed).
* **Communication & Speech Telemetry**:
  * **Spoken Word Count & Pacing**: Words per minute (WPM) calculation against optimal interview benchmarks (120–150 WPM).
  * **Filler Word Counter & Density**: Exact count and categorization of verbal fillers (`um`, `uh`, `like`, `you know`, `actually`, `basically`).
  * **Clarity & Articulation Index (0–100)**: Evaluates conciseness and technical terminology usage.
* **STAR Framework Compliance Metrics**:
  * Situation Detected (`true`/`false`)
  * Task Detected (`true`/`false`)
  * Action Phase Percentage (Target: $\ge 50\%$ of response)
  * Result & Metrics Detected (`true`/`false`)
* **Intelligent Conversational Follow-Up**: Dynamically generates follow-up questions challenging specific claims made in the candidate's answer.
* **Comprehensive Post-Session Report Card**:
  * **Overall Session Score (0–100)**
  * **Official Hiring Recommendation**: `Strong Hire`, `Hire`, `Leaning Hire`, `Needs Improvement`, `No Hire`.
  * **5-Axis Radar Competency Chart**: Communication, STAR Structure, Technical Depth, Problem Solving, Culture Fit.
  * **Key Strengths, Growth Areas & Actionable Next Steps**.

---

### Feature 6: HR & Behavioral Preparation Hub (STAR Framework)

#### Purpose & How It Helps
The HR & Behavioral Hub prepares engineers for culture and leadership screening rounds. It trains candidates to answer situational questions using the industry-standard STAR methodology, mapped to company-specific operating principles (e.g., Amazon's 16 Leadership Principles, Google's Googliness, Microsoft's Growth Mindset).

#### Metrics Provided
* **STAR Framework Blueprint Allocation**:
  * **Situation (20% Weight)**: Context, system constraints, business stakes.
  * **Task (10% Weight)**: Individual responsibility and primary goal.
  * **Action (50% Weight)**: Engineering decisions, trade-offs, implementation steps.
  * **Result (20% Weight)**: Quantifiable outcomes, latency savings, business metrics.
* **Curated Leadership Banks & Evaluator Intent**: Explains why recruiters ask each question, what green flags they seek, and provides model STAR answers.
* **Real-Time Speech Evaluation & STAR Compliance**: Instant badge scoring showing missing STAR components and strategic improvement tips.

---

### Feature 7: Company Intelligence & Technical Research

#### Purpose & How It Helps
Company Intelligence provides candidates with deep dossiers on top tech employers. It eliminates guesswork by detailing exact interview round formats, duration, technical stack, core values, and historical DSA pattern frequencies.

#### Metrics Provided
* **Company Profile & Cultural DNA**: Headquarters, industry, tier, culture summary, and operating values.
* **Production Tech Stack**: Primary frontend frameworks, backend languages, databases (e.g., Google Spanner, Meta TAO, Amazon DynamoDB), and cloud infrastructure.
* **Interview Round Blueprints**: Step-by-step breakdown of all rounds (OA, Tech 1, Tech 2, System Design, Bar Raiser/AA) with duration, platform format, focus topics, and passing criteria.
* **Historical DSA Topic Frequencies**:
  * Topic pattern name (e.g., Graph Dijkstra, 2D Dynamic Programming, Trie).
  * Frequency rating (`Very High`, `High`, `Medium`).
  * High-probability sample interview problems.
* **Dynamic AI Generation Engine**: Uses Gemini AI with web grounding to generate real technical profiles for unlisted enterprise or startup companies.

---

### Feature 8: Coding Arena & Algorithmic Problem Catalog (2,800+ Problems)

#### Purpose & How It Helps
The Coding Arena is getPlaced's standalone coding practice catalog. Powered by an embedded SQLite database (`leetcode.db`) containing 2,800+ LeetCode problems, it allows candidates to practice algorithmic challenges without external platform dependencies.

#### Metrics Provided
* **Problem Distribution Counters**:
  * Total Problems Solved vs Available (e.g., 45 / 2,800+).
  * Easy Solved vs Total Available.
  * Medium Solved vs Total Available.
  * Hard Solved vs Total Available.
* **Curated Preparation Tracks**: Blind 75, Top Interview 150, Dynamic Programming, Trees & Graphs.
* **Tag & Topic Taxonomy**: 25+ topic tags with problem counts (Arrays, Hash Tables, Binary Search, DP, Graphs, etc.).
* **State Synchronization**: Instant synchronization with connected LeetCode profile solved sets and local workspace history.

---

### Feature 9: Live Monaco Coding Workspace & Execution Sandbox

#### Purpose & How It Helps
The Coding Workspace (`/app/coding/:slug`) provides a live, distraction-free code execution environment built with Microsoft Monaco Editor (the editor powering VS Code). Candidates can write code, run sample tests, execute custom inputs, receive AI debugging hints, and benchmark runtime efficiency.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Monaco Editor Workspace                          │
│  [Python / C++ / Java / JS]  •  Theme Selector  •  [Run Code]  [Submit]     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│                                      │                                      │
│  Problem Description & Constraints   │         Live Code Editor             │
│  • Task ID, Title, Difficulty Badge  │         (Monaco Engine)              │
│  • LaTeX Math Formula Formatting     │                                      │
│  • Examples & Interactive Test Cases │                                      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│  Execution Console & AI Code Assistant                                      │
│  • Test Case Results (Passed/Failed)  • Runtime (ms)  • Memory (MB)         │
│  • AI Hints / Code Explanation / Debugger / Complexity Optimization         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Metrics Provided
* **Multi-Language Execution Engine**: Python, C++, Java, JavaScript support.
* **Test Case Evaluation Metrics**: Status (`Accepted`, `Wrong Answer`, `Runtime Error`, `Time Limit Exceeded`), execution runtime in milliseconds (ms), memory footprint in MB, and stdout logs.
* **AI Code Assistant (4 Modes)**:
  1. `Hint`: Algorithmic direction without spoiling full code solutions.
  2. `Explain`: Line-by-line code explanation and state walkthrough.
  3. `Debug`: Identifies logic bugs, off-by-one errors, and unhandled edge cases.
  4. `Optimize`: Analyzes time/space complexity and suggests asymptotic optimizations ($O(N^2) \rightarrow O(N \log N)$).
* **Official Editorial Solutions**: Complete verified reference implementations with complexity analysis.

---

### Feature 10: Striver Placement Sheets & Curricula Hub (28 Curricula, 3,150 Problems, 2,088 Tutorials)

#### Purpose & How It Helps
The Striver & Placement Curricula Hub provides candidates with a complete, structured curriculum spanning Data Structures, Core CS Subjects, System Design, and Competitive Programming. Powered by `takeuforward_sheets_and_playlists.json` and `articles.db`, it offers 28 complete learning tracks with in-app Markdown readers and video lecture modals.

#### Catalog Breakdown & Metrics
* **28 Master Curricula Catalog (3,150 Total Problems)**:
  1. **4 Master DSA Sheets (819 Problems)**: Striver's A2Z DSA Sheet (474 problems), Striver's SDE Sheet (191 problems), Blind 75 Sheet (75 problems), Striver's 79 Last Moment Sheet (79 problems).
  2. **3 Core CS Subject Sheets (111 Problems)**: Computer Networks (54 topics), DBMS (29 topics), Operating Systems (28 topics).
  3. **1 System Design Roadmap (70 Topics)**: Complete System Design Roadmap for SDEs.
  4. **1 Competitive Programming Sheet (297 Problems)**: Striver's CP Sheet.
  5. **9 DSA Topic Playlists (344 Problems)**: Arrays, Binary Search, DP, Graphs, Linked Lists, Recursion, Stack & Queue, Strings, Trees.
  6. **10 TUF+ Comprehensive Courses (1,509 Topics)**: TUF+ DSA, Low Level Design (LLD), Object-Oriented Programming (OOPS), SQL Data Engineering, OS by Striver, CN by Striver, DBMS Core, OS Core, DSA Quick Revision.
* **In-App Tutorial Reader (`SheetArticleModal.jsx`)**: 2,088 in-depth offline Markdown articles with formulas, intuition, diagrams, and multi-language code snippets (C++, Java, Python, JavaScript).
* **Live Sandbox Bridge**: 669+ matched problems link directly to the Monaco Coding Workspace with a single click.
* **Embedded Video Modals (`SheetVideoModal.jsx`)**: Official YouTube lecture videos embedded directly into the learning flow.

---

### Feature 11: Development & Engineering Portfolio Hub (GitHub Sync & Live Tester)

#### Purpose & How It Helps
The Development Hub assesses the candidate's real-world software engineering depth. It synchronizes with their public GitHub profile, computes an algorithmic Project Score (0–100), tests live production URLs, and provides learning tracks for modern backend/cloud architecture.

#### Metrics Provided
* **GitHub Portfolio Synchronization**:
  * Public Repositories Count & Original Repositories Count (excluding forks).
  * Total GitHub Stars & Downstream Forks.
  * Primary Programming Languages & Percentage Distribution.
  * Top Featured Repositories with descriptions and star counts.
* **Algorithmic Project Score (0–100%)**: Evaluates repository volume, original projects ratio, stars/forks, and multi-language versatility.
* **Live Deployment Endpoint Tester (`/api/github/verify-live`)**: Tests production URLs, measures HTTP status codes (200 OK), and measures network latency in milliseconds (ms).
* **6 Engineering Learning Tracks**:
  1. Microservices Architecture & Resilience
  2. Docker Containerization & Kubernetes Orchestration
  3. High-Throughput Caching & Database Indexing (Redis / PostgreSQL)
  4. Production Authentication, OAuth2 & Security
  5. React Enterprise Architecture & Web Performance
  6. Automated CI/CD Pipelines & Testing Automation

---

### Feature 12: Which Role Fits Me? Multi-Evidence AI Role Fit Engine (9 Canonical Tracks)

#### Purpose & How It Helps
Many engineering students are uncertain which career track best matches their background. The Role Fit Engine runs multi-evidence matching across 9 canonical engineering tracks to identify their ideal career direction, calculate skill match percentages, and provide 1-click platform adoption.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 5-Tier Evidence Weighting Matrix (100%)                     │
├────────────────────────┬──────────────────────────┬─────────────────────────┤
│ GitHub Repos & Stack   │ LeetCode DSA Patterns    │ Verified Tech Skills    │
│       (30% Weight)     │       (25% Weight)       │       (25% Weight)      │
├────────────────────────┴──────────────────────────┴─────────────────────────┤
│ Resume ATS Keywords (10% Weight)  •  Academic Specialization (10% Weight)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Metrics Provided
* **9 Evaluated Canonical Tracks**:
  1. Software Development Engineer (SDE / Core Systems)
  2. Full Stack Web Engineer
  3. Frontend Platform Engineer
  4. Backend Infrastructure Engineer
  5. Cloud & DevOps Engineer
  6. Data Engineer
  7. Machine Learning / AI Engineer
  8. Mobile App Engineer (iOS / Android / Flutter)
  9. Cyber Security & AppSec Engineer
* **Match Score (0–100%) & Grade**: `Tier 1 Fit` ($\ge 85\%$), `Strong Fit` (75–84%), `Moderate Fit` (60–74%), `Developing Fit` (<60%).
* **5 Evidence Signal Breakdowns**:
  * GitHub repository stack alignment.
  * LeetCode pattern distribution.
  * Self-assessed verified competencies.
  * ATS resume keyword presence.
  * Academic coursework and degree rigor.
* **Side-by-Side Comparison Matrix**: Compare up to 3 career tracks across skill gaps, DSA bars, compensation ranges (e.g. ₹14–35 LPA), and hiring employers.
* **1-Click Target Role Adoption**: Updates user profile and dynamically recalibrates roadmaps and gap analyses.

---

### Feature 13: Can I Apply? Shortlisting Probability & Eligibility Engine

#### Purpose & How It Helps
The `Can I Apply?` engine evaluates whether a candidate will pass initial resume and eligibility filters for a specific company and role. It assesses four recruitment dimensions, alerts candidates to hard blockers (e.g., CGPA below cutoff, active backlogs), and computes shortlisting probability.

#### Metrics Provided
* **Executive Decision State**:
  * `READY`: Composite score $\ge 80\%$, zero blockers $\rightarrow$ Immediate green light to apply.
  * `ALMOST_READY`: Composite score 65–79%, zero hard blockers $\rightarrow$ Recommend fixing top 2 risks.
  * `NOT_READY`: Composite score <65% $\rightarrow$ Significant preparation required.
  * `HARD_BLOCKER`: Ineligible due to academic cutoffs or active arrears.
* **Composite Readiness Score (0–100%) vs Target Bar**.
* **4 Dimensional Audit Scores (0–100%)**:
  1. **Academic Eligibility (Weight: 25%)**: Undergrad CGPA vs minimum cutoff, active arrears check, 10th/12th minimum percentages, eligible engineering branches.
  2. **DSA & Technical Depth (Weight: 35%)**: Problem volume vs company tier benchmark, Medium/Hard problem ratios, core algorithm coverage.
  3. **Projects & ATS Profile (Weight: 25%)**: ATS resume score, GitHub original repositories, live production deployment verification.
  4. **Interview & Soft Skills (Weight: 15%)**: Behavioral mock scores, spoken clarity, STAR response structure.
* **Critical Risk Detection**: Highlights exact gaps (e.g., *"CGPA 7.2 < Cutoff 7.5 (Gap: -0.30)"*, *"Need 40 more Medium problems"*).

---

### Feature 14: Academic Profile & CGPA Cutoff Calculator (35+ Corporate Cutoffs)

#### Purpose & How It Helps
The Academic suite helps candidates manage their academic baseline and evaluate eligibility across 35+ top corporate recruiters. It includes a mathematical **Target CGPA Requirement Calculator** to determine exact future SGPA goals.

#### Mathematical Formulation & Metrics
* **Target SGPA Requirement Formula**:
  $$\text{Required SGPA per Semester} = \frac{\text{Target CGPA} \times \text{Total Semesters} - \text{Current CGPA} \times \text{Completed Semesters}}{\text{Remaining Semesters}}$$
* **Maximum Achievable CGPA**:
  $$\text{Max Possible CGPA} = \frac{\text{Current CGPA} \times \text{Completed Semesters} + 10.0 \times \text{Remaining Semesters}}{\text{Total Semesters}}$$
* **Difficulty Classification**:
  * `Comfortable`: Required $\text{SGPA} < 7.5$.
  * `Moderate`: Required $\text{SGPA} \in [7.5, 8.5]$.
  * `Challenging`: Required $\text{SGPA} \in [8.5, 9.2]$.
  * `Very Challenging`: Required $\text{SGPA} > 9.2$.
  * `Impossible`: Mathematically unattainable ($\text{Required SGPA} > 10.0$).
* **35+ Company Corporate Cutoff Database**: Detailed academic requirements for Google, Microsoft, Amazon, Atlassian, Adobe, Uber, Goldman Sachs, Cisco, Oracle, Swiggy, TCS, Infosys, Wipro, Accenture, etc.
  * Minimum CGPA and preferred CGPA.
  * 10th and 12th minimum board percentages.
  * Maximum active and historical backlogs permitted.
  * Eligible branches and average compensation package (LPA).

---

### Feature 15: VTOP University Academic Integration (Reverse-Engineered Auth & Safe Bunks)

#### Purpose & How It Helps
For university students (specifically VIT VTOP portal users), getPlaced provides direct academic record integration. Built on a reverse-engineered session authentication protocol with in-memory OCR captcha handling, it syncs transcripts, marks, and attendance—providing an attendance debarment warning system and **Safe Bunks Calculator**.

#### Metrics Provided
* **Automated Multi-Step Session Handshake**:
  1. `POST /vtop/prelogin/setup`: Initializes JSESSIONID and handshake tokens.
  2. Base64 Captcha Acquisition & OCR preprocessing.
  3. `POST /vtop/login`: Validates credentials against `authorizedIDX` DOM response.
  4. Automated harvesting of TimeTable, Attendance, CAT1/CAT2/FAT Marks, and Grades.
* **Attendance Risk & Safe Bunks Predictor**:
  * **Course Attendance Percentage**: $\frac{\text{Attended Classes}}{\text{Total Classes}} \times 100$.
  * **Debarment Risk Flag**: Active warning if attendance drops below university mandatory $75.0\%$.
  * **Safe Bunks Calculation**:
    $$\text{Safe Bunks} = \max\left(0, \left\lfloor \frac{\text{Attended}}{0.75} - \text{Total} \right\rfloor\right)$$
  * **Recovery Classes Required**:
    $$\text{Classes to Recover} = \max(0, \lceil 3 \times \text{Total} - 4 \times \text{Attended} \rceil)$$
* **Placement Tier Eligibility Assessment**:
  * Super Dream Eligible ($\text{CGPA} \ge 9.0$, zero backlogs).
  * Dream Eligible ($\text{CGPA} \ge 7.5$, $\le 1$ backlog).
  * Regular Eligible ($\text{CGPA} \ge 6.0$).
* **Core CS GPA Calculator**: Aggregates grades specifically across core computer science courses (`CSE1001`, `CSE2003`, `CSE2004`, `CSE2005`, `CSE3001`).

---

### Feature 16: Placement Roadmap & Timeline Planner (Multi-Phase Sprints)

#### Purpose & How It Helps
The Placement Roadmap generates a structured, week-by-week preparation plan tailored to the candidate's target company, role, and available preparation window (4, 8, or 12 weeks). It breaks prep down into actionable milestones with task checklists.

#### Metrics Provided
* **Dynamic Multi-Phase Progression**:
  1. **Phase 1: Foundation & Core Algorithms** (Weeks 1–2): Arrays, Hashing, Two Pointers, ATS Resume baseline.
  2. **Phase 2: Core CS & Algorithmic Acceleration** (Weeks 3–4): Trees, Binary Search, OS/DBMS Fundamentals, GitHub repository polish.
  3. **Phase 3: Advanced DSA & System Architecture** (Weeks 5–6): Graphs, Dynamic Programming, System Design, Live Deployment testing.
  4. **Phase 4: High-Stakes Mock Simulation & Polish** (Weeks 7–8): Timed mock interviews, company-specific questions, STAR behavioral polish.
* **Weekly Action Checklist**: Interactive checkmark tasks categorized into `dsa`, `resume`, `project`, `academics`, `interview`, `core_cs`.
* **Roadmap Velocity & Completion Percentage**: Real-time progress tracker measuring overall task completion.

---

### Feature 17: Gamified Milestones & Prestige Tier Engine (Bronze to Diamond)

#### Purpose & How It Helps
Preparation consistency is hard to maintain over several months. getPlaced introduces a gamification and prestige tier framework that rewards candidates with XP and badges for completing verified preparation milestones.

#### Metrics Provided
* **5 Prestige Tiers**:
  1. **Bronze**: Baseline entry tier (0–200 XP).
  2. **Silver**: Active learner (200–500 XP).
  3. **Gold**: Competitive candidate (500–1,000 XP).
  4. **Platinum**: High performer (1,000–1,800 XP).
  5. **Diamond**: Super-Dream Ready ($\ge 1,800$ XP).
* **30+ Verified Milestone Badges**:
  * *DSA Pioneer*: Solve first 25 LeetCode problems (100 XP).
  * *DP Sprint Ace*: Master 15 Dynamic Programming problems (250 XP).
  * *ATS Terminator*: Achieve 85%+ AI Resume ATS score (200 XP).
  * *Open Source Architect*: Connect GitHub with 3+ original repositories (150 XP).
  * *Academic Fortress*: Maintain CGPA $\ge 8.5$ (150 XP).
  * *Streak Machine*: Maintain 7-day practice streak (200 XP).
* **Reward Claiming**: Unlocked milestones feature interactive reward claiming that deposits XP directly into the candidate profile.

---

### Feature 18: Progress Tracker & Study Velocity Analytics

#### Purpose & How It Helps
The Progress Tracker visualizes candidate study velocity, daily habits, and readiness trajectory over 7-day, 30-day, or 90-day timeframes using interactive Recharts graphs.

#### Metrics Provided
* **Daily Practice Streak (Days)**: Consecutive active days on the platform with streak flame badges.
* **Total Study Hours Logged**: Cumulative time invested across coding, mock interviews, and reading.
* **Problem Velocity Chart**: Interactive Area & Line charts tracking problems solved per week.
* **Readiness Trajectory Graph**: 5-line historical trend chart tracking Overall Readiness, DSA Score, Project Score, Resume Score, and Interview Score over time.
* **Manual Activity Logging**: Log custom preparation sessions (e.g., 45 mins of DBMS study) with category tagging and XP rewards.

---

### Feature 19: Placement Arena, Campus Leaderboard & Peer Squads

#### Purpose & How It Helps
The Placement Arena enables peer motivation through healthy competition and collaborative squads. Candidates can view campus-specific leaderboards, join peer study squads using unique codes, and coordinate in real-time squad chat rooms.

#### Metrics Provided
* **Campus & Global Leaderboards**: Ranks candidates by Readiness Score, Total Solved Problems, Streak Days, and XP. Includes college name filters.
* **Peer Study Squads**:
  * Create squads with unique 8-character invite codes (e.g., `DEV8421`).
  * Collective Weekly Goals (e.g., *"Squad Target: 50 Problems Solved before Sunday"*).
  * Real-time squad chat messaging with system notifications.
  * Aggregate Squad Readiness Score calculation.
* **Weekly Competitive Challenges**: Time-limited sprints (e.g., *5 Medium DP Problems*, *5-Day Consistency Sprint*) with leaderboard rank boosts.

---

### Feature 20: Job Recommendations & Placement Market (Live RapidAPI + MongoDB)

#### Purpose & How It Helps
The Job Market connects preparation directly with employment opportunities. It aggregates active software engineering and internship openings across India and remote markets, matching candidate readiness scores against job criteria.

#### Metrics Provided
* **Live Job Search via RapidAPI JSearch**: Real-time query proxying with MongoDB persistent fallback.
* **Search & Filters**: Role keywords, city, country, and employment type (`FULLTIME`, `INTERN`, `CONTRACT`).
* **Job Card Data Points**: Job title, employer name, location, employment type, salary range, posted date, required skills tags, and direct *"Apply Now"* redirection links.

---

### Feature 21: Candidate Profile & Target Calibration Center

#### Purpose & How It Helps
The Profile Center acts as the candidate's single source of truth across getPlaced. It allows candidates to calibrate their target company, role, graduation year, academic marks, and manage API connections for GitHub and LeetCode.

#### Metrics Managed
* **Target Ambition**: Target Company (normalized), Target Role (normalized), Target Timeline Weeks, Graduation Year.
* **Academic Baseline**: University Name, Degree, Branch, CGPA, 10th & 12th Board Percentages.
* **Connected Accounts**: GitHub username & sync status, LeetCode username & sync status.
* **Verified Skills Inventory**: Categorized list of verified languages, frameworks, databases, and CS fundamentals.

---

### Feature 22: Spotlight Global Command Palette (Ctrl+K Navigation)

#### Purpose & How It Helps
The Spotlight Command Palette (`SpotlightCommandPalette.jsx`) provides power-user keyboard navigation across the entire platform. Triggered by `Ctrl+K` or `Cmd+K`, it offers instant fuzzy search across pages, actions, tools, and problem sets.

#### Capabilities
* **Instant Routing**: Navigate to any page (`/app`, `/app/resume`, `/app/coding`, `/app/interview`, `/app/can-i-apply`, etc.).
* **Direct Action Dispatch**: Jump directly into *"Practice LeetCode"*, *"Upload Resume"*, *"Audit Eligibility"*, or *"Chat with AI Coach"*.
* **Problem Search**: Search 2,800+ LeetCode problems by name or topic and launch the IDE directly.

---

### Feature 23: Authentication & Security Architecture

#### Purpose & How It Helps
getPlaced implements secure authentication to ensure user privacy, protected telemetry, and isolated interview records.

#### Security Specifications
* **JWT Cookie Authentication**: JSON Web Tokens signed with `JWT_SECRET` stored in `httpOnly`, `sameSite: strict` cookies with 30-day expiration.
* **Password Encryption**: Passwords salted and hashed with `bcryptjs` ($10$ salt rounds).
* **Protected Middleware Guard**: `backend-Node/middlewares/authMiddleware.js` extracts and verifies cookies on all private `/api/*` endpoints.

---

## 4. Comprehensive Metrics & Telemetry Reference Table

| Metric Name | Scale / Unit | Providing Feature(s) | Calculation Formula / Source |
|---|---|---|---|
| **Composite Placement Readiness** | 0–100% | Readiness Engine, Dashboard | $\frac{\sum (\text{Category Score} \times \text{Weight})}{\sum \text{Available Weights}}$ |
| **Benchmark Target Score** | 0–100% | Readiness Engine, Gap Analysis | Company Tier (Tier 1: 90%, Tier 2: 85%, Tier 3: 75%) |
| **Competency Level Gap** | $-10.0$ to $+10.0$ | Level Gap Analysis, Coding | $\text{Current Level} - \text{Required Level}$ |
| **Active Framework Coverage** | 0–100% | Readiness Engine | $\sum \text{Available Canonical Weights} \times 100$ |
| **ATS Resume Score** | 0–100 | Resume Analyzer | Multi-factor Gemini 1.5 Flash evaluation + OCR |
| **Resume Category Scores (5x)** | 0–100% | Resume Analyzer | Format, Keywords, Impact, Skills, Experience |
| **Interview Overall Score** | 0–100 | Mock Interview, HR Prep | Gemini evaluation across Technical + Behavioral |
| **Speech Pacing (WPM)** | Words / Minute | Mock Interview Telemetry | $\frac{\text{Total Words}}{\text{Duration in Seconds}} \times 60$ |
| **Filler Word Count** | Integer Count | Mock Interview Telemetry | Detection of *um, uh, like, actually, basically* |
| **STAR Method Compliance** | 0–100% | Mock Interview, HR Prep | Detection of Situation (20%), Task (10%), Action (50%), Result (20%) |
| **LeetCode Solved Counts** | Easy/Med/Hard | Coding Arena, DSA Sheets | Synced from LeetCode GraphQL / SQLite database |
| **DSA Topic Level (18 Topics)** | 0.0 to 10.0 | DSA Analysis Service | Non-linear volume scaling + difficulty weight multiplier |
| **GitHub Project Score** | 0–100% | Development, GitHub Sync | Evaluates original repos, stars, forks & language diversity |
| **Endpoint Latency** | Milliseconds (ms) | Live Deployment Tester | HTTP request response duration |
| **Role Fit Match Score** | 0–100% | Which Role Fits Me? | 5-tier evidence weighting across GitHub, LeetCode, Skills, Resume |
| **Shortlisting Probability** | % / Verdict | Can I Apply? | 4-dimension audit: Academics (25%), DSA (35%), Portfolio (25%), Interview (15%) |
| **Required Future SGPA** | 0.0 to 10.0 | Academics Calculator | $\frac{\text{Target CGPA} \times \text{Total Sems} - \text{Current CGPA} \times \text{Completed Sems}}{\text{Remaining Sems}}$ |
| **Attendance Percentage** | 0–100% | VTOP Sync | $\frac{\text{Attended Classes}}{\text{Total Classes}} \times 100$ |
| **Safe Bunks Count** | Integer Classes | VTOP Sync | $\max\left(0, \left\lfloor \frac{\text{Attended}}{0.75} - \text{Total} \right\rfloor\right)$ |
| **Classes to Recover 75%** | Integer Classes | VTOP Sync | $\max(0, \lceil 3 \times \text{Total} - 4 \times \text{Attended} \rceil)$ |
| **Prestige Experience (XP)** | Numerical XP | Milestones, Progress | Awarded for problems (20 XP), streaks (15 XP), milestones |
| **Daily Study Streak** | Days | Progress Tracker | Consecutive days with active platform engagement |

---

## 5. Summary & Competitive Advantage Matrix

| Dimension | Traditional Placement Portals | getPlaced Platform |
|---|---|---|
| **Readiness Scoring** | Static dummy numbers or single test quiz. | Dynamic 7-dimension re-normalized scoring with explainable gap prioritization. |
| **Algorithmic Practice** | External links to LeetCode with manual checking. | Built-in Monaco IDE sandbox with test runner, custom test inputs & AI debugging assistant. |
| **Placement Curricula** | Scattered blog posts and text lists. | 28 complete master curricula (Striver/TUF+), 3,150 problems & 2,088 offline tutorials in-app. |
| **Resume Assessment** | Simple keyword search. | Multi-tier OCR parsing, Gemini 1.5 ATS scoring, and 1-click Google XYZ formula action applier. |
| **Interview Prep** | Static question lists with no feedback. | Live speech-to-text simulation, audio timers, STAR compliance telemetry & executive report cards. |
| **University Sync** | Manual CGPA typing. | Reverse-engineered VTOP session auth with attendance debarment & safe bunks predictor. |
| **Career Coaching** | Generic canned chatbot. | Autonomous Gemini agent with 18 callable tools to mutate database records, query jobs, and build roadmaps. |
| **Role Discovery** | Guesswork based on job titles. | Multi-evidence AI engine matching GitHub repos, LeetCode patterns, and verified skills across 9 tracks. |
