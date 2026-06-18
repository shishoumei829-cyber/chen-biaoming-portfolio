# -*- coding: utf-8 -*-
"""MIRAGE 多页 EVA 海报风：图一白黑白条 + 图二字墙"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

IMG_BAND = (
    "file:///C:/Users/SHIKIMORI/.cursor/projects/c-Users-SHIKIMORI-Desktop/assets/"
    "c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "______4k_2K_202605090012-9adc5211-b328-471d-9ed8-53a94c5476a9.png"
)

HEAD_OLD = re.compile(
    r'<div class="section-head mirage-head[\s\S]*?</div>\s*\n\s*<div class="mirage-cases">',
    re.M,
)

HEAD_NEW = f"""<header class="mirage-eva01 reveal" id="mirage-intro">
      <div class="mirage-eva01-top">
        <p class="mirage-eva01-quote eva-caption">Birth is the beginning of death, death is the continuation of reality, and life is the end of a dream.</p>
        <div class="num mirage-eva01-num">EP.01 / PRODUCT CASE</div>
      </div>
      <div class="mirage-eva01-band">
        <div class="mirage-eva01-moon" aria-hidden="true"></div>
        <figure class="mirage-eva01-figure">
          <img src="{IMG_BAND}" alt="MIRAGE 现实转译后的街景">
        </figure>
      </div>
      <div class="mirage-eva01-foot">
        <div class="mirage-eva01-frag mirage-eva01-frag--l eva-caption"><span>After that,</span><span>and</span><strong>THE END</strong></div>
        <div class="mirage-eva01-frag mirage-eva01-frag--r eva-caption"><span>NOT,</span><span>and</span><strong>ANT</strong></div>
        <h2 class="mirage-eva01-title">MIRAGE</h2>
        <p class="mirage-eva01-subtitle">现实转译器</p>
        <p class="section-desc mirage-eva01-desc">以空间计算与实时渲染，让人重新看见街巷、树影与通勤路上的美——不是逃离现实，而是回到现实。</p>
        <p class="mirage-eva01-script">Goodbye, all of flat screens — hello, translated reality.</p>
      </div>
    </header>

    <div class="mirage-cases">"""

THOUGHT1_OLD = re.compile(
    r'<section class="thought-page reveal split-thought thought-page--center-q"[\s\S]*?</section>',
    re.M,
)

THOUGHT1_NEW = r"""<section class="mirage-eva02 thought-page reveal" data-ghost="如果">
      <div class="mirage-eva02-wall" aria-hidden="true">
        <span class="mw2 mw2--g">如果世界变了个样子</span>
        <span class="mw2">现实转译</span>
        <span class="mw2 mw2--v">你会不会</span>
        <span class="mw2">AR · 空间计算</span>
        <span class="mw2 mw2--g">多看它一眼</span>
        <span class="mw2">MIRAGE</span>
        <span class="mw2 mw2--s">街巷 · 树影 · 通勤路</span>
        <span class="mw2">美学不是滤镜</span>
      </div>
      <div class="mirage-eva02-center">
        <div class="thought-kicker">My Question</div>
        <h3 class="thought-line" data-typewriter="如果世界变了个样子，&#10;你会不会愿意多看它一眼？"></h3>
        <p class="thought-sub">我想创造的不是逃离现实的设备，而是一双看得见美的眼镜。</p>
      </div>
    </section>"""

THOUGHT2_OLD = re.compile(
    r'<section class="thought-page reveal align-right narrow" data-ghost="城市">[\s\S]*?</section>',
    re.M,
)

THOUGHT2_NEW = r"""<section class="mirage-eva02 mirage-eva02--dark thought-page reveal" data-ghost="城市">
      <div class="mirage-eva02-wall mirage-eva02-wall--dense" aria-hidden="true">
        <span class="mw2">城市并不是缺少美</span>
        <span class="mw2 mw2--v">而是我们走得太快</span>
        <span class="mw2">熟悉感 · 噪音 · 屏幕</span>
        <span class="mw2 mw2--g">My Finding</span>
      </div>
      <div class="mirage-eva02-side">
        <div class="thought-kicker">My Finding</div>
        <h3 class="thought-line" data-typewriter="城市并不是缺少美，&#10;而是我们走得太快。"></h3>
        <p class="thought-sub">熟悉感、噪音和屏幕注意力，让很多街景与光影被自动忽略。真实世界的美更安静，需要被提醒、被放大、被重新组织。</p>
      </div>
    </section>"""

THOUGHT3_OLD = re.compile(
    r'<section class="thought-page reveal" data-ghost="AR">[\s\S]*?</section>',
    re.M,
)

THOUGHT3_NEW = r"""<section class="mirage-eva01-bandpage thought-page reveal" data-ghost="AR">
      <div class="mirage-eva01-band mirage-eva01-band--slim">
        <div class="mirage-eva01-moon" aria-hidden="true"></div>
      </div>
      <div class="mirage-eva01-bandpage-copy">
        <div class="thought-kicker">My Vision</div>
        <h3 class="thought-line" data-typewriter="AR 不一定把人带向虚拟，&#10;它也可以把人带回现实。"></h3>
        <p class="thought-sub">用空间计算与实时视觉重构，让世界重新值得观看，同时保留环境风险识别，让美化现实不牺牲安全感。</p>
      </div>
    </section>"""

CSS = r"""
/* ═══ MIRAGE · EVA 海报页 ═══ */
body.eva-skin #mirage.eva-chapter{
  background:#ece8e4!important;
  padding:0!important;
}
body.eva-skin #mirage .mirage-cases{
  background:transparent!important;
  padding:0!important;
  gap:0!important;
}

