# -*- coding: utf-8 -*-
"""v8: 设计说明竖横混排；解决页中心大字；介绍模块非对称；PAD 文字可读"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

PAGE1_OLD = re.compile(
    r'<section class="ama-design-thought reveal split-thought" data-ama-section="problem">[\s\S]*?</section>\s*'
    r'<section class="ama-design-thought reveal align-right narrow" data-ama-section="solution">[\s\S]*?</section>',
    re.M,
)

PAGE1_NEW = r"""<section class="ama-design-thought ama-dnote ama-dnote--p1 reveal" data-ama-section="problem">
      <div class="ama-dnote-vrule ama-dnote-vrule--l" aria-hidden="true">問題</div>
      <div class="ama-dnote-vrule ama-dnote-vrule--r" aria-hidden="true">思考</div>
      <div class="ama-dnote-body">
        <div class="ama-dnote-row ama-dnote-row--problem">
          <p class="ama-dnote-h">我发现的问题</p>
          <h3 class="thought-line ama-dnote-line" data-typewriter="人越来越独处，&#10;却越来越难被接住。"></h3>
          <p class="thought-sub ama-dnote-sub">话多了去处，却少了被记住的温度。伴侣会应答，豆包会解惑，夜里仍像对着空房间说话。</p>
        </div>
        <div class="ama-dnote-row ama-dnote-row--think">
          <p class="ama-dnote-h ama-dnote-h--vr">我的思考</p>
          <h3 class="thought-line ama-dnote-line ama-dnote-line--offset" data-typewriter="慰藉不必昂贵，&#10;也不必用责任计价。"></h3>
          <p class="thought-sub ama-dnote-sub">人与数字之间，可以不必背叛、不必消失、不必索价，也不把你困在必须回应的义务里——像一缕稳定的光。</p>
        </div>
      </div>
    </section>

    <section class="ama-design-thought ama-dnote ama-dnote--solve reveal" data-ama-section="solution">
      <div class="ama-dnote-center">
        <p class="ama-dnote-h ama-dnote-h--center">我的解决</p>
        <h3 class="thought-line ama-dnote-hero-line" data-typewriter="让她像一个人在场，&#10;而不是一轮轮问答。"></h3>
        <p class="thought-sub ama-dnote-sub ama-dnote-sub--center">连续人格、分层记忆、情绪矩阵、主动编排——把「像一个人」拆成可运行的系统。</p>
      </div>
    </section>

    <section class="ama-design-thought ama-dnote ama-dnote--vision reveal" data-ama-section="vision">
      <div class="ama-dnote-vtext ama-dnote-vtext--solo" aria-hidden="true">终端愿景</div>
      <div class="ama-dnote-center ama-dnote-center--wide">
        <h3 class="ama-dnote-big">智能终端</h3>
        <p class="thought-sub ama-dnote-sub ama-dnote-sub--center">家居 · 投影 · 起居 · AR 眼镜 · 手机——数字生命进入生活动线。此刻，先从对话里的长期在场开始。</p>
      </div>
    </section>"""

V8_CSS = r"""
/* ═══ EVA v8 · 设计说明排版 + PAD 可读 ═══ */

body.eva-skin .ama-design-thought{
  margin:0!important;padding:0!important;min-height:auto!important;
  border-top:0!important;background:#fff!important;
}
body.eva-skin .ama-design-thought .thought-aside{display:none!important}

/* 第1页：竖排+横排，故意失衡 */
body.eva-skin .ama-dnote--p1{
  position:relative;min-height:clamp(520px,88vh,920px)!important;
  padding:clamp(72px,10vh,120px) clamp(16px,4vw,48px) clamp(56px,8vw,88px)!important;
  overflow:hidden;
  background:
    linear-gradient(90deg,rgba(153,0,0,.06) 0%,transparent 28%),
    #fff!important;
}
body.eva-skin .ama-dnote-vrule{
  position:absolute;top:clamp(64px,9vh,100px);bottom:clamp(48px,8vh,80px);
  writing-mode:vertical-rl;
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 72;font-weight:800;
  font-size:clamp(11px,1.4vw,14px);letter-spacing:.55em;
  color:rgba(153,0,0,.22);z-index:1;
}
body.eva-skin .ama-dnote-vrule--l{left:clamp(8px,2vw,24px)}
body.eva-skin .ama-dnote-vrule--r{right:clamp(8px,2vw,24px)}

