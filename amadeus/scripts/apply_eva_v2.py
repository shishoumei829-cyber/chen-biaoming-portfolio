# -*- coding: utf-8 -*-
"""EVA v2: 蓝底海报 + 红黑字卡章节 + Matisse + 小字非红"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

ROOT = """:root{
  --bg:#f0eeea;
  --paper:#f5f3ef;
  --ink:#14121a;
  --muted:#5c5668;
  --soft:#c8c4bc;
  --line:rgba(20,18,26,.14);
  --gold:#9a1828;
  --eva-blue:#0034c8;
  --eva-blue-deep:#001f6e;
  --eva-blue-ghost:#061a52;
  --eva-magenta:#b4365a;
  --eva-red:#9a1828;
  --eva-red-band:#a61c2e;
  --eva-black:#080808;
  --eva-paper:#f4f2ec;
  --eva-ink:#16141c;
  --eva-ink-soft:#5a5468;
  --eva-on-dark:rgba(244,242,238,.78);
  --eva-on-dark-dim:rgba(244,242,238,.48);
  --eva-matisse:"Playfair Display","Noto Serif SC",serif;
  --eva-body:"Noto Serif SC",Georgia,serif;
  --blue:#6eb5d9;
  --rose:#c4919a;
  --black:#080808;
  --ease:cubic-bezier(.16,1,.3,1);
}"""

EVA_CSS = r"""
/* ═══ EVA v2 · 蓝海报 + 红黑字卡 + Matisse ═══ */
.eva-skin{background:var(--eva-paper);color:var(--eva-ink);font-family:var(--eva-body)}
.eva-skin #progress{background:var(--eva-red-band);box-shadow:none;height:2px}
.eva-skin .cursor-dot{background:var(--eva-magenta)}
.eva-skin .cursor-ring{border-color:rgba(180,54,90,.4)}

/* 小字永不走红 */
.eva-caption,.eva-skin .num,.eva-skin .section-desc,.eva-skin .case-lead,.eva-skin .case-list span,
.eva-skin .case-list strong,.eva-skin .thought-sub,.eva-skin .thought-kicker,.eva-skin .thought-aside,
.eva-skin .hero-work small,.eva-skin .hero-work p,.eva-skin .ama-v2-copy-block p,.eva-skin .ama-v2-thesis,
.eva-skin .ama-kicker,.eva-skin .ama-v2-sub,.eva-skin .spec-row,.eva-skin .metric span,.eva-skin footer,
.eva-skin .nav a{color:var(--eva-ink-soft)!important;font-family:var(--eva-body);font-weight:400;text-shadow:none}
.eva-skin .brand{color:var(--eva-magenta)!important;font-family:var(--eva-matisse);font-weight:900;letter-spacing:.14em;font-size:clamp(17px,2vw,24px)}
.eva-skin .nav a::after{background:var(--eva-magenta)}
.eva-skin .nav{mix-blend-mode:normal;background:transparent;border:0;color:var(--eva-ink)}

/* 仅展示级大字用红/品红 */
.eva-display,.eva-skin .section-title,.eva-skin .mirage-head .section-title,.eva-skin .case-copy h3,
.eva-skin .ama-v2-title,.eva-skin .ama-v2-copy-block h3,.eva-skin .self-copy h2,.eva-skin .spec-copy h3,
.eva-skin .thought-line,.eva-skin .hero-work h3,.eva-frag-big,.eva-stack,.eva-matisse-main span,.eva-matisse-cn{
  font-family:var(--eva-matisse);font-weight:900;color:var(--eva-magenta);
}
.eva-skin .case-index{font-family:var(--eva-body);font-style:normal;font-weight:600;letter-spacing:.28em;color:var(--eva-ink-soft)!important}

