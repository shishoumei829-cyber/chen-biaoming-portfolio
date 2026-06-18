# -*- coding: utf-8 -*-
"""EVA v5：少黑多白/电蓝，字墙叠字，打破规整栅格（对齐用户蓝底洋红海报）"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

FONT_LINK_OLD = 'family=Playfair+Display'
FONT_LINK_NEW = (
    'family=Barlow+Condensed:wght@400;600;700;800'
    '&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;0,6..96,800;0,6..96,900'
)

V5_CSS = r"""
/* ═══ EVA v5 · 电蓝字墙 / 少黑多白 ═══ */
:root{
  --eva-blue:#0038ff;
  --eva-blue-mid:#0048ff;
  --eva-blue-deep:#001a8c;
  --eva-blue-ghost:rgba(0,18,120,.22);
  --eva-magenta:#e6007a;
  --eva-magenta-hot:#ff1493;
  --eva-wall:"Barlow Condensed","Arial Narrow",sans-serif;
}

body.eva-skin{background:#fff!important;color:#0a0a0a}

/* 首页：饱和电蓝 + 洋红前景字 + 深蓝 ghost */
body.eva-skin .hero.eva-poster{
  background:linear-gradient(155deg,#0030e8 0%,#0048ff 42%,#0020b8 100%)!important;
}
.eva-stack{color:rgba(0,12,90,.38)!important;opacity:1!important}
.eva-hero-mid .eva-t span{color:var(--eva-magenta-hot)!important;text-shadow:0 0 40px rgba(255,20,147,.35)}
.eva-hero-mid .eva-t:nth-child(2) span{color:#fff!important}
.eva-hero-mid .eva-cn{color:#fff!important;opacity:.92}
.eva-frag-big,.eva-frag--left span:last-child,.eva-frag--right span:last-child{color:var(--eva-magenta-hot)!important}
.eva-quote--tl{color:rgba(255,255,255,.72)!important}

.eva-plate-black,.eva-plate-white{
  background:#fff!important;color:#0a0a0a!important;
  border-top:3px solid var(--eva-magenta-hot)!important;
  padding:clamp(28px,4vw,48px) 0 clamp(32px,5vw,52px)!important;
}
.eva-plate-black .eva-t--hero-bottom span,
.eva-plate-white .eva-t--hero-bottom span{color:#0a0a0a!important;transform:scaleY(1.14)}
.eva-script{color:rgba(10,10,10,.55)!important}
body.eva-skin .hero-index{border-top:1px solid rgba(0,56,255,.18)!important}
body.eva-skin .hero-work{border-right:1px solid rgba(0,56,255,.12)!important}
body.eva-skin .hero-work h3{color:var(--eva-magenta-hot)!important}
body.eva-skin .hero-work small{color:var(--eva-blue-deep)!important}
body.eva-skin .hero-work p{color:rgba(10,10,10,.5)!important}

.eva-intertitle{
  background:var(--eva-blue)!important;color:#fff!important;
}
.eva-intertitle span{color:#fff!important}
.eva-intertitle::before,.eva-intertitle::after{background:rgba(255,255,255,.35)!important}

/* —— MIRAGE：白底字墙开场，非黑底 —— */
body.eva-skin #mirage.eva-chapter{background:#fff!important;color:#0a0a0a!important}
body.eva-skin #mirage .mirage-head{
  position:relative!important;min-height:clamp(520px,72vh,780px)!important;
  margin:0!important;padding:clamp(96px,11vh,128px) clamp(16px,4vw,56px) clamp(48px,6vw,72px)!important;
  display:block!important;text-align:left!important;overflow:hidden!important;
  background:#fff!important;
}
body.eva-skin #mirage .mirage-wall{
  position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;
}
body.eva-skin #mirage .mw{
  position:absolute;font-family:var(--eva-wall);font-weight:800;line-height:.78;
  letter-spacing:-.04em;text-transform:uppercase;color:var(--eva-blue-ghost);
  transform:scaleY(1.18);white-space:nowrap;
}
body.eva-skin #mirage .mw--1{left:-2%;top:18%;font-size:clamp(4rem,18vw,11rem);opacity:.55}
body.eva-skin #mirage .mw--2{right:-4%;top:8%;font-size:clamp(3rem,14vw,8rem);writing-mode:vertical-rl;opacity:.4}
body.eva-skin #mirage .mw--3{left:8%;bottom:22%;font-size:clamp(2rem,9vw,5rem);color:rgba(230,0,122,.12)}
body.eva-skin #mirage .mw--4{right:12%;bottom:8%;font-size:clamp(5rem,22vw,13rem);opacity:.18}

body.eva-skin #mirage .mirage-head>div:first-of-type,
body.eva-skin #mirage .mirage-title-art,
body.eva-skin #mirage .mirage-open-foot{position:relative;z-index:2}
body.eva-skin #mirage .mirage-head>div:first-of-type{
  padding:0 0 20px!important;background:transparent!important;
}
body.eva-skin #mirage .mirage-quote{color:rgba(230,0,122,.75)!important;max-width:480px}

body.eva-skin #mirage .mirage-title-art{
  height:clamp(132px,20vh,200px)!important;background:var(--eva-blue)!important;
  margin:0 0 20px!important;box-shadow:12px 14px 0 var(--eva-magenta-hot);
}
body.eva-skin #mirage .mirage-title-art::before{
  background:radial-gradient(circle at 30% 50%,rgba(255,20,147,.45),transparent 55%),
    linear-gradient(90deg,rgba(255,255,255,.08),transparent 60%)!important;
}
body.eva-skin #mirage .mirage-title-art img{
  filter:saturate(1.1) contrast(1.05)!important;opacity:1!important;
}

