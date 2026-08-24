"""RailMadad AI Platform — WebSocket Routes."""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections."""

    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str) -> None:
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str) -> None:
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

    async def send_personal(self, message: dict, websocket: WebSocket) -> None:
        await websocket.send_json(message)

    async def broadcast(self, message: dict, channel: str) -> None:
        if channel in self.active_connections:
            for connection in self.active_connections[channel]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/complaints/{complaint_id}")
async def complaint_updates(websocket: WebSocket, complaint_id: str) -> None:
    """WebSocket endpoint for real-time complaint status updates."""
    channel = f"complaint:{complaint_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming messages
            message = json.loads(data)
            await manager.send_personal(
                {"type": "ack", "data": message},
                websocket,
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)


@router.websocket("/notifications/{user_id}")
async def user_notifications(websocket: WebSocket, user_id: str) -> None:
    """WebSocket endpoint for real-time user notifications."""
    channel = f"user:{user_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)


@router.websocket("/dashboard")
async def dashboard_live(websocket: WebSocket) -> None:
    """WebSocket endpoint for live dashboard updates (admin)."""
    channel = "dashboard:live"
    await manager.connect(websocket, channel)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
