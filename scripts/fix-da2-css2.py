# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parents[1] / "index.html"
t = p.read_text(encoding="utf-8")
i = t.index("\n的内容              ")
j = t.index("\n.da2-cover{", i)
t = t[:i] + "\n" + t[j + 1 :]
p.write_text(t, encoding="utf-8")
print("OK removed bytes", j - i)
