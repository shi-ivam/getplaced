import json
import logging
import hashlib
import re
from typing import Dict, Any, List, Optional
from services.gemini_client import query_gemini, extract_json
from services.communication_service import analyze_communication_skills

logger = logging.getLogger("interview_service")

def generate_deterministic_question_id(company: Optional[str], category: Optional[str], question_text: str, idx: int) -> str:
    """
    Generates a unique, deterministic string ID namespaced to company, category, and prompt hash.
    Avoids collision and bookmark pollution across different companies.
    """
    comp_slug = re.sub(r'[^a-z0-9]+', '-', (company or "tech").lower()).strip('-') or "tech"
    cat_slug = re.sub(r'[^a-z0-9]+', '-', (category or "general").lower()).strip('-')[:16].strip('-') or "gen"
    if question_text and len(question_text.strip()) > 0:
        q_hash = hashlib.md5(question_text.strip().lower().encode("utf-8")).hexdigest()[:8]
    else:
        q_hash = f"q{idx + 1}"
    return f"{comp_slug}-{cat_slug}-{q_hash}"

# Comprehensive Curated Bank of Behavioral & Leadership Questions
CURATED_HR_QUESTIONS: List[Dict[str, Any]] = [
    # 1. Technical Execution & Problem Solving
    {
        "id": 1,
        "question": "Tell me about a challenging technical project you worked on. What obstacles did you encounter and how did you overcome them?",
        "category": "Technical Execution & Problem Solving",
        "principle": "Dive Deep & Deliver Results",
        "companies": ["Amazon", "Google", "Meta", "Microsoft", "Uber", "Stripe", "Apple"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Interviewers want to see how you dissect complex systems, handle unanticipated edge cases, make technical trade-offs, and persevere.",
        "what_to_look_for": "Root cause analysis, architectural trade-offs, clear ownership of technical decisions, and measurable outcomes.",
        "star_tips": "Spend 20% on context (Situation/Task), 60% on your specific engineering decisions (Action), and 20% on metrics/learnings (Result).",
        "sample_answer": "Situation: In my previous project, our microservices experienced 3x latency spikes during flash traffic spikes, dropping availability to 98.2%.\nTask: As the backend lead, I was tasked with identifying the bottleneck and bringing P99 latency below 200ms.\nAction: I implemented distributed tracing with OpenTelemetry, discovered N+1 query bottlenecks in PostgreSQL, and added a multi-tier Redis caching layer with optimistic locking and asynchronous write-backs.\nResult: This reduced P99 latency by 58% to 120ms and enabled our system to comfortably handle 15,000 concurrent requests with 99.99% availability."
    },
    {
        "id": 2,
        "question": "Describe a scenario where you had to debug a critical production issue under severe time pressure. How did you triage and resolve it?",
        "category": "Technical Execution & Problem Solving",
        "principle": "Bias for Action & Operational Resilience",
        "companies": ["Uber", "Amazon", "Meta", "Stripe", "Netflix"],
        "type": "behavioral",
        "difficulty": "Hard",
        "why_asked": "Assesses how you manage stress during high-stakes outages, balance immediate containment versus long-term root fixes, and communicate during incidents.",
        "what_to_look_for": "Systematic triage, blameless containment, metric validation, and post-incident prevention automation.",
        "star_tips": "Highlight your immediate containment action first, followed by root-cause diagnosis and automated regression safeguards.",
        "sample_answer": "Situation: On Black Friday, our payment gateway service began dropping 12% of checkout requests due to connection pool exhaustion in our downstream auth service.\nTask: I had to stop the revenue loss immediately without taking the entire store offline.\nAction: I immediately applied an automated rate-limiting circuit breaker to non-critical background syncs, added connection pool headroom dynamically, and isolated the offending unclosed database session leak.\nResult: Checkout success rate recovered to 99.98% within 7 minutes, saving an estimated $80k in transactions, and I subsequently added automated connection leak tests to CI."
    },
    {
        "id": 3,
        "question": "Give an example of a time when you refactored a legacy codebase or optimized a legacy system that was slowing down the team.",
        "category": "Technical Execution & Problem Solving",
        "principle": "Invent and Simplify / High Standards",
        "companies": ["Google", "Microsoft", "Atlassian", "Amazon"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Evaluates technical stewardship, courage to tackle technical debt, and ability to improve developer velocity safely.",
        "what_to_look_for": "Incremental refactoring strategy, zero downtime migration, unit test coverage expansion, and measurable build/test speedups.",
        "star_tips": "Emphasize how you safeguarded existing behavior with regression tests before changing architecture.",
        "sample_answer": "Situation: Our core user entitlement service was a monolithic 6,000-line file that caused frequent merge conflicts and took 28 minutes to run unit tests.\nTask: I took the initiative to decouple the business logic into distinct domain modules without breaking live integrations.\nAction: I wrote comprehensive characterization tests, split the module into 4 cohesive micro-libraries, and introduced dependency injection.\nResult: Test runtime dropped from 28 minutes to 4.2 minutes, PR review cycles sped up by 40%, and zero production regressions were reported during rollout."
    },

    # 2. Conflict Resolution & Teamwork
    {
        "id": 4,
        "question": "Describe a situation where you had a strong disagreement with a teammate or senior lead regarding an architectural decision. How did you handle it?",
        "category": "Conflict Resolution & Teamwork",
        "principle": "Have Backbone; Disagree and Commit / Radical Candor",
        "companies": ["Amazon", "Netflix", "Google", "Meta", "Microsoft"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Assesses your emotional intelligence, data-driven reasoning, ability to challenge respectfully, and readiness to commit once a decision is finalized.",
        "what_to_look_for": "Decoupling ego from technical merits, using empirical benchmarks rather than opinions, and maintaining great peer relationships.",
        "star_tips": "Focus on the collaborative process of gathering data, benchmarking alternatives, and finding common ground.",
        "sample_answer": "Situation: When architecting our real-time notification engine, my peer wanted to use standard WebSockets while I proposed Server-Sent Events (SSE) due to unidirectional push requirements.\nTask: We needed to align quickly to avoid blocking the sprint schedule.\nAction: Instead of debating opinions, I set up a quick 1-day benchmark testing memory overhead and reconnection resilience for both options under 5,000 connections.\nResult: The data showed SSE consumed 40% less server memory while satisfying all client requirements. My teammate appreciated the objective data, and we shipped on time with zero regressions."
    },
    {
        "id": 5,
        "question": "Tell me about a time you had to work with a difficult stakeholder or non-technical product manager with unrealistic expectations.",
        "category": "Conflict Resolution & Teamwork",
        "principle": "Earn Trust & Customer Empathy",
        "companies": ["Microsoft", "Atlassian", "Amazon", "Salesforce"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Evaluates cross-functional communication, ability to explain engineering trade-offs simply, and empathy for business constraints.",
        "what_to_look_for": "Translating technical constraints into business risks, offering flexible phased options (MVP vs Phase 2), and proactive transparency.",
        "star_tips": "Show how you negotiated scope without saying a flat 'no', protecting both team health and business delivery.",
        "sample_answer": "Situation: A product manager requested a complex multi-tenant analytics dashboard with custom filtering to be delivered within a 2-week sprint.\nTask: Building the full specification would have required 6 weeks and caused burnout.\nAction: I broke the feature into 3 functional milestones, held a 30-minute alignment session to show that 80% of client value came from the top 3 filters, and committed to delivering the high-impact MVP in sprint 1 while scheduling advanced filters for sprint 2.\nResult: The MVP launched on time, client satisfaction increased by 25%, and the PM praised the transparent prioritization framework."
    },
    {
        "id": 6,
        "question": "Describe a time when you received harsh or critical constructive feedback on your code or behavior. How did you respond?",
        "category": "Conflict Resolution & Teamwork",
        "principle": "Growth Mindset & Learn and Be Curious",
        "companies": ["Microsoft", "Google", "Meta", "Netflix"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Probes self-awareness, receptivity to coaching, emotional resilience, and lack of defensiveness.",
        "what_to_look_for": "Welcoming feedback as a growth opportunity, asking clarifying questions, and implementing systemic improvements.",
        "star_tips": "Acknowledge the validity of the feedback quickly, explain how you adapted, and share the long-term benefit.",
        "sample_answer": "Situation: During a senior design review, a staff engineer pointed out that my PR lacked comprehensive boundary testing and had ambiguous variable naming.\nTask: I needed to elevate my engineering standards to match the team's Tier-1 bar.\nAction: Rather than becoming defensive, I thanked the reviewer, asked for their recommended testing patterns, and created a personal pre-PR checklist including boundary fuzzing and docstrings.\nResult: My subsequent PR review turnaround dropped by 50% with near-zero requested revisions, and I was later asked to mentor onboarding engineers on code quality."
    },

    # 3. Accountability, Failure & Growth Mindset
    {
        "id": 7,
        "question": "Tell me about a time you made a significant mistake or an initiative you led failed to meet expectations. What happened and what did you learn?",
        "category": "Accountability & Growth Mindset",
        "principle": "Ownership & Blameless Post-Mortems",
        "companies": ["Amazon", "Uber", "Google", "Stripe", "Microsoft"],
        "type": "behavioral",
        "difficulty": "Hard",
        "why_asked": "Tests honesty, psychological ownership, humility, and ability to build preventative systems rather than pointing fingers.",
        "what_to_look_for": "Explicit 'I owned this' language without blame-shifting, rapid containment, thorough root cause analysis, and systemic prevention mechanisms.",
        "star_tips": "Own the mistake immediately in the Task, describe your rapid containment in Action, and highlight the systemic prevention mechanism in Result.",
        "sample_answer": "Situation: Early in my career, I deployed a database migration script that inadvertently caused a 15-minute table lock on our production user database during peak hours.\nTask: I needed to immediately restore availability and prevent future lockouts across all services.\nAction: I triggered an immediate rollback, communicated status to the on-call team, and conducted a thorough blameless post-mortem. I then authored automated linting rules in our CI pipeline to forbid non-concurrent index creation in production.\nResult: The system was recovered within 12 minutes, and the new CI check prevented 4 subsequent hazardous migrations across the engineering org."
    },
    {
        "id": 8,
        "question": "Describe a project where you realized halfway through that your initial technical approach was flawed. What did you do?",
        "category": "Accountability & Growth Mindset",
        "principle": "Are Right, A Lot / Intellectual Honesty",
        "companies": ["Amazon", "Stripe", "Google", "Meta"],
        "type": "behavioral",
        "difficulty": "Hard",
        "why_asked": "Assesses whether you fall victim to the sunk-cost fallacy or have the courage to pivot based on empirical evidence.",
        "what_to_look_for": "Recognizing early warning signs, presenting transparent pivot options to stakeholders, and recovering project trajectory.",
        "star_tips": "Explain the exact data that prompted your pivot and how you managed the timeline adjustment.",
        "sample_answer": "Situation: We chose a graph database for a recommendation engine, but benchmarks under 100k nodes revealed latency scaled exponentially rather than linearly.\nTask: I had to decide whether to push forward with complex indexing hacks or pivot to an adjacency list model in PostgreSQL with Redis.\nAction: I ran a 48-hour spike test proving the relational+caching model achieved sub-15ms queries at 10x scale, transparently pitched the pivot to my team lead, and migrated our schemas.\nResult: We launched with 12ms P95 query latency, reduced infrastructure costs by $1,200/month, and hit our public beta date without delays."
    },

    # 4. Navigating Ambiguity & Bias for Action
    {
        "id": 9,
        "question": "Describe a scenario where you were given ambiguous requirements with tight deadlines and no clear roadmap. How did you prioritize and execute?",
        "category": "Navigating Ambiguity & Bias for Action",
        "principle": "Bias for Action / Thriving in Ambiguity",
        "companies": ["Amazon", "Google", "Meta", "Uber", "Netflix"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Assesses self-starter capability, proactiveness, hypothesis-driven development, and minimum viable product (MVP) scoping.",
        "what_to_look_for": "Formulating hypotheses, building rapid validation prototypes, communicating assumptions, and iterative delivery.",
        "star_tips": "Explain how you scoped down to the core MVP, validated with stakeholders, and delivered in increments.",
        "sample_answer": "Situation: We received an urgent business request to integrate a third-party payment partner with only high-level documentation and a 2-week launch window.\nTask: I needed to define the API contract, handle edge cases, and ensure financial reconciliation accuracy.\nAction: I mapped out the primary happy path and 5 critical error states, built a mock service within 48 hours to validate integration with our frontend team, and scheduled daily 10-minute syncs with the product manager to resolve open questions.\nResult: We successfully delivered the integration 2 days ahead of schedule, processing $50,000 in transactions in the first week with zero reconciliation discrepancies."
    },
    {
        "id": 10,
        "question": "Tell me about a time you had to make an important engineering decision with incomplete information.",
        "category": "Navigating Ambiguity & Bias for Action",
        "principle": "Two-Way Doors / Bias for Action",
        "companies": ["Amazon", "Meta", "Stripe", "Uber"],
        "type": "behavioral",
        "difficulty": "Hard",
        "why_asked": "Tests your ability to distinguish between one-way door (irreversible) and two-way door (reversible) decisions.",
        "what_to_look_for": "Risk assessment, creating rollback paths, instrumenting telemetry to validate the decision quickly, and speed.",
        "star_tips": "Explicitly mention whether the decision was reversible and what guardrails you established.",
        "sample_answer": "Situation: We needed to select a serialization protocol for our inter-service communication before final traffic volume models were published.\nTask: Delaying the choice would block 4 feature teams for 3 weeks.\nAction: Recognizing this as a two-way door if abstracted behind clean interface contracts, I chose Protocol Buffers over JSON due to known CPU efficiency, while establishing an adapter interface so we could swap implementations if needed.\nResult: Teams began developing immediately without blockers, and the Protobuf choice ended up saving 35% network bandwidth when traffic tripled."
    },

    # 5. Customer Obsession & Product Impact
    {
        "id": 11,
        "question": "Tell me about a time you went above and beyond to solve a customer pain point or advocate for the end user.",
        "category": "Customer Obsession & Product Impact",
        "principle": "Customer Obsession / Users First",
        "companies": ["Amazon", "Stripe", "Uber", "Apple", "Atlassian"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Checks if you view software through user empathy rather than just raw code, and if you proactively champion user experience.",
        "what_to_look_for": "Deep empathy for user workflows, looking beyond immediate specs, and measuring direct user impact.",
        "star_tips": "Connect your engineering efforts directly to user happiness or business retention.",
        "sample_answer": "Situation: Multiple enterprise users complained on our forum that exporting monthly billing reports timed out on datasets over 50,000 rows.\nTask: The ticket was classified as low priority for the next quarter, but I saw it actively hurting customer trust.\nAction: I spent a hackathon day profiling the export worker, converted synchronous in-memory CSV generation into a streaming async job with S3 presigned download links, and added automated email notification upon completion.\nResult: Export failure rate dropped from 18% to 0%, report generation handled up to 1M rows seamlessly, and 3 major enterprise clients renewed their contracts citing the fix."
    },
    {
        "id": 12,
        "question": "Describe a situation where engineering constraints conflicted with user experience. How did you balance both?",
        "category": "Customer Obsession & Product Impact",
        "principle": "Build Awesome Things / Customer Empathy",
        "companies": ["Meta", "Apple", "Google", "Stripe"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Assesses your ability to find creative compromises between UI responsiveness and heavy backend processing.",
        "what_to_look_for": "Optimistic UI updates, progressive loading, caching strategies, and user communication.",
        "star_tips": "Demonstrate how architectural innovation can preserve both performance and delightful UX.",
        "sample_answer": "Situation: Our mobile app required a heavy 3-second fraud check on credit card submissions, causing users to abandon checkout assuming the app froze.\nTask: We could not skip the fraud check due to compliance, but needed checkout to feel instantaneous.\nAction: I implemented optimistic UI confirmation with an animated receipt spinner while executing the fraud check in parallel with payment authorization, coupled with instant rollbacks in rare fraud cases.\nResult: Perceived latency dropped to under 300ms, checkout conversion jumped by 8.4%, and zero fraud detection breaches occurred."
    },

    # 6. Culture Fit, Motivation & Long-Term Vision
    {
        "id": 13,
        "question": "Why do you want to join our engineering team specifically, and how does this role align with your 3-5 year trajectory?",
        "category": "Culture Fit & Motivation",
        "principle": "Mission Alignment & Intellectual Curiosity",
        "companies": ["Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix", "Uber", "Stripe"],
        "type": "hr",
        "difficulty": "Easy",
        "why_asked": "Determines whether you have researched the company's specific architecture, engineering culture, open-source work, and long-term mission.",
        "what_to_look_for": "Authentic personal passion, knowledge of company technical blogs/products, and clear ambition to grow into senior leadership.",
        "star_tips": "Connect 1 specific technical challenge of the company to your personal engineering passions and career goals.",
        "sample_answer": "I have been following your engineering team's work on low-latency distributed databases and open-source contributions. At this stage of my career, I want to specialize in high-throughput backend systems where small optimizations yield massive user impact. Your culture of engineering ownership and continuous learning aligns perfectly with my ambition to grow into a senior distributed systems engineer."
    },
    {
        "id": 14,
        "question": "What is the most innovative or technically creative solution you have built, and what inspired it?",
        "category": "Culture Fit & Motivation",
        "principle": "Invent & Simplify / 10x Thinking",
        "companies": ["Google", "Apple", "Meta", "Amazon"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Probes your passion for technology, curiosity, and whether you think outside conventional boundaries.",
        "what_to_look_for": "Original thought, exploring unconventional tools, enthusiasm for craft, and practical utility.",
        "star_tips": "Describe the core spark of intuition and the technical elegance of the final architecture.",
        "sample_answer": "Situation: Our analytics dashboard was generating 50MB PDF reports taking 45 seconds each, crashing memory on small Kubernetes nodes.\nTask: I wanted to eliminate server-side PDF rendering overhead completely.\nAction: Inspired by modern browser headless capabilities, I moved compilation to client-side Web Workers using WebAssembly and lightweight canvas vectors, streaming raw JSON from the server.\nResult: Server CPU load dropped by 80%, report generation was instant (<1.5s) for users, and our cloud infrastructure bill decreased by $800/month."
    },

    # 7. Leadership, Mentorship & Raising the Bar
    {
        "id": 15,
        "question": "Tell me about a time you mentored a junior engineer or intern. How did you help them grow and overcome hurdles?",
        "category": "Leadership & Mentorship",
        "principle": "Hire and Develop the Best / Multiplier",
        "companies": ["Amazon", "Google", "Microsoft", "Meta", "Atlassian"],
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Evaluates your ability to scale yourself, elevate team capabilities, and practice empathetic engineering leadership.",
        "what_to_look_for": "Patience, Socratic coaching rather than spoon-feeding answers, setting clear expectations, and celebrating growth.",
        "star_tips": "Focus on the specific framework or recurring habits you gave the mentee rather than just fixing their code.",
        "sample_answer": "Situation: A new junior engineer was struggling with our Git branching strategy and lacked confidence submitting PRs to our core service.\nTask: As their assigned buddy, my goal was to help them achieve independent PR delivery within 30 days.\nAction: I instituted daily 15-minute pairing sessions where they drove the keyboard, walked through code review mental models, and encouraged them to author a 'Common Git Recipes' doc for the entire team.\nResult: Within 4 weeks, they autonomously shipped their first major microservice endpoint, and their documentation was adopted across our engineering onboarding curriculum."
    },
    {
        "id": 16,
        "question": "Describe a time you raised the engineering quality bar across your team without formal managerial authority.",
        "category": "Leadership & Mentorship",
        "principle": "Ownership / Insist on Highest Standards",
        "companies": ["Amazon", "Google", "Meta", "Netflix", "Apple"],
        "type": "behavioral",
        "difficulty": "Hard",
        "why_asked": "Tests emergent leadership, grassroots influence, and commitment to engineering excellence.",
        "what_to_look_for": "Demonstrating by example, automating standards in CI, winning consensus through education, and measuring quality uplift.",
        "star_tips": "Highlight how you persuaded the team through tooling and empathy rather than mandate.",
        "sample_answer": "Situation: Our repository lacked standardized unit testing, resulting in recurring staging regressions and 15% flakiness in QA.\nTask: I wanted to achieve 80% test coverage without slowing sprint commitments.\nAction: I set up automated coverage gates in GitHub Actions with incremental diff checks (only new code required 85% coverage) and hosted a 45-minute lunch-and-learn demonstrating fast integration testing with Docker testcontainers.\nResult: Within two quarters, overall repo coverage rose from 42% to 84%, production bugs dropped by 65%, and the team voted to keep the CI check permanently."
    }
]

def generate_interview_questions(
    company: Optional[str] = "Generic Tech",
    role: Optional[str] = "Software Engineer",
    interview_type: Optional[str] = "Mixed",
    difficulty: Optional[str] = "Medium",
    count: int = 6,
    category: Optional[str] = None,
    resume_text: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generates a curated or AI-synthesized set of interview questions tailored to company culture,
    role specifications, candidate resume context, category, and difficulty.
    """
    category_prompt = f"Target Category / Principle: {category}" if category and category != "All Categories" else ""
    prompt = f"""
You are a senior hiring committee chair and principal interviewer at {company}.
Create {count} distinct, realistic, high-caliber behavioral and leadership interview questions for a candidate interviewing for the role of '{role}'.

Interview Type: {interview_type}
Difficulty Level: {difficulty}
{category_prompt}
{"Candidate Resume Context: " + resume_text[:1500] if resume_text else ""}

Requirements:
- Questions must reflect the specific culture and interview bar of {company} (e.g. Amazon Leadership Principles, Google Googliness, fast execution, technical depth).
- Provide rich guidance for each question: why interviewers ask it, what they evaluate, STAR advice, and an exemplary model answer.

Respond strictly in valid JSON matching this schema:
{{
  "questions": [
    {{
      "id": 1,
      "question": "<The exact interview question>",
      "category": "<e.g. Conflict Resolution & Teamwork | Technical Execution & Problem Solving | Accountability & Growth Mindset | Culture Fit & Motivation | Navigating Ambiguity & Bias for Action | Leadership & Mentorship>",
      "principle": "<e.g. Ownership | Customer Obsession | Bias for Action | Googliness>",
      "type": "<behavioral | technical | hr>",
      "difficulty": "{difficulty or 'Medium'}",
      "why_asked": "<1-2 sentences on what the interviewer is probing for>",
      "what_to_look_for": "<Key competencies and green flags>",
      "star_tips": "<Explicit guidance on structuring the answer using STAR>",
      "sample_answer": "<Exemplary STAR response with metrics and clear technical action>"
    }}
  ]
}}
"""
    try:
        raw = query_gemini(prompt, json_mode=True)
        res = extract_json(raw)
        if isinstance(res, dict) and "questions" in res and len(res["questions"]) > 0:
            formatted_questions = []
            for idx, q in enumerate(res["questions"]):
                q_copy = dict(q)
                q_text = q_copy.get("question", "")
                q_cat = q_copy.get("category") or category
                q_copy["id"] = generate_deterministic_question_id(company, q_cat, q_text, idx)
                formatted_questions.append(q_copy)
            return formatted_questions
    except Exception as e:
        logger.warning(f"AI question generation failed ({e}). Falling back to curated questions.")

    # Graceful fallback: Filter curated questions smartly
    company_clean = (company or "").lower().split(" ")[0]
    matched_questions = []

    for q in CURATED_HR_QUESTIONS:
        # Category filter check
        if category and category != "All Categories":
            if q["category"].lower() != category.lower():
                continue
        # Company match check
        if company_clean and company_clean not in ["all", "top", "generic", "tech"]:
            comp_match = any(company_clean in c.lower() for c in q.get("companies", []))
            if comp_match:
                matched_questions.append(q)
                continue
        matched_questions.append(q)

    if not matched_questions:
        matched_questions = list(CURATED_HR_QUESTIONS)

    # Pick up to count questions
    target_count = max(1, min(count, len(matched_questions)))
    result = []
    for idx in range(count):
        source_q = matched_questions[idx % len(matched_questions)]
        copied = dict(source_q)
        q_text = copied.get("question", "")
        q_cat = copied.get("category") or category
        copied["id"] = generate_deterministic_question_id(company, q_cat, q_text, idx)
        if difficulty and difficulty != "All Levels":
            copied["difficulty"] = difficulty
        result.append(copied)

    return result

def evaluate_interview_answer(
    question: str,
    answer: str,
    company: Optional[str] = "Tech Company",
    role: Optional[str] = "Software Engineer",
    interview_type: Optional[str] = "behavioral",
    audio_duration_seconds: Optional[float] = None
) -> Dict[str, Any]:
    """
    Performs full multi-dimensional evaluation of a candidate's answer:
    - Communication & speech quality (clarity, confidence, filler words, WPM, weak phrases)
    - STAR method compliance & breakdown (Situation, Task, Action, Result excerpts)
    - Technical content / domain depth score
    - Strengths, improvement areas, model answer rewrite
    - Dynamic intelligent follow-up question
    """
    if not answer or len(answer.strip()) < 5:
        comm_eval = analyze_communication_skills("", audio_duration_seconds)
        return {
            "score": 0,
            "overall_feedback": "Please provide an answer to receive feedback.",
            "communication": comm_eval,
            "star_compliance": comm_eval["star_compliance"],
            "technical_depth_score": 0,
            "strengths": [],
            "areas_for_improvement": ["Please provide a detailed response."],
            "suggested_better_answer": "",
            "follow_up_question": None
        }

    # Step 1: Communication analytics (deterministic + AI)
    comm_analysis = analyze_communication_skills(answer, audio_duration_seconds, f"{company} {role} {interview_type} Interview")

    # Step 2: In-depth interview scoring and dynamic follow-up generation with Gemini
    ai_eval = None
    try:
        prompt = f"""
You are an expert interviewer evaluating a candidate for '{role}' at '{company}'.

Interview Question:
\"{question}\"

Candidate's Answer:
\"\"\"
{answer}
\"\"\"

Interview Type: {interview_type}

Evaluate the candidate's answer rigorously:
1. Overall Quality Score (0-100) based on role expectations at {company}.
2. Technical Depth / Content Score (0-100).
3. STAR Framework Compliance: Evaluate Situation, Task, Action, Result.
4. Highlight 2-3 specific Strengths.
5. Highlight 2-3 actionable Areas for Improvement.
6. Provide a rewritten, high-impact version of their answer following the STAR method.
7. Formulate 1 sharp, natural follow-up question that directly digs deeper into something specific they claimed in their answer.

Respond strictly in valid JSON:
{{
  "score": <integer 0-100>,
  "technical_depth_score": <integer 0-100>,
  "overall_verdict": "<'Strong' | 'Passable' | 'Needs Improvement'>",
  "star_feedback": "<Evaluation of their STAR structure>",
  "strengths": [
    "<Strength 1>",
    "<Strength 2>"
  ],
  "areas_for_improvement": [
    "<Improvement area 1>",
    "<Improvement area 2>"
  ],
  "suggested_better_answer": "<Polished STAR answer keeping their core experience with added impact>",
  "follow_up_question": "<Intelligent conversational follow-up question digging into a detail in their answer>"
}}
"""
        raw = query_gemini(prompt, json_mode=True)
        ai_eval = extract_json(raw)
        if not ai_eval or not isinstance(ai_eval, dict):
            raise ValueError("Invalid response structure from AI answer evaluation.")
    except Exception as e:
        logger.warning(f"AI answer evaluation fallback active ({e})")
        star_comp = comm_analysis.get("star_compliance", {})
        star_score = star_comp.get("score", 70)
        comm_score = comm_analysis.get("overall_communication_score", 70)
        calc_score = int(0.5 * star_score + 0.5 * comm_score)

        detected_pillars = []
        if star_comp.get("situation_detected"): detected_pillars.append("Context & Problem Stakes")
        if star_comp.get("task_detected"): detected_pillars.append("Clear Individual Mandate")
        if star_comp.get("action_detected"): detected_pillars.append("Technical Implementation Depth")
        if star_comp.get("result_detected"): detected_pillars.append("Quantified Outcome & Metrics")

        strengths = [
            f"Articulated {pillar} clearly in the response narrative." for pillar in detected_pillars[:2]
        ] if detected_pillars else ["Clear chronological delivery", "Professional engineering ownership tone"]

        improvements = star_comp.get("missing_elements", [])
        if not improvements:
            improvements = [
                "Quantify your results with concrete latency, throughput, or business metrics.",
                "Detail specific architectural trade-offs evaluated in the Action phase."
            ]

        ai_eval = {
            "score": calc_score,
            "technical_depth_score": max(50, int(comm_score * 0.95)),
            "overall_verdict": "Strong" if calc_score >= 80 else "Passable" if calc_score >= 60 else "Needs Improvement",
            "strengths": strengths,
            "areas_for_improvement": improvements[:3],
            "suggested_better_answer": comm_analysis.get("polished_version", answer),
            "follow_up_question": "Could you elaborate on the alternative architectures you considered and why your chosen path was superior?"
        }

    final_score = int(ai_eval.get("score", 75))
    final_score = max(20, min(100, final_score))

    return {
        "score": final_score,
        "technical_depth_score": int(ai_eval.get("technical_depth_score", 75)),
        "overall_verdict": ai_eval.get("overall_verdict", "Passable"),
        "communication": comm_analysis,
        "star_compliance": comm_analysis.get("star_compliance", {}),
        "strengths": ai_eval.get("strengths", []),
        "areas_for_improvement": ai_eval.get("areas_for_improvement", []),
        "suggested_better_answer": ai_eval.get("suggested_better_answer", comm_analysis.get("polished_version", "")),
        "follow_up_question": ai_eval.get("follow_up_question")
    }

def generate_session_report(
    company: str,
    role: str,
    interview_type: str,
    answers: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Generates a full post-interview report card and hiring recommendation across all answered questions.
    """
    if not answers:
        return {
            "overall_score": 0,
            "recommendation": "Incomplete Session",
            "summary": "No questions were completed during this session.",
            "radar_scores": {},
            "strengths": [],
            "key_growth_areas": [],
            "next_prep_steps": []
        }

    scores = [a.get("score", 70) for a in answers if "score" in a]
    avg_score = int(sum(scores) / len(scores)) if scores else 70

    comm_scores = [a.get("communication", {}).get("overall_communication_score", 70) for a in answers]
    avg_comm = int(sum(comm_scores) / len(comm_scores)) if comm_scores else 70

    star_scores = [a.get("star_compliance", {}).get("score", 65) for a in answers]
    avg_star = int(sum(star_scores) / len(star_scores)) if star_scores else 65

    tech_scores = [a.get("technical_depth_score", 75) for a in answers]
    avg_tech = int(sum(tech_scores) / len(tech_scores)) if tech_scores else 75

    total_fillers = sum(a.get("communication", {}).get("filler_words", {}).get("total_count", 0) for a in answers)

    # Hiring Recommendation calculation
    recommendation = "Strong Hire" if avg_score >= 88 else "Hire" if avg_score >= 76 else "Leaning Hire" if avg_score >= 65 else "Needs Improvement" if avg_score >= 50 else "No Hire"

    prompt = f"""
You are the Head of Engineering Hiring at {company}.
Review the candidate's full mock interview session for the '{role}' position ({interview_type} Round).

Session Performance Summary:
- Total Questions Attempted: {len(answers)}
- Average Overall Score: {avg_score}/100
- Average Communication Score: {avg_comm}/100
- STAR Framework Score: {avg_star}/100
- Technical Depth Score: {avg_tech}/100
- Total Filler Words Used: {total_fillers}

Candidate Answers & Scores:
{json.dumps([{"q": a.get("question"), "score": a.get("score"), "strengths": a.get("strengths"), "improvements": a.get("areas_for_improvement")} for a in answers], indent=2)}

Generate an executive interview report card strictly in valid JSON:
{{
  "overall_score": {avg_score},
  "recommendation": "{recommendation}",
  "hiring_verdict_summary": "<2-3 sentence executive evaluation summarizing their readiness for {company}>",
  "strengths": [
    "<Core strength 1>",
    "<Core strength 2>",
    "<Core strength 3>"
  ],
  "key_growth_areas": [
    "<Major gap or growth area 1>",
    "<Major gap or growth area 2>"
  ],
  "next_prep_steps": [
    "<Actionable step 1 to reach 90+ score>",
    "<Actionable step 2>",
    "<Actionable step 3>"
  ]
}}
"""
    try:
        raw = query_gemini(prompt, json_mode=True)
        res = extract_json(raw)
        if isinstance(res, dict) and "hiring_verdict_summary" in res:
            res["overall_score"] = avg_score
            res["recommendation"] = recommendation
            res["radar_scores"] = {
                "Communication": avg_comm,
                "STAR Structure": avg_star,
                "Technical Depth": avg_tech,
                "Problem Solving": avg_score,
                "Culture Fit": min(100, int((avg_comm + avg_score) / 2))
            }
            res["total_filler_words"] = total_fillers
            return res
    except Exception as e:
        logger.warning(f"Session report AI evaluation failed: {e}. Using deterministic report.")

    return {
        "overall_score": avg_score,
        "recommendation": recommendation,
        "hiring_verdict_summary": f"Candidate demonstrates solid behavioral foundation with an average score of {avg_score}/100 across {len(answers)} questions. Focus on refining quantified technical impact.",
        "radar_scores": {
            "Communication": avg_comm,
            "STAR Structure": avg_star,
            "Technical Depth": avg_tech,
            "Problem Solving": avg_score,
            "Culture Fit": min(100, int((avg_comm + avg_score) / 2))
        },
        "total_filler_words": total_fillers,
        "strengths": [
            "Structured chronological STAR articulation",
            "Clear ownership of engineering contributions"
        ],
        "key_growth_areas": [
            "Quantifying exact latency, scale, and business metrics",
            "Expanding on architectural trade-offs in the Action phase"
        ],
        "next_prep_steps": [
            "Draft 4 core STAR stories in the Story Matrix covering Conflict, Ownership, Failure, and Scale.",
            "Eliminate verbal filler words by practicing structured pauses.",
            "Benchmark answers against target company operating principles."
        ]
    }