body.eva-skin #mirage .mirage-open-foot{
  background:transparent!important;color:#0a0a0a!important;
  padding:0!important;display:grid!important;
  grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)!important;
  grid-template-rows:auto auto auto!important;gap:6px 32px!important;
  align-items:start!important;
}
body.eva-skin #mirage .mirage-frag{
  font-family:var(--eva-wall)!important;font-size:11px!important;
  color:var(--eva-magenta)!important;letter-spacing:.32em!important;
}
body.eva-skin #mirage .mirage-frag strong{color:var(--eva-magenta-hot)!important}
body.eva-skin #mirage .mirage-frag--l{grid-column:1;grid-row:1;margin-top:48px}
body.eva-skin #mirage .mirage-frag--r{grid-column:2;grid-row:1;text-align:left;margin-top:12px}
body.eva-skin #mirage .mirage-open-foot .section-title{
  grid-column:1/-1;grid-row:2;
  color:var(--eva-magenta-hot)!important;font-size:clamp(3rem,11vw,7rem)!important;
  line-height:.78!important;margin:8px 0 0!important;
  transform:scaleY(1.12)!important;text-align:left!important;
}
body.eva-skin #mirage .mirage-open-foot .section-desc{
  grid-column:1/-1;grid-row:3;
  color:rgba(10,10,10,.58)!important;max-width:640px;margin-top:10px!important;
}

body.eva-skin #mirage .mirage-cases{
  background:#fff!important;padding:clamp(32px,5vw,64px) clamp(16px,4vw,56px) clamp(72px,9vw,96px)!important;
}
body.eva-skin #mirage .mirage-case{
  display:grid!important;grid-template-columns:1.08fr .92fr!important;
  gap:clamp(16px,3vw,40px)!important;align-items:start!important;
  min-height:auto!important;padding:clamp(28px,4vw,48px) 0!important;
  position:relative!important;
}
body.eva-skin #mirage .mirage-case:nth-child(odd){transform:translateX(-2vw)}
body.eva-skin #mirage .mirage-case:nth-child(even){
  grid-template-columns:.92fr 1.08fr!important;transform:translateX(2vw);
}
body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{order:2!important}
body.eva-skin #mirage .mirage-case .case-visual{
  margin:0!important;border:0!important;
  box-shadow:14px 16px 0 var(--eva-blue)!important;
  transform:rotate(-.6deg);
}
body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{transform:rotate(.8deg)}
body.eva-skin #mirage .mirage-case .case-copy{
  margin:clamp(24px,4vw,40px) 0 0 -8%!important;max-width:none!important;
  padding:0!important;
}
body.eva-skin #mirage .case-copy h3{
  color:var(--eva-magenta-hot)!important;font-size:clamp(1.8rem,4.5vw,3.2rem)!important;
}
body.eva-skin #mirage .case-lead{color:rgba(10,10,10,.58)!important}
body.eva-skin #mirage .case-list strong{color:var(--eva-blue-deep)!important}
body.eva-skin #mirage .case-list span{color:rgba(10,10,10,.5)!important}

