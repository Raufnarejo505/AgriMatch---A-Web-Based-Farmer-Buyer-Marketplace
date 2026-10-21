# AgriMatch

A farmer–buyer agricultural marketplace built as a Final Year Project. Farmers publish crop
listings, buyers publish requirements, and both sides negotiate price and quantity in real time
before an order is created and tracked through fulfilment.

## Features

**Farmers**
- Create, edit, close and delete crop listings with quantity, grade, price and location.
- Browse buyer requirements with crop, location, quantity and price filters.
- Chat with buyers over WebSocket, send offers, counter offers, accept or reject.
- Move accepted orders through `pending → confirmed → ready → completed` (or cancel).

**Buyers**
- Post requirements with a price range and delivery area.
- Search open listings with the same filters, contact a farmer and negotiate.
- Track every offer and order from a single timeline.

**Admins**
- Dashboard counts for users, listings, requirements and orders.
- Suspend, reactivate or delete accounts; moderate listings and requirements.
- Inspect all orders; suspended accounts cannot log in or use an existing token.

## Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind CSS                 |
| Backend   | FastAPI, SQLAlchemy 2.0, Pydantic v2, python-jose, passlib/bcrypt |
| Database  | PostgreSQL 16                                                     |
| Realtime  | FastAPI WebSocket (chat + live offer events)                      |
| Runtime   | Docker Compose (`db`, `backend`, `frontend`)                      |

## Project structure

```
backend/
  app/
    main.py          FastAPI app, CORS, admin seed
    config.py        environment settings
    database.py      engine + session factory
    models.py        SQLAlchemy models
    schemas.py       Pydantic schemas
    security.py      hashing and JWT helpers
    deps.py          current-user and role dependencies
    ws.py            websocket connection manager
    routers/         auth, users, listings, requirements, conversations, offers, orders, admin
frontend/
  src/
    app/             route groups for auth, farmer, buyer, admin, chat, offers, orders
    components/      shared Button, Input, Select, Card, Table, Badge, states
    lib/             api client, auth storage, websocket client, helpers
docker-compose.yml
```

## Getting started

```bash
cp backend/.env.example backend/.env      # optional: compose already ships defaults
docker compose up --build -d
docker compose ps
```

- Frontend: <http://localhost:3000>
- API docs: <http://localhost:8000/docs>
- Health: <http://localhost:8000/api/health>

The schema is created on startup with `Base.metadata.create_all`, and an admin account is seeded
from the environment variables below.

Default development admin: `admin@agrimatch.com` / `admin12345` — change these before deploying.

## Environment variables

| Variable            | Default                                                                  | Purpose                     |
| ------------------- | ------------------------------------------------------------------------ | --------------------------- |
| `DATABASE_URL`      | `postgresql+psycopg2://agrimatch:agrimatch@db:5432/agrimatch`            | SQLAlchemy connection URL   |
| `JWT_SECRET`        | `dev-secret-change-me`                                                   | token signing secret        |
| `JWT_ALGORITHM`     | `HS256`                                                                  | token algorithm             |
| `JWT_EXPIRE_HOURS`  | `24`                                                                     | token lifetime              |
| `CORS_ORIGINS`      | `http://localhost:3000`                                                  | comma-separated origins     |
| `ADMIN_NAME`        | `AgriMatch Admin`                                                        | seeded admin display name   |
| `ADMIN_EMAIL`       | `admin@agrimatch.com`                                                    | seeded admin login          |
| `ADMIN_PASSWORD`    | `admin12345`                                                             | seeded admin password       |
| `NEXT_PUBLIC_API_URL`  | `http://localhost:8000`                                               | browser API base URL        |
| `NEXT_PUBLIC_WS_URL`   | `ws://localhost:8000`                                                 | browser websocket base URL  |

## Local development (without Docker)

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql+psycopg2://agrimatch:agrimatch@localhost:5432/agrimatch \
  uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## API overview

| Method | Path                                  | Role            |
| ------ | ------------------------------------- | --------------- |
| POST   | `/api/auth/register`                  | public          |
| POST   | `/api/auth/login`                     | public          |
| GET    | `/api/auth/me`                        | authenticated   |
| GET    | `/api/users/me`                       | authenticated   |
| PATCH  | `/api/users/me`                       | authenticated   |
| GET    | `/api/listings`                       | authenticated   |
| POST   | `/api/listings`                       | farmer          |
| GET    | `/api/listings/mine`                  | farmer          |
| PATCH  | `/api/listings/{id}`                  | owner farmer    |
| DELETE | `/api/listings/{id}`                  | owner farmer    |
| GET    | `/api/requirements`                   | authenticated   |
| POST   | `/api/requirements`                   | buyer           |
| GET    | `/api/requirements/mine`              | buyer           |
| PATCH  | `/api/requirements/{id}`              | owner buyer     |
| DELETE | `/api/requirements/{id}`              | owner buyer     |
| POST   | `/api/conversations`                  | farmer / buyer  |
| GET    | `/api/conversations`                  | participant     |
| GET    | `/api/conversations/{id}/messages`    | participant     |
| GET    | `/api/offers?conversation_id=`        | participant     |
| POST   | `/api/offers`                         | participant     |
| POST   | `/api/offers/{id}/accept`             | participant     |
| POST   | `/api/offers/{id}/reject`             | participant     |
| POST   | `/api/offers/{id}/counter`            | participant     |
| GET    | `/api/orders`                         | participant     |
| GET    | `/api/orders/{id}`                    | participant     |
| PATCH  | `/api/orders/{id}/status`             | farmer (owner)  |
| GET    | `/api/admin/stats`                    | admin           |
| GET    | `/api/admin/users`                    | admin           |
| PATCH  | `/api/admin/users/{id}/status`        | admin           |
| DELETE | `/api/admin/users/{id}`               | admin           |
| GET    | `/api/admin/listings`                 | admin           |
| DELETE | `/api/admin/listings/{id}`            | admin           |
| GET    | `/api/admin/requirements`             | admin           |
| DELETE | `/api/admin/requirements/{id}`        | admin           |
| GET    | `/api/admin/orders`                   | admin           |

## Realtime

`ws://localhost:8000/ws/{conversation_id}?token=JWT`

Only the farmer and buyer of a conversation can connect. Incoming frames are
`{"type": "message", "body": "..."}` and persisted to the database before being broadcast.
Server frames are `{"type": "message" | "offer", "data": {...}}`; offer events fire on create,
counter, accept and reject. Suspended accounts are disconnected on their next message.

## Order lifecycle

```
pending ──► confirmed ──► ready ──► completed
   │            │           │
   └────────────┴───────────┴──► cancelled
```

Accepting an offer creates exactly one order and records the initial history entry. Only the
farmer can advance the status, and every change is written to `order_status_history`.

## License

MIT
