from __future__ import annotations

from app.services import gemini_service


def correct_stt(stt_text: str, recent_context: list[dict]) -> str:
    """Thin wrapper kept for naming clarity."""
    return gemini_service.correct_stt_text(stt_text, recent_context)
