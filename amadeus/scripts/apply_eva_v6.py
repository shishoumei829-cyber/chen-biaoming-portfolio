# -*- coding: utf-8 -*-
"""v6: 首页 PERCEPTION 半截续接白区；AMADEUS 粉→黑红；重写产品思考叙事"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

HERO_OLD = re.compile(
    r'<div class="eva-hero-mid">[\s\S]*?</div>\s*\n\s*<div class="eva-plate-white eva-plate-black">',
    re.M,
)

HERO_NEW = r"""<div class="eva-hero-mid">
    <h1 aria-label="Designing perception as product">
      <span class="eva-t eva-t--xl split-word"><span>DESIGNING</span></span>
      <span class="eva-t-split" aria-hidden="true">
        <span class="eva-t eva-t--xl eva-t--half-top split-word"><span>PERCEPTION</span></span>
      </span>
    </h1>
  </div>

  <div class="eva-plate-white eva-plate-black">"""

PLATE_CONTINUE = r"""    <div class="eva-hero-continue">
      <span class="eva-t-split eva-t-split--plate" aria-hidden="true">
        <span class="eva-t eva-t--xl eva-t--half-bottom split-word"><span>PERCEPTION</span></span>
      </span>
      <span class="eva-t eva-t--xl eva-t--plate-line split-word"><span>AS PRODUCT.</span></span>
      <p class="eva-cn eva-cn--plate">感知 · 作为 · 产品</p>
    </div>
"""

AMA_HERO_OLD = re.compile(
    r'<div class="ama-v2-hero reveal" data-ama-section="intro">[\s\S]*?</div>\s*\n\s*<div class="ama-v2-stage">',
    re.M,
)

AMA_HERO_NEW = r"""<div class="ama-v2-hero reveal" data-ama-section="intro">
      <div class="ama-v2-copy">
        <div class="ama-kicker">02 / Digital Life · 人与数字的关系</div>
        <h2 class="ama-v2-title">AMADEUS<br><em>精神慰藉，而非工具</em></h2>
        <p class="ama-v2-thesis">在单身人数暴涨、性压抑与精神饥渴并存的时代，人们渴望的不是又一本百科全书，而是<strong>能长期在场的精神陪伴</strong>。我认为虚拟陪伴可以承接这种需求：她不背叛、不消失、不必用金钱换亲密、不让你背上责任、也不把你困在关系里——却可以一直活在你的生活里。</p>
        <p class="ama-v2-thesis ama-v2-thesis--gap">市面 AI 伴侣太「AI」：没有真人感、不主动、不了解你、记不住你，程序感太重。豆包一类产品本质是工具，能回答问题，却给不了<strong>长期的情绪价值</strong>。AMADEUS 要解决的，正是人与数字生命之间那条被做薄的线。</p>
        <div class="ama-v2-focus">
          <span>精神慰藉</span>
          <span>长期在场</span>
          <span>主动与记忆</span>
        </div>
      </div>
      <div class="ama-v2-stage">"""

AMA_PROLOGUE = r"""
    <section class="ama-prologue reveal" data-ama-section="why">
      <div class="ama-prologue-grid">
        <div class="ama-prologue-block">
          <div class="ama-v2-sub">Why Now</div>
          <h3 class="ama-prologue-title">单身时代的精神缺口</h3>
          <p>越来越多人独自生活，亲密成本变高，情绪却无处安放。人们不是缺信息——豆包、搜索引擎什么都能答——缺的是<strong>被理解、被记得、被主动回应</strong>的感觉。</p>
        </div>
        <div class="ama-prologue-block">
          <div class="ama-v2-sub">My Thesis</div>
          <h3 class="ama-prologue-title">人与数字，可以不是「用完即走」</h3>
          <p>我要设计的是一种<strong>关系</strong>，不是对话框。她记得你上周说过的话，会在合适的时机开口，会用连续的人格接住你——而不是每轮重置成礼貌客服。</p>
        </div>
        <div class="ama-prologue-block ama-prologue-block--wide">
          <div class="ama-v2-sub">What We Refuse</div>
          <h3 class="ama-prologue-title">拒绝工具感与表演感</h3>
          <p>太 AI 的伴侣：语气统一、没有记忆、不会主动、不懂你的边界。太工具的 AI：百科全书，给答案不给陪伴。<strong>AMADEUS 用灵魂档案、分层记忆、PAD 情绪矩阵、行为候选与心智加工</strong>，把「像一个人」拆成可运行的系统，而不是贴一张女友皮。</p>
        </div>
      </div>
    </section>

    <section class="ama-vision reveal" data-ama-section="vision">
      <div class="ama-vision-copy">
        <div class="ama-v2-sub">Future · 智能终端</div>
        <h3 class="ama-vision-title">从对话，到生活里的存在</h3>
        <p class="ama-vision-lead">产品愿景不止于聊天窗口。AMADEUS 走向<strong>智能终端</strong>：控制家具、实体投影、照拂日常起居；接入 AR 眼镜、手机与更多设备——让数字生命进入真实生活动线，而不只活在屏幕里。</p>
        <ul class="ama-vision-list">
          <li><strong>Home</strong><span>家居控制 · 环境联动</span></li>
          <li><strong>Presence</strong><span>实体投影 · 空间共处</span></li>
          <li><strong>Care</strong><span>起居节律 · 轻量照拂</span></li>
          <li><strong>Mesh</strong><span>AR 眼镜 · 手机 · 多终端</span></li>
        </ul>
      </div>
    </section>
