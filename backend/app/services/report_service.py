from __future__ import annotations

import logging
import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.db.models import ConversationSession, Message, Report, User
from app.services import gemini_service

logger = logging.getLogger(__name__)


def create_report_for_session(
    db: Session,
    user: User,
    session: ConversationSession,
    messages: list[Message],
) -> Report:
    msg_dicts = [
        {"role": m.role, "content": m.content}
        for m in messages
        if m.role in ("ai", "user")
    ]
    report_json = gemini_service.generate_report(session.scenario_type, msg_dicts)

    title = report_json.get("title") or (
        "면접 상황 연습 결과" if session.scenario_type == "interview" else "업무 상황 연습 결과"
    )
    summary = report_json.get("summary") or ""
    total_score = int(report_json.get("total_score") or 0)

    report = Report(
        session_id=session.id,
        user_id=user.id,
        scenario_type=session.scenario_type,
        job=session.job,
        title=title,
        summary=summary,
        total_score=total_score,
        report_json=report_json,
    )
    db.add(report)
    db.flush()
    return report


def list_reports_for_user(db: Session, user: User) -> list[Report]:
    return (
        db.query(Report)
        .filter(Report.user_id == user.id)
        .order_by(Report.created_at.desc())
        .all()
    )


def get_report_for_user(db: Session, user: User, report_id: uuid.UUID) -> Optional[Report]:
    return (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == user.id)
        .first()
    )
