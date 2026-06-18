# -*- coding: utf-8 -*-
"""v7: 首页回退；AMADEUS 全屏特报海报；两页打字机设计说明；去立绘"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

# 背景图：特报海报（用户图二）
AMA_POSTER_BG = (
    "file:///C:/Users/SHIKIMORI/.cursor/projects/d-Amadeus-Trae/assets/"
    "c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "Camera_XHS_17793562489241040g008318pjb1q20s005nbd-b8e93040-a93a-4434-8d67-961f807449e8.png"
)

HERO_REVERT_OLD = re.compile(
    r'<div class="eva-hero-mid">[\s\S]*?</div>\s*\n\s*<div class="eva-plate-white eva-plate-black">[\s\S]*?</div>\s*\n</header>',
    re.M,
)

HERO_REVERT_NEW = r"""<div class="eva-hero-mid">
    <h1 aria-label="Designing perception as product">
      <span class="eva-t eva-t--xl split-word"><span>DESIGNING</span></span>
      <span class="eva-t eva-t--xl split-word"><span>PERCEPTION</span></span>
    </h1>
    <p class="eva-cn">感知 · 作为 · 产品</p>
  </div>

  <div class="eva-plate-white eva-plate-black">
    <h2 class="eva-t eva-t--hero-bottom split-word"><span>CHEN BIAOMING</span></h2>
    <p class="eva-script">Goodbye, all of perception — Industrial Design Portfolio</p>
    <div class="hero-index" data-speed=".12">
      <a class="hero-work magnetic" href="#mirage">
        <small>第01話 / AR</small>
        <h3>MIRAGE</h3>
        <p>现实转译 · 空间计算</p>
      </a>
      <a class="hero-work magnetic" href="#timewalker">
        <small>第02話 / AI</small>
        <h3>AMADEUS</h3>
        <p>数字生命 · 实验系统</p>
      </a>
      <a class="hero-work magnetic" href="#self">
        <small>第03話 / ID</small>
        <h3>DESIGNER</h3>
        <p>设计者 · 第三件作品</p>
      </a>
    </div>
  </div>