body.eva-skin .ama-dnote-body{
  position:relative;z-index:2;max-width:1100px;margin:0 auto;
  display:block;
}
body.eva-skin .ama-dnote-row--problem{
  padding:0 clamp(48px,12vw,160px) clamp(80px,14vh,140px) clamp(24px,6vw,80px);
  text-align:left;
}
body.eva-skin .ama-dnote-row--think{
  margin-left:auto;width:min(92%,720px);
  padding:0 clamp(20px,5vw,48px) 0 clamp(80px,14vw,200px);
  text-align:right;
  border-top:1px solid rgba(153,0,0,.14);
  padding-top:clamp(40px,7vw,72px);
}
body.eva-skin .ama-dnote-h{
  font-family:var(--eva-wall);font-size:10px;letter-spacing:.42em;
  text-transform:uppercase;color:var(--eva-crimson,#990000)!important;
  margin-bottom:clamp(16px,3vw,28px);
}
body.eva-skin .ama-dnote-h--vr{
  writing-mode:vertical-rl;float:right;margin:0 0 0 20px;
  letter-spacing:.5em;color:rgba(153,0,0,.45)!important;
}
body.eva-skin .ama-dnote-line{
  font-family:var(--eva-matisse)!important;font-variation-settings:"opsz" 96!important;
  font-size:clamp(2.4rem,8vw,5.6rem)!important;line-height:.82!important;
  color:var(--eva-crimson-lit,#b30000)!important;text-align:inherit!important;
  max-width:none!important;
}
body.eva-skin .ama-dnote-line--offset{margin-right:-.08em}
body.eva-skin .ama-dnote-sub{
  margin-top:clamp(18px,3vw,28px)!important;max-width:min(480px,88vw)!important;
  font-family:"Noto Serif SC",serif!important;font-size:clamp(13px,1.35vw,16px)!important;
  line-height:2!important;color:rgba(10,10,10,.58)!important;
}
body.eva-skin .ama-dnote-row--think .ama-dnote-sub{margin-left:auto}

/* 第2页：解决 · 中心大字 */
body.eva-skin .ama-dnote--solve{
  min-height:clamp(480px,78vh,820px)!important;
  display:grid!important;place-items:center!important;
  padding:clamp(80px,12vh,140px) clamp(20px,5vw,56px)!important;
  background:
    radial-gradient(circle at 50% 42%,rgba(0,72,255,.08),transparent 55%),
    #fafafa!important;
  border-top:3px solid var(--eva-crimson-lit,#b30000)!important;
}
body.eva-skin .ama-dnote-center{
  text-align:center;max-width:min(920px,94vw);width:100%;
}
body.eva-skin .ama-dnote-h--center{letter-spacing:.55em;margin-bottom:clamp(20px,4vw,36px)}
body.eva-skin .ama-dnote-hero-line{
  font-size:clamp(2.8rem,11vw,7.2rem)!important;
  line-height:.78!important;
  color:var(--eva-crimson-lit,#b30000)!important;
  transform:scaleY(1.1);transform-origin:center center;
}
body.eva-skin .ama-dnote-sub--center{
  margin-left:auto!important;margin-right:auto!important;
  max-width:520px!important;
}

/* 第2页续：愿景横条 */
body.eva-skin .ama-dnote--vision{
  min-height:clamp(320px,48vh,480px)!important;
  position:relative;
  display:grid!important;place-items:center!important;
  padding:clamp(56px,8vw,96px) clamp(20px,5vw,56px)!important;
  background:linear-gradient(180deg,#001a8c 0%,#0038ff 100%)!important;
  color:#fff!important;
}
body.eva-skin .ama-dnote-vtext--solo{
  position:absolute;left:clamp(16px,4vw,48px);top:50%;transform:translateY(-50%);
  writing-mode:vertical-rl;font-family:var(--eva-wall);
  font-size:10px;letter-spacing:.48em;color:rgba(255,255,255,.35);
}
body.eva-skin .ama-dnote-big{
  font-family:var(--eva-matisse);font-variation-settings:"opsz" 96;font-weight:800;
  font-size:clamp(3rem,12vw,6.5rem);line-height:.8;letter-spacing:.12em;
  color:#fff!important;transform:scaleY(1.12);
}
body.eva-skin .ama-dnote--vision .ama-dnote-sub--center{
  color:rgba(255,255,255,.72)!important;margin-top:20px;
}

/* 介绍模块：打破「一页两块」整齐栅格 */
body.eva-skin #timewalker .ama-v2-module{
  min-height:auto!important;
  display:block!important;
  padding:clamp(56px,8vw,100px) clamp(16px,4vw,56px)!important;
  transform:none!important;
  max-width:none!important;
}
body.eva-skin #timewalker .ama-v2-copy-block{
  max-width:min(520px,92vw);margin-bottom:clamp(28px,5vw,48px);
}
body.eva-skin #timewalker .ama-v2-module:nth-child(odd) .ama-v2-copy-block{margin-left:clamp(0px,4vw,48px)}
body.eva-skin #timewalker .ama-v2-module:nth-child(even) .ama-v2-copy-block{
  margin-left:auto;margin-right:clamp(0px,6vw,72px);text-align:right;
}
body.eva-skin #timewalker .ama-v2-module .ama-system-card,
body.eva-skin #timewalker .ama-v2-module .ama-palace-v2,
body.eva-skin #timewalker .ama-v2-module .ama-flow-v2{
  width:min(94%,920px);margin-left:auto;margin-right:auto;
  box-shadow:12px 14px 0 rgba(153,0,0,.2)!important;
}
body.eva-skin #timewalker .ama-v2-module:nth-child(odd) .ama-system-card,
body.eva-skin #timewalker .ama-v2-module:nth-child(odd) .ama-palace-v2{
  margin-left:clamp(8px,8vw,120px);margin-right:clamp(16px,4vw,40px);
}
body.eva-skin #timewalker .ama-v2-module:nth-child(even) .ama-system-card,
body.eva-skin #timewalker .ama-v2-module:nth-child(even) .ama-palace-v2{
  margin-left:clamp(16px,4vw,40px);margin-right:clamp(8px,8vw,120px);
}
body.eva-skin #timewalker .ama-v2-module.alt .ama-v2-copy-block{order:unset}

