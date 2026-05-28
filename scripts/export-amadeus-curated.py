#!/usr/bin/env python3
"""Export A_amadeus curated lines to JSON for static chat fallback."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "experiments" / "kurisu-dialogue"))

from llm.curated import CURATED  # noqa: E402

out = []
for (dim, turn, arm), text in sorted(CURATED.items()):
    if arm not in ("A_amadeus", "D_doubao"):
        continue
    if arm == "D_doubao":
        arm = "A_amadeus"
    out.append({"dimension": dim, "turn": turn, "text": text})

dest = ROOT / "assets" / "amadeus-demo" / "curated.json"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Wrote {len(out)} lines to {dest}")
