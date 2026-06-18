# -*- coding: utf-8 -*-
"""EVA v4: 修复 MIRAGE 介绍页、恢复案例栅格、代码可见、橙绿强调色、高饱和色块背景"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

PATCH_CSS = r"""
/* ═══ EVA v4 修正层 ═══ */
body.eva-skin{background:#fff;color:var(--eva-ink)}

/* —— MIRAGE 开场：白底海报（图二白版）图文一体 —— */
body.eva-skin #mirage.eva-chapter{background:#fff;color:#0a0a0a}
body.eva-skin #mirage .mirage-head{
  min-height:auto;margin:0 0 clamp(48px,6vw,72px);padding:0;
  display:flex;flex-direction:column;background:#fff;
}
body.eva-skin #mirage .mirage-head>div:nth-of-type(1){
  order:0;padding:clamp(88px,10vh,120px) clamp(20px,5vw,72px) 16px;
  background:#fff;
}
body.eva-skin #mirage .mirage-head .num{
  color:#9a4a52!important;font-size:10px!important;letter-spacing:.32em;
}
body.eva-skin #mirage .mirage-title-art{
  order:1;position:relative;inset:auto;width:100%;height:clamp(148px,22vh,220px);
  margin:0;background:#0a0a0a;
}
body.eva-skin #mirage .mirage-title-art::before{
  content:"";position:absolute;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(circle at 72% 42%,#b30000 0%,transparent 42%),
    linear-gradient(180deg,rgba(153,0,0,.35) 0%,transparent 38%,transparent 62%,rgba(153,0,0,.28) 100%);
}
body.eva-skin #mirage .mirage-title-art img{
  position:relative;z-index:0;height:100%;width:100%;object-fit:cover;object-position:center 42%;
  filter:grayscale(1) contrast(1.15);
  opacity:.92;
}
body.eva-skin #mirage .mirage-head>div:last-child{
  order:2;background:#0a0a0a;color:#f2f0ea;
  padding:clamp(32px,5vw,52px) clamp(20px,5vw,72px) clamp(44px,6vw,64px);
  text-align:left;place-items:start;width:100%;
}
body.eva-skin #mirage .mirage-head .section-title{
  color:#f2f0ea!important;font-size:clamp(2.6rem,8vw,5.2rem)!important;
  margin-top:8px;line-height:.82;
}
body.eva-skin #mirage .section-desc{
  color:rgba(242,240,234,.62)!important;max-width:560px;margin-top:18px;line-height:1.95;
}

/* MIRAGE 案例区：恢复左右栅格，取消错位叠图 */
body.eva-skin #mirage .mirage-cases{
  margin:0;padding:clamp(48px,6vw,80px) clamp(20px,5vw,72px);
  background:#0a0a0a;
}
body.eva-skin #mirage .mirage-case{
  display:grid!important;
  grid-template-columns:1.05fr .95fr!important;
  gap:clamp(24px,4vw,56px)!important;
  align-items:center!important;
  min-height:auto!important;
  padding:clamp(40px,6vw,64px) 0!important;
}
body.eva-skin #mirage .mirage-case:nth-child(even){
  grid-template-columns:.95fr 1.05fr!important;
}
body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{order:2}
body.eva-skin #mirage .mirage-case .case-visual{
  width:100%!important;margin:0!important;
  border:1px solid rgba(179,0,0,.45);
  box-shadow:8px 10px 0 rgba(179,0,0,.22);
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
  margin:clamp(32px,5vw,56px) clamp(16px,3vw,40px)!important;
  border:2px solid #0a0a0a;
}
body.eva-skin #mirage .thought-line{color:#b30000!important}
body.eva-skin #mirage .spec-showcase{
  margin:0;padding:0 clamp(20px,5vw,72px) clamp(64px,8vw,96px);
  background:linear-gradient(180deg,#b30000 0%,#b30000 48%,#0a0a0a 48%,#0a0a0a 100%);
}
body.eva-skin #mirage .spec-copy{background:#0a0a0a;color:#f2f0ea;padding:clamp(28px,4vw,48px)}
body.eva-skin #mirage .spec-img{border:2px solid #0a0a0a}

