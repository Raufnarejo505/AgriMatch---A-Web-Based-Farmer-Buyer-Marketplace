from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from .config import settings
from .database import Base, SessionLocal, engine
from .models import User
from . import ws
from .routers import admin, auth, conversations, listings, offers, orders, requirements, users
from .security import hash_password


def seed_admin() -> None:
    with SessionLocal() as db:
        email = settings.admin_email.lower()
        if db.scalar(select(User).where(User.email == email)) is not None:
            return
        db.add(
            User(
                name=settings.admin_name,
                email=email,
                password_hash=hash_password(settings.admin_password),
                role="admin",
                status="active",
            )
        )
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_admin()
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
