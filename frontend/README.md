# Motamyezon Books — Frontend

A React + Vite single-page app that consumes the [Motamyezon Books API](../backend/docs/API.md).
It lets you sign up / log in, browse the catalogue, download books in EPUB / AZW3 /
KFX, and (for uploader & admin roles) manage books, authors, series and categories.

## Features

- **Authentication** — signup, login, logout, forgot/reset password, change
  password, update & deactivate profile. JWT stored in `localStorage` and sent
  as a `Bearer` token on every request.
- **Global error handling** — a single axios interceptor normalises every API
  failure into the backend's `{ status, message }` contract and surfaces it
  through a toast system that mirrors the server's error handler (operational
  `fail` errors are amber, server `error`s are red). See
  [src/api/client.js](src/api/client.js) and
  [src/context/ToastContext.jsx](src/context/ToastContext.jsx).
- **Books** — list (with sorting & pagination), detail view, multi-format
  download, upload (multipart with progress), edit and delete.
- **Catalogue** — authors, series and categories with detail pages and
  role-gated create/delete.
- **Role-based UI** — upload/manage actions only appear for `admin` / `uploader`,
  matching the API's RBAC. Protected routes redirect guests to login.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

The dev server proxies `/api` to the backend (default `http://localhost:3000`,
see [vite.config.js](vite.config.js)). Make sure the backend is running:

```bash
cd ../backend && npm run dev
```

### Configuration

| Variable           | Default                 | Purpose                                  |
| ------------------ | ----------------------- | ---------------------------------------- |
| `VITE_API_URL`     | `/api/v1`               | API base URL used by axios               |
| `VITE_BACKEND_URL` | `http://localhost:3000` | Proxy target for `/api` in dev           |

Create a `.env` file in this folder to override them, e.g.:

```
VITE_API_URL=https://api.motamyezon.com/api/v1
```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Project structure

```
src/
  api/         axios client (auth + error interceptors) and resource modules
  context/     AuthContext (session) and ToastContext (global notifications)
  components/  Navbar, ProtectedRoute, Toaster, DownloadMenu, Field, Spinner…
  hooks/       useApi data-fetching hook
  pages/       route screens (auth, books, authors, series, categories)
  App.jsx      route table
  main.jsx     providers + router bootstrap
```
