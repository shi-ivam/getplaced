import re
import math
import logging
from typing import Dict, Any, List, Optional
from services.gemini_client import query_gemini, extract_json

logger = logging.getLogger("communication_service")

# Comprehensive dictionary of filler words and verbal crutches
FILLER_PATTERNS = [
    r"\bum\b", r"\buh\b", r"\bah\b", r"\ber\b", r"\blike\b", r"\byou know\b",
    r"\bbasically\b", r"\bactually\b", r"\bliterally\b", r"\bsort of\b",
    r"\bkind of\b", r"\bi mean\b", r"\bto be honest\b", r"\bright\?", r"\bso yeah\b",
    r"\banyway\b", r"\bstuff like that\b", r"\band all\b", r"\band everything\b"
]

WEAK_HEDGING_PHRASES = [
    ("i think", "In my experience / I determined"),
    ("maybe", "Likely / Under these specific conditions"),
    ("i guess", "Based on my analysis"),
    ("probably", "Expectedly / With high probability"),
    ("sort of", "Specifically"),
    ("just", "[Omit 'just' to project authority]"),
    ("try to", "Executed / Implemented"),
    ("hopefully", "With targeted planning")
]

POWER_ACTION_VERBS = [
    "spearheaded", "architected", "orchestrated", "engineered", "championed",
    "streamlined", "optimized", "drove", "delivered", "negotiated", "resolved",
    "accelerated", "consolidated", "mentored", "empowered"
]

