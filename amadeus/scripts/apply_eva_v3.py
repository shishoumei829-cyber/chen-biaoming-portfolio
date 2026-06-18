# -*- coding: utf-8 -*-
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

FONT = '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,800;0,6..96,900;1,6..96,500&family=Noto+Serif+SC:wght@300;400;600;700;900&display=swap" rel="stylesheet">'

ROOT = """:root{
  --bg:#f0eeea;
  --paper:#f5f3ef;
  --ink:#121018;
  --muted:#524e5c;
  --soft:#c8c4bc;
  --line:rgba(18,16,24,.14);
  --gold:#990000;
  --eva-crimson:#990000;
  --eva-crimson-lit:#b30000;
  --eva-blue:#0028b0;
  --eva-blue-mid:#0034c8;
  --eva-blue-ghost:#061850;
  --eva-black:#060606;
  --eva-paper:#f4f2ec;
  --eva-ink:#16141e;
  --eva-ink-soft:#5e5868;
  --eva-on-dark:rgba(244,242,238,.82);
  --eva-on-dark-dim:rgba(244,242,238,.5);
  --eva-matisse:"Bodoni Moda","Noto Serif SC",serif;
  --eva-caption:"Helvetica Neue",Arial,sans-serif;
  --eva-body:"Noto Serif SC",Georgia,serif;
  --blue:#6eb5d9;
  --rose:#c4919a;
  --black:#060606;
  --ease:cubic-bezier(.16,1,.3,1);
}"""

