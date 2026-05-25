"""Behavior arbitration — pick response tendency before generation."""
from __future__ import annotations

import re
from dataclasses import dataclass

from .pad import PADState


BEHAVIORS = (
    "APPROACH",
    "DAILY",
    "DEFLECT",
    "REDIRECT",
    "ENGAGE",
    "WITHDRAW",
)


@dataclass
class BehaviorResult:
    winner: str
    scores: dict[str, float]


def arbitrate(pad: PADState, user_input: str) -> BehaviorResult:
    scores = {b: 0.0 for b in BEHAVIORS}
    P, A, D, S = pad.P, pad.A, pad.D, pad.S

    if P > 0.35:
        scores["APPROACH"] += 0.35
    elif P < -0.35:
        scores["WITHDRAW"] += 0.40

    if A > 0.5:
        scores["ENGAGE"] += 0.35
    if S > 0.5:
        scores["APPROACH"] += 0.20

    if re.search(r"喜欢你|爱你|靠近", user_input):
        scores["DEFLECT"] += 0.45
        scores["APPROACH"] += 0.20

    if re.search(r"chatgpt|程序|ai|复制体|别装", user_input, re.I):
        scores["DEFLECT"] += 0.35
        scores["ENGAGE"] += 0.25

    if re.search(r"咖啡|天气|香蕉|真由理|cos", user_input):
        scores["DAILY"] += 0.40

    if re.search(r"信息论|脑科学|世界线|意识|算力", user_input):
        scores["ENGAGE"] += 0.45

    if re.search(r"谢谢|舒服|懂了|信你", user_input):
        scores["APPROACH"] += 0.30
        scores["DAILY"] += 0.15

    winner = max(scores, key=scores.get)
    if scores[winner] <= 0.05:
        winner = "DAILY"
    return BehaviorResult(winner=winner, scores=scores)