/* —— 首页：图一蓝底 + 图二三五横条 —— */
.eva-skin .hero.eva-poster{
  min-height:100svh;padding:0;display:block;overflow:hidden;
  background:linear-gradient(168deg,#002db8 0%,#0038d4 42%,#0026a0 100%);
  color:var(--eva-magenta);
}
.eva-skin .hero-bg,.eva-skin .hero-vignette,.eva-skin .hero-grid,.eva-skin .hero-copy,.eva-skin .hero-meta{display:none!important}

.eva-deco--ghost{
  position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;
}
.eva-stack{
  position:absolute;font-family:var(--eva-matisse);font-weight:900;line-height:.82;
  letter-spacing:-.04em;color:var(--eva-blue-ghost);opacity:.55;
  font-size:clamp(3rem,11vw,8rem);text-transform:uppercase;
}
.eva-stack--1{left:-2%;top:8%}
.eva-stack--2{right:4%;top:18%;text-align:right;color:#0a2568;opacity:.7;font-size:clamp(2.2rem,8vw,6rem)}
.eva-stack--3{left:8%;bottom:32%;font-size:clamp(1.8rem,6vw,4.5rem);opacity:.35}

.eva-quote{
  position:absolute;z-index:3;max-width:min(340px,46vw);
  font-size:11px;line-height:1.9;letter-spacing:.03em;
  color:rgba(8,16,48,.72)!important;
}
.eva-quote--tl{top:clamp(84px,11vh,120px);left:clamp(18px,4vw,52px)}

.eva-frag{
  position:absolute;z-index:3;top:clamp(130px,20vh,210px);
  display:grid;gap:2px;font-size:clamp(12px,1.3vw,15px);letter-spacing:.1em;line-height:1.2;
  color:rgba(8,16,48,.8)!important;font-family:var(--eva-body);font-weight:500;
}
.eva-frag--left{left:clamp(18px,4vw,52px)}
.eva-frag--right{right:clamp(18px,4vw,52px);text-align:right}
.eva-frag-big{
  font-size:clamp(26px,4vw,48px);line-height:.88;letter-spacing:-.02em;
  margin-top:6px;color:var(--eva-magenta)!important;
}

.eva-letterbox{
  position:absolute;z-index:2;left:0;right:0;
  top:clamp(150px,24vh,240px);height:clamp(140px,22vh,280px);
  display:grid;grid-template-rows:1fr clamp(52px,8vh,96px) 1fr;
  border-top:1px solid rgba(0,0,0,.65);border-bottom:1px solid rgba(0,0,0,.65);
}
.eva-band{background:var(--eva-red-band)}
.eva-slit{position:relative;overflow:hidden;background:#120008}
.eva-slit::before{
  content:"";position:absolute;inset:-30% -15%;
  background:
    radial-gradient(ellipse 20% 80% at 50% 50%,rgba(200,48,72,.88) 0%,rgba(100,12,28,.9) 40%,transparent 58%),
    radial-gradient(ellipse 8% 22% at 51% 48%,rgba(255,248,248,.95) 0%,transparent 68%),
    #0a0006;
  filter:contrast(1.2) saturate(.85);
}

.eva-hero-center{
  position:absolute;z-index:4;left:clamp(18px,4vw,52px);right:clamp(18px,4vw,52px);
  top:clamp(118px,17vh,180px);
}
.eva-matisse-main{
  font-size:clamp(2.6rem,9.5vw,6.8rem);line-height:.82;letter-spacing:-.03em;
  text-transform:uppercase;
}
.eva-m-line{display:block;overflow:hidden}
.eva-m-line span{display:inline-block;animation:rise 1.1s var(--ease) both;color:var(--eva-magenta)!important}
.eva-m-line:nth-child(2) span{animation-delay:.12s;color:#f0e8ec!important}
.eva-matisse-cn{
  margin-top:10px;font-size:clamp(1.4rem,4.2vw,2.8rem);letter-spacing:.32em;
  color:var(--eva-magenta)!important;
}
.eva-vtext{
  position:absolute;z-index:4;right:clamp(14px,3vw,44px);top:clamp(100px,15vh,170px);
  writing-mode:vertical-rl;font-size:12px;letter-spacing:.38em;
  color:rgba(240,232,236,.42)!important;font-family:var(--eva-matisse);font-weight:700;
  border-right:1px solid rgba(240,232,236,.22);padding-right:10px;
}

.eva-plate-black{
  position:absolute;z-index:5;left:0;right:0;bottom:0;
  background:var(--eva-black);
  padding:clamp(28px,4vw,48px) clamp(18px,4vw,52px) 0;
  border-top:1px solid #000;
}
.eva-script{
  text-align:center;font-family:Georgia,"Times New Roman",serif;font-style:italic;
  font-size:clamp(12px,1.4vw,16px);letter-spacing:.12em;
  color:var(--eva-on-dark-dim)!important;margin-bottom:clamp(20px,3vw,32px);
}
.eva-skin .hero-index{
  position:relative;left:auto;right:auto;bottom:auto;
  border-top:1px solid rgba(255,255,255,.12);
  background:transparent;margin:0 -clamp(18px,4vw,52px);
  width:calc(100% + 2*clamp(18px,4vw,52px));
}
.eva-skin .hero-work{border-right:1px solid rgba(255,255,255,.1);padding:16px clamp(14px,2.5vw,28px) 18px}
.eva-skin .hero-work::after{display:none}
.eva-skin .hero-work h3{color:#f2f0ea!important;font-size:clamp(17px,2vw,24px);letter-spacing:.06em}
.eva-skin .hero-work small,.eva-skin .hero-work p{color:var(--eva-on-dark-dim)!important}

.eva-intertitle{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:18px;
  padding:clamp(36px,6vw,56px) clamp(20px,5vw,72px);
  background:var(--eva-red-band);color:#f8f4f2;
  font-family:var(--eva-matisse);font-weight:900;font-size:clamp(13px,1.8vw,18px);
  letter-spacing:.48em;text-indent:.48em;
}
.eva-intertitle::before,.eva-intertitle::after{
  content:"";height:1px;background:rgba(0,0,0,.35);
}

/* —— MIRAGE：图二/三 红条 + 画幅 + 黑底标题 —— */
.eva-skin #mirage.eva-chapter{
  padding:0;background:var(--eva-paper);color:var(--eva-ink);
}
.eva-skin #mirage.eva-chapter::before{display:none}
.eva-skin #mirage .mirage-head{
  min-height:min(92vh,920px);margin:0;padding:0;
  display:grid;grid-template-rows:minmax(80px,1fr) clamp(100px,18vh,200px) auto;
  text-align:left;place-items:stretch;
}
.eva-skin #mirage .mirage-head>div:nth-of-type(1){
  position:relative;left:auto;top:auto;z-index:3;
  padding:clamp(100px,12vh,140px) clamp(20px,5vw,72px) 20px;
  background:var(--eva-red-band);
}
.eva-skin #mirage .mirage-head .num{color:rgba(8,8,8,.65)!important}
.eva-skin #mirage .mirage-title-art{
  position:relative;grid-row:2;inset:auto;height:100%;min-height:0;
}
.eva-skin #mirage .mirage-title-art img{
  height:100%;object-fit:cover;
  filter:grayscale(1) contrast(1.15) sepia(.35) hue-rotate(-30deg) saturate(1.4);
}
.eva-skin #mirage .mirage-head>div:last-child{
  grid-row:3;background:var(--eva-black);color:var(--eva-on-dark);
  padding:clamp(40px,6vw,72px) clamp(20px,5vw,72px) clamp(60px,8vw,96px);
  place-items:start;text-align:left;width:100%;
}
.eva-skin #mirage .section-title{
  color:#f0ece8!important;font-size:clamp(2.8rem,9vw,6rem);margin-top:12px;
}
.eva-skin #mirage .section-desc{color:var(--eva-on-dark-dim)!important;max-width:640px}
.eva-skin #mirage .mirage-cases{
  margin:0;padding:clamp(60px,8vw,100px) clamp(20px,5vw,72px);
  background:var(--eva-paper);
}
.eva-skin #mirage .case-copy h3{color:var(--eva-red-band)!important}
.eva-skin #mirage .case-lead,.eva-skin #mirage .case-list span{color:var(--eva-ink-soft)!important}
.eva-skin #mirage .case-list strong{color:var(--eva-ink)!important;font-weight:600}
.eva-skin #mirage .case-visual{border:1px solid rgba(20,18,26,.2);box-shadow:10px 10px 0 rgba(154,24,40,.08)}

