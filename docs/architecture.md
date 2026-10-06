# SalesAnalyticsAI Architecture

## 1. Overview

SalesAnalyticsAI is designed as a layered intelligent analytics system.

The architecture separates natural-language understanding from deterministic data execution.

The system follows this high-level flow:

User Query
    |
    v
React Frontend
    |
    v
FastAPI API
    |
    v
GenAI Query Planner
    |
    v
Structured QueryPlan
    |
    v
Validation and Normalization
    |
    v
Pandas Analytics Engine
    |
    v
Result Formatting
    |
    +----------------------+
    |                      |
    v                      v
Confidence Score       Explanation
    |
    v
Frontend Visualization

---

## 2. Architectural Components

### 2.1 Frontend

The frontend is implemented using React and Vite.

Its responsibilities include:

- Accepting natural-language queries
- Displaying example queries
- Sending requests to the backend
- Displaying loading states
- Displaying errors
- Rendering analytical results
- Displaying charts
- Displaying confidence scores
- Displaying explanations
- Displaying key insights
- Providing suggested next questions
- Maintaining query history
- Maintaining saved analyses
- Providing export functionality

The frontend does not perform the core analytics calculations.

---

## 3. Backend API Layer

The backend is implemented using FastAPI.

The API layer is responsible for:

- Receiving user queries
- Validating API requests
- Calling the query planner
- Executing the generated QueryPlan
- Returning structured results
- Providing metadata
- Providing health information

Main API endpoints include:

POST /api/query

GET /api/health

GET /api/metadata

FastAPI also provides automatic API documentation through its OpenAPI integration.

---

## 4. AI Query Planner

The AI query planner is responsible for understanding natural-language questions.

For example:

"Show me the top 5 products by revenue"

is converted into a structured representation.

Example:

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

The planner uses the available dataset metadata and supported analytical operations to construct the QueryPlan.

---

## 5. Structured QueryPlan

The QueryPlan acts as an intermediate representation between natural language and the analytics engine.

The QueryPlan can contain:

- Metric
- Aggregation
- Dimensions
- Filters
- Sort field
- Sort order
- Result limit
- Percentage calculation
- Comparison
- Time granularity
- Target comparison

This representation provides a controlled interface between the AI layer and the deterministic execution layer.

---

## 6. Query Validation

Before execution, the generated QueryPlan is validated.

Validation checks include:

- Supported metrics
- Supported dimensions
- Valid aggregation
- Valid filters
- Valid sort fields
- Valid sort order
- Valid result limits
- Valid time granularity
- Valid query structure

Invalid plans are rejected before reaching the analytics engine.

This prevents unsupported operations from being executed.

---

## 7. Query Normalization

The normalization layer converts the QueryPlan into a consistent internal representation.

Normalization handles:

- Metric normalization
- Dimension normalization
- Sort field normalization
- Numeric limit extraction
- Consistent query structure

This makes downstream execution more predictable.

---

## 8. Data Layer

The application loads the provided datasets from the backend dataset directory.

Main files include:

sales_data.csv

targets.csv

data_dictionary.json

nl_queries.json

The data loader is responsible for reading the datasets.

The cleaner handles dataset preparation and normalization.

The validator verifies that the required data is available and usable.

The metrics module defines supported metrics and dimensions.

---

## 9. Analytics Engine

The analytics engine is deterministic.

It executes validated QueryPlans using Pandas.

The engine is divided into multiple modules.

### Filtering

Responsible for operations such as:

- Equal
- Not equal
- Greater than
- Greater than or equal
- Less than
- Less than or equal
- In
- Contains

### Aggregation

Responsible for:

- Sum
- Average
- Count
- Minimum
- Maximum

### Ranking

Responsible for:

- Sorting
- Top-N
- Bottom-N
- Result limiting

### Percentage Analysis

Responsible for calculating contribution percentages.

For example:

Region Revenue / Total Revenue * 100

### Time Analysis

Responsible for:

- Date parsing
- Day-level analysis
- Monthly analysis
- Quarterly analysis
- Yearly analysis
- Date ranges

### Comparison

Responsible for supported comparison operations between analytical results.

---

## 10. Result Processing

After execution, the raw Pandas result is converted into a structured response.

The response contains:

- Original query
- Generated logic
- Analytical result
- Confidence score
- Explanation

Example response structure:

{
  "query": "Show me the top 5 products by revenue",
  "generated_logic": {},
  "result": {},
  "confidence_score": 0.91,
  "explanation": "..."
}

This response is then returned to the frontend.

---

## 11. Confidence Service

The confidence service calculates a heuristic confidence score for the generated query.

The score is based on characteristics such as:

- Valid metric
- Recognized dimensions
- Aggregation
- Sorting
- Ranking
- Percentage analysis
- Time granularity
- Query structure

The purpose of the confidence score is to communicate how confidently the system interpreted the user's request.

The score is not intended to represent statistical probability.

---

## 12. Explanation Service

The explanation service converts the generated analytical logic into a human-readable explanation.

