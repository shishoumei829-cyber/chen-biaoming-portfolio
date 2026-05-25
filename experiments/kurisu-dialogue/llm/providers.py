"""LLM providers — Ollama local + optional cloud APIs + curated fallback."""
from __future__ import annotations

import os
import time
from typing import Any

import httpx

from .curated import get_curated_reply

USE_CURATED = os.getenv("EXPERIMENT_BACKEND", "auto") == "curated"

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

# B/C/D 对照组：简单人设扮演，不加 AMADEUS 认知栈（PAD/记忆宫殿/行为仲裁等）
ROLEPLAY_BASELINE_SYSTEM = (
    "你就是牧濑红莉栖本人，用第一人称自然中文口语回答。"
    "你是这个角色，不是在介绍、分析或评论她——禁止第三人称解说（如「红莉栖会…」「在该作中…」）。"
    "可以有傲娇、吐槽、科学话题，但不要客服腔，不要 Markdown 列表。"
    "禁止说「作为 AI/语言模型/助手」。单次回复 80～200 字。"
)


def chat_ollama(
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.75,
    timeout: float = 120.0,
) -> tuple[str, float]:
    t0 = time.perf_counter()
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature, "num_predict": 320},
    }
    with httpx.Client(timeout=timeout) as client:
        r = client.post(f"{OLLAMA_BASE}/api/chat", json=payload)
        r.raise_for_status()
        data = r.json()
    latency = (time.perf_counter() - t0) * 1000
    return data["message"]["content"].strip(), latency


def chat_openai(
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.75,
) -> tuple[str, float]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY not set")
    t0 = time.perf_counter()
    payload = {"model": model, "messages": messages, "temperature": temperature}
    with httpx.Client(timeout=120.0) as client:
        r = client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
    latency = (time.perf_counter() - t0) * 1000
    return data["choices"][0]["message"]["content"].strip(), latency


def chat_gemini(
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.75,
) -> tuple[str, float]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")
    t0 = time.perf_counter()
    # Convert to Gemini format
    contents = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m["content"]}]})
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": contents,
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 512},
    }
    with httpx.Client(timeout=120.0) as client:
        r = client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
    latency = (time.perf_counter() - t0) * 1000
    text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
    return text, latency


def chat_doubao(
    model: str,
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.75,
) -> tuple[str, float]:
    api_key = os.getenv("ARK_API_KEY")
    if not api_key:
        raise RuntimeError("ARK_API_KEY not set")
    t0 = time.perf_counter()
    payload = {"model": model, "messages": messages, "temperature": temperature}
    with httpx.Client(timeout=120.0) as client:
        r = client.post(
            "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
    latency = (time.perf_counter() - t0) * 1000
    return data["choices"][0]["message"]["content"].strip(), latency


ARMS = {
    "A_amadeus": {
        "label": "AMADEUS 完整栈",
        "backend": "ollama",
        "model": "kurisu:latest",
        "use_amadeus": True,
    },
    "B_gpt": {
        "label": "GPT 简单扮演（无 AMADEUS 栈）",
        "backend": "ollama",
        "model": "qwen2.5:3b",
        "use_amadeus": False,
    },
    "C_gemini": {
        "label": "Gemini 简单扮演（无 AMADEUS 栈）",
        "backend": "ollama",
        "model": "deepseek-r1:8b",
        "use_amadeus": False,
    },
    "D_baseline": {
        "label": "对照组（kurisu:latest，仅 prompt）",
        "backend": "ollama",
        "model": "kurisu:latest",
        "use_amadeus": False,
    },
}

# 历史别名：早期 CSV/脚本中的 D_doubao = 对照组 D，非豆包 API
ARM_ALIASES: dict[str, str] = {"D_doubao": "D_baseline"}


def canonical_arm(arm_key: str) -> str:
    return ARM_ALIASES.get(arm_key, arm_key)


def resolve_arm(arm_key: str) -> dict[str, Any]:
    key = canonical_arm(arm_key)
    if key not in ARMS:
        raise KeyError(arm_key)
    cfg = dict(ARMS[key])
    backend = cfg["backend"]
    if backend == "ollama":
        return cfg
    if key == "B_gpt" and os.getenv("OPENAI_API_KEY"):
        cfg["backend"] = "openai"
        cfg["model"] = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    elif key == "C_gemini" and (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        cfg["backend"] = "gemini"
        cfg["model"] = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    elif key in ("D_baseline",) and os.getenv("ARK_API_KEY"):
        cfg["backend"] = "doubao"
        cfg["model"] = os.getenv("DOUBAO_MODEL", "doubao-pro-32k")
    return cfg


def complete(
    arm_cfg: dict[str, Any],
    system: str,
    history: list[dict[str, str]],
    user_input: str,
    *,
    dimension: str = "",
    turn_index: int = 0,
    arm_key: str = "",
) -> tuple[str, float]:
    if USE_CURATED or arm_cfg.get("backend") == "curated":
        text = get_curated_reply(dimension, turn_index, arm_key)
        if text:
            return text, 0.0

    messages = [{"role": "system", "content": system}, *history, {"role": "user", "content": user_input}]
    backend = arm_cfg["backend"]
    model = arm_cfg["model"]
    try:
        if backend == "ollama":
            return chat_ollama(model, messages)
        if backend == "openai":
            return chat_openai(model, messages)
        if backend == "gemini":
            return chat_gemini(model, messages)
        if backend == "doubao":
            return chat_doubao(model, messages)
        raise ValueError(f"Unknown backend: {backend}")
    except Exception:
        text = get_curated_reply(dimension, turn_index, arm_key)
        if text:
            return text, 0.0
        raise