def analyze_communication_skills(
    text: str,
    audio_duration_seconds: Optional[float] = None,
    target_context: Optional[str] = "Technical / Behavioral Interview"
) -> Dict[str, Any]:
    """
    Evaluates speech or text communication across 6 core pillars:
    1. Filler Words & Verbal Crutches
    2. STAR Method Compliance (Situation, Task, Action, Result)
    3. Clarity & Coherence
    4. Confidence & Executive Tone
    5. Pacing (Words Per Minute)
    6. Vocabulary & Power Verbs
    """
    if not text or len(text.strip()) < 5:
        return get_empty_communication_response()

    clean_text = text.strip()
    words = re.findall(r'\b\w+\b', clean_text)
    word_count = len(words)

    # 1. Filler word detection & highlighting
    filler_counts: Dict[str, int] = {}
    total_fillers = 0
    highlighted_text = clean_text

    for pattern in FILLER_PATTERNS:
        matches = list(re.finditer(pattern, clean_text, re.IGNORECASE))
        if matches:
            canonical_word = matches[0].group(0).lower()
            count = len(matches)
            filler_counts[canonical_word] = count
            total_fillers += count

    # Calculate filler density %
    filler_density = round((total_fillers / max(word_count, 1)) * 100, 1)

    # 2. Pacing calculation (Words Per Minute)
    # If audio duration is provided, use it; otherwise return None
    if audio_duration_seconds and audio_duration_seconds > 0:
        wpm = round((word_count / (audio_duration_seconds / 60)), 1)
        if wpm < 110:
            pacing_rating = "too_slow"
            pacing_feedback = f"Pacing is slightly slow ({wpm} WPM). Aim for 130-150 WPM for engaging delivery."
        elif wpm > 170:
            pacing_rating = "too_fast"
            pacing_feedback = f"Pacing is fast ({wpm} WPM). Consider pausing after key statements to allow points to resonate."
        else:
            pacing_rating = "optimal"
            pacing_feedback = "Your speaking pace is natural, balanced, and easy to follow."
    else:
        wpm = None
        pacing_rating = "unknown"
        pacing_feedback = "Audio duration was not provided; WPM calculation unavailable."

    # 3. Weak phrasing & power verbs analysis
    weak_found = []
    text_lower = clean_text.lower()
    for phrase, alternative in WEAK_HEDGING_PHRASES:
        if re.search(r'\b' + re.escape(phrase) + r'\b', text_lower):
            weak_found.append({"phrase": phrase, "suggestion": alternative})

    power_verbs_used = [verb for verb in POWER_ACTION_VERBS if verb in text_lower]

    # 4. LLM-based deep semantic evaluation (STAR compliance, clarity, confidence)
    ai_evaluation = None
    try:
        prompt = f"""
You are a master executive communication coach and technical interview evaluator.
Analyze the candidate's spoken/written interview response below.

Context: {target_context}
Candidate Answer:
\"\"\"
{clean_text}
\"\"\"

Evaluate the answer on:
1. STAR Compliance: Did they clearly state Situation, Task, Action, and quantifiable Result?
2. Clarity & Coherence (0-100): Is the narrative structured and logical?
3. Confidence & Tone (0-100): Does it sound assertive, composed, and decisive?
4. Executive Presence & Articulation.

Respond strictly in valid JSON format:
{{
  "overall_communication_score": <integer 0-100>,
  "clarity_score": <integer 0-100>,
  "clarity_feedback": "<1-2 sentences on coherence and structure>",
  "confidence_score": <integer 0-100>,
  "confidence_feedback": "<1-2 sentences on assertiveness vs hesitation>",
  "star_compliance": {{
    "score": <integer 0-100>,
    "situation_detected": <true/false>,
    "task_detected": <true/false>,
    "action_detected": <true/false>,
    "result_detected": <true/false>,
    "situation_excerpt": "<excerpt from answer or null>",
    "task_excerpt": "<excerpt from answer or null>",
    "action_excerpt": "<excerpt from answer or null>",
    "result_excerpt": "<excerpt from answer or null>",
    "missing_elements": ["<e.g. Quantified Result>", "<e.g. Clear Task Objective>"],
    "star_feedback": "<guidance on how to structure into tighter STAR format>"
  }},
  "coaching_tips": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>"
  ],
  "polished_version": "<expertly phrased, crisp STAR response keeping candidate's authentic points>"
}}
"""
        raw = query_gemini(prompt, json_mode=True)
        ai_evaluation = extract_json(raw)
        if not ai_evaluation or not isinstance(ai_evaluation, dict):
            logger.warning("Invalid AI communication evaluation JSON, using fallback.")
            ai_evaluation = get_fallback_star_evaluation(clean_text, word_count)
    except Exception as e:
        logger.warning(f"Gemini communication evaluation failed ({e}). Using deterministic rule-based analysis.")
        ai_evaluation = get_fallback_star_evaluation(clean_text, word_count)

    clarity_score = int(ai_evaluation.get("clarity_score", 75))
    confidence_score = int(ai_evaluation.get("confidence_score", 70))
    star_score = int(ai_evaluation.get("star_compliance", {}).get("score", 65))

    # Adjust confidence score based on filler density & hedging phrases
    if filler_density > 6.0:
        confidence_score = max(30, confidence_score - 15)
    elif filler_density > 3.0:
        confidence_score = max(40, confidence_score - 8)

    if len(weak_found) >= 3:
        confidence_score = max(40, confidence_score - 10)

    overall_comm_score = int(0.35 * clarity_score + 0.30 * confidence_score + 0.25 * star_score + 0.10 * (100 - min(100, filler_density * 10)))
    overall_comm_score = max(20, min(98, overall_comm_score))

    return {
        "overall_communication_score": overall_comm_score,
        "word_count": word_count,
        "audio_duration_seconds": audio_duration_seconds,
        "filler_words": {
            "total_count": total_fillers,
            "density_percent": filler_density,
            "breakdown": filler_counts,
            "status": "Excellent" if filler_density < 1.5 else "Moderate" if filler_density < 4.0 else "High - Needs Attention"
        },
        "pacing": {
            "wpm": wpm,
            "rating": pacing_rating,
            "feedback": pacing_feedback
        },
        "clarity": {
            "score": clarity_score,
            "feedback": ai_evaluation.get("clarity_feedback", "Structure is easy to follow with clear topic progression.")
        },
        "confidence": {
            "score": confidence_score,
            "feedback": ai_evaluation.get("confidence_feedback", "Delivery sounds professional and grounded.")
        },
        "star_compliance": ai_evaluation.get("star_compliance", {
            "score": star_score,
            "situation_detected": True,
            "task_detected": True,
            "action_detected": True,
            "result_detected": False,
            "missing_elements": ["Quantifiable Result"],
            "star_feedback": "Ensure you close your response with clear business or technical metrics achieved."
        }),
        "power_verbs_used": power_verbs_used,
        "weak_phrases_detected": weak_found,
        "coaching_tips": ai_evaluation.get("coaching_tips", [
            "Use the STAR method: Situation -> Task -> Action -> Result.",
            "Pause for 1-2 seconds instead of using verbal filler words like 'um' or 'like'.",
            "Quantify your results with concrete numbers, percentages, or scale metrics."
        ]),
        "polished_version": ai_evaluation.get("polished_version", clean_text)
    }

