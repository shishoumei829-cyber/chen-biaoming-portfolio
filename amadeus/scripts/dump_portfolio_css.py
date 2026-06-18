from pathlib import Path
p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
lines = p.read_text(encoding="utf-8").splitlines()
for i, l in enumerate(lines, 1):
    if 370 <= i <= 860 or "eva-poster" in l or "EVA v" in l:
        print(f"{i}:{l[:150]}")
