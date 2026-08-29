import os
import sys
import unittest
from unittest.mock import patch


BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from services.gemini_client import (  # noqa: E402
    DEFAULT_GEMINI_REQUEST_TIMEOUT_MS,
    get_request_timeout_ms,
)
from services.resume_service import analyze_resume_comprehensive  # noqa: E402


RESUME_TEXT = """
Software Engineer
Experience
Engineered Python and React services used by 2,000 users.
Reduced API latency by 35% and automated deployments with Docker and AWS.
Projects include REST APIs, PostgreSQL, Git, and distributed systems.
"""


class ResumeResilienceTests(unittest.TestCase):
    @patch("services.resume_service.query_gemini", side_effect=TimeoutError("deadline exceeded"))
    def test_timeout_returns_deterministic_analysis(self, _query_gemini):
        result = analyze_resume_comprehensive(RESUME_TEXT)

        self.assertEqual(result["analysis_source"], "deterministic_fallback")
        self.assertIsInstance(result["ats_score"], int)
        self.assertIn("category_scores", result)
        self.assertTrue(result["structured_actions"])

    @patch(
        "services.resume_service.query_gemini",
        return_value='{"ats_score": 84, "structured_actions": []}',
    )
    def test_valid_model_analysis_is_identified(self, _query_gemini):
        result = analyze_resume_comprehensive(RESUME_TEXT)

        self.assertEqual(result["analysis_source"], "gemini")
        self.assertEqual(result["ats_score"], 84)

    def test_request_timeout_is_bounded_below_proxy_window(self):
        with patch.dict(os.environ, {"PY_GEMINI_REQUEST_TIMEOUT_MS": "90000"}):
            self.assertEqual(get_request_timeout_ms(), 45_000)

        with patch.dict(os.environ, {"PY_GEMINI_REQUEST_TIMEOUT_MS": "invalid"}):
            self.assertEqual(
                get_request_timeout_ms(),
                DEFAULT_GEMINI_REQUEST_TIMEOUT_MS,
            )


if __name__ == "__main__":
    unittest.main()
