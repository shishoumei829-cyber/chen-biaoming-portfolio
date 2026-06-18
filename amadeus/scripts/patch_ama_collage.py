# -*- coding: utf-8 -*-
import re
from pathlib import Path

p = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")
t = p.read_text(encoding="utf-8")

t = re.sub(r'\s*<div class="ama-orb[^"]*"[\s\S]*?</div>\s*\n', "\n", t, count=1)

if 'class="ama-collage"' not in t:
    t = t.replace(
        '    <article class="ama-v2-module reveal" data-ama-section="soul">',
        '    <div class="ama-collage">\n    <article class="ama-v2-module reveal" data-ama-section="soul">',
        1,
    )
    t = t.replace(
        "    </article>\n\n    <section class=\"ama-ui-v2",
        "    </article>\n    </div>\n\n    <section class=\"ama-ui-v2",
        1,
    )

t = t.replace(
    "body.eva-skin .nav{mix-blend-mode:normal;background:transparent;border:0}",
    "body.eva-skin .nav{mix-blend-mode:normal;background:transparent;border:0}\n"
    "body.eva-skin .nav a{color:rgba(0,0,0,.62)!important}",
    1,
)

p.write_text(t, encoding="utf-8")
print("collage", "ama-collage" in t)
