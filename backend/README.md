# ShirtStore Backend (FastAPI)

Starter FastAPI backend for the ShirtStore frontend.

## Features
- Health check endpoint
- Product catalogue/detail endpoints (curated fashion items, DummyJSON-compatible response shape for the current frontend)
- Order draft submission endpoint (`POST /orders`) that accepts the frontend draft and returns a created order record (in-memory for now)

## Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Frontend integration
Set in the frontend `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_ORDERS_ENABLED=true
```

Then restart the Vite dev server.

## Notes
- Product and order storage is in-memory in this scaffold (resets on restart). Replace with a database (e.g. SQLite/PostgreSQL) as the next step.
- Auth, payments, and real stock/order lifecycle are not implemented yet.
