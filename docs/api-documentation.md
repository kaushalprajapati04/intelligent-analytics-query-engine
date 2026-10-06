# SalesAnalyticsAI API Documentation

## 1. Overview

SalesAnalyticsAI exposes a REST API through FastAPI.

The API provides endpoints for:

- Natural-language analytics queries
- Application health checks
- Dataset and analytics metadata

Base URL for local development:

http://localhost:8000

FastAPI interactive documentation:

http://localhost:8000/docs

---

## 2. API Architecture

The API follows this flow:

Frontend
    |
    v
FastAPI
    |
    v
Query Planner
    |
    v
Query Validation
    |
    v
Analytics Engine
    |
    v
Formatted Response
    |
    v
Frontend

The API acts as the communication layer between the React application and the backend analytics system.

---

# 3. Query API

## Endpoint

POST /api/query

This endpoint accepts a natural-language analytics question and returns the generated analytical logic, result, confidence score, and explanation.

---

## Request Body

Content-Type:

application/json

Example:

{
  "query": "Show me the top 5 products by revenue"
}

---

## Request Fields

### query

Type:

string

Required:

Yes

Description:

Natural-language business question submitted by the user.

Example:

"Show total revenue by region"

---

## Example Request

```http
POST /api/query
Content-Type: application/json