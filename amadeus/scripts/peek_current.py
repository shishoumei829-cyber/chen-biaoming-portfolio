from pathlib import Path
p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
t = p.read_text(encoding="utf-8")
for m in ['<div class="eva-hero-mid">', 'ama-v2-hero', 'ama-prologue', 'ama-vision', 'ama-v2-stage', 'EVA v6']:
    i = t.find(m) if m.startswith('<') else t.find(m)
    print("\n===", m, "found", i >= 0)
    if i >= 0 and m.startswith('<'):
        print(t[i:i+1400][:1400])
