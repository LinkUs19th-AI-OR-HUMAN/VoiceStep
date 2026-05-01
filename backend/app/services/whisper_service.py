from __future__ import annotations

import logging
import os
import tempfile

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_local_model = None


def _get_local_model():
    """Lazy-load faster-whisper model (only when STT_ENGINE=faster_whisper)."""
    global _local_model
    if _local_model is not None:
        return _local_model
    settings = get_settings()
    try:
        from faster_whisper import WhisperModel

        _local_model = WhisperModel(
            settings.WHISPER_MODEL_SIZE,
            device=settings.WHISPER_DEVICE,
            compute_type=settings.WHISPER_COMPUTE_TYPE,
        )
        logger.info("faster-whisper model loaded: size=%s", settings.WHISPER_MODEL_SIZE)
        return _local_model
    except Exception as exc:  # noqa: BLE001
        logger.exception("faster-whisper failed to load: %s", exc)
        _local_model = None
        return None


def _transcribe_with_groq_api(audio_bytes: bytes, filename: str) -> str:
    """Call Groq Whisper API (https://api.groq.com/openai/v1/audio/transcriptions)."""
    settings = get_settings()
    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not configured; cannot use groq_whisper engine.")
        return ""
    try:
        files = {"file": (filename, audio_bytes, "application/octet-stream")}
        data = {"model": "whisper-large-v3-turbo", "language": "ko"}
        headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}"}
        with httpx.Client(timeout=60.0) as client:
            r = client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers=headers,
                files=files,
                data=data,
            )
        if r.status_code >= 400:
            logger.error("Groq Whisper API error %s: %s", r.status_code, r.text[:300])
            return ""
        return (r.json().get("text") or "").strip()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Groq Whisper API call failed: %s", exc)
        return ""


def _transcribe_local_file(file_path: str) -> str:
    model = _get_local_model()
    if model is None:
        return ""
    try:
        segments, _info = model.transcribe(file_path, language="ko", vad_filter=True)
        return "".join(seg.text for seg in segments).strip()
    except Exception as exc:  # noqa: BLE001
        logger.exception("Local whisper transcription failed: %s", exc)
        return ""


def transcribe_bytes(audio_bytes: bytes, suffix: str = ".webm") -> str:
    """Transcribe an audio buffer based on configured STT_ENGINE."""
    settings = get_settings()
    engine = (settings.STT_ENGINE or "").lower()

    if engine == "groq_whisper":
        filename = f"audio{suffix}"
        return _transcribe_with_groq_api(audio_bytes, filename)

    # faster_whisper or unknown → fall back to local
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(audio_bytes)
        return _transcribe_local_file(tmp_path)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


def transcribe_audio(file_path: str) -> str:
    """Convenience function for an existing file path (used by tests/CLI)."""
    settings = get_settings()
    engine = (settings.STT_ENGINE or "").lower()
    if engine == "groq_whisper":
        with open(file_path, "rb") as f:
            audio_bytes = f.read()
        return _transcribe_with_groq_api(audio_bytes, os.path.basename(file_path))
    return _transcribe_local_file(file_path)
