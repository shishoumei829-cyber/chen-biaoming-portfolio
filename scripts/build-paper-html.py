#!/usr/bin/env python3
"""Build paper/index.html from paper/AMADEUS-论文.md."""
from __future__ import annotations

from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
MD_PATH = ROOT / "paper" / "AMADEUS-论文.md"
OUT_PATH = ROOT / "paper" / "index.html"

TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AMADEUS：面向连续人格在场的数字生命对话系统</title>
<meta name="description" content="陈彪明 · AMADEUS 同底模对照实验论文（v0.8）">
<meta name="author" content="陈彪明">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@400;600;700&display=swap" rel="stylesheet">
<style>
:root {{
  --ink:#1a1a1f;
  --muted:#5c5c66;
  --rule:#ddd8cf;
  --paper:#faf8f4;
  --accent:#3d52a0;
}}
* {{ box-sizing: border-box; }}
body {{
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: "Noto Serif SC", "Source Han Serif SC", serif;
  font-size: 17px;
  line-height: 1.85;
}}
.wrap {{
  max-width: 46rem;
  margin: 0 auto;
  padding: 2.5rem 1.25rem 4rem;
}}
.topbar {{
  font-family: Inter, system-ui, sans-serif;
  font-size: 0.82rem;
  color: var(--muted);
  border-bottom: 1px solid var(--rule);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  align-items: center;
}}
.topbar a {{ color: var(--accent); text-decoration: none; }}
.topbar a:hover {{ text-decoration: underline; }}
article h1 {{ font-size: 1.75rem; line-height: 1.35; margin: 0 0 0.5rem; }}
article h2 {{ font-size: 1.35rem; margin: 2.25rem 0 0.75rem; border-top: 1px solid var(--rule); padding-top: 1.5rem; }}
article h3 {{ font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }}
article h4 {{ font-size: 1rem; margin: 1.25rem 0 0.4rem; }}
article p {{ margin: 0.75rem 0; }}
article strong {{ font-weight: 700; }}
article em {{ font-style: italic; }}
article hr {{ border: none; border-top: 1px solid var(--rule); margin: 2rem 0; }}
article blockquote {{
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  border-left: 3px solid var(--accent);
  background: #f0ede6;
  color: #333;
}}
article ul, article ol {{ padding-left: 1.4rem; margin: 0.75rem 0; }}
article li {{ margin: 0.35rem 0; }}
article code {{
  font-family: ui-monospace, "Cascadia Code", monospace;
  font-size: 0.88em;
  background: #eee9df;
  padding: 0.1em 0.35em;
  border-radius: 3px;
}}
article pre {{
  background: #1e1e24;
  color: #e8e6e3;
  padding: 1rem 1.1rem;
  overflow-x: auto;
  border-radius: 6px;
  font-size: 0.82rem;
  line-height: 1.55;
}}
article pre code {{ background: none; padding: 0; color: inherit; }}
article table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
  margin: 1rem 0;
  line-height: 1.5;
}}
article th, article td {{
  border: 1px solid var(--rule);
  padding: 0.45rem 0.55rem;
  vertical-align: top;
}}
article th {{ background: #f0ede6; font-weight: 600; }}
article a {{ color: var(--accent); }}
footer {{
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--rule);
  font-family: Inter, sans-serif;
  font-size: 0.8rem;
  color: var(--muted);
}}
@media print {{
  body {{ background: #fff; }}
  .topbar {{ display: none; }}
}}
</style>
</head>
<body>
<div class="wrap">
<nav class="topbar">
  <a href="../index.html#amadeus">← 返回作品集 · AMADEUS</a>
  <a href="AMADEUS-论文.md" download>下载 Markdown 源稿</a>
  <span>公开预印本 · GitHub Pages</span>
</nav>
<article>
{body}
</article>
<footer>
  陈彪明 · 桂林电子科技大学 设计与创意学院 · 公开预印本，引用请注明出处与版本号。
</footer>
</div>
</body>
</html>
"""

def main() -> None:
    md_text = MD_PATH.read_text(encoding="utf-8")
    body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code", "sane_lists", "nl2br"],
    )
    html = TEMPLATE.format(body=body)
    OUT_PATH.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
