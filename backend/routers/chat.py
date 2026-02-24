import os
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openai import OpenAI

from database import get_db
from models import Conversation, Message
from schemas import ChatRequest

router = APIRouter(prefix="/api", tags=["chat"])

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

MODEL_NAME = "deepseek-chat"


def generate_title(user_message: str) -> str:
    """Call DeepSeek to generate a short conversation title."""
    try:
        resp = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": f"用10个字以内概括此对话主题，只返回标题文字，不要标点符号：{user_message}",
                }
            ],
            max_tokens=30,
        )
        title = resp.choices[0].message.content.strip().strip("\"'""''")
        return title[:20] if title else user_message[:20]
    except Exception:
        return user_message[:20] if len(user_message) > 20 else user_message


@router.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
    if not conv:
        conv = Conversation(id=request.conversation_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)

    history = (
        db.query(Message)
        .filter(Message.conversation_id == request.conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    is_first_message = len(history) == 0

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": request.message})

    user_msg = Message(
        conversation_id=request.conversation_id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)
    db.commit()

    is_thinking = request.mode == "reasoner"

    create_kwargs = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": True,
    }
    if is_thinking:
        create_kwargs["extra_body"] = {"thinking": {"type": "enabled"}}

    def event_stream():
        full_content = ""
        full_reasoning = ""

        try:
            response = client.chat.completions.create(**create_kwargs)

            for chunk in response:
                if not chunk.choices:
                    continue

                choice = chunk.choices[0]
                delta = choice.delta

                rc = getattr(delta, "reasoning_content", None)
                ct = delta.content

                if rc:
                    full_reasoning += rc
                    yield f"data: {json.dumps({'type': 'reasoning', 'content': rc})}\n\n"

                if ct:
                    full_content += ct
                    yield f"data: {json.dumps({'type': 'content', 'content': ct})}\n\n"

                if choice.finish_reason == "stop":
                    break

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        assistant_msg = Message(
            conversation_id=request.conversation_id,
            role="assistant",
            content=full_content,
            reasoning_content=full_reasoning if full_reasoning else None,
            model=MODEL_NAME,
        )
        db.add(assistant_msg)
        conv.updated_at = datetime.now(timezone.utc)
        db.commit()

        yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg.id})}\n\n"

        if is_first_message and full_content:
            title = generate_title(request.message)
            conv.title = title
            db.commit()
            yield f"data: {json.dumps({'type': 'title', 'content': title})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