/* —— 思考页：图四/五 白底 Matisse 字墙 —— */
.eva-skin .thought-page{
  position:relative;
  background:var(--eva-paper)!important;color:var(--eva-ink)!important;
  margin:clamp(40px,6vw,80px) clamp(16px,4vw,48px)!important;
  padding:clamp(56px,9vw,100px) clamp(24px,5vw,64px)!important;
  min-height:min(75vh,700px)!important;
  border:1px solid rgba(20,18,26,.08);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.6);
}
.eva-skin .thought-page::before{
  content:"人類補完計劃 感知 設計 產品 工業 交互 新世紀 特報 使徒 來襲 同步率 記憶 情緒 矩阵 双脑 行为 决策 长期 关系";
  position:absolute;inset:8%;z-index:0;pointer-events:none;
  font-family:var(--eva-matisse);font-size:11px;line-height:1.5;letter-spacing:.12em;
  color:rgba(154,24,40,.06);word-break:break-all;text-align:justify;opacity:1;
  columns:4;column-gap:2em;
}
.eva-skin .thought-page::after{display:none}
.eva-skin .thought-line{
  position:relative;z-index:1;
  font-size:clamp(1.8rem,6.5vw,4.2rem)!important;line-height:1.08!important;
  letter-spacing:.05em;text-align:center;color:var(--eva-red-band)!important;
  text-shadow:none;
}
.eva-skin .thought-copy,.eva-skin .thought-sub,.eva-skin .thought-kicker,.eva-skin .thought-aside{position:relative;z-index:1}
.eva-skin .thought-page.split-thought{grid-template-columns:1fr;place-items:center;text-align:center}
.eva-skin .type-caret::after{background:var(--eva-red-band)}

