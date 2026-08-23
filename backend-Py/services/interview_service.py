import json
import logging
from typing import Dict, Any, List, Optional
from services.gemini_client import query_gemini, extract_json
from services.communication_service import analyze_communication_skills

logger = logging.getLogger("interview_service")

# Curated bank of behavioral and HR questions categorized by domain and target company principles
CURATED_HR_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "question": "Tell me about a challenging technical project you worked on. What obstacles did you encounter and how did you overcome them?",
        "category": "Technical Execution & Problem Solving",
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Interviewers want to see how you dissect complex problems, make trade-offs under constraints, and persevere when obstacles arise.",
        "what_to_look_for": "Structured breakdown, technical depth, ownership of decisions, and measurable outcomes.",
        "star_tips": "Spend 20% on context (Situation/Task), 60% on your specific engineering decisions (Action), and 20% on metrics/learnings (Result).",
        "sample_answer": "Situation: In my previous project, our microservices experienced 3x latency spikes during flash traffic.\nTask: As the backend engineer, I was tasked with identifying the bottleneck and bringing P99 latency below 200ms.\nAction: I implemented distributed tracing with OpenTelemetry, discovered N+1 query bottlenecks in PostgreSQL, and added a multi-tier Redis caching layer with optimistic locking.\nResult: This reduced P99 latency by 58% to 120ms and enabled our system to handle 15,000 concurrent requests without failure."
    },
    {
        "id": 2,
        "question": "Describe a situation where you had a strong disagreement with a teammate or lead regarding a technical decision. How did you handle it?",
        "category": "Conflict Resolution & Teamwork",
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Assesses your emotional intelligence, professional maturity, ability to disagree and commit, and collaboration skills.",
        "what_to_look_for": "Respectful communication, data-driven reasoning rather than ego, and prioritizing the product/team's best interest.",
        "star_tips": "Focus on the collaborative process of gathering data, benchmarking alternatives, and finding common ground.",
        "sample_answer": "Situation: When building our real-time notification engine, my peer wanted to use standard WebSockets while I proposed Server-Sent Events (SSE) due to unidirectional requirements.\nTask: We needed to align quickly to avoid blocking the sprint schedule.\nAction: Instead of debating opinions, I set up a quick 1-day benchmark testing memory overhead and reconnection resilience for both options under 5,000 connections.\nResult: The data showed SSE consumed 40% less server memory while satisfying all client requirements. My teammate appreciated the objective data, and we shipped on time with zero regressions."
    },
    {
        "id": 3,
        "question": "Tell me about a time you made a significant mistake or a project you delivered failed to meet expectations. What did you learn?",
        "category": "Accountability & Growth Mindset",
        "type": "behavioral",
        "difficulty": "Hard",
        "why_asked": "Tests your honesty, humility, accountability, and ability to turn failures into institutional improvements.",
        "what_to_look_for": "Taking genuine responsibility without shifting blame to others, followed by clear preventative measures.",
        "star_tips": "Own the mistake immediately, explain your rapid containment action, and highlight the systemic prevention mechanism you put in place.",
        "sample_answer": "Situation: Early in my career, I deployed a database migration script that inadvertently caused a 15-minute table lock on our production user database.\nTask: I needed to immediately restore availability and prevent future lockouts.\nAction: I triggered an immediate rollback, communicated status to the on-call team, and conducted a thorough blameless post-mortem. I then authored automated linting rules in our CI pipeline to forbid non-concurrent index creation in production.\nResult: The system was recovered within 12 minutes, and the new CI check prevented 4 subsequent hazardous migrations across the engineering org."
    },
    {
        "id": 4,
        "question": "Why do you want to join our company, and how does this role fit into your long-term career aspirations?",
        "category": "Culture Fit & Motivation",
        "type": "hr",
        "difficulty": "Easy",
        "why_asked": "Determines whether you have researched the company's specific mission, architecture, and whether you will be energized long-term.",
        "what_to_look_for": "Specific knowledge of company products, culture values, engineering blogs, and authentic personal alignment.",
        "star_tips": "Connect 1 specific technical challenge of the company to your personal engineering passions.",
        "sample_answer": "I have been following your engineering team's work on low-latency distributed databases and open-source contributions. At this stage of my career, I want to specialize in high-throughput backend systems where small optimizations yield massive user impact. Your culture of engineering ownership and continuous learning aligns perfectly with my ambition to grow into a senior distributed systems engineer."
    },
    {
        "id": 5,
        "question": "Describe a scenario where you were given ambiguous requirements with tight deadlines. How did you prioritize and execute?",
        "category": "Navigating Ambiguity & Bias for Action",
        "type": "behavioral",
        "difficulty": "Medium",
        "why_asked": "Assesses self-starter capability, proactiveness, stakeholder management, and iterative delivery.",
        "what_to_look_for": "Formulating hypotheses, building fast prototypes, communicating assumptions, and delivering minimum viable product.",
        "star_tips": "Explain how you scoped down to the core MVP, validated with stakeholders, and delivered in increments.",
        "sample_answer": "Situation: We received a high-priority request to integrate a new third-party payment provider with only high-level specifications and a 2-week launch window.\nTask: I needed to define the API contract, handle edge cases, and ensure financial reconciliation accuracy.\nAction: I mapped out the primary happy path and 5 critical error states, built a mock service within 48 hours to validate integration with our frontend team, and scheduled daily 10-minute syncs with the product manager to resolve open questions.\nResult: We successfully delivered the integration 2 days ahead of schedule, processing $50,000 in transactions in the first week with zero reconciliation discrepancies."
    }
]

