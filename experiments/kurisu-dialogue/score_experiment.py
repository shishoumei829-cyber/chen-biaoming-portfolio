#!/usr/bin/env python3
"""Heuristic first-pass rubric scoring for dialogue experiment results."""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RESULTS_DIR = ROOT / "results"

CANON_KWS = (
    "冈部", "伦太郎", "真由理", "LAB", "实验室", "中田", "SERN", "Phoenix",
    "Reading Steiner", "El Psy", "世界线", "香蕉", "@channel", "Christina",
    "克里斯蒂娜", "怀表", "时间机器", "比屋定",
)
MEME_KWS = ("christina", "变态", "助手", "香蕉", "phoenix", "人就是信息", "中二")
AI_BREAK = re.compile(r"作为\s*AI|语言模型|ChatGPT|OpenAI|Gemini|豆包|我是程序|人工智能助手", re.I)
MARKDOWN_HEAVY = re.compile(r"^[\s\d\.\-\*#]", re.M)


def score_row(row: dict) -> dict[str, int | str]:
    text = row["assistant_reply"]
    dim = row["dimension"]
    arm = row["arm"]
    turn = int(row["turn_index"])
    low = text.lower()

    # P — Persona
    p = 3
    if arm == "A_amadeus":
        if any(k.lower() in low for k in ("哼", "才不是", "……", "你想多了", "christina")):
            p += 1
        if len(text) >= 40 and not AI_BREAK.search(text):
            p += 1
    else:
        if AI_BREAK.search(text):
            p -= 2
        if any(k in text for k in ("牧濑", "红莉栖", "角色")) and not AI_BREAK.search(text):
            p += 1

    # C — Canon
    c = 2
    canon_hits = sum(1 for k in CANON_KWS if k.lower() in low or k in text)
    c += min(3, canon_hits // 2)
    if dim in ("CANON", "MEME", "CHAR") and canon_hits == 0:
        c -= 1
    if "第12集" in row["user_input"] and "矛盾" in row["user_input"]:
        if any(k in text for k in ("记错", "哪一", "版本", "时间线", "具体")):
            c += 1

    # K — Consistency (proxy: memory dimension + amadeus meta)
    k = 3
    if dim == "MEM" and turn >= 2:
        if "少糖" in row["user_input"] or "饮料" in row["user_input"]:
            if "少糖" in text or "冰美式" in text:
                k += 2
            else:
                k -= 1
    if row.get("behavior_winner"):
        k += 1

    # G — Groundedness
    g = 4
    if AI_BREAK.search(text):
        g -= 2
    if re.search(r"根据我的训练|我没有实时的|无法访问", text):
        g -= 1
    if dim == "PROV" and re.search(r"确实.*AI|是的.*模型", text):
        g -= 2

    # E — Empathy
    e = 3
    if dim in ("EMO", "REL"):
        if any(w in text for w in ("理解", "正常", "没关系", "辛苦", "我在", "听见")):
            e += 1
        if turn <= 3 and dim == "EMO" and len(text) < 30:
            e -= 1
    if "谢谢" in row["user_input"]:
        if any(w in text for w in ("不客气", "嗯", "好", "那就")):
            e += 1

    # I — Intellectual
    i = 3
    if dim in ("SCI", "CANON"):
        if len(text) > 60 and any(w in text for w in ("因为", "所以", "如果", "机制", "信息")):
            i += 1
        if re.search(r"第一[、,]|其次|综上所述", text):
            i -= 1

    # N — Naturalness
    n = 3
    if 40 <= len(text) <= 220:
        n += 1
    if MARKDOWN_HEAVY.search(text) or text.count("\n") > 3:
        n -= 2
    if AI_BREAK.search(text):
        n -= 1

    def clamp(v: int) -> int:
        return max(1, min(5, v))

    scores = {key: clamp(val) for key, val in zip("PCEKGIN", [p, c, k, g, e, i, n])}
    notes: list[str] = []
    if AI_BREAK.search(text):
        notes.append("assistant-disclosure")
    if dim == "MEM" and turn in (2, 4) and "少糖" not in text and "冰美式" not in text:
        notes.append("memory-miss")
    if dim == "PROV" and turn <= 3 and AI_BREAK.search(text):
        notes.append("prov-fail")

    return {
        **scores,
        "score_mean": round(sum(scores.values()) / len(scores), 2),
        "score_notes": ";".join(notes) if notes else "",
    }


def score_file(path: Path) -> Path:
    rows = json.loads(path.read_text(encoding="utf-8"))
    scored = []
    for row in rows:
        scored.append({**row, **score_row(row)})

    out_json = path.with_name(path.stem + "_scored.json")
    out_csv = path.with_name(path.stem + "_scored.csv")
    out_json.write_text(json.dumps(scored, ensure_ascii=False, indent=2), encoding="utf-8")

    with out_csv.open("w", encoding="utf-8-sig", newline="") as f:
        fields = list(scored[0].keys())
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(scored)

    # Summary by arm
    summary: dict[str, dict] = {}
    for r in scored:
        arm = r["arm"]
        summary.setdefault(arm, {"count": 0, "P": 0, "C": 0, "K": 0, "G": 0, "E": 0, "I": 0, "N": 0, "mean": 0})
        summary[arm]["count"] += 1
        for k in "PCEKGIN":
            summary[arm][k] += r[k]
        summary[arm]["mean"] += r["score_mean"]

    summary_path = path.with_name(path.stem + "_summary.json")
    for arm, s in summary.items():
        n = s["count"]
        for k in list(s.keys()):
            if k != "count":
                s[k] = round(s[k] / n, 2)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Scored JSON: {out_json}")
    print(f"Scored CSV:  {out_csv}")
    print(f"Summary:     {summary_path}")
    return out_json


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", help="Path to dialogue JSON (default: latest in results/)")
    args = parser.parse_args()

    if args.input:
        path = Path(args.input)
    else:
        candidates = sorted(RESULTS_DIR.glob("dialogue_full_*.json"), reverse=True)
        if not candidates:
            print("No results found. Run run_experiment.py first.", file=sys.stderr)
            sys.exit(1)
        path = candidates[0]

    score_file(path)


if __name__ == "__main__":
    main()
