# -*- coding: utf-8 -*-
"""清理 v3 冲突规则，强化 v4：MIRAGE 海报式介绍、案例栅格、橙绿代码可读"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

# 删除 v3 中会覆盖 v4 的 #mirage / #timewalker 错位与米白纸规则块
V3_MIRAGE_BLOCK = re.compile(
    r"body\.eva-skin #mirage\.eva-chapter\{[\s\S]*?"
    r"body\.eva-skin #mirage \.spec-img\{[^}]+\}\n",
    re.M,
)

V3_AMA_PAPER = re.compile(
    r"body\.eva-skin #timewalker\.eva-chapter\{background:var\(--eva-paper\)[\s\S]*?"
    r"body\.eva-skin \.ama-collage \.ama-v2-module\{[^}]+\}\n",
    re.M,
)

# 全局把 ama 橙绿洗成 eva-red 的规则
AMA_RED_WASH = re.compile(
    r"\.eva-skin \.ama-kicker,\.eva-skin \.ama-v2-sub\{color:var\(--eva-red\)\}\n"
    r"\.eva-skin \.ama-v2-title em\{color:var\(--eva-red\)[^}]+\}\n"
    r"\.eva-skin \.ama-v2-ring\{[^}]+\}\n"
    r"\.eva-skin \.ama-v2-focus span\{[^}]+\}\n",
    re.M,
)

V4_CSS = r"""
/* ═══ EVA v4 修正层 ═══ */
body.eva-skin{background:#fff;color:var(--eva-ink)}

body.eva-skin #mirage.eva-chapter{background:#fff!important;color:#0a0a0a!important;padding:0!important}
body.eva-skin #mirage .mirage-head{
  min-height:auto!important;margin:0 0 clamp(40px,5vw,64px)!important;padding:0!important;
  display:flex!important;flex-direction:column!important;background:#fff!important;
  text-align:left!important;overflow:visible!important;
}
body.eva-skin #mirage .mirage-head>div:first-of-type{
  order:0!important;position:static!important;
  padding:clamp(88px,10vh,120px) clamp(20px,5vw,72px) 12px!important;
  background:#fff!important;
}
body.eva-skin #mirage .mirage-quote{
  color:#9a4a52!important;font-size:11px!important;line-height:1.75!important;
  max-width:520px;margin-bottom:14px;font-family:"Noto Sans SC",sans-serif;
}
body.eva-skin #mirage .mirage-head .num{color:rgba(10,10,10,.5)!important;font-size:10px!important}

body.eva-skin #mirage .mirage-title-art{
  order:1!important;position:relative!important;inset:auto!important;
  width:100%!important;height:clamp(148px,22vh,220px)!important;min-height:0!important;
  margin:0!important;background:#0a0a0a!important;
}
body.eva-skin #mirage .mirage-title-art::before{
  content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(circle at 72% 42%,#b30000 0%,transparent 42%),
    linear-gradient(180deg,rgba(153,0,0,.35) 0%,transparent 38%,transparent 62%,rgba(153,0,0,.28) 100%);
}
body.eva-skin #mirage .mirage-title-art img{
  position:relative;z-index:0;height:100%;width:100%;object-fit:cover;object-position:center 42%;
  filter:grayscale(1) contrast(1.15);opacity:.92;
}

body.eva-skin #mirage .mirage-open-foot{
  order:2!important;position:static!important;
  background:#0a0a0a!important;color:#f2f0ea!important;
  padding:clamp(28px,4vw,44px) clamp(20px,5vw,72px) clamp(40px,5vw,56px)!important;
  display:grid!important;grid-template-columns:1fr 1fr;gap:8px 24px;align-items:end;
  width:100%!important;place-items:start!important;
}
body.eva-skin #mirage .mirage-frag{
  display:flex;flex-direction:column;gap:2px;font-size:10px;letter-spacing:.28em;
  text-transform:uppercase;color:rgba(154,74,82,.85)!important;
}
body.eva-skin #mirage .mirage-frag strong{color:#9a4a52!important;font-weight:700}
body.eva-skin #mirage .mirage-frag--l{grid-column:1}
body.eva-skin #mirage .mirage-frag--r{grid-column:2;text-align:right}
body.eva-skin #mirage .mirage-open-foot .section-title{
  grid-column:1/-1;color:#f2f0ea!important;
  font-size:clamp(2.4rem,7.5vw,4.8rem)!important;margin-top:12px;
  text-shadow:none!important;transform:scaleY(1.08);
}
body.eva-skin #mirage .mirage-open-foot .section-desc{
  grid-column:1/-1;color:rgba(242,240,234,.62)!important;max-width:560px;margin-top:14px;
  text-shadow:none!important;line-height:1.9;
}

