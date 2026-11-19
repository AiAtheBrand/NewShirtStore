# ShirtStore Backend (FastAPI)

FastAPI backend for the ShirtStore frontend with SQLite persistence.

## Features
- **Health:** `GET /health`
- **Products:** curated catalogue with DummyJSON-compatible response shape
  - `GET /products` (supports `limit`, `select`, `category`)
  - `GET /products/{id}`
  - `POST /products`, `PUT /products/{id}`, `DELETE /products/{id}` (**admin only**)
- **Cart (server-backed):** guest session carts via `X-Cart-Session` header, or user cart when authenticated
  - `GET /cart`, `PUT /cart`, `DELETE /cart`, `POST /cart/merge` (merge requires authentication)
- **Auth (JWT):**
  - `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (Bearer token)
  - Users include a `role` (`customer` or `admin`)
- **Orders:**
  - `POST /orders` validates draft/items and product stock, decrements stock, supports `Idempotency-Key`, associates authenticated user when present
  - `GET /orders` (**authenticated**; users see their own orders, admins see all)
  - `GET /orders/{id}` (**authenticated** owner/admin)
  - `PATCH /orders/{id}/status` (**admin only**)

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
- Best-effort additive SQLite schema adjustments run on startup for local development (e.g. adding `user.role` to existing DBs).
- Environment variables: `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `ADMIN_EMAILS` (comma-separated emails promoted to admin role).

## Migrations (Alembic)
Alembic is configured in `backend/alembic.ini` with `backend/alembic/`.
- `alembic revision --autogenerate -m "message"`
- `alembic upgrade head`

Use Alembic as the source of truth for schema evolution in shared/production environments.

## Tests
Backend tests (pytest + FastAPI TestClient) are in `backend/tests/`:
```bash
cd backend
python -m pytest -q
```
(Ensure backend dependencies are installed in your Python environment.)

## Notes / next hardening
- RBAC and basic API tests are in place, but this is still not a production-hardened deployment.
- Continue with stronger admin/account tooling, token refresh/session policies, payment integration, richer order/fulfillment workflows, rate limiting, and production CORS/security settings.
