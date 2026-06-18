# -*- coding: utf-8 -*-
"""v11: 大标题恢复上一版+放大；愿景置末；MIRAGE 思考页回退仅居中"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

H3_REVERT = {
    '<h3 class="ama-v2-h3">人格：<br>可执行的档案栈</h3>': "<h3>人格是一套可执行的档案栈。</h3>",
    "<h3 class=\"ama-v2-h3\">记忆宫殿：<br>按语义分房间检索</h3>": "<h3>记忆宫殿：按语义分房间检索</h3>",
    '<h3 class="ama-v2-h3">情绪：<br>向量，而非单一心情</h3>': "<h3>她不是单一情绪，而是情绪向量。</h3>",
    "<h3 class=\"ama-v2-h3\">情绪曲线：<br>把内部状态压成可观察信号</h3>": "<h3>情绪曲线把内部状态压成可观察信号。</h3>",
    '<h3 class="ama-v2-h3">回复之前：<br>先选择行为倾向</h3>': "<h3>回复前先选择行为倾向。</h3>",
    "<h3 class=\"ama-v2-h3\">主动陪伴：<br>内生目标，而非定时问候</h3>": "<h3>主动不是定时问候，而是内生目标。</h3>",
    '<h3 class="ama-v2-h3">每轮心智：<br>逻辑 → 共情 → 智识</h3>': "<h3>每轮先走逻辑、共情、智识。</h3>",
    '<h3 class="ama-v2-h3">产品界面：<br>最后才展示</h3>': "<h3>最后才展示 UI。</h3>",
}

MIRAGE_EVA10 = re.compile(
    r'<section class="thought-page thought-page--eva10[\s\S]*?</section>',
    re.M,
)

MIRAGE_CENTER = r"""<section class="thought-page reveal split-thought thought-page--center-q" data-ghost="如果">
      <div class="thought-aside">Question / Before Concept</div>
      <div class="thought-copy">
        <div class="thought-kicker">My Question</div>
        <h3 class="thought-line" data-typewriter="如果世界变了个样子，&#10;你会不会愿意多看它一眼？"></h3>
        <p class="thought-sub">我想创造的不是逃离现实的设备，而是一双看得见美的眼镜。</p>
      </div>
    </section>"""

VISION_BLOCK = re.compile(
    r'\s*<section class="ama-chapter-break ama-chapter-break--vision[\s\S]*?</section>\s*',
    re.M,
)

VISION_HTML = r"""
    <section class="ama-chapter-break ama-chapter-break--vision reveal" data-ama-section="vision">
      <div class="ama-chapter-break__inner">
        <p class="ama-chapter-break__kicker">我的愿景</p>
        <h3 class="ama-chapter-break__title" data-typewriter="从对话里的在场，&#10;走向生活里的在场。"></h3>
        <p class="ama-chapter-break__sub">家居联动、实体投影、起居节律；接入 AR 眼镜与手机。先把长期陪伴做实。</p>
      </div>
    </section>
"""

V11_CSS = r"""
/* ═══ EVA v11 ═══ */

/* 取消 v10 缩小标题 */
body.eva-skin #timewalker .ama-v2-copy-block h3,
body.eva-skin #timewalker .ama-v2-h3{
  font-size:clamp(42px,6.2vw,96px)!important;
  line-height:.9!important;
  letter-spacing:-.048em!important;
  max-width:none!important;
  word-break:normal!important;
  overflow-wrap:break-word!important;
  text-wrap:balance;
}

/* MIRAGE 第一问：上一版结构 + 仅居中 */
body.eva-skin #mirage .thought-page--center-q{
  display:grid!important;
  grid-template-columns:1fr!important;
  place-items:center!important;
  text-align:center!important;
  min-height:clamp(480px,78vh,760px)!important;
  margin:clamp(40px,6vw,72px) clamp(16px,3vw,40px)!important;
  padding:clamp(64px,10vw,100px) clamp(24px,5vw,56px)!important;
  background:#fff!important;
  border:2px solid #0a0a0a!important;
}
body.eva-skin #mirage .thought-page--center-q .thought-aside{
  writing-mode:horizontal-tb!important;position:static!important;
  margin-bottom:20px;color:rgba(153,0,0,.35)!important;
}
body.eva-skin #mirage .thought-page--center-q .thought-copy{
  margin:0!important;max-width:min(800px,92vw)!important;text-align:center!important;
}
body.eva-skin #mirage .thought-page--center-q .thought-line{
  font-size:clamp(2.4rem,8vw,5.2rem)!important;
  line-height:.9!important;
  color:var(--eva-crimson-lit,#b30000)!important;
  text-align:center!important;
}
body.eva-skin #mirage .thought-page--center-q .thought-sub{
  margin:24px auto 0!important;text-align:center!important;
  max-width:480px!important;
}
body.eva-skin #mirage .thought-page--eva10{display:none!important}

/* 间章标题加大 */
body.eva-skin .ama-chapter-break__title{
  font-size:clamp(2.8rem,10vw,6.8rem)!important;
  line-height:.86!important;
}
"""

def move_vision_last(t: str) -> str:
    m = VISION_BLOCK.search(t)
    if not m:
        block = VISION_HTML.strip()
    else:
        block = m.group(0).strip()
        t = VISION_BLOCK.sub("\n", t, count=1)

    anchor = 'data-ama-section="ui"'
    ui = t.find(anchor)
    if ui < 0:
        return t + block
    # 找到 ama-ui-v2 这一节的闭合 </section>
    close = t.find("</section>", t.find("</div>", ui))
    if close < 0:
        close = t.find("</section>", ui)
    insert_at = close + len("</section>")
    if t.find('data-ama-section="vision"', insert_at, insert_at + 200) < 0:
        t = t[:insert_at] + "\n" + block + "\n" + t[insert_at:]
    return t


def main():
    t = P.read_text(encoding="utf-8")

    for old, new in H3_REVERT.items():
        t = t.replace(old, new)

    if "thought-page--center-q" not in t:
        t = MIRAGE_EVA10.sub(MIRAGE_CENTER, t, count=1)
        if "thought-page--center-q" not in t:
            t = t.replace(
                '<section class="thought-page reveal split-thought" data-ghost="如果">',
                MIRAGE_CENTER.strip(),
                1,
            )

    t = move_vision_last(t)

    if "EVA v11" in t:
        t = re.sub(r"/\* ═══ EVA v11[\s\S]*?(?=</style>)", "", t, count=1)
    t = t.replace("</style>", V11_CSS + "\n</style>", 1)

    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    ui_pos = t2.find('data-ama-section="ui"')
    vis_pos = t2.find('data-ama-section="vision"')
    print("ok", vis_pos > ui_pos, "center-q" in t2, "ama-v2-h3" not in t2)


if __name__ == "__main__":
    main()