/* —— AMADEUS：图三 黑底红条 —— */
.eva-skin #timewalker.eva-chapter{
  background:var(--eva-black);color:var(--eva-on-dark);padding-top:0;
}
.eva-skin #timewalker::before{display:none}
.eva-skin .ama-orb{display:none!important}
.eva-skin #timewalker .ama-v2-hero{
  padding-top:clamp(100px,12vh,140px);
  border-bottom:1px solid rgba(255,255,255,.08);
  background:
    linear-gradient(180deg,var(--eva-red-band) 0%,var(--eva-red-band) 6px,transparent 6px),
    var(--eva-black);
}
.eva-skin #timewalker .ama-v2-title{color:#f2f0ea!important}
.eva-skin #timewalker .ama-v2-title em{color:var(--eva-magenta)!important;font-style:italic}
.eva-skin #timewalker .ama-v2-thesis,.eva-skin #timewalker .ama-v2-copy-block p{color:var(--eva-on-dark-dim)!important}
.eva-skin #timewalker .ama-v2-copy-block h3{color:var(--eva-magenta)!important}
.eva-skin #timewalker .ama-v2-sub,.eva-skin #timewalker .ama-kicker{color:var(--eva-on-dark-dim)!important}
.eva-skin #timewalker .ama-v2-focus span{
  border-radius:0;border-color:rgba(180,54,90,.35);color:var(--eva-on-dark-dim)!important;
  background:rgba(255,255,255,.03);font-family:var(--eva-body);
}
.eva-skin #timewalker .ama-v2-ring{border-color:rgba(154,24,40,.25);animation:none}
.eva-skin #timewalker .ama-v2-module{
  border-top:1px solid rgba(255,255,255,.06);
  padding-top:clamp(48px,7vw,80px);
}
.eva-skin .amadeus-case::before{opacity:.06}

/* —— 个人章：图一蓝底变体 —— */
.eva-skin #self.eva-chapter{
  background:linear-gradient(165deg,#002ab0,#0032c2 55%,#002080);
  color:var(--eva-on-dark);padding:clamp(80px,10vw,120px) clamp(20px,5vw,72px);
}
.eva-skin #self .self-copy h2{color:var(--eva-magenta)!important}
.eva-skin #self .self-copy p,.eva-skin #self .metric span{color:var(--eva-on-dark-dim)!important}
.eva-skin #self .metric{
  background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);border-radius:0;
}
.eva-skin #self .metric strong{color:#f0ece8!important}

.eva-skin .section.light{background:var(--eva-paper)}
.eva-skin .spec-copy h3{color:var(--eva-red-band)!important}
.eva-skin .spec-row,.eva-skin .spec-copy .num{color:var(--eva-ink-soft)!important}
.eva-skin .contact-card{background:var(--eva-black);border:1px solid rgba(154,24,40,.35);border-radius:0}
.eva-skin .contact-card a{color:var(--eva-magenta)!important}
.eva-skin footer{background:var(--eva-black);border-top:3px solid var(--eva-red-band);color:var(--eva-on-dark-dim)!important}

