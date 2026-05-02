"""Reserved for future LLM-related debug endpoints."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.options("", include_in_schema=False)
@router.options("/ping", include_in_schema=False)
async def llm_options():
    return {}


@router.get("/ping")
def ping() -> dict:
    return {"ok": True}
