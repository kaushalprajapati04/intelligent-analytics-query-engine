# SalesAnalyticsAI

Natural Language to Intelligent Analytics

SalesAnalyticsAI is an intelligent analytics query engine that allows users to ask business questions in natural language and receive structured, analytical results.

Instead of manually writing SQL or Python queries, users can ask questions such as:

- Show me the top 5 products by revenue
- Show total revenue by region
- What percentage of total revenue comes from each region?
- Show revenue by month
- Show the top 3 products by profit

The system uses Generative AI to understand the user's intent and convert the natural-language question into a structured QueryPlan. The QueryPlan is then validated and executed through a deterministic Pandas-based analytics engine.

The application is designed with a clear separation between AI-based query understanding and deterministic data execution.

---

## Project Overview

The objective of SalesAnalyticsAI is to provide a simple natural-language interface for business analytics.

The system supports:

- Natural-language business questions
- Metric identification
- Dimension identification
- Filtering
- Aggregation
- Grouping
- Sorting
- Ranking
- Top-N and Bottom-N analysis
- Contribution percentage analysis
- Time-based analysis
- Query validation
- Confidence scoring
- Result explanations
- Interactive data visualization
- Query history
- Saved analyses
- Exportable reports

The main design principle is:

Natural Language Query -> AI Query Planning -> Validation -> Deterministic Analytics -> Result -> Visualization

---

## Key Features

### Natural Language Querying

Users can ask analytical questions using normal business language without writing SQL or Python.

Examples:

"Show me the top 5 products by revenue"

"Show total revenue by region"

"Show revenue by month"

"What percentage of total revenue comes from each region?"

"Show the top 3 products by profit"

---

### Generative AI Query Planning

The system uses an OpenAI-powered planner to understand the user's question.

The AI does not generate arbitrary Python code or SQL for execution.

Instead, it generates a structured QueryPlan containing information such as:

- Metric
- Aggregation
- Dimensions
- Filters
- Sorting
- Ranking limit
- Percentage analysis
- Time granularity
- Comparison requirements

Example QueryPlan:

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

This approach provides better control, validation, reliability, and security.

---

## System Architecture

The system follows the architecture below:

```text
User Query
    |
    v
React Frontend
    |
    v
FastAPI Backend
    |
    v
GenAI Query Planner
    |
    v
Structured QueryPlan
    |
    v
Query Validation and Normalization
    |
    v
Deterministic Pandas Analytics Engine
    |
    v
Result Formatting
    |
    +----------------------+----------------------+
    |                      |                      |
    v                      v                      v
Confidence Score      Explanation           Analytics Dashboard
                                               |
                                    +----------+----------+
                                    |          |          |
                                    v          v          v
                                  Charts     Tables    Insights
```
---

## Query Processing Flow

Every query follows a controlled processing pipeline.

1. The user enters a natural-language question.
2. The React frontend sends the question to the FastAPI backend.
3. The backend sends the question and dataset context to the GenAI planner.
4. The GenAI planner generates a structured QueryPlan.
5. The QueryPlan is parsed and validated.
6. The query is normalized into supported metrics, dimensions, and operations.
7. The deterministic analytics engine executes the validated plan using Pandas.
8. The result is formatted into a structured response.
9. A confidence score is calculated.
10. A human-readable explanation is generated.
11. The frontend displays the result using tables, charts, insights, and supporting information.

---

## Safe AI Architecture

A major design decision in SalesAnalyticsAI is that the LLM does not generate executable code.

The system uses the following approach:

```text
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
Controlled Analytics Operations
    |
    v
Pandas Execution
```

This avoids directly executing arbitrary AI-generated Python or SQL.

Only supported operations defined by the application can be executed.

Benefits of this approach include:

- Controlled execution
- Reduced security risk
- Easier validation
- Better reliability
- Clear separation of responsibilities
- Easier debugging
- Easier extension of supported analytical operations
---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Recharts
- Lucide React

### Backend

- Python
- FastAPI
- Pandas
- Pydantic
- Uvicorn
- Python-dotenv

### AI

