#!/usr/bin/env python3
"""AMADEUS 对话 API — 供作品集 iframe 调用（需本机 Ollama + kurisu:latest）。"""
from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from amadeus.engine import AmadeusSession
from llm.providers import complete, resolve_arm

ARMS_KEY = os.getenv("AMA_DEMO_ARM", "A_amadeus")
DIMENSION = os.getenv("AMA_DEMO_DIMENSION", "DAILY")

app = FastAPI(title="AMADEUS Chat", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("AMA_CORS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_sessions: dict[str, AmadeusSession] = {}


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None


class ChatResponse(BaseModel):
    success: bool = True
    reply: str
    session_id: str
    pad: dict[str, float]
    behavior: str = ""
    emotion_score: float = 0.0


@app.get("/health")
def health():
    return {"ok": True, "arm": ARMS_KEY}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    sid = req.session_id or str(uuid.uuid4())
    session = _sessions.setdefault(sid, AmadeusSession())
    arm_cfg = resolve_arm(ARMS_KEY)
    built = session.build_system_prompt(req.message, DIMENSION)
    reply, _latency = complete(
        arm_cfg,
        built["system"],
        session.history,
        req.message,
        dimension=DIMENSION,
        turn_index=len(session.history) // 2 + 1,
        arm_key=ARMS_KEY,
    )
    session.add_turn(req.message, reply)
    meta = built["meta"]
    pad = meta["pad"]
    return ChatResponse(
        reply=reply,
        session_id=sid,
        pad=pad,
        behavior=meta.get("behavior_winner", ""),
        emotion_score=meta.get("emotion_score", 0.0),
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8765"))
    uvicorn.run(app, host="0.0.0.0", port=port)