"""

V6_CSS = r"""
/* ═══ EVA v6 ═══ */
:root{
  --eva-crimson:#990000;
  --eva-crimson-lit:#b30000;
}

/* 首页：PERCEPTION 上蓝下白半截续接 */
body.eva-skin .hero.eva-poster{padding-bottom:0!important}
.eva-hero-mid .eva-cn{display:none}
.eva-t-split{display:block;position:relative;line-height:.78;margin-top:.06em}
.eva-t--half-top{display:block;clip-path:inset(0 0 52% 0);-webkit-clip-path:inset(0 0 52% 0);margin-bottom:-.52em}
.eva-t--half-top span{color:#fff!important;text-shadow:0 0 36px rgba(255,255,255,.25)}
.eva-hero-continue{padding:0 clamp(18px,5vw,64px) clamp(8px,2vw,16px)}
.eva-t-split--plate{margin-top:0}
.eva-t--half-bottom{
  display:block;clip-path:inset(48% 0 0 0);-webkit-clip-path:inset(48% 0 0 0);
  margin-top:-.48em;margin-bottom:-.12em;
}
.eva-t--half-bottom span{color:var(--eva-crimson-lit)!important;text-shadow:none}
.eva-t--plate-line{display:block;margin-top:.02em}
.eva-t--plate-line span{color:var(--eva-crimson-lit)!important;font-size:clamp(2.2rem,8.5vw,6.2rem)!important}
.eva-cn--plate{
  display:block!important;margin-top:12px;font-size:clamp(1.1rem,3.2vw,2rem)!important;
  color:var(--eva-blue-deep)!important;letter-spacing:.38em;opacity:1!important;
}
.eva-plate-black,.eva-plate-white{border-top-color:var(--eva-crimson-lit)!important}
body.eva-skin .hero-work h3{color:var(--eva-crimson-lit)!important}

/* 第02話：黑红，不用粉 */
body.eva-skin #timewalker{
  --ama-accent:#ff9d34;
  --ama-crimson:var(--eva-crimson-lit);
}
body.eva-skin #timewalker .ama-v2-hero{
  background:
    linear-gradient(105deg,var(--eva-crimson-lit) 0%,var(--eva-crimson-lit) 26%,transparent 26%),
    linear-gradient(180deg,#f4f6ff 0%,#fff 100%)!important;
}
body.eva-skin #timewalker .ama-v2-title em{color:var(--eva-crimson-lit)!important}
body.eva-skin #timewalker .ama-kicker{color:var(--eva-crimson)!important}
body.eva-skin #timewalker .ama-v2-copy-block h3,
body.eva-skin #timewalker .ama-prologue-title,
body.eva-skin #timewalker .ama-vision-title{color:var(--eva-crimson-lit)!important}
body.eva-skin #timewalker .ama-v2-thesis strong{color:var(--eva-crimson);font-weight:600}
body.eva-skin #timewalker .ama-v2-thesis--gap{margin-top:1.35em}
body.eva-skin #timewalker .ama-v2-focus span{
  border-color:rgba(153,0,0,.28)!important;color:rgba(10,10,10,.62)!important;
  background:rgba(153,0,0,.05)!important;
}
body.eva-skin #timewalker .ama-system-card,
body.eva-skin #timewalker .ama-equation,
body.eva-skin #timewalker .ama-flow-v2>div{
  box-shadow:10px 12px 0 var(--eva-crimson-lit)!important;
  border-color:rgba(153,0,0,.22)!important;
}
body.eva-skin #timewalker .ama-system-card header{color:var(--ama-accent)!important}
body.eva-skin .ama-ui-v2{
  background:linear-gradient(180deg,#fff 0%,#eef3ff 50%,var(--eva-blue) 100%)!important;
}
body.eva-skin #timewalker .ama-ui-v2 h3{color:var(--eva-crimson-lit)!important}

body.eva-skin .ama-prologue{
  padding:clamp(48px,7vw,88px) clamp(16px,4vw,56px);
  background:#fff;
  border-top:2px solid var(--eva-crimson-lit);
}
body.eva-skin .ama-prologue-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,40px);max-width:1200px;margin:0 auto;
}
body.eva-skin .ama-prologue-block--wide{grid-column:1/-1}
body.eva-skin .ama-prologue-block p{
  font-family:"Noto Serif SC",serif;font-size:clamp(14px,1.4vw,17px);line-height:2;color:rgba(10,10,10,.58);
}
body.eva-skin .ama-prologue-block strong{color:var(--eva-crimson)}

