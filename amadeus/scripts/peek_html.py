from pathlib import Path
p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
t = p.read_text(encoding="utf-8")
for marker, n in [("hero eva-poster", 2200), ('id="mirage"', 2000), ('id="timewalker"', 800)]:
    i = t.find(marker)
    print("===", marker, "===")
    print(t[i : i + n])
    print()
