from fastapi import APIRouter

from app.api.routes import admin, auth, concierge, health, loyalty, users

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(users.router)
api_router.include_router(auth.router)
api_router.include_router(concierge.router)
api_router.include_router(loyalty.router)
api_router.include_router(admin.router)
