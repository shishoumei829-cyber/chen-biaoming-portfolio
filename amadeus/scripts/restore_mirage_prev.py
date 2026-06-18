# -*- coding: utf-8 -*-
"""回退 MIRAGE：去掉 intro-p02 / eva01 海报，恢复 mirage-head + mirage-wall（上上一版）"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

IMG_MAIN = (
    "file:///C:/Users/SHIKIMORI/.cursor/projects/c-Users-SHIKIMORI-Desktop/assets/"
    "c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "______4k_2K_202605090012-9adc5211-b328-471d-9ed8-53a94c5476a9.png"
)

MIRAGE_WALL = """
      <div class="mirage-wall" aria-hidden="true">
        <span class="mw mw--1">现实</span>
        <span class="mw mw--2">转译</span>
        <span class="mw mw--3">MIRAGE</span>
        <span class="mw mw--4">AR</span>
      </div>
"""

HEAD_NEW = f"""<div class="section-head mirage-head mirage-poster reveal">{MIRAGE_WALL}
      <div>
        <p class="eva-caption mirage-quote">Birth is the beginning of death, death is the continuation of reality, and life is the end of a dream.</p>
        <div class="num">EP.01 / PRODUCT CASE</div>
      </div>
      <figure class="mirage-title-art magnetic">
        <img src="{IMG_MAIN}" alt="MIRAGE 现实转译后的城市街景">
      </figure>
      <div class="mirage-open-foot">
        <div class="mirage-frag mirage-frag--l eva-caption" aria-hidden="true"><span>After that,</span><span>and</span><strong>THE END</strong></div>
        <div class="mirage-frag mirage-frag--r eva-caption" aria-hidden="true"><span>NOT,</span><span>and</span><strong>ANT</strong></div>
        <h2 class="section-title">MIRAGE<br>现实转译器</h2>
        <p class="section-desc">MIRAGE 是一副以「现实转译」为核心的 AR 眼镜：用空间计算与实时渲染，让人重新看见街巷、树影与通勤路上的美——不是逃离现实，而是回到现实。</p>
      </div>
    </div>

    <div class="mirage-cases">"""

INTRO_PATTERNS = [
    re.compile(r"<header class=\"mirage-intro-p02[\s\S]*?</header>\s*\n\s*<div class=\"mirage-cases\">", re.M),
    re.compile(r"<header class=\"mirage-eva01[\s\S]*?</header>\s*\n\s*<div class=\"mirage-cases\">", re.M),
    re.compile(r"<div class=\"section-head mirage-head[\s\S]*?</div>\s*\n\s*<div class=\"mirage-cases\">", re.M),
]

CSS_STRIP = [
    r"/\* ═══ MIRAGE 介绍 · 图二[\s\S]*?(?=/\* ═══|</style>)",
    r"/\* ═══ MIRAGE · EVA 海报页[\s\S]*?(?=/\* ═══|</style>)",
    r"body\.eva-skin \.mirage-eva01\{display:none!important\}\s*",
]


def main():
    t = P.read_text(encoding="utf-8")

    for pat in INTRO_PATTERNS:
        if pat.search(t):
            t = pat.sub(HEAD_NEW, t, count=1)
            break

    for pat in CSS_STRIP:
        t = re.sub(pat, "", t, count=1)

    # 去掉 v11 对旧 eva10 思考页的隐藏（若仍存在）
    t = t.replace(
        "body.eva-skin #mirage .thought-page--eva10{display:none!important}\n",
        "",
    )

    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    print(
        "ok",
        "mirage-wall" in t2,
        "mirage-open-foot" in t2,
        "mirage-intro-p02" not in t2,
        "mirage-eva01 reveal" not in t2,
        "thought-page--center-q" in t2,
    )


if __name__ == "__main__":
    main()
