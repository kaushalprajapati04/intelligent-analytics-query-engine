# SalesAnalyticsAI Query Processing

## 1. Overview

SalesAnalyticsAI converts natural-language business questions into structured analytical operations.

The query-processing pipeline is:

Natural Language Query
    |
    v
Query Planner
    |
    v
QueryPlan
    |
    v
Parser
    |
    v
Validator
    |
    v
Normalizer
    |
    v
Analytics Executor
    |
    v
Result Formatter
    |
    +----------------------+
    |                      |
    v                      v
Confidence Score       Explanation
    |
    v
Final API Response

The system separates query understanding from actual data execution.

---

## 2. Step 1: User Query

The process begins when the user enters a natural-language question.

Example:

Show me the top 5 products by revenue

The frontend sends the query to the backend through the query API.

Example request:

{
  "query": "Show me the top 5 products by revenue"
}

---

## 3. Step 2: Query Planning

The AI planner receives the user's question along with information about the available analytics capabilities.

The planner determines:

- What metric the user wants
- What aggregation should be performed
- What dimension should be used
- Whether filtering is required
- Whether sorting is required
- Whether ranking is required
- Whether percentage analysis is required
- Whether time-based analysis is required
- Whether comparison is required

For example:

Show me the top 5 products by revenue

can be represented as:

{
  "metric": "revenue",
  "aggregation": "sum",
  "dimensions": [
    "product_name"
  ],
  "filters": [],
  "sort_by": "revenue",
  "sort_order": "desc",
  "limit": 5,
  "percentage": false,
  "comparison": null,
  "time_granularity": null,
  "target_comparison": false
}

---

## 4. Step 3: AI Response Parsing

The AI response is parsed before it reaches the execution engine.

The parser extracts the structured JSON response and converts it into the application's QueryPlan model.

This provides a strongly typed representation of the requested operation.

If the AI response is not valid JSON or does not match the expected structure, the query is rejected rather than executed blindly.

---

## 5. Step 4: Query Validation

The QueryPlan is validated before execution.

The validator checks whether the requested operations are supported by the application.

Validation includes:

- Metric validation
- Aggregation validation
- Dimension validation
- Filter validation
- Sort field validation
- Sort order validation
- Limit validation
- Time granularity validation
- Query structure validation

For example, if the user asks for a metric that does not exist in the supported metric list, the query should not be executed.

---

## 6. Step 5: Query Normalization

After validation, the QueryPlan is normalized.

Normalization creates a consistent internal representation.

Examples include:

- Converting metric names into supported names
- Normalizing dimension names
- Normalizing sorting fields
- Extracting numerical limits
- Standardizing query attributes

This reduces ambiguity for the execution layer.

---

## 7. Step 6: Data Preparation

Before execution, the application loads the required dataset.

The data layer is responsible for:

- Loading CSV data
- Cleaning data
- Validating required columns
- Preparing calculated metrics
- Providing metadata about supported fields

The primary dataset is:

sales_data.csv

Additional dataset information is available through:

targets.csv

data_dictionary.json

nl_queries.json

---

## 8. Step 7: Filtering

If the QueryPlan contains filters, the filtering engine applies them to the dataset.

Supported operations include:

- eq
- neq
- gt
- gte
- lt
- lte
- in
- contains

Example:

Show total revenue for the North region

The corresponding operation can be represented as:

{
  "field": "region",
  "operator": "eq",
  "value": "North"
}

The dataset is filtered before aggregation.

---

## 9. Step 8: Time-Based Processing

If the query requires time-based analysis, the time analysis module processes the date information.

Supported granularities include:

- Day
- Month
- Quarter
- Year

Example:

Show revenue by month

The system extracts the month from the relevant date field and performs the requested aggregation at monthly granularity.

---

## 10. Step 9: Metric Calculation

The analytics engine calculates the requested metric.

Supported metrics include:

- Revenue
- Profit
- Orders
- Quantity
- Average Order Value

Revenue is calculated as:

quantity * unit_price * (1 - discount)

Average Order Value is calculated as:

revenue / orders

The calculation is performed by the deterministic analytics engine rather than by the AI model.

---

## 11. Step 10: Aggregation

The aggregation engine applies the requested aggregation.

Supported aggregations include:

- Sum
- Average
- Count
- Minimum
- Maximum

For example:

Show total revenue by region

requires:

Metric:
revenue

Aggregation:
sum

Dimension:
region

The resulting data is grouped by region and the revenue values are summed.

---

## 12. Step 11: Grouping

Grouping is performed when the QueryPlan contains dimensions.

Example:

Show total profit by product category

The query is grouped by:

product_category

and the requested metric:

profit

is aggregated for each group.

---

## 13. Step 12: Ranking

Ranking is used for Top-N and Bottom-N questions.

Example:

Show me the top 5 products by revenue

The execution engine:

1. Calculates revenue for each product.
2. Groups the data by product.
3. Sorts the result by revenue.
4. Uses descending order.
5. Limits the result to five rows.

For Bottom-N queries, the sorting direction is reversed.

---

## 14. Step 13: Contribution Percentage

Contribution analysis determines how much each group contributes to the total.

Example:

What percentage of total revenue comes from each region?

The system first calculates revenue for each region.

Then:

Contribution Percentage =
Group Revenue / Total Revenue * 100

Example result structure:

{
  "region": "NA",
  "revenue": 3262.4,
  "contribution_percentage": 53.18
}

---

## 15. Step 14: Comparison

The comparison engine handles supported analytical comparisons.

Comparison operations can be used to compare analytical values or groups.

The QueryPlan contains comparison information when the user requests a comparison.

