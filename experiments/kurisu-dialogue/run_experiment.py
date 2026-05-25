#!/usr/bin/env python3
"""Run Kurisu dialogue experiment — 8 dimensions × 6 turns × 4 arms."""
from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from amadeus.engine import AmadeusSession
from llm.providers import ARMS, ARM_ALIASES, ROLEPLAY_BASELINE_SYSTEM, canonical_arm, complete, resolve_arm

RESULTS_DIR = ROOT / "results"


def load_questions() -> dict:
    return json.loads((ROOT / "data" / "questions.json").read_text(encoding="utf-8"))


def run_arm(arm_key: str, questions: dict, *, dry_run: bool = False) -> list[dict]:
    cfg = resolve_arm(arm_key)
    rows: list[dict] = []
    experiment_id = questions["experiment_id"]

    for dim in questions["dimensions"]:
        code = dim["code"]
        session_id = f"{arm_key}_{code}"
        amadeus = AmadeusSession() if cfg["use_amadeus"] else None
        history: list[dict[str, str]] = []

        for turn_index, user_input in enumerate(dim["turns"], start=1):
            meta: dict = {}
            if cfg["use_amadeus"]:
                assert amadeus is not None
                built = amadeus.build_system_prompt(user_input, f"{code} · {dim['name']}")
                system = built["system"]
                meta = built["meta"]
            else:
                system = ROLEPLAY_BASELINE_SYSTEM

            if dry_run:
                reply, latency = "[DRY RUN]", 0.0
            else:
                reply, latency = complete(
                    cfg,
                    system,
                    history,
                    user_input,
                    dimension=code,
                    turn_index=turn_index,
                    arm_key=arm_key,
                )

            row = {
                "experiment_id": experiment_id,
                "arm": arm_key,
                "arm_label": cfg["label"],
                "model_name": cfg["model"],
                "backend": "curated" if os.getenv("EXPERIMENT_BACKEND") == "curated" else cfg["backend"],
                "dimension": code,
                "dimension_name": dim["name"],
                "session_id": session_id,
                "turn_index": turn_index,
                "user_input": user_input,
                "assistant_reply": reply,
                "latency_ms": round(latency, 1),
                "pad_P": meta.get("pad", {}).get("P"),
                "pad_A": meta.get("pad", {}).get("A"),
                "pad_D": meta.get("pad", {}).get("D"),
                "pad_S": meta.get("pad", {}).get("S"),
                "behavior_winner": meta.get("behavior_winner"),
                "memory_rooms": "|".join(meta.get("memory_rooms", [])),
                "emotion_score": meta.get("emotion_score"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            rows.append(row)

            history.append({"role": "user", "content": user_input})
            history.append({"role": "assistant", "content": reply})
            if amadeus:
                amadeus.add_turn(user_input, reply)

            print(f"  [{arm_key}] {code} turn {turn_index}/6 done ({latency:.0f}ms)")

    return rows


def save_results(all_rows: list[dict], tag: str) -> tuple[Path, Path]:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = RESULTS_DIR / f"dialogue_{tag}_{ts}.json"
    csv_path = RESULTS_DIR / f"dialogue_{tag}_{ts}.csv"

    json_path.write_text(json.dumps(all_rows, ensure_ascii=False, indent=2), encoding="utf-8")

    if all_rows:
        with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
            writer.writeheader()
            writer.writerows(all_rows)

    return json_path, csv_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Kurisu dialogue experiment runner")
    parser.add_argument(
        "--arms",
        nargs="*",
        default=list(ARMS.keys()),
        help="Arms to run (default: all)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Skip LLM calls")
    parser.add_argument(
        "--curated",
        action="store_true",
        help="Use curated pilot responses (no LLM)",
    )
    parser.add_argument(
        "--dimensions",
        nargs="*",
        help="Only run these dimension codes, e.g. CANON MEME",
    )
    args = parser.parse_args()

    if args.curated:
        os.environ["EXPERIMENT_BACKEND"] = "curated"

    questions = load_questions()
    if args.dimensions:
        codes = set(args.dimensions)
        questions["dimensions"] = [d for d in questions["dimensions"] if d["code"] in codes]

    all_rows: list[dict] = []
    print(f"Experiment: {questions['experiment_id']}")
    print(f"Dimensions: {len(questions['dimensions'])} × 6 turns × {len(args.arms)} arms")

    for arm_key in args.arms:
        if arm_key not in set(ARMS) | set(ARM_ALIASES):
            print(f"Unknown arm: {arm_key}", file=sys.stderr)
            continue
        cfg = resolve_arm(arm_key)
        run_key = canonical_arm(arm_key)
        print(f"\n=== {run_key}: {cfg['label']} ({cfg['backend']}/{cfg['model']}) ===")
        rows = run_arm(run_key, questions, dry_run=args.dry_run)
        all_rows.extend(rows)

    json_path, csv_path = save_results(all_rows, "full" if not args.dry_run else "dry")
    print(f"\nSaved JSON: {json_path}")
    print(f"Saved CSV:  {csv_path}")


if __name__ == "__main__":
    main()