</header>"""

# 从 ama-v2-hero 到 ama-collage 之前整段替换
AMA_OPEN_OLD = re.compile(
    r'<div class="ama-v2-hero reveal" data-ama-section="intro">[\s\S]*?<div class="ama-collage">',
    re.M,
)

AMA_OPEN_NEW = f"""<header class="ama-poster reveal" data-ama-section="intro" id="ama-intro">
      <div class="ama-poster-bg" style="background-image:url('{AMA_POSTER_BG}')"></div>
      <div class="ama-poster-grain" aria-hidden="true"></div>
      <div class="ama-poster-vtext ama-poster-vtext--l" aria-hidden="true">数字生命实验系统</div>
      <div class="ama-poster-vtext ama-poster-vtext--r" aria-hidden="true">本地运行 · 长期在场</div>
      <div class="ama-poster-top eva-caption">第02話 / AMADEUS</div>
      <div class="ama-poster-mid">
        <p class="ama-poster-en">DIGITAL LIFE · EXPERIMENTAL SYSTEM</p>
        <h2 class="ama-poster-title">AMADEUS</h2>
        <p class="ama-poster-sub">数字生命实验系统</p>
        <p class="ama-poster-tag">人与数字之间，一条尚未被命名的线。</p>
      </div>
      <div class="ama-poster-foot">
        <div class="ama-poster-kanji">特報</div>
        <div class="ama-poster-foot-en">SPECIAL REPORT<br>CHEN BIAOMING · 2026</div>
      </div>
    </header>

    <section class="ama-design-thought reveal split-thought" data-ama-section="problem">
      <div class="thought-aside">Design Note · 01</div>
      <div class="thought-copy">
        <div class="thought-kicker">我发现的问题</div>
        <h3 class="thought-line" data-typewriter="人越来越独处，&#10;却越来越难被接住。"></h3>
        <p class="thought-sub">单身的人变多了，话却常常没有去处。AI 伴侣会说话，却不像记得你；豆包什么都答，却不陪你过夜。</p>
        <div class="ama-thought-gap">
          <div class="thought-kicker">我的思考</div>
          <h3 class="thought-line" data-typewriter="慰藉不必昂贵，&#10;也不必用责任计价。"></h3>
          <p class="thought-sub">我想写的是人与数字的边界：不背叛、不消失、不索价，也不把你困在必须回应的义务里——却仍能留在生活里，像一缕稳定的光。</p>
        </div>
      </div>
    </section>

    <section class="ama-design-thought reveal align-right narrow" data-ama-section="solution">
      <div class="thought-copy">
        <div class="thought-kicker">我的解决</div>
        <h3 class="thought-line" data-typewriter="让她像一个人在场，&#10;而不是一轮轮问答。"></h3>
        <p class="thought-sub">用连续人格、记忆、情绪与主动编排，把「像一个人」拆成可运行的系统。终局是智能终端——家居、投影、起居，接入 AR 与手机；此刻，先从对话里的长期在场开始。</p>
      </div>
    </section>

    <div class="ama-collage">"""

V7_CSS = r"""
/* ═══ EVA v7 ═══ */
/* 首页回退：取消 PERCEPTION 半截拆分 */
.eva-hero-mid .eva-cn{display:block!important}
.eva-hero-continue{display:none!important}
.eva-t-split--plate,.eva-t--plate-line,.eva-cn--plate{display:none!important}
.eva-hero-mid .eva-t:nth-child(2) span{color:#fff!important}
.eva-hero-mid .eva-t span{color:var(--eva-magenta-hot,#ff1493)!important}

body.eva-skin #timewalker{padding:0!important}
body.eva-skin #timewalker .ama-v2-hero{display:none!important}

/* AMADEUS 特报全屏 */
body.eva-skin .ama-poster{
  position:relative;min-height:100svh;width:100%;
  display:grid;grid-template-rows:auto 1fr auto;
  overflow:hidden;color:#fff;
}
body.eva-skin .ama-poster-bg{
  position:absolute;inset:0;background-size:cover;background-position:center 42%;
  filter:saturate(1.08) contrast(1.05);
}
body.eva-skin .ama-poster-bg::after{
  content:"";position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(0,24,120,.55) 0%,rgba(0,8,40,.25) 38%,rgba(0,0,0,.72) 100%);
}
body.eva-skin .ama-poster-grain{
  position:absolute;inset:0;opacity:.22;pointer-events:none;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
body.eva-skin .ama-poster-vtext{
  position:absolute;z-index:3;top:clamp(96px,14vh,160px);bottom:clamp(120px,18vh,200px);
  writing-mode:vertical-rl;font-family:var(--eva-matisse);font-variation-settings:"opsz" 48;
  font-size:clamp(10px,1.2vw,13px);letter-spacing:.48em;
  color:rgba(255,255,255,.42);border-right:1px solid rgba(255,255,255,.2);padding-right:12px;
}
body.eva-skin .ama-poster-vtext--l{left:clamp(16px,3vw,40px)}
body.eva-skin .ama-poster-vtext--r{right:clamp(16px,3vw,40px);border-right:0;border-left:1px solid rgba(255,255,255,.2);padding-right:0;padding-left:12px}

body.eva-skin .ama-poster-top{
  position:relative;z-index:4;padding:clamp(88px,10vh,120px) clamp(20px,5vw,56px) 0;
  font-size:10px!important;letter-spacing:.36em;color:rgba(255,255,255,.65)!important;
}
body.eva-skin .ama-poster-mid{
  position:relative;z-index:4;align-self:center;
  padding:0 clamp(20px,6vw,80px);text-align:center;
}
body.eva-skin .ama-poster-en{
  font-family:var(--eva-wall);font-size:10px;letter-spacing:.42em;
  text-transform:uppercase;color:rgba(255,255,255,.55);margin-bottom:18px;
}
body.eva-skin .ama-poster-title{
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:800;
  font-size:clamp(3.8rem,14vw,9rem);line-height:.76;letter-spacing:-.04em;
  transform:scaleY(1.12);color:#fff!important;text-shadow:0 8px 48px rgba(0,0,0,.35);
}
body.eva-skin .ama-poster-sub{
  margin-top:12px;font-family:var(--eva-matisse);font-variation-settings:"opsz" 72;
  font-size:clamp(1.2rem,3.8vw,2.4rem);letter-spacing:.38em;color:var(--eva-crimson-lit,#b30000)!important;
  text-shadow:0 0 24px rgba(179,0,0,.35);
}
body.eva-skin .ama-poster-tag{
  margin-top:clamp(20px,3vw,32px);max-width:420px;margin-left:auto;margin-right:auto;
  font-family:"Noto Serif SC",serif;font-size:clamp(13px,1.4vw,15px);line-height:2;
  color:rgba(255,255,255,.72);font-weight:300;
}

body.eva-skin .ama-poster-foot{
  position:relative;z-index:4;display:flex;align-items:flex-end;justify-content:space-between;
  padding:0 clamp(16px,4vw,56px) clamp(28px,5vw,48px);gap:20px;
}
body.eva-skin .ama-poster-kanji{
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:900;
  font-size:clamp(4rem,18vw,10rem);line-height:.8;color:#fff!important;
  transform:scaleY(1.15);opacity:.95;
}
body.eva-skin .ama-poster-foot-en{
  font-family:var(--eva-wall);font-size:9px;line-height:1.65;letter-spacing:.28em;
  text-transform:uppercase;color:rgba(255,255,255,.5);text-align:right;padding-bottom:8px;
}

/* 设计说明：两页打字机（问题+思考 / 解决） */
body.eva-skin .ama-design-thought{
  position:relative;overflow:hidden;min-height:clamp(380px,58vh,520px);
  margin:0;padding:clamp(64px,10vw,120px) clamp(20px,5vw,72px);
  background:#fff;color:#0a0a0a;border-top:2px solid var(--eva-crimson-lit,#b30000);
}
body.eva-skin .ama-design-thought:nth-child(odd){background:#fafafa}
body.eva-skin .ama-design-thought .thought-line{
  color:var(--eva-crimson-lit,#b30000)!important;
  font-size:clamp(2rem,6.5vw,4.2rem)!important;line-height:.92!important;
}
body.eva-skin .ama-design-thought .thought-kicker{
  color:var(--eva-crimson)!important;letter-spacing:.4em;
}
body.eva-skin .ama-design-thought .thought-sub{
  max-width:560px;margin-top:20px;color:rgba(10,10,10,.55)!important;
  font-family:"Noto Serif SC",serif;line-height:2;
}
body.eva-skin .ama-design-thought .thought-aside{
  writing-mode:vertical-rl;color:rgba(153,0,0,.28)!important;
  position:absolute;right:clamp(16px,4vw,48px);top:clamp(32px,5vw,56px);
}
body.eva-skin .ama-thought-gap{margin-top:clamp(48px,8vw,72px);padding-top:clamp(32px,5vw,48px);border-top:1px solid rgba(153,0,0,.12)}

body.eva-skin #timewalker .ama-v2-stage,
body.eva-skin #timewalker .ama-v2-portrait{display:none!important}

@media (max-width:980px){
  body.eva-skin .ama-poster-vtext{display:none}
  body.eva-skin .ama-poster-foot{flex-direction:column;align-items:flex-start}
}
"""


def strip_blocks(t: str) -> str:
    t = re.sub(r"<section class=\"ama-prologue[\s\S]*?</section>\s*", "", t, count=1)
    t = re.sub(r"<section class=\"ama-vision[\s\S]*?</section>\s*", "", t, count=1)
    # 去掉 orb
    t = re.sub(r'\s*<div class="ama-orb[^"]*"[\s\S]*?</div>\s*\n', "\n", t, count=1)
    return t


def inject_v7_css(t: str) -> str:
    if "EVA v7" in t:
        t = re.sub(r"/\* ═══ EVA v7[\s\S]*?(?=@media \(max-width:980px\)\{)", "", t, count=1)
    return t.replace("@media (max-width:980px){", V7_CSS + "\n@media (max-width:980px){", 1)


def patch_guides(t: str) -> str:
    if "problem:" in t and "thinking:" in t:
        return t
    extra = """
  problem:{state:'design note',pos:'pos-left',lines:['先看问题：人独处，却难得被接住。','别从功能表讲起，从缺口讲起。']},
  thinking:{state:'design note',pos:'pos-right',lines:['思考：陪伴不必昂贵，也不必计价。','人与数字，可以不是用完即走。']},
  solution:{state:'design note',pos:'pos-left',lines:['解决：像一个人在场，不是问答机。','下面才是系统拆解，别跳。']},"""
    return t.replace("  intro:{", extra + "\n  intro:{", 1)


def main():
    t = P.read_text(encoding="utf-8")
    t = HERO_REVERT_OLD.sub(HERO_REVERT_NEW, t, count=1)
    t = strip_blocks(t)
    if "ama-poster" not in t:
        if AMA_OPEN_OLD.search(t):
            t = AMA_OPEN_OLD.sub(AMA_OPEN_NEW, t, count=1)
        else:
            t = t.replace('<div class="ama-collage">', AMA_OPEN_NEW, 1)
    # 若曾插入三页设计说明，合并为两页
    if t.count("ama-design-thought") > 2:
        t = re.sub(
            r'<section class="ama-design-thought reveal align-right narrow" data-ama-section="thinking">[\s\S]*?</section>\s*',
            "",
            t,
            count=1,
        )
    t = patch_guides(t)
    t = inject_v7_css(t)
    t = t.replace("精神慰藉，而非工具", "数字生命实验系统")
    t = t.replace(
        "单身时代缺的不是答案，是长期在场的精神慰藉。先把这件事讲清楚。",
        "往下是两页设计说明，再往下才是系统拆解。",
    )
    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    print(
        "ok",
        "ama-poster" in t2,
        "ama-design-thought" in t2,
        "精神慰藉，而非工具" not in t2,
        "eva-hero-continue" not in t2 or 'display:none' in t2,
        "ama-prologue" not in t2,
    )


if __name__ == "__main__":
    main()