def generate_interview_questions(
    company: Optional[str] = "Generic Tech",
    role: Optional[str] = "Software Engineer",
    interview_type: Optional[str] = "Mixed",  # HR, Technical, Behavioral, Mixed, System Design
    difficulty: Optional[str] = "Medium",
    count: int = 5,
    resume_text: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Generates a curated or AI-synthesized set of interview questions tailored to company culture,
    role specifications, candidate resume context, and difficulty.
    """
    prompt = f"""
You are a senior hiring committee chair and principal interviewer at {company}.
Create {count} distinct, realistic, high-caliber interview questions for a candidate interviewing for the role of '{role}'.

Interview Type: {interview_type} (Focus on {interview_type} questions)
Difficulty Level: {difficulty}
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
      "category": "<e.g. Leadership & Ownership | System Thinking | Algorithmic Problem Solving | Culture Fit>",
      "type": "<behavioral | technical | hr | system_design>",
      "difficulty": "{difficulty}",
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
            return res["questions"]
    except Exception as e:
        logger.warning(f"AI question generation failed ({e}). Falling back to curated questions.")

    # Graceful fallback to CURATED_HR_QUESTIONS
    target_count = max(1, count)
    fallback_questions = []
    for idx in range(target_count):
        source_q = CURATED_HR_QUESTIONS[idx % len(CURATED_HR_QUESTIONS)]
        copied = dict(source_q)
        copied["id"] = idx + 1
        if difficulty:
            copied["difficulty"] = difficulty
        fallback_questions.append(copied)

    return fallback_questions

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
    - Communication & speech quality (clarity, confidence, filler words, WPM)
    - STAR method compliance & breakdown
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
            raise RuntimeError("Invalid response structure from AI answer evaluation.")
    except Exception as e:
        logger.error(f"AI answer evaluation failed: {e}")
        raise RuntimeError(f"Interview answer evaluation failed: {e}")

    final_score = int(ai_eval.get("score", 75))
    final_score = max(20, min(100, final_score))

    return {
        "score": final_score,
        "technical_depth_score": int(ai_eval.get("technical_depth_score", 75)),
        "overall_verdict": ai_eval.get("overall_verdict", "Passable"),
        "communication": comm_analysis,
        "star_compliance": comm_analysis["star_compliance"],
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
        logger.error(f"Session report AI evaluation failed: {e}")
        raise RuntimeError(f"Session report generation failed: {e}")

    raise RuntimeError("Failed to generate session report from AI model.")
