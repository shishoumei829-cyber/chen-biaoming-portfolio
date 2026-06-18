# -*- coding: utf-8 -*-
"""v10: 解决/愿景穿插介绍页；MIRAGE 思考页图一风；大标题防尴尬断行"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

# 图一：EVA 1.0 楼梯海报（用户新图）
MIRAGE_POSTER = (
    "file:///C:/Users/SHIKIMORI/.cursor/projects/d-Amadeus-Trae/assets/"
    "c__Users_SHIKIMORI_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_"
    "Camera_1040g3k831f23t4jt66705nqtta5087hojk8anhg-bca444ec-31da-403b-b6cc-8315ba36c5b1.png"
)

REMOVE_SOLVE_VISION = re.compile(
    r'\s*<section class="ama-design-thought ama-dnote ama-dnote--solve[\s\S]*?</section>\s*'
    r'<section class="ama-design-thought ama-dnote ama-dnote--vision[\s\S]*?</section>\s*',
    re.M,
)

# 在 matrix 模块前插入「解决」、在 behavior 前插入「愿景」式间章
INSERT_SOLVE_BEFORE = '<article class="ama-v2-module reveal" data-ama-section="matrix">'
INSERT_SOLVE = r"""
    <section class="ama-chapter-break reveal" data-ama-section="solution">
      <div class="ama-chapter-break__inner">
        <p class="ama-chapter-break__kicker">我的解决</p>
        <h3 class="ama-chapter-break__title" data-typewriter="让她像一个人在场，&#10;而不是一轮轮问答。"></h3>
        <p class="ama-chapter-break__sub">连续人格、分层记忆、情绪矩阵、主动编排——把在场感拆成可运行的系统。</p>
      </div>
    </section>

    """

INSERT_VISION_BEFORE = '<article class="ama-v2-module reveal" data-ama-section="behavior">'
INSERT_VISION = r"""
    <section class="ama-chapter-break ama-chapter-break--vision reveal" data-ama-section="vision">
      <div class="ama-chapter-break__inner">
        <p class="ama-chapter-break__kicker">我的愿景</p>
        <h3 class="ama-chapter-break__title" data-typewriter="从对话里的在场，&#10;走向生活里的在场。"></h3>
        <p class="ama-chapter-break__sub">家居联动、实体投影、起居节律；接入 AR 眼镜与手机。先把长期陪伴做实。</p>
      </div>
    </section>

    """

MIRAGE_THOUGHT_OLD = re.compile(
    r'<section class="thought-page reveal split-thought" data-ghost="如果">[\s\S]*?</section>',
    re.M,
)

MIRAGE_THOUGHT_NEW = f"""<section class="thought-page thought-page--eva10 reveal" data-ghost="如果">
      <div class="thought-eva10-bg" style="background-image:url('{MIRAGE_POSTER}')"></div>
      <div class="thought-eva10-wash" aria-hidden="true"></div>
      <div class="thought-eva10-vtitle" aria-hidden="true">现实转译</div>
      <div class="thought-eva10-rail eva-caption" aria-hidden="true">
        <span>MIRAGE · AR</span><span>PRODUCT CASE</span><span>2026</span>
      </div>
      <div class="thought-copy thought-copy--center">
        <div class="thought-kicker">My Question</div>
        <h3 class="thought-line thought-line--center" data-typewriter="如果世界变了个样子，&#10;你会不会愿意多看它一眼？"></h3>
        <p class="thought-sub thought-sub--center">我想做的不是逃离现实的设备，而是一双让人愿意把目光多停一秒的眼镜。</p>
      </div>
    </section>"""

TITLE_FIXES = {
    "<h3>情绪曲线把内部状态压成可观察信号。</h3>": '<h3 class="ama-v2-h3">情绪曲线：<br>把内部状态压成可观察信号</h3>',
    "<h3>回复前先选择行为倾向。</h3>": '<h3 class="ama-v2-h3">回复之前：<br>先选择行为倾向</h3>',
    "<h3>主动不是定时问候，而是内生目标。</h3>": '<h3 class="ama-v2-h3">主动陪伴：<br>内生目标，而非定时问候</h3>',
    "<h3>每轮先走逻辑、共情、智识。</h3>": '<h3 class="ama-v2-h3">每轮心智：<br>逻辑 → 共情 → 智识</h3>',
    "<h3>人格是一套可执行的档案栈。</h3>": '<h3 class="ama-v2-h3">人格：<br>可执行的档案栈</h3>',
    "<h3>记忆宫殿：按语义分房间检索</h3>": '<h3 class="ama-v2-h3">记忆宫殿：<br>按语义分房间检索</h3>',
    "<h3>她不是单一情绪，而是情绪向量。</h3>": '<h3 class="ama-v2-h3">情绪：<br>向量，而非单一心情</h3>',
    "<h3>最后才展示 UI。</h3>": '<h3 class="ama-v2-h3">产品界面：<br>最后才展示</h3>',
}

V10_CSS = r"""
/* ═══ EVA v10 ═══ */

