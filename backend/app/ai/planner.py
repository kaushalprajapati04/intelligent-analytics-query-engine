import re

from openai import OpenAI, OpenAIError

from ..config import settings
from ..data.metrics import DIMENSIONS, METRICS
from ..query.models import QueryPlan
from ..query.normalizer import normalize_plan
from .parser import parse_query_plan
from .prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE


class QueryPlanner:
    """
    Converts a natural-language analytics question into
    a structured QueryPlan using an LLM with a safe fallback.
    """

    def __init__(
        self,
        columns: list[str],
        target_columns: list[str] | None = None,
    ):
        self.columns = columns
        self.target_columns = target_columns or []
        self.client = None

        if settings.OPENAI_API_KEY:
            self.client = OpenAI(
                api_key=settings.OPENAI_API_KEY,
            )

    def _build_fallback_plan(self, question: str) -> QueryPlan:
        """
        Build a deterministic QueryPlan for common demo requests when the
        AI service is unavailable, rate-limited, or otherwise unusable.
        """

        question_lower = question.lower()
        plan = QueryPlan(
            metric="revenue",
            aggregation="sum",
            dimensions=[],
            filters=[],
            sort_by=None,
            sort_order="desc",
            limit=None,
            percentage=False,
            comparison=None,
            time_granularity=None,
            target_comparison=False,
        )

        match = re.search(r"top\s+(\d+)", question_lower)
        if match:
            plan.limit = int(match.group(1))

        if "percentage" in question_lower or "share of total" in question_lower or "contribution" in question_lower:
            plan.percentage = True

        if "month" in question_lower or "monthly" in question_lower:
            plan.time_granularity = "month"
            plan.metric = "revenue"
            plan.aggregation = "sum"
            if "by" in question_lower and "region" in question_lower:
                plan.dimensions = ["region"]
                plan.sort_by = "revenue"
            elif "by" in question_lower and "country" in question_lower:
                plan.dimensions = ["country"]
                plan.sort_by = "revenue"

        if "average order value" in question_lower or "aov" in question_lower:
            plan.metric = "avg_order_value"
            plan.aggregation = "sum"
            if "by" in question_lower and "region" in question_lower:
                plan.dimensions = ["region"]
            elif "by" in question_lower and "country" in question_lower:
                plan.dimensions = ["country"]
            elif "by" in question_lower and "product" in question_lower:
                plan.dimensions = ["product_name"]
            plan.sort_by = "avg_order_value"
            return normalize_plan(plan)

        if "profit" in question_lower:
            plan.metric = "profit"
            if "country" in question_lower:
                plan.dimensions = ["country"]
                plan.sort_by = "profit"
            elif "region" in question_lower:
                plan.dimensions = ["region"]
                plan.sort_by = "profit"
            elif "city" in question_lower:
                plan.dimensions = ["city"]
                plan.sort_by = "profit"
            elif "product" in question_lower:
                plan.dimensions = ["product_name"]
                plan.sort_by = "profit"
            return normalize_plan(plan)

        if "revenue" in question_lower or "sales" in question_lower:
            plan.metric = "revenue"
            plan.aggregation = "sum"

            if "by" in question_lower and "region" in question_lower:
                plan.dimensions = ["region"]
                plan.sort_by = "revenue"
            elif "by" in question_lower and "country" in question_lower:
                plan.dimensions = ["country"]
                plan.sort_by = "revenue"
            elif "by" in question_lower and "product" in question_lower:
                plan.dimensions = ["product_name"]
                plan.sort_by = "revenue"
            elif "by" in question_lower and "month" in question_lower:
                plan.time_granularity = "month"
                plan.sort_by = "revenue"
            elif "top" in question_lower and "product" in question_lower:
                plan.dimensions = ["product_name"]
                plan.sort_by = "revenue"
                if plan.limit is None:
                    plan.limit = 5
            elif "percentage" in question_lower and "region" in question_lower:
                plan.dimensions = ["region"]
                plan.percentage = True
                plan.sort_by = "revenue"
                return normalize_plan(plan)
            elif "month" in question_lower:
                plan.time_granularity = "month"
                plan.sort_by = "revenue"

            if plan.sort_by is None and plan.dimensions:
                plan.sort_by = plan.metric

            if plan.limit is not None and not plan.dimensions:
                plan.dimensions = ["product_name"]
                plan.sort_by = "revenue"

            return normalize_plan(plan)

        if "total" in question_lower and "revenue" in question_lower:
            plan.metric = "revenue"
            plan.dimensions = []
            plan.sort_by = None
            return normalize_plan(plan)

        return normalize_plan(plan)

    def create_plan(self, question: str) -> QueryPlan:
        """
        Generate and parse a QueryPlan from a natural-language question.
        """

        if not question or not question.strip():
            raise ValueError(
                "Analytics question cannot be empty."
            )

        if not self.client:
            return self._build_fallback_plan(question.strip())

        user_prompt = USER_PROMPT_TEMPLATE.format(
            columns=", ".join(self.columns),
            metrics=", ".join(METRICS.keys()),
            dimensions=", ".join(DIMENSIONS),
            target_columns=", ".join(self.target_columns),
            question=question.strip(),
        )

        try:
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                temperature=0,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
            )

            content = response.choices[0].message.content

            if not content:
                raise ValueError(
                    "The AI model returned an empty response."
                )

            plan = parse_query_plan(content)
            return normalize_plan(plan)

        except (
            OpenAIError,
            ValueError,
            TypeError,
            IndexError,
            AttributeError,
        ):
            return self._build_fallback_plan(question.strip())