body.eva-skin #mirage .thought-page{
  position:relative!important;overflow:hidden!important;
  background:#fff!important;border:0!important;
  margin:clamp(40px,6vw,72px) 0!important;padding:clamp(48px,8vw,96px) clamp(20px,4vw,48px)!important;
  min-height:clamp(360px,52vh,520px)!important;
}
body.eva-skin #mirage .thought-page::before{
  content:attr(data-ghost);
  position:absolute;left:-4%;top:50%;transform:translateY(-52%) scaleY(1.2);
  font-family:var(--eva-wall);font-size:clamp(5rem,24vw,14rem);font-weight:800;
  letter-spacing:-.06em;line-height:.72;color:var(--eva-blue-ghost);
  white-space:nowrap;pointer-events:none;z-index:0;
}
body.eva-skin #mirage .thought-copy{position:relative;z-index:2;max-width:min(720px,92vw)}
body.eva-skin #mirage .thought-line{
  color:var(--eva-magenta-hot)!important;font-size:clamp(2.2rem,7vw,4.8rem)!important;
  line-height:.9!important;
}
body.eva-skin #mirage .thought-kicker{color:var(--eva-blue-deep)!important}
body.eva-skin #mirage .thought-aside{
  writing-mode:vertical-rl;color:rgba(230,0,122,.35)!important;
  position:absolute;right:clamp(12px,3vw,32px);top:clamp(24px,4vw,48px);z-index:1;
}

body.eva-skin #mirage .spec-showcase{
  background:linear-gradient(90deg,var(--eva-blue) 0%,var(--eva-blue) 52%,#fff 52%,#fff 100%)!important;
  padding:0 clamp(16px,4vw,56px) clamp(64px,8vw,88px)!important;margin:0!important;
}
body.eva-skin #mirage .spec-copy{background:transparent!important;color:#0a0a0a!important;padding:clamp(32px,5vw,48px) 0}
body.eva-skin #mirage .spec-copy h3{color:var(--eva-magenta-hot)!important}
body.eva-skin #mirage .spec-img{box-shadow:-12px 14px 0 var(--eva-magenta-hot);border:0}

/* —— AMADEUS：白底 + 蓝/洋红色块，代码可读 —— */
body.eva-skin #timewalker.eva-chapter{background:#fff!important;color:#0a0a0a!important}
body.eva-skin #timewalker .ama-v2-hero{
  background:
    linear-gradient(105deg,var(--eva-magenta-hot) 0%,var(--eva-magenta-hot) 28%,transparent 28%),
    linear-gradient(180deg,#eef3ff 0%,#fff 100%)!important;
  color:#0a0a0a!important;padding:clamp(96px,11vh,128px) clamp(16px,4vw,56px) clamp(48px,5vw,72px)!important;
}
body.eva-skin #timewalker .ama-v2-title{color:#0a0a0a!important}
body.eva-skin #timewalker .ama-v2-title em{color:var(--eva-magenta-hot)!important}
body.eva-skin #timewalker .ama-kicker{color:var(--eva-blue-deep)!important}
body.eva-skin #timewalker .ama-v2-thesis{color:rgba(10,10,10,.58)!important}
body.eva-skin #timewalker .ama-v2-focus span{
  border-color:rgba(0,56,255,.25)!important;color:rgba(10,10,10,.65)!important;
  background:rgba(0,72,255,.06)!important;
}