The actual comparison is performed deterministically by the backend.

---

## 16. Step 15: Result Formatting

After execution, the raw Pandas result is converted into a structured result object.

The formatted result contains information such as:

- Columns
- Rows
- Row count

Example:

{
  "columns": [
    "product_name",
    "revenue"
  ],
  "rows": [
    {
      "product_name": "Dell XPS",
      "revenue": 2068.0
    }
  ],
  "row_count": 1
}

This predictable format allows the frontend to display results consistently.

---

## 17. Step 16: Confidence Calculation

After the query is executed, the confidence service calculates a confidence score.

The score considers aspects of the generated QueryPlan such as:

- Recognized metric
- Valid dimensions
- Aggregation
- Ranking
- Sorting
- Percentage analysis
- Time analysis
- Query structure

The score is represented between:

0.0 and 1.0

The confidence score is a heuristic indicator and should not be interpreted as a statistical probability.

---

## 18. Step 17: Explanation Generation

The explanation service converts the QueryPlan into a human-readable description.

For example:

Query:

Show me the top 5 products by revenue

Explanation:

The system analyzed revenue using sum aggregation, grouped the result by product name, sorted the products by revenue in descending order, and returned the top 5 results.

This allows users to understand the analytical logic without needing to inspect the QueryPlan.

---

## 19. Step 18: Final API Response

The backend combines all components into a final response.

Example:

{
  "query": "Show me the top 5 products by revenue",
  "generated_logic": {
    "metric": "revenue",
    "aggregation": "sum",
    "dimensions": [
      "product_name"
    ],
    "filters": [],
    "sort_by": "revenue",
    "sort_order": "desc",
    "limit": 5
  },
  "result": {
    "columns": [
      "product_name",
      "revenue"
    ],
    "rows": [
      {
        "product_name": "Dell XPS",
        "revenue": 2068.0
      }
    ],
    "row_count": 5
  },
  "confidence_score": 0.91,
  "explanation": "The system analyzed revenue using sum aggregation and returned the top 5 products."
}

---

## 20. Frontend Result Processing

The frontend receives the API response and determines how the result should be presented.

Depending on the result structure, it can display:

- KPI
- Table
- Bar chart
- Horizontal bar chart
- Line chart
- Pie chart
- Donut chart

The frontend does not recalculate the analytical result.

The backend remains the source of truth for query execution.

---

## 21. Example End-to-End Query

Consider the query:

Show me the top 5 products by revenue

### Input

Natural-language query:

Show me the top 5 products by revenue

### QueryPlan

Metric:

revenue

Aggregation:

sum

Dimension:

product_name

Sort:

descending

Limit:

5

### Execution

The analytics engine:

1. Loads the sales data.
2. Calculates revenue.
3. Groups by product name.
4. Calculates total revenue for each product.
5. Sorts by revenue descending.
6. Selects the first five rows.

### Output

Example:

Product Name | Revenue

Dell XPS | 2068.00

Samsung Galaxy | 1288.00

MacBook Air | 1116.00

iPhone 14 | 855.00

Ergo Chair | 324.00

### Final Processing

The system then generates:

- Confidence score
- Explanation
- Structured result

The frontend displays the result as a table and an appropriate chart.

---

## 22. Why This Processing Model Is Used

The system intentionally separates AI interpretation from data execution.

The AI is good at:

- Understanding natural language
- Identifying user intent
- Mapping business language to available fields
- Selecting analytical operations

Deterministic code is better suited for:

- Data filtering
- Aggregation
- Sorting
- Ranking
- Mathematical calculations
- Result formatting

This hybrid approach combines the flexibility of AI with the reliability of deterministic analytics.

---

## 23. Handling Invalid Queries

If a user asks for an unsupported operation, the system should not attempt to execute arbitrary logic.

For example:

"Calculate a metric that does not exist in the dataset"

The planner may produce an unsupported metric.

The validator identifies the problem and rejects the QueryPlan.

This prevents unsupported operations from reaching the execution engine.

---

## 24. Handling Empty Results

A valid query may produce no matching rows.

For example, a filter may not match any records.

The execution layer returns an empty result structure rather than failing unexpectedly.

The frontend can then display an appropriate empty-state message.

---

## 25. Handling AI Parsing Errors

If the AI response cannot be parsed into the expected QueryPlan structure, the parser reports an error.

The backend does not execute an unvalidated response.

This provides a safety boundary between the AI model and the analytics engine.

---

## 26. Extending Query Processing

Additional query capabilities can be introduced by extending the QueryPlan model and the corresponding execution modules.

For example, future versions could support:

- Advanced target comparisons
- Multi-level grouping
- Nested analytical queries
- Forecasting
- Anomaly detection
- Additional date operations
- More complex contribution analysis
- Database-backed execution

The existing architecture is designed to support these extensions without replacing the complete query-processing pipeline.

---

## 27. Summary

The SalesAnalyticsAI query-processing pipeline follows a controlled sequence:

1. Receive natural-language query.
2. Understand user intent using Generative AI.
3. Generate a structured QueryPlan.
4. Parse the AI response.
5. Validate the QueryPlan.
6. Normalize the query.
7. Load and prepare the data.
8. Apply filters.
9. Apply time transformations when required.
10. Calculate metrics.
11. Perform aggregation and grouping.
12. Apply sorting and ranking.
13. Calculate percentages or comparisons when required.
14. Format the result.
15. Calculate confidence.
16. Generate an explanation.
17. Return the response through the API.
18. Visualize the result in the frontend.

The key architectural principle is:

AI plans the analysis.

Validation controls the analysis.

Pandas executes the analysis.

The frontend presents the analysis.