body.eva-skin #mirage .mirage-cases{
  margin:0!important;padding:clamp(40px,5vw,72px) clamp(20px,5vw,72px)!important;
  background:#0a0a0a!important;
}
body.eva-skin #mirage .mirage-case{
  display:grid!important;
  grid-template-columns:1.05fr .95fr!important;
  gap:clamp(24px,4vw,56px)!important;
  align-items:center!important;
  min-height:auto!important;padding:clamp(36px,5vw,56px) 0!important;
}
body.eva-skin #mirage .mirage-case:nth-child(even){
  grid-template-columns:.95fr 1.05fr!important;
}
body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{order:2!important}
body.eva-skin #mirage .mirage-case .case-visual{
  width:100%!important;margin:0!important;
  border:1px solid rgba(179,0,0,.45)!important;
  box-shadow:8px 10px 0 rgba(179,0,0,.22)!important;
}
body.eva-skin #mirage .mirage-case .case-copy{
  position:static!important;margin:0!important;max-width:520px!important;
  padding:0!important;background:transparent!important;box-shadow:none!important;
}
body.eva-skin #mirage .case-copy h3{color:#f2f0ea!important}
body.eva-skin #mirage .case-lead{color:rgba(242,240,234,.62)!important}
body.eva-skin #mirage .case-list strong{color:#ff9d34!important}
body.eva-skin #mirage .case-list span{color:rgba(242,240,234,.55)!important}
body.eva-skin #mirage .case-index{color:rgba(242,240,234,.45)!important}

body.eva-skin #mirage .thought-page{
  background:#fff!important;color:#0a0a0a!important;
  margin:clamp(28px,4vw,48px) 0!important;border:2px solid #0a0a0a;
}
body.eva-skin #mirage .thought-line{color:#b30000!important}
body.eva-skin #mirage .spec-showcase{
  margin:0;padding:0 clamp(20px,5vw,72px) clamp(56px,7vw,88px);
  background:linear-gradient(180deg,#b30000 0%,#b30000 46%,#0a0a0a 46%,#0a0a0a 100%);
}
body.eva-skin #mirage .spec-copy{background:#0a0a0a;color:#f2f0ea;padding:clamp(24px,4vw,40px)}
body.eva-skin #mirage .spec-img{border:2px solid #0a0a0a}

body.eva-skin #timewalker.eva-chapter{
  background:#050505!important;color:#f8f3e8!important;padding:0!important;
}
body.eva-skin #timewalker .ama-v2-hero{
  background:linear-gradient(90deg,#b30000 0%,#b30000 36%,#050505 36%),#050505;
  color:#f8f3e8;padding:clamp(96px,11vh,128px) clamp(20px,5vw,72px) clamp(40px,5vw,64px);
  display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,48px);align-items:end;
}
body.eva-skin #timewalker .ama-v2-thesis{color:rgba(248,243,232,.68)!important}
body.eva-skin #timewalker .ama-kicker{color:#ff9d34!important}
body.eva-skin #timewalker .ama-v2-title em{color:#ff9d34!important;text-shadow:none!important}
body.eva-skin #timewalker .ama-v2-focus span{
  border-color:rgba(255,157,52,.35)!important;color:rgba(248,243,232,.72)!important;
  background:rgba(255,157,52,.08)!important;
}

