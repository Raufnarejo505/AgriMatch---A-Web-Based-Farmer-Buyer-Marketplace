from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from .database import SessionLocal
from .models import Conversation, Message, User
from .security import decode_token

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.rooms: dict[int, set[WebSocket]] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.rooms.setdefault(conversation_id, set()).add(websocket)

    def disconnect(self, conversation_id: int, websocket: WebSocket) -> None:
        room = self.rooms.get(conversation_id)
        if room is None:
            return
        room.discard(websocket)
        if not room:
            self.rooms.pop(conversation_id, None)

    async def broadcast(self, conversation_id: int, payload: dict) -> None:
        for websocket in list(self.rooms.get(conversation_id, set())):
            try:
                await websocket.send_json(payload)
            except Exception:
                self.disconnect(conversation_id, websocket)


manager = ConnectionManager()


@router.websocket("/ws/{conversation_id}")
async def chat_socket(websocket: WebSocket, conversation_id: int, token: str = Query("")) -> None:
    await manager.connect(conversation_id, websocket)
    user_id = decode_token(token)

    with SessionLocal() as db:
        user = db.get(User, user_id) if user_id is not None else None
        conversation = db.get(Conversation, conversation_id)
        if (
            user is None
            or user.status != "active"
            or conversation is None
            or user.id not in (conversation.farmer_id, conversation.buyer_id)
        ):
            await websocket.close(code=4403)
            manager.disconnect(conversation_id, websocket)
            return

        try:
            while True:
                payload = await websocket.receive_json()
                if not isinstance(payload, dict) or payload.get("type") != "message":
                    continue
                body = str(payload.get("body") or "").strip()[:2000]
                if not body:
                    continue
                message = Message(conversation_id=conversation_id, sender_id=user.id, body=body)
                db.add(message)
                db.commit()
                db.refresh(message)
                await manager.broadcast(
                    conversation_id,
                    {
                        "type": "message",
                        "data": {
                            "id": message.id,
                            "conversation_id": message.conversation_id,
                            "sender_id": user.id,
                            "sender_name": user.name,
                            "body": message.body,
                            "created_at": message.created_at.isoformat(),
                        },
                    },
                )
        except WebSocketDisconnect:
            pass
        finally:
            manager.disconnect(conversation_id, websocket)