- OpenAI API
- Structured QueryPlan generation
- Natural-language intent understanding

### Data

- CSV
- JSON
- Pandas DataFrames

### Development Tools

- Git
- GitHub
- Postman
- VS Code

---

## Supported Metrics

The analytics engine supports the following metrics:

- Revenue
- Profit
- Orders
- Quantity
- Average Order Value

Revenue is calculated using:

quantity * unit_price * (1 - discount)

Average Order Value is calculated using:

revenue / orders

---

## Supported Dimensions

The current analytics engine supports:

- Region
- Country
- City
- Customer ID
- Customer Segment
- Product Category
- Product Subcategory
- Product Name

---

## Supported Aggregations

The system supports:

- Sum
- Average
- Count
- Minimum
- Maximum

---

## Supported Query Operations

### Filtering

Examples:

- Show revenue for the North region
- Show products with profit greater than a given value

### Grouping

Examples:

- Show total revenue by region
- Show total profit by product category

### Ranking

Examples:

- Show the top 5 products by revenue
- Show the top 3 products by profit

### Bottom-N Analysis

Examples:

- Show the lowest 3 products by profit

### Contribution Analysis

Example:

- What percentage of total revenue comes from each region?

### Time-Based Analysis

Examples:

- Show revenue by month
- Show revenue by quarter
- Show revenue by year

### Sorting

Results can be sorted in ascending or descending order depending on the requested query.

---

## Confidence Score

Each query receives a confidence score between 0 and 1.

The confidence score communicates how confidently the system interpreted the user's request.

The score considers factors such as:

- Recognized metric
- Valid dimensions
- Aggregation
- Ranking requirements
- Sorting
- Percentage analysis
- Time granularity
- Query structure

Example:

{
  "confidence_score": 0.91
}

A higher score indicates that more elements of the query were clearly identified and validated.

---

## Result Explanation

The system provides a human-readable explanation along with the analytical result.

For example, a query such as:

"Show me the top 5 products by revenue"

can produce an explanation describing:

- The metric used
- The aggregation performed
- The grouping dimension
- The sorting order
- The ranking limit

This makes the result easier for users to understand and verify.

---

## Frontend Features

The SalesAnalyticsAI dashboard provides:

- Natural-language query input
- Example queries
- Dataset overview
- KPI cards
- Result tables
- Interactive charts
- Confidence score
- Query explanation
- Key insights
- Suggested next questions
- Query history
- Saved analyses
- CSV export
- Analytics report export
- Responsive layout

---

## Interactive Visualizations

The frontend dynamically chooses visualizations based on the query result.

Examples include:

- Bar charts for grouped categorical results
- Horizontal bar charts for Top-N results
- Line charts for time-based analysis
- Pie or donut charts for contribution analysis
- KPI-style presentation for scalar results

Charts are generated from the actual query results rather than hardcoded values.

---

## Query History

The application maintains query history on the client side.

Users can:

- View previous queries
- Re-run queries
- Delete individual queries
- Clear query history

The application limits stored history to avoid unnecessary local storage growth.

---

## Saved Analyses

Users can save useful analyses for later reference.

Saved analyses can be:

- Reopened
- Re-run
- Deleted

Saved analyses are stored using browser local storage.

---

## Export Features

The application supports exporting analytical results.

Available export options include:

- CSV export
- Standalone HTML analytics report
- Print-friendly report

This allows users to take the generated analysis outside the dashboard.

---

## Dataset

The application uses the following dataset files:

backend/dataset/sales_data.csv

backend/dataset/targets.csv

backend/dataset/data_dictionary.json

backend/dataset/nl_queries.json

The data dictionary provides information about the available metrics and dimensions.

The system is designed to use the dataset schema instead of hardcoding answers for individual questions.

---

## Project Structure

