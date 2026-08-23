import os
import re
import json
import logging
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv(override=True)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=True)

logger = logging.getLogger("gemini_client")

MODELS_PRIORITY = [
    "gemini-flash-latest",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash",
]

def get_configured_api_key() -> str:
    load_dotenv(override=True)
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"), override=True)
    return (os.getenv("GOOGLE_API_KEY") or "").strip()

def query_gemini(prompt: str, system_instruction: Optional[str] = None, json_mode: bool = False) -> str:
    """
    Executes a prompt against Gemini with model fallback cascade.
    """
    api_key = get_configured_api_key()
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not configured.")

    genai.configure(api_key=api_key)

    generation_config = {}
    if json_mode:
        generation_config["response_mime_type"] = "application/json"

    last_error = None
    for model_name in MODELS_PRIORITY:
        try:
            model_kwargs = {"model_name": model_name}
            if system_instruction:
                model_kwargs["system_instruction"] = system_instruction

            model = genai.GenerativeModel(**model_kwargs)
            response = model.generate_content(
                prompt,
                generation_config=generation_config if json_mode else None
            )

            text_content = ""
            if hasattr(response, "text") and response.text:
                text_content = response.text
            elif hasattr(response, "candidates") and response.candidates:
                parts = response.candidates[0].content.parts
                text_content = "".join(getattr(p, "text", "") for p in parts)

            if text_content.strip():
                return text_content.strip()

        except Exception as e:
            last_error = e
            logger.warning(f"Model '{model_name}' failed: {e}")
            continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

def extract_json(text: str) -> Any:
    """
    Safely extracts and parses JSON from model output that might contain markdown fences,
    trailing commas, or conversational padding.
    """
    if not text:
        return None

    cleaned = text.strip()

    # 1. Direct parse attempt
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 2. Strip markdown fences if present
    fence_match = re.search(r"```(?:json|JSON)?\s*([\s\S]*?)\s*```", cleaned)
    if fence_match:
        fence_content = fence_match.group(1).strip()
        try:
            return json.loads(fence_content)
        except json.JSONDecodeError:
            cleaned = fence_content

    if cleaned.startswith("```json") or cleaned.startswith("```JSON"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # 3. Locate outermost JSON object or array
    match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
    candidate = match.group(1).strip() if match else cleaned

    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        pass

    # 4. Remove trailing commas before closing braces/brackets
    no_trailing = re.sub(r",\s*([\]}])", r"\1", candidate)
    try:
        return json.loads(no_trailing)
    except json.JSONDecodeError:
        pass

    # 5. Try fixing trailing commas across full cleaned text
    no_trailing_all = re.sub(r",\s*([\]}])", r"\1", cleaned)
    try:
        return json.loads(no_trailing_all)
    except json.JSONDecodeError:
        pass

    match_all = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", no_trailing_all)
    if match_all:
        try:
            return json.loads(match_all.group(1).strip())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Failed to parse JSON from AI response: {text[:200]}...")
