# System Architecture

## 1. Overview

SalesAnalyticsAI follows a layered architecture that separates natural-language
understanding from deterministic analytical execution.

```text
┌──────────────────────────────┐
│          React UI            │
│  Natural Language Interface  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          FastAPI             │
│        API Layer             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        AI Query Planner      │
│      Natural Language →      │
│       Structured Plan        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Query Validation        │
│  Schema + Business Rules     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Deterministic Engine      │
│                              │
│  Filtering                   │
│  Aggregation                 │
│  Ranking                     │
│  Percentage Analysis         │
│  Time Analysis               │
│  Comparisons                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Result + Confidence +        │
│ Explanation                  │
└──────────────────────────────┘