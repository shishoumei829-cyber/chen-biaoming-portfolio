from pathlib import Path
p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
t = p.read_text(encoding="utf-8")
for marker in ["eva-hero-mid", "eva-plate", "ama-v2-hero", "ama-v2-thesis", "EVA v5"]:
    i = t.find(marker)
    if i < 0:
        print("MISSING", marker)
        continue
    print("\n===", marker, "===")
    print(t[max(0, i - 80) : i + 1200][:1300])