/* MIRAGE 思考 · 图一高键居中 */
body.eva-skin #mirage .thought-page--eva10{
  position:relative;min-height:clamp(520px,92vh,880px)!important;
  margin:clamp(32px,5vw,56px) clamp(12px,3vw,32px)!important;
  padding:0!important;border:0!important;overflow:hidden;
  display:grid!important;place-items:center!important;
  background:transparent!important;
}
body.eva-skin #mirage .thought-page--eva10 .thought-aside{display:none!important}
body.eva-skin .thought-eva10-bg{
  position:absolute;inset:0;background-size:cover;background-position:center 35%;
  filter:saturate(.95) brightness(1.08);
}
body.eva-skin .thought-eva10-wash{
  position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(255,255,255,.72) 0%,rgba(255,255,255,.55) 45%,rgba(255,255,255,.82) 100%);
}
body.eva-skin .thought-eva10-vtitle{
  position:absolute;z-index:2;left:clamp(56%,50%,62%);top:clamp(12%,10%,18%);
  writing-mode:vertical-rl;
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 72;font-weight:800;
  font-size:clamp(14px,2.2vw,22px);letter-spacing:.42em;
  color:var(--eva-crimson-lit,#b30000)!important;
  text-shadow:0 0 1px #fff;
}
body.eva-skin .thought-eva10-rail{
  position:absolute;z-index:2;right:clamp(12px,3vw,36px);top:clamp(18%,14%,24%);
  bottom:clamp(18%,14%,28%);width:min(140px,22vw);
  display:flex;flex-direction:column;justify-content:flex-start;gap:14px;
  text-align:right;font-size:9px!important;line-height:1.6!important;
  letter-spacing:.28em;color:rgba(10,10,10,.45)!important;
}
body.eva-skin .thought-copy--center{
  position:relative;z-index:3;text-align:center!important;
  max-width:min(720px,88vw)!important;margin:0!important;padding:clamp(48px,8vw,80px)  clamp(24px,8vw,160px)!important;
}
body.eva-skin .thought-line--center{
  font-size:clamp(2rem,7.5vw,4.6rem)!important;
  line-height:.92!important;color:var(--eva-crimson-lit,#b30000)!important;
  text-align:center!important;
}
body.eva-skin .thought-sub--center{
  margin:20px auto 0!important;text-align:center!important;
  color:rgba(10,10,10,.55)!important;max-width:480px!important;
}

/* AMADEUS 间章：穿插介绍页 */
body.eva-skin .ama-chapter-break{
  padding:clamp(72px,12vh,120px) clamp(20px,5vw,56px);
  background:#fff;
  border-top:2px solid var(--eva-crimson-lit,#b30000);
  border-bottom:1px solid rgba(10,10,10,.06);
}
body.eva-skin .ama-chapter-break--vision{background:#fafafa}
body.eva-skin .ama-chapter-break__inner{
  max-width:920px;margin:0 auto;text-align:center;
}
body.eva-skin .ama-chapter-break__kicker{
  font-family:var(--eva-wall);font-size:10px;letter-spacing:.48em;
  text-transform:uppercase;color:var(--eva-crimson,#990000);
  margin-bottom:clamp(20px,4vw,32px);
}
body.eva-skin .ama-chapter-break__title{
  font-family:var(--eva-matisse)!important;font-variation-settings:"opsz" 96!important;
  font-size:clamp(2.2rem,8.5vw,5.4rem)!important;line-height:.88!important;
  color:var(--eva-crimson-lit,#b30000)!important;
  transform:scaleY(1.08);transform-origin:center center;
}
body.eva-skin .ama-chapter-break__sub{
  margin-top:clamp(18px,3vw,28px);max-width:520px;margin-left:auto;margin-right:auto;
  font-family:"Noto Serif SC",serif;font-size:clamp(14px,1.4vw,16px);
  line-height:2;color:rgba(10,10,10,.55);
}

/* 介绍模块大标题：语义断行，避免随机 mid-word 断开 */
body.eva-skin #timewalker .ama-v2-copy-block h3,
body.eva-skin #timewalker .ama-v2-h3{
  font-family:var(--eva-matisse)!important;font-variation-settings:"opsz" 72!important;
  font-size:clamp(1.65rem,4.2vw,2.75rem)!important;
  line-height:1.05!important;
  letter-spacing:-.02em!important;
  color:var(--eva-crimson-lit,#b30000)!important;
  word-break:keep-all;
  overflow-wrap:normal;
  max-width:14em;
}
body.eva-skin #timewalker .ama-v2-module:nth-child(even) .ama-v2-copy-block h3{margin-left:auto;text-align:right}

@media (max-width:980px){
  body.eva-skin .thought-eva10-vtitle{display:none}
  body.eva-skin .thought-eva10-rail{display:none}
  body.eva-skin .thought-copy--center{padding-left:24px!important;padding-right:24px!important}
  body.eva-skin #timewalker .ama-v2-copy-block h3{max-width:none;text-align:left!important}
}
"""


def main():
    t = P.read_text(encoding="utf-8")

    t = REMOVE_SOLVE_VISION.sub("\n", t)

    if "ama-chapter-break" not in t:
        if INSERT_SOLVE_BEFORE in t:
            t = t.replace(INSERT_SOLVE_BEFORE, INSERT_SOLVE + INSERT_SOLVE_BEFORE, 1)
        if INSERT_VISION_BEFORE in t:
            t = t.replace(INSERT_VISION_BEFORE, INSERT_VISION + INSERT_VISION_BEFORE, 1)

    if "thought-page--eva10" not in t:
        t = MIRAGE_THOUGHT_OLD.sub(MIRAGE_THOUGHT_NEW, t, count=1)

    for old, new in TITLE_FIXES.items():
        t = t.replace(old, new)

    if "EVA v10" in t:
        t = re.sub(r"/\* ═══ EVA v10[\s\S]*?(?=</style>)", "", t, count=1)
    t = t.replace("</style>", V10_CSS + "\n</style>", 1)

    # 解决页重复文案清理
    t = t.replace(
        "连续人格、分层记忆、情绪矩阵、主动编排——把「像一个人」拆成可运行的系统。",
        "连续人格、分层记忆、情绪矩阵、主动编排——把在场感拆成可运行的系统。",
    )

    P.write_text(t, encoding="utf-8")
    print(
        "ok",
        "ama-chapter-break" in t,
        "thought-page--eva10" in t,
        "ama-dnote--solve" not in t,
        "EVA v10" in t,
    )


if __name__ == "__main__":
    main()
