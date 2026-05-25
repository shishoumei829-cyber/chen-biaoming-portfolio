"""PAD affective matrix — nonlinear update."""
from __future__ import annotations

import math
import random
from dataclasses import dataclass, field


@dataclass
class PADState:
    P: float = 0.1
    A: float = 0.0
    D: float = 0.2
    S: float = 0.35

    def clamp(self) -> None:
        for name in ("P", "A", "D", "S"):
            setattr(self, name, max(-1.0, min(1.0, getattr(self, name))))

    def to_dict(self) -> dict[str, float]:
        return {"P": self.P, "A": self.A, "D": self.D, "S": self.S}


def _importance(user_input: str) -> float:
    text = user_input.lower()
    weight = 0.2
    if any(k in user_input for k in ("喜欢", "爱", "死", "牺牲", "父亲", "论文")):
        weight += 0.35
    if any(k in user_input for k in ("chatgpt", "ai", "程序", "复制体", "别装")):
        weight += 0.4
    if any(k in user_input for k in ("谢谢", "舒服", "懂了")):
        weight += 0.15
    if "?" in user_input or "？" in user_input:
        weight += 0.05
    return min(1.0, weight)


def _stimulus(user_input: str) -> tuple[float, float, float]:
    text = user_input
    p, a, d = 0.0, 0.0, 0.0
    if any(k in text for k in ("喜欢", "爱", "靠近", "担心")):
        p += 0.25
        a += 0.35
        d -= 0.15
    if any(k in text for k in ("拒", "不够格", "撑不住", "麻烦")):
        p -= 0.35
        a += 0.15
    if any(k in text for k in ("chatgpt", "ai", "程序", "复制体", "矛盾", "prove")):
        p -= 0.2
        a += 0.45
        d += 0.35
    if any(k in text for k in ("christina", "变态", "助手", "中二")):
        p -= 0.05
        a += 0.25
        d += 0.15
    if any(k in text for k in ("谢谢", "信你", "测试")):
        p += 0.3
        a -= 0.1
    if any(k in text for k in ("记忆", "信息论", "脑科学", "世界线")):
        a += 0.2
        d += 0.15
    return p, a, d


def update_pad(state: PADState, user_input: str) -> PADState:
    imp = _importance(user_input)
    sp, sa, sd = _stimulus(user_input)
    alpha, beta, gamma = 0.86, 0.2 + imp * 0.6, 0.18
    bond_damp = 1.0 - state.S * 0.35 if sp < 0 else 1.0
    sp *= bond_damp
    eps = random.uniform(-0.04, 0.04)
    base = (0.08, 0.05, 0.12, 0.0)

    def tanh(x: float) -> float:
        return math.tanh(x)

    state.P = tanh(alpha * state.P + beta * sp + gamma * base[0] + eps)
    state.A = tanh(alpha * state.A + beta * sa + gamma * base[1] + eps * 0.5)
    state.D = tanh(alpha * state.D + beta * sd + gamma * base[2] + eps * 0.5)
    if any(k in user_input for k in ("喜欢", "担心", "谢谢", "信你")):
        state.S = tanh(alpha * state.S + 0.12 + imp * 0.08)
    state.clamp()
    return state


def emotion_score(state: PADState) -> float:
    s = state.S * 2 - 1
    return 0.40 * state.P + 0.25 * state.A + 0.20 * state.D + 0.15 * s
