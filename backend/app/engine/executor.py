import pandas as pd

from ..query.models import QueryPlan
from .aggregation import aggregate
from .filtering import apply_filters
from .percentage import add_contribution_percentage
from .ranking import rank_result
from .time_analysis import add_time_dimension


class QueryExecutor:
    """
    Executes a validated QueryPlan against the sales dataset.

    The executor contains deterministic business logic.
    The AI planner does not generate or execute Python code.
    """

    def __init__(self, dataframe: pd.DataFrame):
        self.dataframe = dataframe.copy()

    def execute(self, plan: QueryPlan) -> pd.DataFrame:
        df = self.dataframe.copy()

        # 1. Prepare time dimension when requested.
        dimensions = list(plan.dimensions)

        if plan.time_granularity:
            df = add_time_dimension(
                df,
                granularity=plan.time_granularity,
            )

            if "time_period" not in dimensions:
                dimensions.insert(0, "time_period")

        # 2. Apply filters.
        if plan.filters:
            df = apply_filters(
                df,
                plan.filters,
            )

        # 3. Aggregate requested metric.
        result = aggregate(
            df=df,
            metric=plan.metric,
            aggregation=plan.aggregation,
            dimensions=dimensions,
        )

        # 4. Add contribution percentage when requested.
        if plan.percentage:
            result = add_contribution_percentage(
                result,
                metric=plan.metric,
            )

        # 5. Sort and apply limit.
        sort_by = plan.sort_by

        if sort_by is None:
            sort_by = plan.metric

        if plan.limit is not None and len(dimensions) > 1:
            parent_dimensions = dimensions[:-1]
            if parent_dimensions:
                ascending = plan.sort_order == "asc"
                result = (
                    result.groupby(
                        parent_dimensions,
                        group_keys=False,
                        dropna=False,
                    )
                    .apply(
                        lambda group: group.sort_values(
                            by=sort_by,
                            ascending=ascending,
                            kind="stable",
                        ).head(plan.limit)
                    )
                    .reset_index(drop=True)
                )
            else:
                result = rank_result(
                    result,
                    sort_by=sort_by,
                    sort_order=plan.sort_order,
                    limit=plan.limit,
                )
        else:
            result = rank_result(
                result,
                sort_by=sort_by,
                sort_order=plan.sort_order,
                limit=plan.limit,
            )

        return result.reset_index(drop=True)


def execute_query(
    dataframe: pd.DataFrame,
    plan: QueryPlan,
) -> pd.DataFrame:
    """
    Convenience function for executing a QueryPlan.
    """

    executor = QueryExecutor(dataframe)

    return executor.execute(plan)