EVA_CSS = r"""
/* ═══ EVA v3 · 多版式字卡 + Bodoni Matisse ═══ */
body.eva-skin{background:var(--eva-paper);color:var(--eva-ink);font-family:var(--eva-body)}
body.eva-skin #progress{background:var(--eva-crimson-lit);height:2px;box-shadow:none}
body.eva-skin .cursor-dot{background:var(--eva-crimson-lit)}

/* Matisse：高、窄、粗细反差 */
.eva-t{
  font-family:var(--eva-matisse);
  font-variation-settings:"opsz" 96;
  font-weight:800;
  letter-spacing:-.05em;
  line-height:.76;
  text-transform:uppercase;
  transform:scaleY(1.1);
  transform-origin:left center;
}
.eva-t--xl{font-size:clamp(3.4rem,12vw,9.2rem)}
.eva-t--lg{font-size:clamp(2rem,5.5vw,4.2rem);letter-spacing:.02em;transform:scaleY(1.06)}
.eva-t--md{font-size:clamp(1.4rem,3.5vw,2.8rem)}
.eva-t--hero-bottom{
  font-size:clamp(2.4rem,8.5vw,6.2rem);
  color:#f2f0ea!important;
  text-align:center;
  transform:scaleY(1.14);
  transform-origin:center center;
}
.eva-cn{
  font-family:var(--eva-matisse);
  font-variation-settings:"opsz" 48;
  font-weight:900;
  letter-spacing:.34em;
  text-transform:none;
  transform:none;
  color:var(--eva-crimson-lit)!important;
}
.eva-caption,.eva-skin .num,.eva-skin .section-desc,.eva-skin .case-lead,.eva-skin .case-list span,
.eva-skin .case-list strong,.eva-skin .thought-sub,.eva-skin .thought-kicker,.eva-skin .thought-aside,
.eva-skin .hero-work small,.eva-skin .hero-work p,.eva-skin .ama-v2-copy-block p,.eva-skin .ama-v2-thesis,
.eva-skin .ama-kicker,.eva-skin .ama-v2-sub,.eva-skin .spec-row,.eva-skin .metric span,
.eva-skin footer,.eva-skin .nav a,.eva-frag,.eva-quote{
  font-family:var(--eva-caption)!important;
  font-weight:400;
  color:var(--eva-ink-soft)!important;
  text-shadow:none;
  transform:none;
  letter-spacing:.06em;
}
.eva-skin .brand{
  font-family:var(--eva-matisse)!important;
  font-variation-settings:"opsz" 48;
  font-weight:800;
  letter-spacing:.12em;
  color:var(--eva-crimson-lit)!important;
  transform:scaleY(1.08);
}
.eva-skin .nav{mix-blend-mode:normal;background:transparent;border:0}
.eva-skin .nav a::after{background:var(--eva-crimson-lit)}

/* 仅展示大字可走红 */
.eva-skin .section-title,.eva-skin .mirage-head .section-title,.eva-skin .case-copy h3,
.eva-skin .ama-v2-title,.eva-skin .ama-v2-copy-block h3,.eva-skin .self-copy h2,
.eva-skin .spec-copy h3,.eva-skin .thought-line,.eva-skin .hero-work h3,.eva-frag-big{
  font-family:var(--eva-matisse);
  font-variation-settings:"opsz" 96;
  font-weight:800;
  letter-spacing:-.04em;
  line-height:.8;
  transform:scaleY(1.1);
  color:var(--eva-crimson-lit)!important;
}
.eva-skin .mirage-head .section-title{color:#f2f0ea!important;transform:scaleY(1.12)}
.eva-skin .ama-v2-title{color:#f2f0ea!important}
.eva-skin .ama-v2-title em{font-style:italic;color:var(--eva-crimson-lit)!important;font-variation-settings:"opsz" 72}
.eva-skin .case-index{color:var(--eva-ink-soft)!important;font-family:var(--eva-caption)!important;transform:none}

/* —— 首页：图一蓝底解构，无红黑条 —— */
body.eva-skin .hero.eva-poster{
  min-height:100svh;padding:0;display:block;overflow:hidden;
  background:linear-gradient(168deg,#001f7a 0%,var(--eva-blue-mid) 45%,#001a66 100%);
}
body.eva-skin .hero-bg,body.eva-skin .hero-vignette,body.eva-skin .hero-grid,
body.eva-skin .hero-copy,body.eva-skin .hero-meta,.eva-letterbox,.eva-scanlines,.eva-crosshair,.eva-frame{display:none!important}

.eva-deco--ghost{position:absolute;inset:0;pointer-events:none;z-index:0}
.eva-stack{
  position:absolute;font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:800;
  line-height:.78;letter-spacing:-.04em;color:var(--eva-blue-ghost);opacity:.5;
  transform:scaleY(1.15);text-transform:uppercase;
}
.eva-stack--1{left:-1%;top:10%;font-size:clamp(3rem,11vw,7.5rem)}
.eva-stack--2{right:2%;top:22%;text-align:right;font-size:clamp(2.4rem,8vw,5.5rem);opacity:.35}
.eva-stack--3{left:10%;bottom:38%;font-size:clamp(1.6rem,5vw,3.2rem);opacity:.22}

.eva-quote{position:absolute;z-index:3;max-width:min(360px,44vw);font-size:10px!important;line-height:1.95!important;color:rgba(0,0,0,.68)!important}
.eva-quote--tl{top:clamp(88px,11vh,124px);left:clamp(18px,4vw,52px)}

.eva-frag{position:absolute;z-index:3;top:clamp(120px,18vh,200px);display:grid;gap:3px;font-size:11px!important;line-height:1.25}
.eva-frag--left{left:clamp(18px,4vw,52px)}
.eva-frag--right{right:clamp(18px,4vw,52px);text-align:right}
.eva-frag-big{
  font-family:var(--eva-matisse)!important;font-size:clamp(24px,3.8vw,44px)!important;
  line-height:.82!important;letter-spacing:-.03em!important;margin-top:8px;
  color:var(--eva-crimson-lit)!important;transform:scaleY(1.12)!important;
}

.eva-vtext{
  position:absolute;z-index:3;right:clamp(14px,3vw,40px);top:clamp(96px,14vh,168px);
  writing-mode:vertical-rl;font-family:var(--eva-matisse);font-variation-settings:"opsz" 48;
  font-size:11px;letter-spacing:.42em;color:rgba(242,240,236,.35)!important;transform:scaleY(1.08);
  border-right:1px solid rgba(242,240,236,.18);padding-right:10px;
}

.eva-hero-mid{
  position:absolute;z-index:4;left:clamp(18px,5vw,64px);right:clamp(18px,5vw,64px);
  top:clamp(108px,16vh,180px);
}
.eva-hero-mid .eva-t span{display:inline-block;animation:rise 1.1s var(--ease) both;color:var(--eva-crimson-lit)!important}
.eva-hero-mid .eva-t:nth-child(2) span{animation-delay:.12s;color:#f0ece8!important}
.eva-hero-mid .eva-cn{margin-top:14px;font-size:clamp(1.3rem,3.8vw,2.6rem)}

.eva-plate-black{
  position:absolute;z-index:5;left:0;right:0;bottom:0;background:var(--eva-black);
  padding:clamp(32px,5vw,56px) 0 0;border-top:1px solid #000;
}
.eva-script{
  text-align:center;font-family:Georgia,serif;font-style:italic;font-size:13px;
  color:var(--eva-on-dark-dim)!important;margin:14px 0 clamp(22px,3vw,36px);transform:none;
}
body.eva-skin .hero-index{
  position:relative;border-top:1px solid rgba(255,255,255,.1);background:transparent;margin:0;
}
body.eva-skin .hero-work{border-right:1px solid rgba(255,255,255,.08);padding:16px 20px 18px}
body.eva-skin .hero-work::after{display:none}
body.eva-skin .hero-work h3{
  color:#f2f0ea!important;font-size:clamp(16px,2vw,22px);transform:scaleY(1.08);
}

.eva-intertitle{
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;
  padding:clamp(32px,5vw,52px) clamp(20px,5vw,72px);
  background:var(--eva-crimson-lit);color:#0a0a0a;
}
.eva-intertitle span{
  font-family:var(--eva-matisse)!important;font-variation-settings:"opsz" 72;
  font-size:clamp(12px,1.6vw,16px)!important;letter-spacing:.55em;text-indent:.55em;
  color:#0a0a0a!important;transform:scaleY(1.1);
}
.eva-intertitle::before,.eva-intertitle::after{content:"";height:1px;background:rgba(0,0,0,.35)}

/* —— 第01話 MIRAGE：图二三五 红场+画幅+黑底标题 —— */
body.eva-skin #mirage.eva-chapter{padding:0;background:var(--eva-paper);color:var(--eva-ink)}
body.eva-skin #mirage::before{display:none}
body.eva-skin #mirage .mirage-head{
  min-height:min(94vh,940px);margin:0;padding:0;
  display:grid;grid-template-rows:minmax(72px,1.15fr) clamp(92px,16vh,180px) auto;
}
body.eva-skin #mirage .mirage-head>div:nth-of-type(1){
  position:relative;inset:auto;left:auto;top:auto;
  padding:clamp(96px,11vh,132px) clamp(20px,5vw,72px) 24px;
  background:var(--eva-crimson-lit);
}
body.eva-skin #mirage .mirage-head .num{color:rgba(0,0,0,.58)!important;font-size:10px!important}
body.eva-skin #mirage .mirage-title-art{position:relative;height:100%;min-height:0;inset:auto}
body.eva-skin #mirage .mirage-title-art img{
  height:100%;object-fit:cover;
  filter:grayscale(1) contrast(1.2) sepia(.25) hue-rotate(-20deg) saturate(1.1);
}
body.eva-skin #mirage .mirage-head>div:last-child{
  background:var(--eva-black);padding:clamp(36px,6vw,68px) clamp(20px,5vw,72px) clamp(56px,7vw,88px);
  text-align:left;place-items:start;
}
body.eva-skin #mirage .section-desc{color:var(--eva-on-dark-dim)!important;max-width:600px;line-height:2}

body.eva-skin #mirage .mirage-cases{margin:0;padding:clamp(20px,4vw,48px) 0 clamp(80px,10vw,120px)}
body.eva-skin #mirage .mirage-case{
  display:block;position:relative;min-height:auto;padding:clamp(48px,8vw,88px) 0;
}
body.eva-skin #mirage .mirage-case .case-visual{
  width:min(82vw,920px);border-radius:0;border:1px solid rgba(0,0,0,.15);
  box-shadow:14px 18px 0 rgba(153,0,0,.1);
}
body.eva-skin #mirage .mirage-case:nth-child(odd) .case-visual{margin-left:clamp(0px,4vw,48px)}
body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{margin-left:auto;margin-right:clamp(0px,4vw,48px)}
body.eva-skin #mirage .mirage-case .case-copy{
  position:relative;max-width:min(460px,88vw);margin-top:clamp(-100px,-12vh,-60px);
  padding:28px 32px 32px;background:var(--eva-paper);z-index:2;
}
body.eva-skin #mirage .mirage-case:nth-child(odd) .case-copy{margin-left:clamp(38vw,48vw,52vw)}
body.eva-skin #mirage .mirage-case:nth-child(even) .case-copy{margin-left:clamp(6vw,10vw,14vw)}
body.eva-skin #mirage .case-copy h3{transform:scaleY(1.08);font-size:clamp(1.6rem,4vw,2.8rem)!important}

/* 思考页：图四/五 白底字墙 */
body.eva-skin .thought-page{
  background:var(--eva-paper)!important;color:var(--eva-ink)!important;
  margin:clamp(32px,5vw,64px) clamp(12px,3vw,40px)!important;
  padding:clamp(48px,8vw,88px) clamp(20px,4vw,56px)!important;
  min-height:min(72vh,680px)!important;border:1px solid rgba(0,0,0,.07);
}
body.eva-skin .thought-page::before{
  content:"人類補完計劃 感知 設計 特報 使徒 同步率 記憶 情緒 矩阵 双脑 行为 决策 长期 关系 新世紀";
  position:absolute;inset:6%;z-index:0;pointer-events:none;
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 48;font-size:10px;line-height:1.45;
  letter-spacing:.1em;color:rgba(153,0,0,.055);columns:5;column-gap:1.8em;text-align:justify;
  word-break:break-all;transform:none;
}
body.eva-skin .thought-page::after{display:none}
body.eva-skin .thought-line{
  position:relative;z-index:1;text-align:center;
  font-size:clamp(1.6rem,5.8vw,3.8rem)!important;line-height:1.02!important;
  transform:scaleY(1.08);transform-origin:center center;
}
body.eva-skin .thought-copy,.eva-skin .thought-sub,.eva-skin .thought-kicker{position:relative;z-index:1;text-align:center}
body.eva-skin .thought-page.split-thought{grid-template-columns:1fr;place-items:center}
body.eva-skin .type-caret::after{background:var(--eva-crimson-lit)}

/* —— 第02話 AMADEUS：图五字墙式错落，打破左右栏 —— */
body.eva-skin #timewalker.eva-chapter{background:var(--eva-paper);color:var(--eva-ink);padding:0}
body.eva-skin #timewalker::before{display:none}
body.eva-skin .ama-orb{display:none!important}

body.eva-skin #timewalker .ama-v2-hero{
  display:block;max-width:none;padding:clamp(100px,12vh,140px) clamp(16px,4vw,48px) clamp(48px,6vw,72px);
  min-height:auto;
  background:var(--eva-crimson-lit);color:#0a0a0a;
}
body.eva-skin #timewalker .ama-v2-copy{max-width:min(720px,92vw)}
body.eva-skin #timewalker .ama-v2-title{color:#f2f0ea!important;transform:scaleY(1.1);font-size:clamp(2.8rem,9vw,5.5rem)!important}
body.eva-skin #timewalker .ama-v2-thesis{color:rgba(0,0,0,.72)!important}
body.eva-skin #timewalker .ama-kicker{color:rgba(0,0,0,.55)!important}
body.eva-skin #timewalker .ama-v2-stage{
  min-height:min(52vh,480px);margin-top:40px;
}
body.eva-skin #timewalker .ama-v2-portrait{filter:grayscale(.15) contrast(1.05)}
body.eva-skin #timewalker .ama-v2-ring{display:none}

body.eva-skin .ama-collage{
  position:relative;padding:clamp(40px,6vw,80px) clamp(10px,2.5vw,32px) clamp(100px,12vw,140px);
  background:var(--eva-paper);overflow:hidden;
}
body.eva-skin .ama-collage::before{
  content:"人類補完計劃";
  position:absolute;right:-2vw;top:60px;
  writing-mode:vertical-rl;
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:800;
  font-size:clamp(4rem,14vw,10rem);letter-spacing:.12em;
  color:rgba(153,0,0,.07);transform:scaleY(1.12);pointer-events:none;z-index:0;
}
body.eva-skin .ama-collage .ama-v2-module{
  position:relative;z-index:1;display:block!important;
  grid-template-columns:1fr!important;max-width:none;
  min-height:auto;padding:clamp(36px,6vw,72px) 0;
  margin:0;
}
body.eva-skin .ama-collage .ama-v2-module.alt .ama-v2-copy-block{order:0}
body.eva-skin .ama-collage .ama-v2-copy-block{
  max-width:min(500px,92vw);margin-bottom:28px;
}
body.eva-skin .ama-collage .ama-v2-module:nth-child(1) .ama-v2-copy-block{margin-left:0}
body.eva-skin .ama-collage .ama-v2-module:nth-child(2) .ama-v2-copy-block{margin-left:clamp(8vw,18vw,220px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(3) .ama-v2-copy-block{margin-left:clamp(2vw,6vw,80px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(4) .ama-v2-copy-block{margin-left:clamp(14vw,26vw,320px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(5) .ama-v2-copy-block{margin-left:clamp(4vw,10vw,120px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(6) .ama-v2-copy-block{margin-left:clamp(20vw,34vw,400px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(7) .ama-v2-copy-block{margin-left:clamp(6vw,12vw,140px)}
body.eva-skin .ama-collage .ama-v2-copy-block h3{
  font-size:clamp(1.5rem,4.2vw,3rem)!important;transform:scaleY(1.1);transform-origin:left center;
}
body.eva-skin .ama-collage .ama-system-card,
body.eva-skin .ama-collage .ama-palace-v2,
body.eva-skin .ama-collage .ama-equation,
body.eva-skin .ama-collage .ama-flow-v2{
  max-width:min(580px,94vw);margin:8px 0 32px;
  border-radius:0;border:1px solid rgba(0,0,0,.12);
  box-shadow:10px 12px 0 rgba(153,0,0,.08);
}
body.eva-skin .ama-collage .ama-v2-module:nth-child(odd) .ama-system-card,
body.eva-skin .ama-collage .ama-v2-module:nth-child(odd) .ama-palace-v2{margin-left:clamp(4vw,14vw,180px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(even) .ama-system-card,
body.eva-skin .ama-collage .ama-v2-module:nth-child(even) .ama-palace-v2{margin-left:clamp(18vw,30vw,360px)}
body.eva-skin .ama-collage .ama-v2-module:nth-child(3) .ama-palace-v2{margin-left:clamp(2vw,8vw,64px);max-width:min(680px,96vw)}
body.eva-skin .ama-ui-v2{padding:clamp(48px,8vw,88px) clamp(12px,3vw,40px);background:var(--eva-black);color:var(--eva-on-dark)}
body.eva-skin .ama-ui-v2 h3{color:#f2f0ea!important}

/* —— 第03話 设计师：图一蓝海报变奏 —— */
body.eva-skin #self.eva-chapter{
  background:linear-gradient(165deg,#001c72,#002db8 50%,#001660);
  color:var(--eva-on-dark);padding:clamp(80px,10vw,120px) clamp(20px,5vw,72px);
}
body.eva-skin #self .self-copy h2{color:#f2f0ea!important;transform:scaleY(1.1)}
body.eva-skin #self .self-copy p,.eva-skin #self .metric span{color:var(--eva-on-dark-dim)!important}
body.eva-skin #self .metric{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:0}
body.eva-skin #self .metric strong{color:#f2f0ea!important;font-family:var(--eva-matisse);transform:scaleY(1.08)}

body.eva-skin .section.light{background:var(--eva-paper)}
body.eva-skin .contact-card{background:var(--eva-black);border:1px solid rgba(153,0,0,.35);border-radius:0}
body.eva-skin .contact-card a{color:var(--eva-crimson-lit)!important}
body.eva-skin footer{background:var(--eva-black);border-top:3px solid var(--eva-crimson-lit);color:var(--eva-on-dark-dim)!important}
body.eva-skin .case-visual{border-radius:0}

"""

