from fastapi import APIRouter

from backend.api.api_v1.endpoints import auth, users, health_records, admin, analytics

api_router = APIRouter()

# Include all the router modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(health_records.router, prefix="/health-records", tags=["Health Records"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"]) 