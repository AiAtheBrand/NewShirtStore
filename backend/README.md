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

## Database
- Uses SQLite by default (`sqlite:///./shirtstore.db`) via SQLModel.
- Tables are created on startup and curated products are seeded automatically when the product table is empty.
- Override with `DATABASE_URL` environment variable if needed.

## Notes
- Product/order persistence is local SQLite in this step (no migrations/auth/payments/order lifecycle yet).
- Expand the dataset, add migrations, auth, cart endpoints, and production config as next steps.
