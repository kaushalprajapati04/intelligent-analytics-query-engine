import json
import re
from typing import Any

from ..query.models import QueryPlan


def extract_json(text: str) -> dict[str, Any]:
    """
    Extract a JSON object from an LLM response.

    Handles responses where the model wraps JSON inside
    markdown code fences.
    """

    if not text or not text.strip():
        raise ValueError("AI response is empty.")

    cleaned = text.strip()

    # Remove markdown code fences such as ```json ... ```
    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
    )

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to locate the first JSON object in the response.
        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start == -1 or end == -1 or start >= end:
            raise ValueError(
                "AI response does not contain valid JSON."
            )

        json_text = cleaned[start : end + 1]

        try:
            parsed = json.loads(json_text)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Could not parse AI response as JSON: {exc}"
            ) from exc

    if not isinstance(parsed, dict):
        raise ValueError(
            "AI response must contain a JSON object."
        )

    return parsed


def parse_query_plan(response_text: str) -> QueryPlan:
    """
    Parse an AI response and validate its structure using Pydantic.
    """

    data = extract_json(response_text)

    try:
        return QueryPlan.model_validate(data)
    except Exception as exc:
        raise ValueError(
            f"AI response does not match the QueryPlan schema: {exc}"
        ) from exc