/* PAD 矩阵：文字可见 */
body.eva-skin #timewalker .ama-matrix-grid{
  gap:16px!important;
}
body.eva-skin #timewalker .ama-axis{
  background:#fff!important;
  border:2px solid rgba(153,0,0,.35)!important;
  box-shadow:6px 8px 0 rgba(0,56,255,.12)!important;
}
body.eva-skin #timewalker .ama-axis::after{display:none}
body.eva-skin #timewalker .ama-axis strong{
  color:var(--eva-crimson-lit,#b30000)!important;
  font-family:var(--eva-wall)!important;
}
body.eva-skin #timewalker .ama-axis span{
  color:#1a1a1a!important;
  font-size:14px!important;line-height:1.85!important;
}
body.eva-skin #timewalker .ama-equation-note{color:rgba(10,10,10,.62)!important}

@media (max-width:980px){
  body.eva-skin .ama-dnote-row--problem,
  body.eva-skin .ama-dnote-row--think{padding-left:32px;padding-right:32px;text-align:left}
  body.eva-skin .ama-dnote-row--think .ama-dnote-sub{margin-left:0}
  body.eva-skin .ama-dnote-h--vr{float:none;writing-mode:horizontal-tb;margin-bottom:16px}
  body.eva-skin #timewalker .ama-v2-module .ama-v2-copy-block{text-align:left;margin-left:0!important;margin-right:0!important}
  body.eva-skin #timewalker .ama-v2-module .ama-system-card{margin-left:16px!important;margin-right:16px!important}
}
"""


def inject_css(t: str) -> str:
    if "EVA v8" in t:
        t = re.sub(r"/\* ═══ EVA v8[\s\S]*?(?=@media \(max-width:980px\)\{)", "", t, count=1)
    return t.replace("@media (max-width:980px){", V8_CSS + "\n@media (max-width:980px){", 1)


def patch_guides(t: str) -> str:
    if "vision:" in t and "terminal future" in t:
        return t
    if "vision:" not in t.split("amaGuideLines")[1][:800]:
        t = t.replace(
            "  solution:{state:'design note',pos:'pos-left',lines:[",
            "  vision:{state:'future',pos:'pos-center',lines:['终端愿景：家居、投影、AR。','别只讲聊天窗。']},\n  solution:{state:'design note',pos:'pos-left',lines:[",
            1,
        )
    return t


def main():
    t = P.read_text(encoding="utf-8")
    if "ama-dnote--p1" not in t:
        t = PAGE1_OLD.sub(PAGE1_NEW, t, count=1)
    t = patch_guides(t)
    t = inject_css(t)
    P.write_text(t, encoding="utf-8")
    print("ok", "ama-dnote--p1" in t, "ama-dnote--solve" in t, "EVA v8" in t)


if __name__ == "__main__":
    main()
