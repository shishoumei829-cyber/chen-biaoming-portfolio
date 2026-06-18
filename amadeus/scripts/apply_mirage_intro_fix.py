# -*- coding: utf-8 -*-
"""MIRAGE 介绍页：纯白底；左图二排版 + 右图不变；思考页回上一版"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

IMG_MAIN = (
    "file:///C:/Users/SHIKIMORI/.cursor/projects/c-Users-SHIKIMORI-Desktop/assets/"
    "c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "______4k_2K_202605090012-9adc5211-b328-471d-9ed8-53a94c5476a9.png"
)
IMG_STRIP = (
    "file:///C:/Users/SHIKIMORI/.cursor/projects/d-Amadeus-Trae/assets/"
    "c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "Camera_1040g3k831vqvu1te54c05nnltca0ble4odkkg9g-eda7b9fd-8f42-45c6-b1c8-f6302c28de34.png"
)

INTRO_OLD = re.compile(
    r"<header class=\"mirage-eva01[\s\S]*?</header>\s*\n\s*<div class=\"mirage-cases\">",
    re.M,
)

INTRO_NEW = f"""<header class="mirage-intro-p02 reveal" id="mirage-intro">
      <div class="mirage-p02-left">
        <div class="mirage-p02-top">
          <p class="mirage-p02-quote eva-caption">Birth is the beginning of death, death is the continuation of reality, and life is the end of a dream.</p>
          <div class="num">EP.01 / PRODUCT CASE</div>
        </div>
        <div class="mirage-p02-letterbox" style="background-image:url('{IMG_STRIP}')"></div>
        <div class="mirage-p02-mid">
          <span class="mirage-p02-frag eva-caption"><span>After that,</span><span>and</span><strong>THE END</strong></span>
          <span class="mirage-p02-frag eva-caption"><span>NOT,</span><span>and</span><strong>ANT</strong></span>
        </div>
        <div class="mirage-p02-bottom">
          <h2 class="mirage-p02-title">MIRAGE</h2>
          <p class="mirage-p02-sub">现实转译器</p>
          <p class="section-desc mirage-p02-desc">以空间计算与实时渲染，让人重新看见街巷、树影与通勤路上的美——不是逃离现实，而是回到现实。</p>
          <p class="mirage-p02-script">Goodbye, all of flat screens — hello, translated reality.</p>
        </div>
      </div>
      <figure class="mirage-p02-visual magnetic">
        <img src="{IMG_MAIN}" alt="MIRAGE 现实转译后的城市街景">
      </figure>
    </header>

    <div class="mirage-cases">"""

# 图一备选：仅第一思考页用竖排字墙+下图（用户说或图一）
THOUGHT1_OLD = re.compile(
    r'<section class="mirage-eva02[\s\S]*?data-ghost="如果"[\s\S]*?</section>',
    re.M,
)
THOUGHT1_NEW = r"""<section class="thought-page reveal thought-page--center-q" data-ghost="如果">
      <div class="thought-aside">Question / Before Concept</div>
      <div class="thought-copy">
        <div class="thought-kicker">My Question</div>
        <h3 class="thought-line" data-typewriter="如果世界变了个样子，&#10;你会不会愿意多看它一眼？"></h3>
        <p class="thought-sub">我想创造的不是逃离现实的设备，而是一双看得见美的眼镜。</p>
      </div>
    </section>"""

THOUGHT2_OLD = re.compile(
    r'<section class="mirage-eva02[\s\S]*?data-ghost="城市"[\s\S]*?</section>',
    re.M,
)
THOUGHT2_NEW = r"""<section class="thought-page reveal align-right narrow" data-ghost="城市">
        <div class="thought-copy">
          <div class="thought-kicker">My Finding</div>
          <h3 class="thought-line" data-typewriter="城市并不是缺少美，&#10;而是我们走得太快。"></h3>
          <p class="thought-sub">熟悉感、噪音和屏幕注意力，让很多街景、光影、天气和生活细节被自动忽略。真实世界的美更安静，需要被提醒、被放大、被重新组织。</p>
        </div>
      </section>"""

THOUGHT3_OLD = re.compile(
    r'<section class="mirage-eva01-bandpage[\s\S]*?data-ghost="AR"[\s\S]*?</section>',
    re.M,
)
THOUGHT3_NEW = r"""<section class="thought-page reveal" data-ghost="AR">
        <div class="thought-copy">
          <div class="thought-kicker">My Vision</div>
          <h3 class="thought-line" data-typewriter="AR 不一定把人带向虚拟，&#10;它也可以把人带回现实。"></h3>
          <p class="thought-sub">用空间计算与实时视觉重构，让世界重新值得观看，同时保留环境风险识别，让美化现实不牺牲安全感。</p>
        </div>
      </section>"""

CSS = r"""
/* ═══ MIRAGE 介绍 · 图二左文右图 / 纯白 ═══ */
body.eva-skin #mirage.eva-chapter{background:#fff!important;padding:0!important}

