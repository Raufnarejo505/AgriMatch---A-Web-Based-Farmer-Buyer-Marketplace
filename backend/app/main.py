from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .config import settings
from .database import Base, engine
from . import ws
from .routers import admin, auth, conversations, listings, offers, orders, requirements, users


def migrate_user_identity() -> None:
    # Additive migration for databases created before CNIC-based authentication.
    # Never clear users on service startup or during an ordinary redeployment.
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS cnic_hash VARCHAR(64)"))
        connection.execute(text("ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS cnic_last4 VARCHAR(4)"))
        connection.execute(text("ALTER TABLE IF EXISTS users ALTER COLUMN email DROP NOT NULL"))
        connection.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_cnic_hash ON users (cnic_hash)"
        ))


@asynccontextmanager
async def lifespan(_: FastAPI):
    # For existing databases the new columns need adding before ORM queries use them.
    Base.metadata.create_all(bind=engine)
    migrate_user_identity()
    # Remove legacy default admin seeding. Accounts must be registered with CNIC.
    yield


app = FastAPI(title="AgriMatch API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(requirements.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(offers.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(ws.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