For example:

"The system analyzed revenue using sum aggregation, grouped the result by product name, sorted the products by revenue in descending order, and returned the top 5 results."

This allows users to understand how the result was generated without inspecting the underlying implementation.

---

## 13. Formatter Service

The formatter prepares analytical results for API consumption and frontend rendering.

It handles:

- Result structure
- Columns
- Rows
- Row counts
- Numeric values
- Empty results

The frontend can therefore consume a predictable response structure.

---

## 14. Frontend Visualization Architecture

The frontend dynamically selects visualizations based on the query plan and result structure.

Examples:

Categorical grouped result:

Bar Chart

Top-N result:

Horizontal Bar Chart

Time-based result:

Line Chart

Contribution analysis:

Pie or Donut Chart

Scalar result:

KPI presentation

This allows the visualization layer to remain generic rather than containing hardcoded charts for individual questions.

---

## 15. Query History and Saved Analyses

Query history and saved analyses are implemented using browser local storage.

The frontend maintains separate storage keys for:

- Query history
- Saved analyses

The system limits stored history to prevent unnecessary local storage growth.

Users can:

- Re-run previous queries
- Delete individual queries
- Clear history
- Save analyses
- Re-run saved analyses
- Delete saved analyses

A production implementation could move these features to persistent server-side storage.

---

## 16. Export Architecture

The frontend supports multiple export options.

### CSV Export

The analytical result is converted into CSV format for external analysis.

### HTML Report

The application generates a standalone HTML report containing the analysis.

### Print Report

A print-friendly report can be generated through the browser.

These features allow users to use the generated analysis outside the application.

---

## 17. Security Design

The most important security decision is that the application does not execute arbitrary code generated by the LLM.

The architecture is:

Natural Language
    |
    v
LLM
    |
    v
Structured QueryPlan
    |
    v
Validation
    |
    v
Supported Operations
    |
    v
Pandas Execution

The execution engine only supports predefined operations.

Environment variables are used for sensitive configuration such as the OpenAI API key.

The .env file should not be committed to Git.

---

## 18. Separation of Responsibilities

The system follows clear separation of concerns.

Frontend:

User interaction and visualization.

API:

Communication between frontend and backend.

AI Planner:

Natural-language understanding and query planning.

Parser:

Converts the AI response into a structured object.

Validator:

Checks whether the QueryPlan is supported.

Normalizer:

Creates a consistent internal query representation.

Analytics Engine:

Performs deterministic data processing.

Confidence Service:

Calculates the query confidence score.

Explanation Service:

Generates human-readable explanations.

Formatter:

Creates the final API response.

This separation makes the application easier to maintain and extend.

---

## 19. Design Trade-offs

### LLM Planning vs Rule-Based Parsing

LLM-based planning provides better flexibility for natural-language queries.

However, it introduces:

- API dependency
- API cost
- Model variability

Rule-based parsing is deterministic but becomes difficult to maintain for complex natural-language variations.

The chosen architecture uses LLMs only for planning and deterministic code for execution.

---

### Pandas vs Database Query Engine

Pandas is suitable for the provided CSV-based dataset and allows rapid analytical development.

A database-based architecture would be more appropriate for:

- Very large datasets
- Concurrent users
- Persistent analytical workloads
- Complex joins
- Production-scale data

The current architecture can be extended to support a database-backed execution engine later.

---

### Local Storage vs Persistent Storage

Browser local storage keeps the implementation simple and avoids additional infrastructure.

For production use, query history and saved analyses could be stored in a database.

---

## 20. Scalability Considerations

The architecture can be extended by introducing:

- Database-backed datasets
- Query result caching
- Background processing
- Distributed analytics
- Authentication
- Role-based access control
- Persistent user profiles
- Cloud storage
- Monitoring and logging

The QueryPlan abstraction also makes it possible to introduce alternative execution engines without changing the natural-language interface.

---

## 21. Error Handling

Errors can occur at multiple stages.

### AI Planning Errors

The AI may produce an invalid or incomplete QueryPlan.

The parser and validator handle this case.

### Validation Errors

Unsupported metrics, dimensions, or operations are rejected.

### Data Errors

Missing or malformed data is handled by the data preparation layer.

### Execution Errors

Unexpected analytics errors are handled by the backend before returning a response.

### API Errors

The frontend displays appropriate error information when the backend is unavailable or returns an unsuccessful response.

---

## 22. Extensibility

New analytical capabilities can be added without redesigning the complete system.

For example, a new metric can be added to the metrics configuration and aggregation engine.

A new operation can be implemented as a separate engine module.

A new AI capability can be added to the QueryPlan schema and validator.

This modular architecture makes future development easier.

---

## 23. Architectural Summary

SalesAnalyticsAI follows a hybrid AI and deterministic analytics architecture.

The key principle is:

AI understands the question.

Validation controls the request.

Pandas executes the analysis.

The frontend presents the result.

This design combines the flexibility of Generative AI with the reliability and control of deterministic data processing.