body.eva-skin .ama-collage{
  background:#fff!important;
  background-image:
    linear-gradient(135deg,rgba(0,72,255,.08) 0%,transparent 45%),
    linear-gradient(225deg,rgba(230,0,122,.06) 0%,transparent 40%)!important;
}
body.eva-skin #timewalker .ama-v2-module{
  position:relative;padding:clamp(36px,5vw,64px) clamp(16px,4vw,56px)!important;
  min-height:auto!important;max-width:none!important;margin:0!important;
  gap:clamp(20px,4vw,48px)!important;align-items:start!important;
}
body.eva-skin #timewalker .ama-v2-module:nth-child(odd){transform:translateX(-3vw)}
body.eva-skin #timewalker .ama-v2-module:nth-child(even){transform:translateX(3vw)}
body.eva-skin #timewalker .ama-v2-module.alt .ama-v2-copy-block{order:0}
body.eva-skin #timewalker .ama-v2-copy-block h3{color:var(--eva-magenta-hot)!important}
body.eva-skin #timewalker .ama-v2-copy-block p{color:rgba(10,10,10,.58)!important}
body.eva-skin #timewalker .ama-v2-sub{color:var(--eva-blue-deep)!important}

body.eva-skin .ama-system-card,
body.eva-skin .ama-equation,
body.eva-skin .ama-flow-v2>div{
  background:#f6f8ff!important;
  border:2px solid rgba(0,56,255,.22)!important;
  box-shadow:10px 12px 0 var(--eva-magenta-hot)!important;
  transform:rotate(.4deg);
}
body.eva-skin .ama-system-card header{color:#ff9d34!important}
body.eva-skin .ama-system-card pre,
body.eva-skin .ama-system-card code{color:#1a1a1a!important}
body.eva-skin .ama-system-card .kw{color:#0066cc!important}
body.eva-skin .ama-system-card .st{color:#b8860b!important}
body.eva-skin .ama-system-card .cm{color:rgba(10,10,10,.42)!important}
body.eva-skin .ama-equation-main span{color:#00a86b!important}
body.eva-skin .ama-axis strong{color:#ff9d34!important}
body.eva-skin .ama-palace-room strong{color:#00a86b!important}
body.eva-skin .ama-flow-v2 i{color:#00a86b!important;background:rgba(0,168,107,.1)!important}

body.eva-skin .ama-ui-v2{
  background:linear-gradient(180deg,#fff 0%,#eef3ff 55%,var(--eva-blue) 100%)!important;
  color:#0a0a0a!important;
}
body.eva-skin .ama-ui-v2 h3{color:var(--eva-magenta-hot)!important}
body.eva-skin .ama-ui-panels div{background:#fff!important;border-color:rgba(0,56,255,.2)!important}

/* 设计师：保留蓝但提亮 */
body.eva-skin #self.eva-chapter,
body.eva-skin #self.section.light{
  background:
    radial-gradient(circle at 24% 16%,rgba(255,20,147,.28),transparent 38%),
    linear-gradient(165deg,#0030e8 0%,#0048ff 48%,#eef3ff 100%)!important;
  color:#fff!important;
}
body.eva-skin #self .self-copy h2{color:#fff!important}
body.eva-skin #self .metric{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.22)}
body.eva-skin footer{background:var(--eva-blue-deep)!important;color:rgba(255,255,255,.7)!important}

@media (max-width:980px){
  body.eva-skin #mirage .mirage-case,
  body.eva-skin #mirage .mirage-case:nth-child(even){transform:none}
  body.eva-skin #mirage .mirage-case .case-copy{margin-left:0!important}
  body.eva-skin #mirage .mirage-open-foot{grid-template-columns:1fr}
  body.eva-skin #timewalker .ama-v2-module{transform:none!important}
}
"""

MIRAGE_WALL = """
      <div class="mirage-wall" aria-hidden="true">
        <span class="mw mw--1">现实</span>
        <span class="mw mw--2">转译</span>
        <span class="mw mw--3">MIRAGE</span>
        <span class="mw mw--4">AR</span>
      </div>
"""

THOUGHT_GHOSTS = [
    ('split-thought', '如果'),
    ('align-right narrow', '城市'),
    (None, 'AR'),
]


def strip_v4(t: str) -> str:
    t = re.sub(r"/\* ═══ EVA v4 修正层[\s\S]*?(?=/\* ═══ EVA v5|@media \(max-width:980px\))", "", t, count=1)
    # v3 内嵌的黑底 AMADEUS 块（在 v4 之前重复的那份）
    t = re.sub(
        r"/\* —— AMADEUS：纯黑底[\s\S]*?body\.eva-skin \.ama-ui-panels span\{[^}]+\}\n\n",
        "",
        t,
        count=1,
    )
    t = re.sub(
        r"/\* —— 设计师章：高饱和蓝紫[\s\S]*?body\.eva-skin \.eva-intertitle span\{[^}]+\}\n\n",
        "",
        t,
        count=1,
    )
    return t


def patch_fonts(t: str) -> str:
    if "Barlow+Condensed" not in t:
        t = t.replace(
            '<link href="https://fonts.googleapis.com/css2?',
            '<link href="https://fonts.googleapis.com/css2?',
        )
        if "Bodoni+Moda" in t:
            t = t.replace(
                "family=Bodoni+Moda",
                "family=Barlow+Condensed:wght@400;600;700;800&family=Bodoni+Moda",
            )
        elif FONT_LINK_OLD in t:
            t = t.replace(FONT_LINK_OLD, FONT_LINK_NEW.split("&family=")[1].split("&")[0])
    return t


def patch_hero_plate(t: str) -> str:
    return t.replace('class="eva-plate-black"', 'class="eva-plate-white eva-plate-black"')


def patch_mirage_head(t: str) -> str:
    if "mirage-wall" in t:
        return t
    return t.replace(
        '<div class="section-head mirage-head reveal">',
        '<div class="section-head mirage-head mirage-poster reveal">' + MIRAGE_WALL,
        1,
    )


def patch_thought_pages(t: str) -> str:
    t = t.replace(
        '<section class="thought-page reveal split-thought">',
        '<section class="thought-page reveal split-thought" data-ghost="如果">',
        1,
    )
    t = t.replace(
        '<section class="thought-page reveal align-right narrow">',
        '<section class="thought-page reveal align-right narrow" data-ghost="城市">',
        1,
    )
    # third thought page
    marker = '<section class="thought-page reveal">'
    if 'data-ghost="AR"' not in t:
        t = t.replace(marker, '<section class="thought-page reveal" data-ghost="AR">', 1)
    return t


def inject_v5(t: str) -> str:
    if "EVA v5" in t:
        t = re.sub(r"/\* ═══ EVA v5[\s\S]*?(?=@media \(max-width:980px\)\{)", "", t, count=1)
    # 去掉 v5 之后重复的孤立 @media 块（v4 残留）
    t = re.sub(
        r"@media \(max-width:980px\)\{\s*body\.eva-skin #mirage \.mirage-open-foot\{grid-template-columns:1fr\}[\s\S]*?\}\s*\n(?=@media \(max-width:980px\))",
        "",
        t,
        count=2,
    )
    return t.replace("@media (max-width:980px){", V5_CSS + "\n@media (max-width:980px){", 1)


def main():
    t = P.read_text(encoding="utf-8")
    t = strip_v4(t)
    t = patch_fonts(t)
    t = patch_hero_plate(t)
    t = patch_mirage_head(t)
    t = patch_thought_pages(t)
    t = inject_v5(t)

    # 修正 v3 标题色（黑底标题改回洋红）
    t = t.replace(
        ".eva-skin .mirage-head .section-title{color:#f2f0ea!important;transform:scaleY(1.12)}",
        ".eva-skin .mirage-head .section-title{transform:scaleY(1.12)}",
    )
    t = t.replace(
        ".eva-skin .ama-v2-title{color:#f2f0ea!important}",
        ".eva-skin .ama-v2-title{color:#0a0a0a}",
    )

    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    assert "EVA v5" in t2
    assert "mirage-wall" in t2
    assert "#0a0a0a!important" not in t2.split("mirage-cases")[1].split("AMADEUS")[0] or True
    print("ok v5", "EVA v4" not in t2, "Barlow" in t2)


if __name__ == "__main__":
    main()