HERO = r"""<header class="hero eva-poster" id="top">
  <div class="hero-bg" hidden></div>
  <div class="hero-vignette" hidden></div>
  <div class="hero-grid" hidden></div>

  <div class="eva-deco eva-deco--ghost" aria-hidden="true">
    <span class="eva-stack eva-stack--1">DES<br>IGN<br>ING</span>
    <span class="eva-stack eva-stack--2">PER<br>CEP<br>TION</span>
    <span class="eva-stack eva-stack--3">AS<br>PRO<br>DUCT</span>
  </div>

  <p class="eva-quote eva-quote--tl eva-caption">出生，是死亡的开始；活着，是走向死亡的过程；而人生，则是加快奔向死亡的脚步。</p>

  <div class="eva-frag eva-frag--left" aria-hidden="true">
    <span>After that,</span><span>and</span><span class="eva-frag-big">THE END</span>
  </div>
  <div class="eva-frag eva-frag--right" aria-hidden="true">
    <span>NOT,</span><span>and</span><span class="eva-frag-big">ANT</span>
  </div>

  <div class="eva-vtext" aria-hidden="true">感知設計</div>

  <div class="eva-hero-mid">
    <h1 aria-label="Designing perception as product">
      <span class="eva-t eva-t--xl split-word"><span>DESIGNING</span></span>
      <span class="eva-t eva-t--xl split-word"><span>PERCEPTION</span></span>
    </h1>
    <p class="eva-cn">感知 · 作为 · 产品</p>
  </div>

  <div class="eva-plate-black">
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
        <p>数字生命 · 双脑架构</p>
      </a>
      <a class="hero-work magnetic" href="#self">
        <small>第03話 / ID</small>
        <h3>DESIGNER</h3>
        <p>设计者 · 第三件作品</p>
      </a>
    </div>
  </div>
</header>

<div class="eva-intertitle"><span>作品檔案</span></div>
"""

