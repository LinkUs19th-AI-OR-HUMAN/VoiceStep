from __future__ import annotations

import logging
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import ConversationSession, Message, Report, User
from app.services import gemini_service, report_service

logger = logging.getLogger(__name__)


def create_session(db: Session, user: User, scenario_type: str) -> ConversationSession:
    session = ConversationSession(user_id=user.id, scenario_type=scenario_type, status="active", turn_count=0)
    db.add(session)
    db.flush()

    first_question = gemini_service.get_first_question(scenario_type)
    if not first_question:
        first_question = "안녕하세요. 먼저 자기소개를 간단히 해주시겠어요?"

    msg = Message(
        session_id=session.id,
        role="ai",
        content=first_question,
        turn_index=0,
    )
    db.add(msg)
    db.commit()
    db.refresh(session)
    return session


def get_session_for_user(db: Session, user: User, session_id: uuid.UUID) -> Optional[ConversationSession]:
    return (
        db.query(ConversationSession)
        .filter(ConversationSession.id == session_id, ConversationSession.user_id == user.id)
        .first()
    )


def list_messages(db: Session, session_id: uuid.UUID) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.turn_index.asc(), Message.created_at.asc())
        .all()
    )


def submit_user_reply(
    db: Session,
    user: User,
    session: ConversationSession,
    original_stt_text: str,
    corrected_text: str,
) -> dict:
    settings = get_settings()
    max_turns = settings.MAX_CONVERSATION_TURNS

    if session.status != "active":
        raise ValueError("Session is not active")

    messages = list_messages(db, session.id)
    next_turn_index = (messages[-1].turn_index + 1) if messages else 0

    user_msg = Message(
        session_id=session.id,
        role="user",
        content=corrected_text or original_stt_text,
        original_stt_text=original_stt_text,
        corrected_text=corrected_text,
        turn_index=next_turn_index,
    )
    db.add(user_msg)
    session.turn_count = (session.turn_count or 0) + 1
    db.flush()

    is_completed = session.turn_count >= max_turns

    # Build history for Gemini (exclude system role)
    history_dicts = [
        {"role": m.role, "content": m.content}
        for m in messages
        if m.role in ("ai", "user")
    ]
    history_dicts.append({"role": "user", "content": user_msg.content})

    if is_completed:
        from app.services.prompt_loader import load_conversation_prompt

        closing = (load_conversation_prompt(session.scenario_type).get("closing_message") or
                   "수고하셨습니다. 지금까지의 답변을 바탕으로 결과 보고서를 생성하겠습니다.").strip()
        ai_msg = Message(
            session_id=session.id,
            role="ai",
            content=closing,
            turn_index=next_turn_index + 1,
        )
        db.add(ai_msg)
        session.status = "completed"
        session.ended_at = datetime.utcnow()
        db.flush()

        # Generate report
        full_messages = list_messages(db, session.id)
        report = report_service.create_report_for_session(db, user, session, full_messages)
        db.commit()
        db.refresh(ai_msg)

        return {
            "session_id": session.id,
            "turn_count": session.turn_count,
            "is_completed": True,
            "ai_message": {
                "role": ai_msg.role,
                "content": ai_msg.content,
                "turn_index": ai_msg.turn_index,
            },
            "report_id": report.id,
        }

    # Generate next AI question
    next_q = gemini_service.generate_next_question(
        scenario_type=session.scenario_type,
        recent_messages=history_dicts[-6:],
        user_answer=user_msg.content,
    )
    ai_msg = Message(
        session_id=session.id,
        role="ai",
        content=next_q,
        turn_index=next_turn_index + 1,
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return {
        "session_id": session.id,
        "turn_count": session.turn_count,
        "is_completed": False,
        "ai_message": {
            "role": ai_msg.role,
            "content": ai_msg.content,
            "turn_index": ai_msg.turn_index,
        },
        "report_id": None,
    }
