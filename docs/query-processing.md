# Query Processing Flow

## 1. Overview

SalesAnalyticsAI converts a natural-language business question into a
validated analytical result.

The complete flow is:

```text
Natural Language Question
            ↓
       AI Query Planner
            ↓
       JSON QueryPlan
            ↓
     Query Plan Normalization
            ↓
      Query Plan Validation
            ↓
    Deterministic Execution
            ↓
     Result + Confidence
            ↓
         Explanation
            ↓
       API Response
            ↓
        React UI