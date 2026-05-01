from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"


def _load_yaml(filename: str) -> dict[str, Any]:
    path = PROMPTS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


@lru_cache(maxsize=8)
def load_conversation_prompt(scenario_type: str) -> dict[str, Any]:
    if scenario_type == "interview":
        return _load_yaml("interview_conversation.yaml")
    if scenario_type == "work":
        return _load_yaml("work_conversation.yaml")
    raise ValueError(f"Unknown scenario_type: {scenario_type}")


@lru_cache(maxsize=8)
def load_report_prompt(scenario_type: str) -> dict[str, Any]:
    if scenario_type == "interview":
        return _load_yaml("interview_report.yaml")
    if scenario_type == "work":
        return _load_yaml("work_report.yaml")
    raise ValueError(f"Unknown scenario_type: {scenario_type}")