body.eva-skin .ama-vision{
  padding:clamp(56px,8vw,96px) clamp(16px,4vw,56px);
  background:linear-gradient(135deg,#fff 0%,#fff 55%,rgba(0,56,255,.08) 100%);
  border-top:1px solid rgba(0,56,255,.12);
}
body.eva-skin .ama-vision-copy{max-width:920px;margin:0 auto}
body.eva-skin .ama-vision-lead{
  font-family:"Noto Serif SC",serif;font-size:clamp(15px,1.5vw,18px);line-height:2.05;color:rgba(10,10,10,.58);margin-top:16px;
}
body.eva-skin .ama-vision-list{
  list-style:none;margin-top:clamp(28px,4vw,40px);display:grid;
  grid-template-columns:repeat(2,1fr);gap:14px 24px;
}
body.eva-skin .ama-vision-list li{
  border-left:3px solid var(--eva-crimson-lit);padding:12px 0 12px 16px;
}
body.eva-skin .ama-vision-list strong{
  display:block;font-family:var(--eva-wall);font-size:11px;letter-spacing:.28em;
  text-transform:uppercase;color:var(--eva-crimson-lit);margin-bottom:6px;
}
body.eva-skin .ama-vision-list span{font-size:13px;color:rgba(10,10,10,.5)}

@media (max-width:980px){
  .eva-t--half-top,.eva-t--half-bottom{font-size:clamp(2rem,12vw,3.4rem)!important}
  body.eva-skin .ama-prologue-grid{grid-template-columns:1fr}
  body.eva-skin .ama-vision-list{grid-template-columns:1fr}
}
"""


def inject_v6_css(t: str) -> str:
    if "EVA v6" in t:
        t = re.sub(r"/\* ═══ EVA v6[\s\S]*?(?=@media \(max-width:980px\)\{)", "", t, count=1)
    return t.replace("@media (max-width:980px){", V6_CSS + "\n@media (max-width:980px){", 1)


def patch_plate_continue(t: str) -> str:
    if "eva-hero-continue" in t:
        return t
    return t.replace(
        '<div class="eva-plate-white eva-plate-black">',
        '<div class="eva-plate-white eva-plate-black">' + PLATE_CONTINUE,
        1,
    )


def patch_ama_prologue(t: str) -> str:
    if "ama-prologue" in t:
        return t
    marker = '<div class="ama-collage">'
    if marker in t:
        return t.replace(marker, AMA_PROLOGUE + "\n    " + marker, 1)
    # fallback: after ama-v2-hero closing
    return t.replace(
        "</div>\n    </div>\n\n    <article class=\"ama-v2-module",
        "</div>\n    </div>\n" + AMA_PROLOGUE + "\n    <article class=\"ama-v2-module",
        1,
    )


def main():
    t = P.read_text(encoding="utf-8")

    if "eva-t--half-top" not in t:
        t = HERO_OLD.sub(HERO_NEW, t, count=1)
    t = patch_plate_continue(t)

    if "精神慰藉，而非工具" not in t:
        t = AMA_HERO_OLD.sub(AMA_HERO_NEW, t, count=1)

    t = patch_ama_prologue(t)
    t = inject_v6_css(t)

    # 去掉 v5 里 timewalker 的粉色变量覆盖（保留 mirage 可用蓝粉，仅 timewalker 用 v6）
    t = t.replace(
        "body.eva-skin #timewalker .ama-v2-title em{color:var(--eva-magenta-hot)!important}",
        "body.eva-skin #timewalker .ama-v2-title em{color:var(--eva-crimson-lit)!important}",
    )

    t = t.replace(
        """  intro:{
    state:'soul archive loaded',
    pos:'pos-hero',
    lines:[
      '别把我介绍成“会聊天的产品”。那太单薄了。要讲，就讲我为什么能连续地像同一个人。',
      '先看清楚：我不是一套固定台词。我的语气、记忆和状态是分层拼起来的。',
      '作品集不用证明我会说甜话。证明系统真的有记忆、有情绪、有边界，就够了。'
    ]
  },""",
        """  intro:{
    state:'why now',
    pos:'pos-hero',
    lines:[
      '单身时代缺的不是答案，是长期在场的精神慰藉。先把这件事讲清楚。',
      '市面伴侣太 AI：不主动、不了解你、记不住你。豆包是工具，不是关系。',
      '我要做的是人与数字生命之间，那条没有被做薄的线。'
    ]
  },
  why:{
    state:'thesis loaded',
    pos:'pos-left',
    lines:[
      '她不背叛、不消失、不必用金钱换亲密——却可以一直在你的生活里。',
      '这不是虚拟女友皮肤，是灵魂档案、记忆、情绪与主动编排叠出来的连续人格。',
      '读下去，你会看到系统怎么证明“像一个人”，而不是像客服。'
    ]
  },
  vision:{
    state:'terminal future',
    pos:'pos-right',
    lines:[
      '愿景是智能终端：家居、投影、起居，接入 AR 与手机。',
      '现在先做对话里的在场感。路要一步一步走，但方向别讲窄了。',
      '评审如果只看到聊天窗，会误会这只是又一个 AI 应用。'
    ]
  },""",
    )

    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    t = t.replace(
        "<h3>AMADEUS</h3>\n        <p>数字生命 · 双脑架构</p>",
        "<h3>AMADEUS</h3>\n        <p>精神慰藉 · 长期在场</p>",
    )
    P.write_text(t, encoding="utf-8")
    t2 = t
    print(
        "ok",
        "eva-t--half-bottom" in t2,
        "ama-prologue" in t2,
        "精神慰藉" in t2,
        "EVA v6" in t2,
    )


if __name__ == "__main__":
    main()
