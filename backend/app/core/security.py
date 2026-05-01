from __future__ import annotations

import logging
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.firebase_admin import verify_id_token
from app.db.database import get_db
from app.db.models import User

logger = logging.getLogger(__name__)


def _bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


def _decode_token(token: str) -> dict:
    settings = get_settings()
    if settings.DEV_AUTH_BYPASS:
        # Trust the token as raw uid for local development.
        return {"uid": token, "email": None, "name": None}
    try:
        return verify_id_token(token)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Firebase token verification failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = _bearer_token(authorization)
    decoded = _decode_token(token)
    firebase_uid = decoded.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        user = User(
            firebase_uid=firebase_uid,
            email=decoded.get("email"),
            display_name=decoded.get("name"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def get_token_payload(
    authorization: Optional[str] = Header(default=None),
) -> dict:
    token = _bearer_token(authorization)
    return _decode_token(token)