/* —— AMADEUS：纯黑底 + 橙绿系统色 + 代码可读 —— */
body.eva-skin #timewalker.eva-chapter{
  background:#050505;color:#f8f3e8;padding:0;
}
body.eva-skin #timewalker .ama-v2-hero{
  background:
    linear-gradient(90deg,#b30000 0%,#b30000 38%,#050505 38%),
    #050505;
  color:#f8f3e8;padding:clamp(96px,11vh,128px) clamp(20px,5vw,72px) clamp(40px,5vw,64px);
  display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,48px);align-items:end;
}
body.eva-skin #timewalker .ama-v2-thesis{color:rgba(248,243,232,.68)!important}
body.eva-skin #timewalker .ama-kicker{color:#ff9d34!important}
body.eva-skin #timewalker .ama-v2-title em{color:#ff9d34!important;text-shadow:none}
body.eva-skin #timewalker .ama-v2-focus span{
  border-color:rgba(255,157,52,.35);color:rgba(248,243,232,.72)!important;
  background:rgba(255,157,52,.08);
}

body.eva-skin .ama-collage{
  background:#050505;
  background-image:
    linear-gradient(135deg,rgba(179,0,0,.14) 0%,transparent 42%),
    linear-gradient(225deg,rgba(255,157,52,.06) 0%,transparent 38%);
}
body.eva-skin .ama-collage::before{color:rgba(179,0,0,.09)}
body.eva-skin .ama-collage .ama-v2-copy-block h3{color:#f2f0ea!important}
body.eva-skin .ama-collage .ama-v2-copy-block p,
body.eva-skin .ama-collage .ama-v2-sub{color:rgba(248,243,232,.62)!important}
body.eva-skin .ama-collage .ama-v2-sub{color:#ff9d34!important}

body.eva-skin .ama-system-card,
body.eva-skin .ama-equation,
body.eva-skin .ama-flow-v2>div{
  background:linear-gradient(145deg,rgba(18,18,18,.98),rgba(8,8,8,.98))!important;
  border:1px solid rgba(255,140,0,.22)!important;
  box-shadow:10px 12px 0 rgba(179,0,0,.15)!important;
}
body.eva-skin .ama-system-card header{color:#ff9d34!important}
body.eva-skin .ama-system-card pre,
body.eva-skin .ama-system-card code{color:rgba(248,243,232,.86)!important}
body.eva-skin .ama-system-card .kw{color:#73c7ff!important}
body.eva-skin .ama-system-card .st{color:#e7c47f!important}
body.eva-skin .ama-system-card .cm{color:rgba(248,243,232,.42)!important}
body.eva-skin .ama-equation-main span{color:#00ff9f!important}
body.eva-skin .ama-equation-note{color:rgba(248,243,232,.58)!important}
body.eva-skin .ama-axis strong{color:#ff9d34!important}
body.eva-skin .ama-axis span{color:rgba(248,243,232,.62)!important}
body.eva-skin .ama-palace-room strong{color:#00ff9f!important}
body.eva-skin .ama-palace-room span{color:rgba(248,243,232,.58)!important}
body.eva-skin .ama-flow-v2 i{color:#00ff9f!important;background:rgba(0,255,159,.12)!important}
body.eva-skin .ama-flow-v2 span{color:rgba(248,243,232,.65)!important}

body.eva-skin .ama-ui-v2{
  background:linear-gradient(180deg,#050505 0%,#b30000 100%);
  padding:clamp(56px,8vw,88px) clamp(20px,5vw,72px);
}
body.eva-skin .ama-ui-v2 h3{color:#f2f0ea!important}
body.eva-skin .ama-ui-v2>p{color:rgba(248,243,232,.65)!important}
body.eva-skin .ama-ui-panels strong{color:#ff9d34!important}
body.eva-skin .ama-ui-panels span{color:rgba(248,243,232,.6)!important}

/* —— 设计师章：高饱和蓝紫 + 颗粒 —— */
body.eva-skin #self.eva-chapter{
  background:
    radial-gradient(circle at 30% 20%,rgba(120,200,255,.35),transparent 40%),
    radial-gradient(circle at 80% 70%,rgba(179,0,0,.45),transparent 45%),
    linear-gradient(165deg,#001a66 0%,#0030b8 55%,#000814 100%);
  color:#f2f0ea;
}
body.eva-skin #self .metric{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.16)}

body.eva-skin .eva-intertitle{
  background:#b30000;color:#0a0a0a;
}
body.eva-skin .eva-intertitle span{color:#0a0a0a!important}

@media (max-width:980px){
  body.eva-skin #timewalker .ama-v2-hero{grid-template-columns:1fr}
  body.eva-skin #mirage .mirage-case,
  body.eva-skin #mirage .mirage-case:nth-child(even){grid-template-columns:1fr!important}
  body.eva-skin #mirage .mirage-case:nth-child(even) .case-visual{order:0}
}
"""

MIRAGE_HEAD_OLD = re.compile(
    r'<div class="section-head mirage-head reveal">[\s\S]*?</div>\s*\n\s*<div class="mirage-cases">',
    re.M,
)

MIRAGE_HEAD_NEW = r"""<div class="section-head mirage-head reveal">
      <div>
        <p class="eva-caption mirage-quote">Birth is the beginning of death, death is the continuation of reality, and life is the end of a dream.</p>
        <div class="num">EP.01 / PRODUCT CASE</div>
      </div>
      <figure class="mirage-title-art">
        <img src="file:///C:/Users/SHIKIMORI/.cursor/projects/c-Users-SHIKIMORI-Desktop/assets/c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images______4k_2K_202605090012-9adc5211-b328-471d-9ed8-53a94c5476a9.png" alt="MIRAGE 现实转译后的城市街景">
      </figure>
      <div class="mirage-open-foot">
        <div class="mirage-frag mirage-frag--l eva-caption" aria-hidden="true"><span>After that,</span><span>and</span><strong>THE END</strong></div>
        <div class="mirage-frag mirage-frag--r eva-caption" aria-hidden="true"><span>NOT,</span><span>and</span><strong>ANT</strong></div>
        <h2 class="section-title">MIRAGE<br>现实转译器</h2>
        <p class="section-desc">MIRAGE 是一副以「现实转译」为核心的 AR 眼镜：用空间计算与实时渲染，让人重新看见街巷、树影与通勤路上的美——不是逃离现实，而是回到现实。</p>
      </div>
    </div>

    <div class="mirage-cases">"""


def main():
    t = P.read_text(encoding="utf-8")

    # 插入 v4 层（替换旧 v4 若存在）
    t = re.sub(r"/\* ═══ EVA v4 修正层[\s\S]*?(?=@media \(max-width:980px\)\{)", "", t)
    t = t.replace("@media (max-width:980px){", PATCH_CSS + "\n@media (max-width:980px){")

    if "mirage-open-foot" not in t:
        t = MIRAGE_HEAD_OLD.sub(MIRAGE_HEAD_NEW, t, count=1)

    if 'class="section dark eva-chapter" id="mirage"' not in t:
        t = t.replace(
            '<section class="section dark" id="mirage">',
            '<section class="section dark eva-chapter" id="mirage">',
        )

    # 去掉 orb
    t = re.sub(r'\s*<div class="ama-orb[^"]*"[\s\S]*?</div>\s*\n', "\n", t, count=1)

    # 修正全局 caption 误伤代码区
    t = t.replace(
        ".eva-skin .ama-v2-copy-block p,.eva-skin .ama-v2-thesis,\n.eva-skin .ama-kicker,.eva-skin .ama-v2-sub,",
        ".eva-skin .ama-v2-thesis,\n",
    )

    P.write_text(t, encoding="utf-8")
    print("ok", "EVA v4" in t, "mirage-open-foot" in t)


if __name__ == "__main__":
    main()
