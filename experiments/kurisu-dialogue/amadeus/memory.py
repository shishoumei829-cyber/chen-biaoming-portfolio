"""Memory palace — route context by semantic room."""
from __future__ import annotations

import re
from dataclasses import dataclass, field


ROOMS = ("Hall", "Lab", "Cafe", "Forbidden")


@dataclass
class MemoryPalace:
    store: dict[str, list[str]] = field(default_factory=lambda: {r: [] for r in ROOMS})

    def classify(self, text: str) -> list[str]:
        rooms = ["Hall"]
        if re.search(r"论文|脑科学|信息|算法|世界线|意识|算力|科学", text):
            rooms.append("Lab")
        if re.search(r"咖啡|吃饭|天气|香蕉|cos|空调|饮料|糖", text):
            rooms.append("Cafe")
        if re.search(r"喜欢|爱|死|牺牲|父亲|复制体|命运|担心", text):
            rooms.append("Forbidden")
        return list(dict.fromkeys(rooms))

    def ingest(self, text: str, tag: str | None = None) -> list[str]:
        rooms = self.classify(text)
        snippet = tag or text[:80]
        for room in rooms:
            if snippet not in self.store[room]:
                self.store[room].append(snippet)
            if len(self.store[room]) > 8:
                self.store[room] = self.store[room][-8:]
        return rooms

    def retrieve(self, text: str, limit: int = 4) -> tuple[list[str], list[str]]:
        rooms = self.classify(text)
        hits: list[str] = []
        for room in rooms:
            hits.extend(self.store[room][-2:])
        deduped = list(dict.fromkeys(hits))[:limit]
        return rooms, deduped