def get_fallback_star_evaluation(text: str, word_count: int) -> Dict[str, Any]:
    """Fallback rule-based STAR analysis."""
    text_lower = text.lower()
    has_sit = any(k in text_lower for k in ["when", "during", "at my", "project", "situation", "company", "team"])
    has_task = any(k in text_lower for k in ["task", "goal", "needed to", "responsible for", "objective", "challenge"])
    has_act = any(k in text_lower for k in ["i implemented", "i built", "i designed", "i led", "i decided", "i solved", "i engineered"])
    has_res = any(k in text_lower for k in ["result", "improved", "reduced", "increased", "achieved", "%", "metric", "outcome"])

    star_count = sum([has_sit, has_task, has_act, has_res])
    star_score = int((star_count / 4.0) * 100)
    missing = []
    if not has_sit: missing.append("Clear Context / Situation")
    if not has_task: missing.append("Explicit Goal / Task")
    if not has_act: missing.append("Specific Individual Action (Use 'I' instead of 'We')")
    if not has_res: missing.append("Quantifiable Outcome / Result")

    clarity = 78 if word_count > 40 else 60
    confidence = 75

    return {
        "overall_communication_score": int(0.4 * clarity + 0.3 * confidence + 0.3 * star_score),
        "clarity_score": clarity,
        "clarity_feedback": "Clear narrative progression. Ensure distinct separation between individual actions and team contributions.",
        "confidence_score": confidence,
        "confidence_feedback": "Tone is steady. Frame decisions with conviction and ownership.",
        "star_compliance": {
            "score": star_score,
            "situation_detected": has_sit,
            "task_detected": has_task,
            "action_detected": has_act,
            "result_detected": has_res,
            "situation_excerpt": "Context provided in opening" if has_sit else None,
            "task_excerpt": "Task objectives outlined" if has_task else None,
            "action_excerpt": "Technical execution explained" if has_act else None,
            "result_excerpt": "Impact summarized" if has_res else None,
            "missing_elements": missing,
            "star_feedback": f"Detected {star_count}/4 STAR pillars. Focus on: {', '.join(missing) if missing else 'None'}"
        },
        "coaching_tips": [
            "Structure every answer using STAR: Situation (20%), Task (10%), Action (50%), Result (20%).",
            "Replace filler pauses with intentional silence to project poise and executive composure.",
            "End with a measurable business or user outcome (e.g. latency reduced by 30%, user satisfaction up 15%)."
        ],
        "polished_version": text
    }

def get_empty_communication_response() -> Dict[str, Any]:
    return {
        "overall_communication_score": 0,
        "word_count": 0,
        "audio_duration_seconds": None,
        "filler_words": {
            "total_count": 0,
            "density_percent": 0.0,
            "breakdown": {},
            "status": "No audio/text provided"
        },
        "pacing": {
            "wpm": None,
            "rating": "none",
            "feedback": "Please speak or enter an answer to evaluate communication skills."
        },
        "clarity": {"score": 0, "feedback": "Awaiting input."},
        "confidence": {"score": 0, "feedback": "Awaiting input."},
        "star_compliance": {
            "score": 0,
            "situation_detected": False,
            "task_detected": False,
            "action_detected": False,
            "result_detected": False,
            "missing_elements": ["Situation", "Task", "Action", "Result"],
            "star_feedback": "Provide an answer to analyze STAR structure."
        },
        "power_verbs_used": [],
        "weak_phrases_detected": [],
        "coaching_tips": ["Start recording or typing your response to receive real-time coaching."],
        "polished_version": ""
    }
