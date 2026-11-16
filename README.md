# ShirtStore

A curated fashion storefront built with React, Redux Toolkit, React Router and
Tailwind CSS. Products come live from the [DummyJSON](https://dummyjson.com)
API; everything else — filtering, sorting, pagination, the cart and the demo
checkout — runs in the browser.

This is a learning project and a portfolio piece, not a production shop.

## Features

- **Curated catalogue** — men's shirts, women's dresses, tops, men's and
  women's shoes, women's bags and sunglasses. The API is not clothing-only, so
  the storefront filters to a business-defined category whitelist.
- **Catalogue browsing** — URL-driven search, category and price filters,
  sorting and pagination. Filters survive refreshes and can be shared as links.
- **Shared catalogue state** — the catalogue is fetched once and cached in
  Redux. A thunk `condition` prevents duplicate requests, including the double
  effect React StrictMode runs in development.
- **Product details** — dedicated product pages with an image gallery, quantity
  picker, discount and stock information, shipping/returns metadata, breadcrumb
  navigation, and related products from the catalogue. Detail requests are cached
  per product id.
- **Cart drawer and cart page** — add to cart (from cards or the detail page),
  adjust quantities (capped by stock), remove items, and review a live subtotal.
  The cart is persisted to `localStorage` so a refresh does not clear it.
  Drawer and `/cart` both lead to the demo checkout. Accessible dialog semantics
  with focus trapping, Escape to close and background scroll locking.
- **Recently viewed** — product detail views are stored locally on-device and
  surfaced on the home and product pages, with a one-click clear action.
- **Responsive layout** — desktop and mobile navigation, responsive hero
  images, skeleton loading states and empty/error states.
- **Demo checkout** — client-side validation with an explicit notice that no
  order is created and no payment is taken.
- **Tests** — Vitest and React Testing Library cover utilities, Redux slices
  and key UI components.

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| State | Redux Toolkit + React Redux |
| Routing | React Router 7 |
| Tests | Vitest 5 + Testing Library + jsdom |

## Getting started

```bash
npm install
cp .env.example .env   # optional: change VITE_API_URL
npm run dev
```

### Backend (FastAPI, scaffold)

A starter backend lives in [`backend/`](backend/README.md).

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

To use it from the frontend, set `VITE_API_URL=http://localhost:8000` and
`VITE_ORDERS_ENABLED=true` in `.env`, then restart Vite.

The app runs at `http://localhost:5173`.

### Environment

`VITE_API_URL` defaults to `https://dummyjson.com`. Vite only exposes variables
prefixed with `VITE_` to the browser, so never put secrets in this file.

## Available scripts

```bash
npm run dev        # start the Vite dev server
npm run build      # production build into dist/
npm run preview    # preview the production build
npm run lint       # run ESLint
npm test           # run the test suite once
npm run test:watch # run tests in watch mode
```

## Data model

`src/api/productApi.js` requests the full product list once with a reduced
`select` payload, filters it to the curated fashion categories and normalises
each record to the fields the UI needs. Components never depend on DummyJSON's
full payload.

Because the catalogue is around 35 items, filtering, sorting and pagination are
done client-side. A larger catalogue would move those operations to the server.

## Project structure

```
src/
  api/          Compatibility exports for product data access
  domain/       Shared models/mappers (product, cart, checkout/order draft)
  services/     Data-source clients/services (API client, product service)
  assets/       Icons and optimised hero images
  components/   Reusable UI: navbar, cards, drawer, pagination, sections
  hooks/        useCatalogue, useProductDetail, useDocumentTitle
  pages/        Home, Products, ProductDetail, Cart, Checkout, NotFound
  store/        Redux slices/selectors and cart persistence adapter
  test/         Vitest setup
  utils/        Currency formatting and catalogue helpers
```

## Backend integration

- **FastAPI backend scaffold:** [`backend/`](backend/README.md) provides products, server-backed cart, JWT auth, and order APIs with SQLite persistence.
- **Service boundaries:** product fetching goes through `src/services/productService.js`
  and `src/services/apiClient.js` (with `src/api/productApi.js` as a compatibility layer).
  Order submission is isolated behind `src/services/orderService.js`.
- **Config flags:** set `VITE_API_URL`, `VITE_ORDERS_ENABLED`, and `VITE_CART_API_ENABLED`
  to connect the frontend to the backend (see `.env.example`).
- **Domain models:** shared product/cart/checkout shapes live in `src/domain/*`
  to keep UI and state aligned on stable contracts.
- **Checkout behavior:** validates details, builds an order draft, and submits via the
  order service when enabled (backend confirms/validates stock); otherwise reports
  submission as unavailable without faking payment/cart mutation.
- **Cart persistence seam:** `src/services/cartRepository.js` syncs with `/cart` when
  enabled (session/user-backed on backend) and falls back to local storage for resilience.

## Testing notes

Tests use explicit imports from `vitest` rather than global test functions, so
ESLint's browser globals configuration stays accurate. The setup file adds
jest-dom matchers and cleans up rendered components after each test.

```bash
npm test
```

## Current limitations

- **Auth is basic.** JWT auth endpoints and basic frontend login/register/logout flows exist, but account management, token refresh, and richer user/cart-merge UX are still minimal.
- **No payments.** Orders can be submitted/confirmed by the backend when enabled, but payment processing is not implemented.
- **Operational hardening pending.** Migrations, admin/role controls, rate limiting, production security/CORS, and richer order fulfillment workflows are still to be added.
- **Sample reviews & demo newsletter.** Testimonials are placeholder content and newsletter stays local/demo-only.

## Roadmap

1. Backend integration: authentication, server-backed cart, orders, real stock and payments.
2. Connect the checkout review flow to a real order API (create/confirm order, error handling, order status).
3. Richer product discovery (recently viewed, recommendations) once backend data and analytics are available.
