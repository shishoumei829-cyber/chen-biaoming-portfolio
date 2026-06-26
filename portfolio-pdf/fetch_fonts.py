#!/usr/bin/env python3
"""下载作品集 PDF 所需的拉丁字体 woff2 到本地，并生成 fonts.css。
中文用系统已装的 Noto Serif/Sans CJK SC，无需下载。"""
import re, os, sys, urllib.request

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36")

FONTS = {
    "Playfair Display": "Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600",
    "Allura": "Allura",
    "Jost": "Jost:wght@300;400;500;600",
}

OUT = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(OUT, "fonts")
os.makedirs(FONT_DIR, exist_ok=True)

# 只保留 latin / latin-ext 子集，避免下载无关字符集
WANT = ("latin", "latin-ext")

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

css_out = []
for fam, q in FONTS.items():
    css = fetch(f"https://fonts.googleapis.com/css2?family={q}&display=block").decode("utf-8")
    # 按 /* subset */ 注释切块
    blocks = re.split(r"/\*\s*([\w-]+)\s*\*/", css)
    # blocks: [pre, name1, body1, name2, body2, ...]
    for i in range(1, len(blocks) - 1, 2):
        subset = blocks[i].strip()
        body = blocks[i + 1]
        if subset not in WANT:
            continue
        m = re.search(r"url\((https://[^)]+\.woff2)\)", body)
        if not m:
            continue
        u = m.group(1)
        fname = f"{fam.replace(' ', '')}-{subset}-{i}.woff2"
        data = fetch(u)
        with open(os.path.join(FONT_DIR, fname), "wb") as f:
            f.write(data)
        body = body.replace(u, f"fonts/{fname}")
        css_out.append(f"/* {fam} {subset} */\n{body.strip()}")
        print(f"downloaded {fname} ({len(data)//1024} KB)")

with open(os.path.join(OUT, "fonts.css"), "w", encoding="utf-8") as f:
    f.write("\n\n".join(css_out) + "\n")
print("wrote fonts.css")