```text
intelligent-analytics-query-engine/
|
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── planner.py
│   │   │   ├── prompts.py
│   │   │   └── parser.py
│   │   │
│   │   ├── data/
│   │   │   ├── loader.py
│   │   │   ├── cleaner.py
│   │   │   ├── validator.py
│   │   │   └── metrics.py
│   │   │
│   │   ├── engine/
│   │   │   ├── executor.py
│   │   │   ├── filtering.py
│   │   │   ├── aggregation.py
│   │   │   ├── ranking.py
│   │   │   ├── comparison.py
│   │   │   ├── percentage.py
│   │   │   └── time_analysis.py
│   │   │
│   │   ├── query/
│   │   │   ├── models.py
│   │   │   ├── normalizer.py
│   │   │   └── validator.py
│   │   │
│   │   ├── services/
│   │   │   ├── confidence.py
│   │   │   ├── explanation.py
│   │   │   └── formatter.py
│   │   │
│   │   └── routes/
│   │       ├── query.py
│   │       ├── metadata.py
│   │       └── health.py
│   │
│   ├── dataset/
│   │   ├── sales_data.csv
│   │   ├── targets.csv
│   │   ├── data_dictionary.json
│   │   └── nl_queries.json
│   │
│   ├── tests/
│   │   ├── test_loader.py
│   │   ├── test_metrics.py
│   │   ├── test_planner.py
│   │   ├── test_validator.py
│   │   ├── test_executor.py
│   │   ├── test_evaluation_queries.py
│   │   └── test_api.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── services/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── docs/
│   ├── architecture.md
│   ├── query-processing.md
│   └── api-documentation.md
│
├── samples/
│   ├── sample-queries.json
│   └── sample-outputs.json
│
├── screenshots/
│   ├── dashboard.png
│   ├── query-result.png
│   └── architecture.png
│
├── .gitignore
├── README.md
└── LICENSE
```
---

## API

### Query Endpoint

Method:

POST

Endpoint:

/api/query

Example request:

{
  "query": "Show me the top 5 products by revenue"
}

Example response structure:

{
  "query": "Show me the top 5 products by revenue",
  "generated_logic": {},
  "result": {},
  "confidence_score": 0.91,
  "explanation": "..."
}

---

### Health Endpoint

Method:

GET

Endpoint:

/api/health

This endpoint is used to verify that the backend service is running correctly.

---

### Metadata Endpoint

Method:

GET

Endpoint:

/api/metadata

This endpoint provides metadata used by the frontend and analytics system.

---

## Local Installation

### Prerequisites

Install the following:

- Python 3.13 or compatible Python version
- Node.js
- npm
- Git

---

## Backend Setup

Open a terminal and navigate to the backend:

cd backend

Create a Python virtual environment:

python -m venv .venv

Activate the virtual environment on Windows:

.\.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Create a .env file in the backend directory.

Example:

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=your_model_name

Start the backend:

uvicorn app.main:app --reload --port 8000

The backend will be available at:

http://localhost:8000

FastAPI documentation will be available at:

http://localhost:8000/docs

---

## Frontend Setup

Open another terminal.

Navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

---

## Running the Complete Application

Start the backend first:

cd backend

.\.venv\Scripts\Activate.ps1

uvicorn app.main:app --reload --port 8000

Then start the frontend in another terminal:

cd frontend

npm run dev

Open the frontend URL shown by Vite in the browser.

---

## Testing

Backend tests can be executed using:

cd backend

pytest

The test suite covers areas including:

- Dataset loading
- Metric handling
- Query planning
- Query validation
- Query execution
- Evaluation queries
- API endpoints

---

## Example Queries

The following queries demonstrate the main capabilities of the system.

### Query 1

Show me the top 5 products by revenue

Expected analytical operation:

- Metric: revenue
- Aggregation: sum
- Dimension: product_name
- Sort: descending
- Limit: 5

---

### Query 2

Show total revenue by region

Expected analytical operation:

- Metric: revenue
- Aggregation: sum
- Dimension: region

---

### Query 3

Show revenue by month

Expected analytical operation:

- Metric: revenue
- Aggregation: sum
- Time granularity: month

---

### Query 4

What percentage of total revenue comes from each region?

Expected analytical operation:

- Metric: revenue
- Aggregation: sum
- Dimension: region
- Contribution percentage: enabled

---

