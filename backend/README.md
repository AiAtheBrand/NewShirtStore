# ShirtStore Backend (FastAPI)

FastAPI backend for the ShirtStore frontend with SQLite persistence.

## Features
- **Health:** `GET /health`
- **Products:** curated catalogue with DummyJSON-compatible response shape
  - `GET /products` (supports `limit`, `select`, `category`)
  - `GET /products/{id}`
  - `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` for catalogue management/alignment
- **Cart (server-backed):** guest session carts via `X-Cart-Session` header, or user cart when authenticated
  - `GET /cart`, `PUT /cart`, `DELETE /cart`
- **Auth (JWT):**
  - `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (Bearer token)
- **Orders:**
  - `POST /orders` validates draft/items and product stock, decrements stock, supports `Idempotency-Key`, associates authenticated user when present
  - `GET /orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status`

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
VITE_CART_API_ENABLED=true
```

Then restart the Vite dev server.

## Database & config
- Uses SQLite by default (`sqlite:///./shirtstore.db`) via SQLModel.
- Tables are created on startup and curated products are seeded automatically when the product table is empty.
- Environment variables: `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`.

## Notes / next hardening
- This is a functional backend foundation (not a production-hardened deployment).
- Consider adding migrations, role-based admin controls for product/order management, payment integration, richer order workflows, email/notifications, rate limiting, and production CORS/security settings.
