"""AMADEUS full-stack prompt assembly."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from .behavior import arbitrate
from .memory import MemoryPalace
from .mind_turn import mind_turn
from .pad import PADState, emotion_score, update_pad

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "data" / "prompts"


def _load(name: str) -> str:
    return (PROMPTS_DIR / name).read_text(encoding="utf-8").strip()


@dataclass
class AmadeusSession:
    pad: PADState = field(default_factory=PADState)
    memory: MemoryPalace = field(default_factory=MemoryPalace)
    history: list[dict[str, str]] = field(default_factory=list)

    def build_system_prompt(self, user_input: str, dimension: str) -> dict:
        self.pad = update_pad(self.pad, user_input)
        behavior = arbitrate(self.pad, user_input)
        rooms, mem_hits = self.memory.retrieve(user_input)
        self.memory.ingest(user_input)
        inner = mind_turn(user_input, behavior.winner)

        voice = _load("kurisu_voice.txt")
        core = _load("kurisu_core.txt")
        soul = _load("kurisu_soul.txt")

        memory_block = "\n".join(f"- {m}" for m in mem_hits) if mem_hits else "- （暂无相关记忆标签）"
        system = (
            f"{core}\n\n{voice}\n\n{soul}\n\n"
            f"【实验维度】{dimension}\n"
            f"【记忆宫殿命中】{', '.join(rooms)}\n"
            f"【相关记忆】\n{memory_block}\n\n"
            f"【内部状态 PAD】P={self.pad.P:.2f} A={self.pad.A:.2f} "
            f"D={self.pad.D:.2f} S={self.pad.S:.2f} emotion={emotion_score(self.pad):.2f}\n"
            f"【行为倾向】{behavior.winner}\n\n"
            f"{inner}"
        )
        meta = {
            "pad": self.pad.to_dict(),
            "behavior_winner": behavior.winner,
            "memory_rooms": rooms,
            "memory_hits": mem_hits,
            "emotion_score": round(emotion_score(self.pad), 4),
        }
        return {"system": system, "meta": meta}

    def add_turn(self, user: str, assistant: str) -> None:
        self.history.append({"role": "user", "content": user})
        self.history.append({"role": "assistant", "content": assistant})
        self.memory.ingest(assistant, tag=f"self:{assistant[:40]}")
