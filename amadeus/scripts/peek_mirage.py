from pathlib import Path
p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
t = p.read_text(encoding="utf-8")
i = t.find('id="mirage"')
print(t[i:i+3500])
