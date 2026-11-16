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
  api/          API request, category whitelist and normalisation
  assets/       Icons and optimised hero images
  components/   Reusable UI: navbar, cards, drawer, pagination, sections
  hooks/        useCatalogue, useProductDetail, useDocumentTitle
  pages/        Home, Products, ProductDetail, Cart, Checkout, NotFound
  store/        Redux slices/selectors and cart persistence helpers
  test/         Vitest setup
  utils/        Currency formatting and catalogue helpers
```

## Testing notes

Tests use explicit imports from `vitest` rather than global test functions, so
ESLint's browser globals configuration stays accurate. The setup file adds
jest-dom matchers and cleans up rendered components after each test.

```bash
npm test
```

## Demo limitations

- **No authentication.** The account icon is intentionally absent until a
  backend exists.
- **No backend or payments.** Checkout validates the form, then clearly states
  that no order was created and nothing was charged. No personal data is logged,
  sent or stored.
- **Sample reviews.** Testimonials are placeholder content for the demo.
- **Newsletter is a demo.** The form keeps the email in Redux only and sends
  nothing.

## Roadmap

1. Backend integration: authentication, orders, real stock and payments.
2. Richer product discovery (related items, recently viewed) once the backend
   data model is defined.
3. Improve the checkout/order flow when a backend is available.
