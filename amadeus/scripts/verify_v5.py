from pathlib import Path
p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
t = p.read_text(encoding="utf-8")
checks = {
    "v5": "EVA v5" in t,
    "no_v4": "EVA v4" not in t,
    "wall": "mirage-wall" in t,
    "barlow": "Barlow" in t,
    "plate_white": "eva-plate-white" in t,
    "ghost_thought": 'data-ghost="如果"' in t,
}
# black backgrounds in v5 mirage cases?
import re
m = re.search(r"mirage-cases\{[^}]+\}", t)
checks["mirage_cases_bg"] = m.group(0) if m else "missing"
print(checks)
print("v4 count", t.count("EVA v4"))
print("media980 count", t.count("@media (max-width:980px)"))