"""

NEW_HERO = r"""<header class="hero eva-poster" id="top">
  <div class="hero-bg" hidden></div>
  <div class="hero-vignette" hidden></div>
  <div class="hero-grid" hidden></div>

  <div class="eva-deco eva-deco--ghost" aria-hidden="true">
    <span class="eva-stack eva-stack--1">DES<br>IGN<br>ING</span>
    <span class="eva-stack eva-stack--2">PER<br>CEP<br>TION</span>
    <span class="eva-stack eva-stack--3">PRO<br>DUCT</span>
  </div>

  <p class="eva-quote eva-quote--tl eva-caption">出生，是死亡的开始；活着，是走向死亡的过程；而人生，则是加快奔向死亡的脚步。</p>

  <div class="eva-frag eva-frag--left" aria-hidden="true">
    <span>After that,</span><span>and</span><span class="eva-frag-big">THE END</span>
  </div>
  <div class="eva-frag eva-frag--right" aria-hidden="true">
    <span>NOT,</span><span>and</span><span class="eva-frag-big">ANT</span>
  </div>

  <div class="eva-vtext" aria-hidden="true">感知設計</div>

  <div class="eva-letterbox" aria-hidden="true">
    <div class="eva-band"></div>
    <div class="eva-slit"></div>
    <div class="eva-band"></div>
  </div>

  <div class="eva-hero-center">
    <h1 class="eva-matisse-main" aria-label="Designing perception as product">
      <span class="eva-m-line split-word"><span>DESIGNING</span></span>
      <span class="eva-m-line split-word"><span>PERCEPTION</span></span>
    </h1>
    <p class="eva-matisse-cn">感知 · 作为 · 产品</p>
  </div>

  <div class="eva-plate-black">
    <p class="eva-script">Chen Biaoming — Industrial Design Portfolio</p>
    <div class="hero-index" data-speed=".12">
      <a class="hero-work magnetic" href="#mirage">
        <small>第01話 / AR Glasses</small>
        <h3>MIRAGE</h3>
        <p>以空间计算重构现实感知的 AR 眼镜概念。</p>
      </a>
      <a class="hero-work magnetic" href="#timewalker">
        <small>第02話 / Digital Life</small>
        <h3>AMADEUS</h3>
        <p>本地数字生命：连续记忆、情绪矩阵、双脑架构。</p>
      </a>
      <a class="hero-work magnetic" href="#self">
        <small>第03話 / Personal</small>
        <h3>DESIGNER</h3>
        <p>把设计者本人作为持续迭代的第三件作品。</p>
      </a>
    </div>
  </div>
</header>

<div class="eva-intertitle" aria-hidden="true">作品檔案</div>
"""

NEW_NAV = """<nav class="nav">
  <a class="brand" href="#top">陳彪明</a>
  <ul>
    <li><a href="#mirage">第01話</a></li>
    <li><a href="#timewalker">第02話</a></li>
    <li><a href="#self">第03話</a></li>
  </ul>
</nav>"""


def main():
    text = P.read_text(encoding="utf-8")

    text = re.sub(r":root\{[\s\S]*?--ease:cubic-bezier\([^)]+\);\s*\}", ROOT, text, count=1)

    text = re.sub(
        r"/\* ═══ EVA[\s\S]*?(?=@media \(max-width:980px\))",
        EVA_CSS,
        text,
        count=1,
    )

    text = re.sub(
        r"<header class=\"hero eva-poster\" id=\"top\">[\s\S]*?</header>\s*\n\s*<div class=\"eva-intertitle\"[\s\S]*?</div>",
        NEW_HERO.strip(),
        text,
        count=1,
    )

    text = re.sub(r"<nav class=\"nav\">[\s\S]*?</nav>", NEW_NAV, text, count=1)

    text = text.replace(
        '<section class="section dark" id="mirage">',
        '<section class="section dark eva-chapter" id="mirage">',
    )
    text = text.replace(
        '<section class="section dark timewalker amadeus-case ama-v2" id="timewalker">',
        '<section class="section dark timewalker amadeus-case ama-v2 eva-chapter" id="timewalker">',
    )
    text = re.sub(
        r'<section class="section light" id="self">',
        '<section class="section light eva-chapter" id="self">',
        text,
        count=1,
    )

    # mobile overrides for new hero
    text = re.sub(
        r"  \.eva-vrule,\.eva-crosshair\{display:none\}[\s\S]*?  \.eva-title-plate\{padding-bottom:[^}]+\}\n",
        "  .eva-stack,.eva-vtext{display:none}\n  .eva-frag{display:none}\n  .eva-quote--tl{max-width:88%;font-size:10px}\n  .eva-letterbox{top:clamp(110px,16vh,150px);height:clamp(100px,16vh,140px)}\n  .eva-hero-center{top:96px}\n  .eva-matisse-main{font-size:clamp(2rem,12vw,2.8rem)}\n  .eva-matisse-cn{font-size:clamp(1.1rem,5.5vw,1.6rem)}\n  .eva-plate-black{padding-bottom:0}\n",
        text,
        count=1,
    )
    text = re.sub(
        r"  \.eva-skin \.hero h1\.eva-title\{font-size:clamp\(2\.8rem,14vw,3\.8rem\)\}\n",
        "",
        text,
        count=1,
    )

    P.write_text(text, encoding="utf-8")
    print("ok", "eva-poster--blue" not in text, "eva-stack--1" in text, "eva-chapter" in text)


if __name__ == "__main__":
    main()