body.eva-skin .ama-collage{
  background:#050505!important;
  background-image:
    linear-gradient(135deg,rgba(179,0,0,.16) 0%,transparent 42%),
    linear-gradient(225deg,rgba(255,157,52,.07) 0%,transparent 38%)!important;
}
body.eva-skin .ama-collage .ama-v2-copy-block h3{color:#f2f0ea!important}
body.eva-skin .ama-collage .ama-v2-copy-block p{color:rgba(248,243,232,.62)!important}
body.eva-skin .ama-collage .ama-v2-sub{color:#ff9d34!important}

body.eva-skin .ama-system-card,
body.eva-skin .ama-equation,
body.eva-skin .ama-flow-v2>div{
  background:linear-gradient(145deg,#141414,#080808)!important;
  border:1px solid rgba(255,140,0,.28)!important;
  box-shadow:10px 12px 0 rgba(179,0,0,.18)!important;
}
body.eva-skin .ama-system-card header{color:#ff9d34!important}
body.eva-skin .ama-system-card pre,
body.eva-skin .ama-system-card code{color:rgba(248,243,232,.9)!important}
body.eva-skin .ama-system-card .kw{color:#73c7ff!important}
body.eva-skin .ama-system-card .st{color:#e7c47f!important}
body.eva-skin .ama-system-card .cm{color:rgba(248,243,232,.45)!important}
body.eva-skin .ama-equation-main span{color:#00ff9f!important}
body.eva-skin .ama-equation-note{color:rgba(248,243,232,.58)!important}
body.eva-skin .ama-axis strong{color:#ff9d34!important}
body.eva-skin .ama-axis span{color:rgba(248,243,232,.62)!important}
body.eva-skin .ama-palace-room strong{color:#00ff9f!important}
body.eva-skin .ama-palace-room span{color:rgba(248,243,232,.58)!important}
body.eva-skin .ama-flow-v2 i{color:#00ff9f!important;background:rgba(0,255,159,.14)!important}
body.eva-skin .ama-flow-v2 span{color:rgba(248,243,232,.65)!important}

body.eva-skin .ama-ui-v2{
  background:linear-gradient(180deg,#050505 0%,#8a0000 55%,#b30000 100%);
  padding:clamp(56px,8vw,88px) clamp(20px,5vw,72px);
}
body.eva-skin .ama-ui-v2 h3{color:#f2f0ea!important}
body.eva-skin .ama-ui-v2>p{color:rgba(248,243,232,.65)!important}
body.eva-skin .ama-ui-panels strong{color:#ff9d34!important}
body.eva-skin .ama-ui-panels span{color:rgba(248,243,232,.6)!important}

body.eva-skin #self.eva-chapter{
  background:
    radial-gradient(circle at 28% 18%,rgba(120,200,255,.4),transparent 42%),
    radial-gradient(circle at 78% 72%,rgba(179,0,0,.5),transparent 46%),
    linear-gradient(165deg,#001a66 0%,#0030b8 52%,#000814 100%)!important;
  color:#f2f0ea!important;
}
body.eva-skin #self .metric{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.16)}

body.eva-skin .eva-intertitle{background:#b30000;color:#0a0a0a}
body.eva-skin .eva-intertitle span{color:#0a0a0a!important}

@media (max-width:980px){
  body.eva-skin #mirage .mirage-open-foot{grid-template-columns:1fr}
  body.eva-skin #mirage .mirage-frag--r{text-align:left}
  body.eva-skin #timewalker .ama-v2-hero{grid-template-columns:1fr}
  body.eva-skin #mirage .mirage-case,
  body.eva-skin #mirage .mirage-case:nth-child(even){grid-template-columns:1fr!important}
  body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{order:0!important}
}
"""


def main():
    t = P.read_text(encoding="utf-8")

    t = V3_MIRAGE_BLOCK.sub("", t)
    t = V3_AMA_PAPER.sub("", t)
    t = AMA_RED_WASH.sub("", t)

    # 单独删残留错位行
    for bad in (
        "body.eva-skin #mirage .mirage-case:nth-child(odd) .case-copy{margin-left:clamp(38vw,48vw,52vw)}",
        "body.eva-skin #mirage .mirage-case:nth-child(even) .case-copy{margin-left:clamp(6vw,10vw,14vw)}",
        "body.eva-skin #mirage .mirage-case:nth-child(odd) .case-visual{margin-left:clamp(0px,4vw,48px)}",
        "body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{margin-left:auto;margin-right:clamp(0px,4vw,48px)}",
        "body.eva-skin #mirage .mirage-case .case-copy{position:relative;z-index:2;max-width:min(420px,88vw);padding:18px 20px;background:rgba(10,10,10,.72);box-shadow:0 18px 60px rgba(0,0,0,.35)}",
        "body.eva-skin #mirage .mirage-case{display:block!important;min-height:auto}",
    ):
        t = t.replace(bad + "\n", "")

    # 替换 v4 块
    t = re.sub(r"/\* ═══ EVA v4 修正层[\s\S]*?(?=@media \(max-width:980px\)\{)", "", t, count=1)
    t = t.replace(
        "@media (max-width:980px){",
        V4_CSS + "\n@media (max-width:980px){",
        1,
    )

    # caption 不作用于代码区
    t = t.replace(
        ".eva-skin .ama-v2-copy-block p,.eva-skin .ama-v2-thesis,\n.eva-skin .ama-kicker,.eva-skin .ama-v2-sub,",
        ".eva-skin .ama-v2-thesis,\n",
    )
    if ".eva-skin .ama-system-card pre" not in t.split("EVA v4")[0][-800:]:
        pass  # v4 已含

    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    assert "38vw" not in t2, "still has misalign"
    assert "mirage-open-foot" in t2
    assert "EVA v4" in t2
    print("ok cleaned", "38vw" in t2)


if __name__ == "__main__":
    main()