### Query 5

Show the top 3 products by profit

Expected analytical operation:

- Metric: profit
- Aggregation: sum
- Dimension: product_name
- Sort: descending
- Limit: 3

---

### Query 6

Show total revenue for the North region

Expected analytical operation:

- Metric: revenue
- Aggregation: sum
- Filter: region = North

---

## Sample Output

Example query:

Show me the top 5 products by revenue

Example result:

Product Name | Revenue

Dell XPS | 2068.00

Samsung Galaxy | 1288.00

MacBook Air | 1116.00

iPhone 14 | 855.00

Ergo Chair | 324.00

The complete sample responses are available in:

samples/sample-outputs.json

---

## Design Decisions

### Why Use Generative AI?

Natural-language business questions can be expressed in many different ways.

For example:

"Which products made the most money?"

and:

"Show me the top products by revenue"

may represent the same analytical intent.

A Generative AI planner provides semantic understanding that is difficult to achieve with simple keyword matching.

---

### Why Use a Structured QueryPlan?

Instead of allowing the LLM to generate executable code, the system converts the request into a structured representation.

This makes the system:

- Easier to validate
- Easier to debug
- Safer
- More deterministic
- Easier to extend

---

### Why Use Pandas?

The supplied dataset is CSV-based, making Pandas a suitable analytical engine.

Pandas provides efficient support for:

- Filtering
- Grouping
- Aggregation
- Sorting
- Ranking
- Time-based operations

---

### Why Use FastAPI?

FastAPI provides:

- REST API support
- Request validation
- Automatic API documentation
- Pydantic integration
- Good Python ecosystem compatibility

---

### Why Use React?

React provides a component-based frontend architecture suitable for:

- Query interaction
- Result rendering
- Interactive charts
- Query history
- Saved analyses
- Export functionality

---

## Trade-offs

### Generative AI vs Rule-Based Query Parsing

Generative AI provides better natural-language understanding and can handle variations in user questions.

However, it introduces:

- API dependency
- API cost
- Potential model variability
- Need for validation

Rule-based parsing is more deterministic but becomes difficult to maintain as query complexity increases.

The project therefore uses GenAI for query understanding and deterministic code for actual execution.

---

### Client-Side History vs Database Storage

Query history and saved analyses currently use browser local storage.

Advantages:

- Simple implementation
- No additional database requirement
- Fast access
- Suitable for a demonstration application

A production implementation could move this functionality to a persistent backend database.

---

## Error Handling

The backend validates the generated QueryPlan before execution.

Invalid or unsupported operations are rejected rather than executed.

The frontend also handles:

- API errors
- Loading states
- Invalid responses
- Empty results
- Backend connectivity issues

---

## Security Considerations

The project avoids direct execution of arbitrary AI-generated code.

Important security practices include:

- QueryPlan validation
- Restricted supported metrics
- Restricted supported dimensions
- Controlled aggregation operations
- Environment variables for API credentials
- No API keys committed to Git
- `.env` excluded from version control

---

## Future Improvements

Potential future enhancements include:

- Multi-dataset support
- Database-backed analytics
- Text-to-SQL support
- Automatic schema discovery
- Advanced target comparisons
- Forecasting
- Anomaly detection
- Advanced multi-step analytical queries
- User authentication
- Role-based access control
- Persistent cloud-based query history
- Streaming AI responses
- Production monitoring
- Advanced caching
- Query performance optimization

---

## Project Deliverables

The repository contains:

- Complete backend implementation
- Complete frontend implementation
- Dataset files
- Query engine
- GenAI planner
- Validation layer
- Test suite
- Sample queries
- Sample outputs
- Architecture documentation
- Query processing documentation
- API documentation
- Screenshots
- License

---

## Screenshots

Dashboard:

screenshots/dashboard.png

Query Result:

screenshots/query-result.png

System Architecture:

screenshots/architecture.png

---

## Repository

GitHub repository:

https://github.com/kaushalprajapati04/intelligent-analytics-query-engine

---

## License

This project is licensed under the MIT License.

See the LICENSE file for more information.