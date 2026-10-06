from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..ai.planner import QueryPlanner
from ..main import sales_data, targets_data
from ..query.validator import validate_query_plan
from ..engine.executor import execute_query
from ..services.confidence import calculate_confidence
from ..services.explanation import build_explanation
from ..services.formatter import format_result


router = APIRouter(
    prefix="/api",
    tags=["Query"],
)


class QueryRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Natural-language analytics question.",
    )


@router.post("/query")
def process_query(request: QueryRequest):
    """
    Convert a natural-language question into a QueryPlan,
    validate it, execute it, and return the analytical result.
    """

    try:
        planner = QueryPlanner(
            columns=list(sales_data.columns),
            target_columns=list(targets_data.columns),
        )

        # Step 1: Generate structured plan using GenAI.
        plan = planner.create_plan(request.query)

        # Step 2: Validate the generated plan.
        is_valid, validation_errors = validate_query_plan(
            plan,
            available_columns=set(sales_data.columns),
        )

        if not is_valid:
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Generated query plan is invalid.",
                    "errors": validation_errors,
                },
            )

        # Step 3: Execute the validated plan deterministically.
        result_dataframe = execute_query(
            dataframe=sales_data,
            plan=plan,
        )

        # Step 4: Calculate confidence.
        confidence_score = calculate_confidence(
            plan=plan,
            validation_errors=validation_errors,
        )

        # Step 5: Generate explanation.
        explanation = build_explanation(
            plan=plan,
            row_count=len(result_dataframe),
        )

        # Step 6: Format result for the frontend.
        formatted_result = format_result(
            result_dataframe,
        )

        return {
            "query": request.query,
            "generated_logic": plan.model_dump(),
            "result": formatted_result,
            "confidence_score": confidence_score,
            "explanation": explanation,
        }

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to process the analytics query. "
                f"Error: {exc}"
            ),
        ) from exc