NAV = """<nav class="nav">
  <a class="brand" href="#top">陳彪明</a>
  <ul>
    <li><a href="#mirage">第01話</a></li>
    <li><a href="#timewalker">第02話</a></li>
    <li><a href="#self">第03話</a></li>
  </ul>
</nav>"""


def main():
    t = P.read_text(encoding="utf-8")

    t = re.sub(r'<link href="https://fonts\.googleapis\.com/css2\?family=[^"]+" rel="stylesheet">', FONT, t, count=1)
    t = re.sub(r":root\{[\s\S]*?--ease:cubic-bezier\([^)]+\);\s*\}", ROOT, t, count=1)

    t = re.sub(r"/\* ═══ EVA[\s\S]*?(?=@media \(max-width:980px\))", EVA_CSS, t, count=1)

    t = re.sub(r"<header class=\"hero[\s\S]*?</header>\s*\n(?:<div class=\"eva-intertitle\"[\s\S]*?</div>\s*\n)?", HERO, t, count=1)

    t = re.sub(r"<nav class=\"nav\">[\s\S]*?</nav>", NAV, t, count=1)

    if 'class="eva-skin"' not in t and 'class="eva-skin"' not in t:
        t = t.replace("<body>", '<body class="eva-skin">')
    if "<body class=\"eva-skin\">" not in t:
        t = re.sub(r"<body[^>]*>", '<body class="eva-skin">', t, count=1)

    t = t.replace('<section class="section dark" id="mirage">', '<section class="section dark eva-chapter" id="mirage">')
    t = t.replace(
        '<section class="section dark timewalker amadeus-case ama-v2" id="timewalker">',
        '<section class="section dark timewalker amadeus-case ama-v2 eva-chapter" id="timewalker">',
    )
    t = re.sub(r'<section class="section light" id="self">', '<section class="section light eva-chapter" id="self">', t, count=1)

    # 包裹 AMADEUS 模块为 collage
    if "ama-collage" not in t:
        t = t.replace(
            '    <article class="ama-v2-module reveal" data-ama-section="soul">',
            '    <div class="ama-collage">\n    <article class="ama-v2-module reveal" data-ama-section="soul">',
            1,
        )
        t = re.sub(
            r"(<article class=\"ama-v2-module[\s\S]*?data-ama-section=\"mind\">[\s\S]*?</article>)\s*\n\s*<section class=\"ama-ui-v2",
            r"\1\n    </div>\n\n    <section class=\"ama-ui-v2",
            t,
            count=1,
        )

    # 去掉 orb
    t = re.sub(r'\s*<div class="ama-orb[\s\S]*?</div>\s*\n', "\n", t, count=1)

    # 清理旧 mobile eva 规则
    t = re.sub(r"  \.eva-vrule[\s\S]*?padding-bottom:[^}]+\}\n", "", t, count=1)
    t = re.sub(r"  \.eva-skin \.hero h1\.eva-title\{[^}]+\}\n", "", t, count=1)

    mobile = """
  .eva-stack,.eva-vtext,.eva-frag{display:none}
  .eva-hero-mid{top:100px}
  .eva-t--xl{font-size:clamp(2.2rem,13vw,3rem)}
  .eva-cn{font-size:clamp(1rem,5vw,1.5rem);letter-spacing:.2em}
  body.eva-skin #mirage .mirage-case .case-copy{margin-left:12px!important;margin-top:20px;max-width:none}
  body.eva-skin #mirage .mirage-case .case-visual{width:100%}
  body.eva-skin .ama-collage .ama-v2-copy-block,
  body.eva-skin .ama-collage .ama-system-card{margin-left:0!important}
"""
    t = t.replace("@media (max-width:980px){", "@media (max-width:980px){" + mobile, 1)

    P.write_text(t, encoding="utf-8")
    print("ok", "Bodoni Moda" in t, "ama-collage" in t, "eva-letterbox" not in t)


if __name__ == "__main__":
    main()