/* —— 图一：开场白 / 黑条 / 白底标题 —— */
body.eva-skin .mirage-eva01{
  margin:0;display:flex;flex-direction:column;
}
body.eva-skin .mirage-eva01-top{
  position:relative;padding:clamp(88px,11vh,124px) clamp(20px,5vw,56px) clamp(28px,4vw,40px);
  background:#f7f5f0;
  background-image:radial-gradient(circle at 20% 30%,rgba(153,0,0,.04),transparent 40%);
}
body.eva-skin .mirage-eva01-top::before{
  content:"";position:absolute;inset:0;opacity:.07;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80'%3E%3Cellipse cx='40' cy='40' rx='36' ry='24' fill='none' stroke='%23990000' stroke-width='1'/%3E%3C/svg%3E");
  background-size:140px 100px;
}
body.eva-skin .mirage-eva01-quote{
  position:relative;z-index:1;max-width:520px;
  color:rgba(154,74,82,.9)!important;font-size:11px!important;line-height:1.9!important;
}
body.eva-skin .mirage-eva01-num{color:rgba(10,10,10,.45)!important;margin-top:14px}

body.eva-skin .mirage-eva01-band{
  position:relative;height:clamp(200px,32vh,320px);background:#0a0a0a;overflow:hidden;
}
body.eva-skin .mirage-eva01-moon{
  position:absolute;right:18%;top:50%;transform:translateY(-50%);
  width:clamp(140px,28vw,280px);height:clamp(140px,28vw,280px);border-radius:50%;
  background:radial-gradient(circle at 40% 40%,#d40000 0%,#6a0000 55%,#1a0000 100%);
  opacity:.95;
}
body.eva-skin .mirage-eva01-figure{
  position:absolute;inset:0;margin:0;display:flex;align-items:center;justify-content:center;
}
body.eva-skin .mirage-eva01-figure img{
  max-height:92%;max-width:88%;object-fit:contain;
  filter:grayscale(1) contrast(1.2) sepia(1) hue-rotate(-42deg) saturate(4);
  opacity:.88;
}
body.eva-skin .mirage-eva01-band--slim{height:clamp(120px,18vh,180px)}

body.eva-skin .mirage-eva01-foot{
  position:relative;padding:clamp(36px,6vw,56px) clamp(20px,5vw,56px) clamp(48px,7vw,72px);
  background:#f7f5f0;text-align:center;
}
body.eva-skin .mirage-eva01-frag{
  position:absolute;top:clamp(32px,5vw,48px);display:flex;flex-direction:column;gap:3px;
  font-size:10px!important;letter-spacing:.28em;text-transform:uppercase;
  color:rgba(154,74,82,.85)!important;
}
body.eva-skin .mirage-eva01-frag--l{left:clamp(16px,4vw,48px);text-align:left}
body.eva-skin .mirage-eva01-frag--r{right:clamp(16px,4vw,48px);text-align:right}
body.eva-skin .mirage-eva01-frag strong{color:var(--eva-crimson-lit,#b30000)!important}
body.eva-skin .mirage-eva01-title{
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:800;
  font-size:clamp(3.2rem,11vw,7rem);line-height:.78;letter-spacing:.06em;
  color:#0a0a0a!important;transform:scaleY(1.14);margin-top:8px;
}
body.eva-skin .mirage-eva01-subtitle{
  font-family:var(--eva-matisse);font-size:clamp(1.1rem,3vw,1.8rem);
  letter-spacing:.42em;color:var(--eva-crimson-lit,#b30000)!important;margin-top:10px;
}
body.eva-skin .mirage-eva01-desc{
  max-width:560px;margin:20px auto 0;color:rgba(10,10,10,.58)!important;text-shadow:none!important;
}
body.eva-skin .mirage-eva01-script{
  margin-top:18px;font-family:Georgia,serif;font-style:italic;font-size:13px;
  color:rgba(10,10,10,.45);
}

/* —— 图二：字墙 + 居中 / 侧栏 —— */
body.eva-skin .mirage-eva02{
  position:relative;min-height:clamp(520px,88vh,860px);
  margin:0!important;padding:0!important;border:0!important;
  background:#f2f0ec!important;overflow:hidden;
}
body.eva-skin .mirage-eva02--dark{background:#e8e4e0!important}

body.eva-skin .mirage-eva02-wall{
  position:absolute;inset:0;padding:clamp(48px,8vw,88px) clamp(12px,3vw,32px);
  pointer-events:none;z-index:0;
}
body.eva-skin .mw2{
  position:absolute;font-family:var(--eva-matisse);font-weight:800;
  font-variation-settings:"opsz" 96;line-height:.78;
  color:rgba(10,10,10,.08);letter-spacing:-.03em;
  transform:scaleY(1.12);white-space:nowrap;
}
body.eva-skin .mw2--g{font-size:clamp(2.8rem,11vw,6.5rem)}
body.eva-skin .mw2--v{
  writing-mode:vertical-rl;font-size:clamp(1.4rem,4vw,2.8rem);
  color:rgba(153,0,0,.12)!important;
}
body.eva-skin .mw2--s{font-size:clamp(1rem,2.5vw,1.6rem)}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(1){left:5%;top:12%}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(2){right:8%;top:8%;font-size:clamp(3rem,14vw,8rem)}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(3){left:62%;top:22%}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(4){left:4%;top:42%}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(5){right:4%;top:38%}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(6){left:28%;top:55%;font-size:clamp(4rem,16vw,9rem);color:rgba(153,0,0,.1)!important}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(7){right:18%;top:58%}
body.eva-skin .mirage-eva02-wall .mw2:nth-child(8){left:12%;bottom:18%}

body.eva-skin .mirage-eva02-center{
  position:relative;z-index:2;min-height:inherit;
  display:grid;place-items:center;text-align:center;
  padding:clamp(120px,18vh,200px) clamp(24px,6vw,80px) clamp(64px,10vw,100px);
}
body.eva-skin .mirage-eva02-center .thought-line{
  font-size:clamp(2.2rem,7.5vw,4.8rem)!important;line-height:.9!important;
  color:var(--eva-crimson-lit,#b30000)!important;text-align:center!important;
}
body.eva-skin .mirage-eva02-center .thought-sub{
  max-width:480px;margin:22px auto 0!important;text-align:center!important;
  color:rgba(10,10,10,.55)!important;
}
body.eva-skin .mirage-eva02-side{
  position:relative;z-index:2;max-width:min(640px,88vw);
  margin-left:auto;padding:clamp(100px,14vh,160px) clamp(24px,8vw,120px) clamp(64px,8vw,96px);
  text-align:right;
}
body.eva-skin .mirage-eva02-side .thought-line{
  font-size:clamp(2rem,6.5vw,4.2rem)!important;color:var(--eva-crimson-lit,#b30000)!important;
}
body.eva-skin .mirage-eva02-side .thought-sub{color:rgba(10,10,10,.55)!important;margin-top:20px}

body.eva-skin .mirage-eva01-bandpage{
  margin:0!important;padding:0!important;border:0!important;background:#f7f5f0!important;
  display:block!important;min-height:auto!important;
}
body.eva-skin .mirage-eva01-bandpage-copy{
  padding:clamp(48px,8vw,80px) clamp(20px,5vw,56px) clamp(64px,9vw,96px);
  max-width:720px;margin:0 auto;text-align:center;
}
body.eva-skin .mirage-eva01-bandpage .thought-line{
  color:var(--eva-crimson-lit,#b30000)!important;font-size:clamp(2rem,6vw,3.8rem)!important;
}
body.eva-skin .mirage-eva01-bandpage .thought-sub{color:rgba(10,10,10,.55)!important;margin-top:18px}

/* 案例区：浅灰纸，不再纯白 */
body.eva-skin #mirage .mirage-case{
  margin:0!important;padding:clamp(56px,8vw,96px) clamp(20px,5vw,56px)!important;
  background:#f7f5f0!important;transform:none!important;
  border-top:1px solid rgba(153,0,0,.15);
}
body.eva-skin #mirage .mirage-case:nth-child(even){background:#ece8e4!important}
body.eva-skin #mirage .case-copy h3{color:var(--eva-crimson-lit,#b30000)!important}
body.eva-skin #mirage .case-lead{color:rgba(10,10,10,.58)!important}
body.eva-skin #mirage .case-list span{color:rgba(10,10,10,.5)!important}
body.eva-skin #mirage .case-list strong{color:#0048bb!important}
body.eva-skin #mirage .case-visual{box-shadow:12px 14px 0 rgba(153,0,0,.25)!important;border:0!important}

body.eva-skin #mirage .spec-showcase{
  margin:0!important;
  background:linear-gradient(180deg,#0a0a0a 0%,#0a0a0a 42%,#f7f5f0 42%,#f7f5f0 100%)!important;
  padding:0 clamp(16px,4vw,48px) clamp(64px,8vw,88px)!important;
}
body.eva-skin #mirage .spec-copy{color:#0a0a0a!important;padding-top:clamp(40px,6vw,64px)}

@media (max-width:980px){
  body.eva-skin .mirage-eva01-frag{position:static;margin-bottom:12px}
  body.eva-skin .mirage-eva01-foot{padding-top:24px}
  body.eva-skin .mirage-eva02-side{text-align:left;margin-left:0;padding-left:24px;padding-right:24px}
  body.eva-skin .mw2{display:none}
  body.eva-skin .mirage-eva02-center .thought-line{font-size:clamp(1.8rem,9vw,2.6rem)!important}
}
"""


def inject_css(t: str) -> str:
    if "MIRAGE · EVA 海报页" in t:
        t = re.sub(r"/\* ═══ MIRAGE · EVA 海报页[\s\S]*?(?=</style>)", "", t, count=1)
    return t.replace("</style>", CSS + "\n</style>", 1)


def main():
    t = P.read_text(encoding="utf-8")
    if "mirage-eva01" not in t:
        t = HEAD_OLD.sub(HEAD_NEW, t, count=1)
    if "mirage-eva02-center" not in t:
        t = THOUGHT1_OLD.sub(THOUGHT1_NEW, t, count=1)
    if "mirage-eva02-side" not in t:
        t = THOUGHT2_OLD.sub(THOUGHT2_NEW, t, count=1)
    if "mirage-eva01-bandpage" not in t:
        t = THOUGHT3_OLD.sub(THOUGHT3_NEW, t, count=1)
    t = inject_css(t)
    P.write_text(t, encoding="utf-8")
    print("ok", "mirage-eva01" in t, "mirage-eva02" in t)


if __name__ == "__main__":
    main()