body.eva-skin .mirage-intro-p02{
  min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);
  background:#fff;align-items:stretch;
}
body.eva-skin .mirage-p02-left{
  display:flex;flex-direction:column;justify-content:space-between;
  padding:clamp(88px,10vh,120px) clamp(20px,4vw,48px) clamp(40px,5vw,56px);
  border-right:1px solid rgba(10,10,10,.08);
}
body.eva-skin .mirage-p02-quote{
  color:rgba(153,0,0,.82)!important;font-size:11px!important;line-height:1.85!important;
  max-width:420px;
}
body.eva-skin .mirage-p02-top .num{color:rgba(10,10,10,.45)!important;margin-top:12px}

body.eva-skin .mirage-p02-letterbox{
  margin:clamp(28px,5vw,44px) 0;height:clamp(140px,22vh,220px);
  background-size:cover;background-position:center 40%;
  filter:grayscale(1) contrast(1.15);
  border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;
}

body.eva-skin .mirage-p02-mid{
  display:flex;justify-content:space-between;align-items:flex-start;
  gap:16px;margin-bottom:clamp(24px,4vw,36px);
}
body.eva-skin .mirage-p02-frag{
  display:flex;flex-direction:column;gap:2px;font-size:10px!important;
  letter-spacing:.28em;text-transform:uppercase;color:rgba(153,0,0,.75)!important;
}
body.eva-skin .mirage-p02-frag strong{color:var(--eva-crimson-lit,#b30000)!important}

body.eva-skin .mirage-p02-title{
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:800;
  font-size:clamp(2.8rem,9vw,5.6rem);line-height:.78;letter-spacing:.04em;
  color:#0a0a0a!important;transform:scaleY(1.14);
}
body.eva-skin .mirage-p02-sub{
  margin-top:10px;font-family:var(--eva-matisse);font-size:clamp(1rem,2.8vw,1.6rem);
  letter-spacing:.38em;color:var(--eva-crimson-lit,#b30000)!important;
}
body.eva-skin .mirage-p02-desc{
  margin-top:16px;max-width:480px;color:rgba(10,10,10,.58)!important;text-shadow:none!important;
}
body.eva-skin .mirage-p02-script{
  margin-top:14px;font-family:Georgia,serif;font-style:italic;font-size:13px;
  color:rgba(10,10,10,.42);
}

body.eva-skin .mirage-p02-visual{
  margin:0;min-height:100%;overflow:hidden;background:#fff;
}
body.eva-skin .mirage-p02-visual img{
  width:100%;height:100%;min-height:100svh;object-fit:cover;object-position:center 42%;
}

/* 思考页 / 案例：恢复纯白 */
body.eva-skin #mirage .mirage-cases{background:#fff!important;padding:0!important;gap:0!important}
body.eva-skin #mirage .mirage-case{background:#fff!important;border-top:1px solid rgba(10,10,10,.08)!important}
body.eva-skin #mirage .mirage-case:nth-child(even){background:#fff!important}
body.eva-skin #mirage .thought-page{
  background:#fff!important;border:2px solid #0a0a0a!important;
  margin:clamp(40px,6vw,64px) clamp(16px,3vw,40px)!important;
}
body.eva-skin #mirage .thought-page::before{display:none!important}
body.eva-skin #mirage .spec-showcase{background:#fff!important;padding:clamp(48px,6vw,72px) clamp(16px,3vw,40px)!important}

/* 停用旧 mirage-eva01 全页三段 */
body.eva-skin .mirage-eva01{display:none!important}

@media (max-width:980px){
  body.eva-skin .mirage-intro-p02{grid-template-columns:1fr}
  body.eva-skin .mirage-p02-visual img{min-height:clamp(280px,42vh,400px)}
  body.eva-skin .mirage-p02-left{border-right:0;border-bottom:1px solid rgba(10,10,10,.08)}
}
"""


def main():
    t = P.read_text(encoding="utf-8")

    if "mirage-intro-p02" not in t:
        t = INTRO_OLD.sub(INTRO_NEW, t, count=1)

    t = THOUGHT1_OLD.sub(THOUGHT1_NEW, t, count=1)
    t = THOUGHT2_OLD.sub(THOUGHT2_NEW, t, count=1)
    t = THOUGHT3_OLD.sub(THOUGHT3_NEW, t, count=1)

    # 也匹配旧 center-q 无需替换 if already ok

    if "MIRAGE 介绍 · 图二左文右图" in t:
        t = re.sub(r"/\* ═══ MIRAGE 介绍 · 图二[\s\S]*?(?=/\* ═══|</style>)", "", t, count=1)
    if "MIRAGE · EVA 海报页" in t:
        t = re.sub(r"/\* ═══ MIRAGE · EVA 海报页[\s\S]*?(?=/\* ═══ MIRAGE 介绍|</style>)", "", t, count=1)

    if "MIRAGE 介绍 · 图二左文右图" not in t.split("</style>")[0][-8000:]:
        t = t.replace("</style>", CSS + "\n</style>", 1)

    P.write_text(t, encoding="utf-8")
    print("ok", "mirage-intro-p02" in t)


if __name__ == "__main__":
    main()
