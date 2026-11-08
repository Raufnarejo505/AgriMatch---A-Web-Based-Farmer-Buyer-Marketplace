<div align="center">

# 🌾 AgriMatch

**A real-time farmer–buyer marketplace: publish crops, post requirements, negotiate live, and track every order to fulfilment.**

[![CI](https://img.shields.io/github/actions/workflow/status/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace/ci.yml?branch=main&label=CI&style=flat-square)](.github/workflows/ci.yml)
[![License](https://img.shields.io/github/license/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace?style=flat-square)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace?style=flat-square)](https://github.com/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace/commits/main)
[![Stars](https://img.shields.io/github/stars/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace?style=flat-square)](https://github.com/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace/stargazers)

<br/>

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Quick start](#quick-start) · [API](#api-reference) · [Roadmap](#roadmap)

</div>

---

## Overview

Smallholder farmers and wholesale buyers usually negotiate through phone calls and
scattered messages. Listings go stale, price expectations never sync up, and nobody can
say afterwards what was agreed or when it shipped.

AgriMatch puts that entire loop in one product. Farmers publish what they have; buyers
publish what they need; the two sides search each other's inventory, open a conversation,
and trade offers over a WebSocket connection. Accepting an offer creates exactly one order,
which then moves through a tracked lifecycle with a full audit trail.

It was built as a Final Year Project and is deliberately small enough to run end-to-end on
one machine with `docker compose up`.

### Who it serves

| Role | What they do |
| --- | --- |
| **Farmer** | List harvests, browse buyer requirements, negotiate, and drive accepted orders to completion |
| **Buyer** | Post requirements with a price range and delivery area, search listings, negotiate, and track purchases |
| **Admin** | Monitor the platform, moderate content, and suspend or delete accounts |

---

## Features

### Farmers

- Create, edit, close and delete crop listings with quantity, grade, price and location.
- Browse buyer requirements with crop, location, quantity and price filters.
- Chat with buyers over WebSocket; send offers, counter, accept or reject.
- Move accepted orders through `pending → confirmed → ready → completed`, or cancel.

### Buyers

- Post requirements with a price range and delivery area.
- Search open listings with the same filter set.
- Contact a farmer and negotiate inside a single conversation timeline.
- Track every offer and order from one view.

### Admins

- Dashboard counts for users, listings, requirements and orders.
- Suspend, reactivate or delete accounts.
- Moderate listings and requirements; inspect all orders.
- Suspended accounts cannot log in, and an already-issued token stops working.

### Under the hood

- **Role-based access control** enforced per route, with ownership checks on every mutation.
- **Realtime negotiation** — messages are persisted before broadcast, so a dropped socket
  never loses history.
- **Optimistic-lock-free order state machine** — only the owning farmer can advance status,
  and every transition is appended to `order_status_history`.
- **Paginated search** across listings and requirements (`page`, `size`, default 9, max 100).

---

## Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI[Next.js 14 App Router<br/>TypeScript + Tailwind]
    end

    subgraph Compose["Docker Compose"]
        FE[frontend :3000]
        BE[backend :8000<br/>FastAPI + Uvicorn]
        DB[(PostgreSQL 16<br/>db :5432)]
    end

    UI -->|REST /api/*| BE
    UI <-->|WebSocket /ws/{id}| BE
    BE -->|SQLAlchemy 2.0| DB
    FE -.serves.-> UI
```

### Negotiation flow

```mermaid
sequenceDiagram
    actor F as Farmer
    actor B as Buyer
    participant API as FastAPI
    participant DB as PostgreSQL

    B->>API: POST /api/conversations
    API->>DB: create conversation (farmer + buyer)
    F->>API: WS /ws/{id}?token=JWT
    B->>API: WS /ws/{id}?token=JWT
    B->>API: {type: "message", body: "..."}
    API->>DB: persist message
    API-->>F: broadcast {type: "message"}
    F->>API: POST /api/offers
    API->>DB: offer (pending)
    API-->>B: broadcast {type: "offer"}
    B->>API: POST /api/offers/{id}/counter
    F->>API: POST /api/offers/{id}/accept
    API->>DB: create order + history[0]
    API-->>B: broadcast {type: "offer"}
```

### Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript 5.6, Tailwind CSS 3.4 |
| Backend | FastAPI 0.115, SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| Auth | JWT (`python-jose`), bcrypt password hashing (`passlib`) |
| Database | PostgreSQL 16 |
| Realtime | FastAPI WebSocket with a per-conversation connection manager |
| Runtime | Docker Compose (`db`, `backend`, `frontend`) |

---

## Quick start

The fastest path is Docker Compose — it brings up the database, API and frontend together.

```bash
git clone https://github.com/Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace.git
cd AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace
docker compose up --build -d
docker compose ps
```

| Service | URL |
| --- | --- |
| Frontend | <http://localhost:3000> |
| API docs (Swagger) | <http://localhost:8000/docs> |
| Health check | <http://localhost:8000/api/health> |

The schema is created on startup with `Base.metadata.create_all`, and an admin account is
seeded from the environment.

> [!WARNING]
> The development admin is seeded as `admin@agrimatch.com` / `admin12345`. Change
> `ADMIN_PASSWORD` and `JWT_SECRET` before exposing this anywhere.

---

## Local development

Run the two halves separately when you want hot reload.

**Backend**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

DATABASE_URL=postgresql+psycopg2://agrimatch:agrimatch@localhost:5432/agrimatch \
  uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 \
NEXT_PUBLIC_WS_URL=ws://localhost:8000 \
  npm run dev
```

### Configuration

All settings are environment variables with working defaults for local development.

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg2://agrimatch:agrimatch@db:5432/agrimatch` | SQLAlchemy connection URL |
| `JWT_SECRET` | `dev-secret-change-me` | Token signing secret |
| `JWT_ALGORITHM` | `HS256` | Token algorithm |
| `JWT_EXPIRE_HOURS` | `24` | Token lifetime |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `ADMIN_NAME` | `AgriMatch Admin` | Seeded admin display name |
| `ADMIN_EMAIL` | `admin@agrimatch.com` | Seeded admin login |
| `ADMIN_PASSWORD` | `admin12345` | Seeded admin password |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Browser API base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | Browser WebSocket base URL |

---

## API reference

Interactive docs are served at `/docs`. All routes are prefixed with `/api`.

<details>
<summary><b>Authentication &amp; users</b></summary>

| Method | Path | Role |
| --- | --- | --- |
| `POST` | `/api/auth/register` | public |
| `POST` | `/api/auth/login` | public |
| `GET` | `/api/auth/me` | authenticated |
| `GET` | `/api/users/me` | authenticated |
| `PATCH` | `/api/users/me` | authenticated |

</details>

<details>
<summary><b>Listings &amp; requirements</b></summary>

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/api/listings` | authenticated |
| `GET` | `/api/listings/{id}` | authenticated |
| `POST` | `/api/listings` | farmer |
| `GET` | `/api/listings/mine` | farmer |
| `PATCH` | `/api/listings/{id}` | owning farmer |
| `DELETE` | `/api/listings/{id}` | owning farmer |
| `GET` | `/api/requirements` | authenticated |
| `GET` | `/api/requirements/{id}` | authenticated |
| `POST` | `/api/requirements` | buyer |
| `GET` | `/api/requirements/mine` | buyer |
| `PATCH` | `/api/requirements/{id}` | owning buyer |
| `DELETE` | `/api/requirements/{id}` | owning buyer |

Search parameters on the two collection routes: `crop`, `location`, `quality`,
`min_quantity`, `max_quantity`, `min_price`, `max_price`, `status`, `page`, `size`.

</details>

<details>
<summary><b>Conversations, offers &amp; orders</b></summary>

| Method | Path | Role |
| --- | --- | --- |
| `POST` | `/api/conversations` | farmer / buyer |
| `GET` | `/api/conversations` | participant |
| `GET` | `/api/conversations/{id}` | participant |
| `GET` | `/api/conversations/{id}/messages` | participant |
| `GET` | `/api/offers?conversation_id=` | participant |
| `GET` | `/api/offers/mine` | participant |
| `POST` | `/api/offers` | participant |
| `POST` | `/api/offers/{id}/accept` | participant |
| `POST` | `/api/offers/{id}/reject` | participant |
| `POST` | `/api/offers/{id}/counter` | participant |
| `GET` | `/api/orders` | participant |
| `GET` | `/api/orders/{id}` | participant |
| `PATCH` | `/api/orders/{id}/status` | owning farmer |

</details>

<details>
<summary><b>Admin</b></summary>

| Method | Path | Role |
| --- | --- | --- |
| `GET` | `/api/admin/stats` | admin |
| `GET` | `/api/admin/users` | admin |
| `PATCH` | `/api/admin/users/{id}/status` | admin |
| `DELETE` | `/api/admin/users/{id}` | admin |
| `GET` | `/api/admin/listings` | admin |
| `DELETE` | `/api/admin/listings/{id}` | admin |
| `GET` | `/api/admin/requirements` | admin |
| `DELETE` | `/api/admin/requirements/{id}` | admin |
| `GET` | `/api/admin/orders` | admin |

</details>

### Realtime

```
ws://localhost:8000/ws/{conversation_id}?token=JWT
```

Only the farmer and buyer of a conversation can connect.

| Direction | Frame |
| --- | --- |
| Client → server | `{"type": "message", "body": "..."}` |
| Server → client | `{"type": "message" \| "offer", "data": {...}}` |

Incoming messages are persisted before being broadcast. Offer events fire on create,
counter, accept and reject. Suspended accounts are disconnected on their next message.

### Order lifecycle

```
pending ──► confirmed ──► ready ──► completed
   │            │           │
   └────────────┴───────────┴──► cancelled
```

Accepting an offer creates exactly one order and records the initial history entry. Only the
owning farmer can advance the status, and every change is written to `order_status_history`.

---

## Project structure

```text
backend/
  app/
    main.py           FastAPI app, CORS, admin seed, health route
    config.py         environment settings (pydantic-settings)
    database.py       engine + session factory
    models.py         SQLAlchemy models (8 tables)
    schemas.py        Pydantic request/response schemas
    security.py       password hashing and JWT helpers
    deps.py           current-user and role dependencies
    pagination.py     shared offset/limit helper
    ws.py             WebSocket connection manager
    routers/          auth, users, listings, requirements,
                      conversations, offers, orders, admin
frontend/
  src/
    app/              route groups: farmer, buyer, admin, login,
                      register, conversations, offers, orders, profile
    components/       Button, Input, Select, Card, Table, Badge,
                      FilterBar, Pagination, RoleGuard, states
    lib/              api client, auth storage, ws client, helpers
docker-compose.yml
```

---

## Testing & CI

CI runs on every push and pull request to `main` or `develop`:

- **backend** — installs dependencies and runs `python -m compileall -q app` on Python 3.12.
- **frontend** — `npm ci` then a full `npm run build` on Node 20 with the API URL injected.

A pytest suite covering the routers and the order state machine is the next addition; see
the roadmap.

---

## Roadmap

- [ ] Backend test suite (pytest + `httpx.AsyncClient`) wired into CI.
- [ ] Alembic migrations instead of `create_all` on startup.
- [ ] Image uploads for listings (object storage).
- [ ] Ratings and reviews after a completed order.
- [ ] Refresh tokens and logout-with-revocation.
- [ ] Notification emails for new offers and status changes.

---

## Notes and limitations

- **Development defaults are insecure by design.** `JWT_SECRET` and the seeded admin
  password exist so the stack runs with zero configuration. Set both before deploying.
- **Schema is created at startup**, so there is no migration path yet — a schema change
  means dropping the volume.
- **Not hardened for production**: no rate limiting, no HTTPS termination, no refresh-token
  rotation.
- Single-tenant and single-region by design; this is a teaching-scale implementation.

---

## License

Released under the [MIT License](LICENSE).

## Author

**Abdul Rauf** — [GitHub](https://github.com/Raufnarejo505) · [LinkedIn](https://www.linkedin.com/in/abdul-r-254241168/)

<div align="center">
<sub>If this project was useful, a ⭐ helps.</sub>
</div>
