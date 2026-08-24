"""RailMadad AI Platform — API v1 Router."""

from fastapi import APIRouter

from app.api.v1 import auth, complaints, trains, stations, admin, analytics, notifications, websocket

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
api_v1_router.include_router(trains.router, prefix="/trains", tags=["Trains"])
api_v1_router.include_router(stations.router, prefix="/stations", tags=["Stations"])
api_v1_router.include_router(admin.router, prefix="/admin", tags=["Admin Operations"])
api_v1_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_v1_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_v1_router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
