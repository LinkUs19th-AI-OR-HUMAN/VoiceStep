from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_initialized = False


def _init_firebase_app() -> None:
    """Initialize Firebase Admin SDK lazily; safe to call multiple times."""
    global _initialized
    if _initialized:
        return

    settings = get_settings()
    raw = (settings.FIREBASE_SERVICE_ACCOUNT_JSON or "").strip()

    try:
        import firebase_admin
        from firebase_admin import credentials
    except ImportError:
        logger.warning("firebase-admin not installed; auth endpoints will fail without it.")
        return

    try:
        if raw:
            cred_dict = json.loads(raw)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized with service account credentials.")
        elif settings.FIREBASE_PROJECT_ID:
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
            logger.warning(
                "Firebase Admin initialized without service account; token verification may fail."
            )
        else:
            logger.warning(
                "Firebase Admin not initialized: missing FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_PROJECT_ID."
            )
            return
    except ValueError:
        # Already initialized
        pass

    _initialized = True


def verify_id_token(id_token: str) -> dict[str, Any]:
    _init_firebase_app()
    from firebase_admin import auth as fb_auth

    return fb_auth.verify_id_token(id_token)


def is_initialized() -> bool:
    _init_firebase_app()
    try:
        import firebase_admin

        firebase_admin.get_app()
        return True
    except Exception:  # noqa: BLE001
        return False
