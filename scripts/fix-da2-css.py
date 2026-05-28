# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
index_path = root / "index.html"
redesign_path = Path(r"C:\Users\SHIKIMORI\Downloads\digitalark-redesign.html")

index = index_path.read_text(encoding="utf-8")
redesign = redesign_path.read_text(encoding="utf-8")

start = redesign.index('<style id="da-redesign-css">') + len('<style id="da-redesign-css">')
end = redesign.index(
    "</style>\n\n<!-- ══════════════════════════════════════════════════════\n     ② HTML"
)
da2_css = redesign[start:end].strip()
da2_css = re.sub(r"^#digitalark\{[^}]+\}\s*", "", da2_css, count=1, flags=re.S)

bad_start = index.index("的内容              ║")
bad_end = index.index("/* ═══ 移动端 · 桌面样式不变 ═══ */")
index = index[:bad_start] + da2_css + "\n\n" + index[bad_end:]

index_path.write_text(index, encoding="utf-8")
print("Fixed da2 CSS, length", len(da2_css))
