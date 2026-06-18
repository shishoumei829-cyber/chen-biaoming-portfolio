# -*- coding: utf-8 -*-
"""v9: 我的愿景白底；人格/记忆表达换形式；宫殿房间换色可读"""
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

VISION_OLD = re.compile(
    r'<section class="ama-design-thought ama-dnote ama-dnote--vision[\s\S]*?</section>',
    re.M,
)

VISION_NEW = r"""<section class="ama-design-thought ama-dnote ama-dnote--vision reveal" data-ama-section="vision">
      <div class="ama-dnote-vrule ama-dnote-vrule--vision" aria-hidden="true">我的愿景</div>
      <div class="ama-dnote-center ama-dnote-center--wide">
        <p class="ama-dnote-h ama-dnote-h--center">我的愿景</p>
        <h3 class="ama-dnote-hero-line ama-dnote-hero-line--vision" data-typewriter="从对话里的在场，&#10;走向生活里的在场。"></h3>
        <p class="thought-sub ama-dnote-sub ama-dnote-sub--center">她终局进入真实动线：家居联动、实体投影、起居节律；接入 AR 眼镜与手机。此刻先把长期陪伴做实，再谈终端形态。</p>
      </div>
    </section>"""

SOUL_OLD = re.compile(
    r'<article class="ama-v2-module reveal" data-ama-section="soul">[\s\S]*?</article>\s*\n\s*<article class="ama-v2-module alt reveal" data-ama-section="palace">',
    re.M,
)

SOUL_NEW = r"""<article class="ama-v2-module reveal" data-ama-section="soul">
      <div class="ama-v2-copy-block">
        <div class="ama-v2-sub">01 / Soul Construction</div>
        <h3>人格是一套可执行的档案栈。</h3>
        <p>评审看到的不是「一句人设」，而是三层文件分工：传记定身份底色，核心锚点划边界，口吻文件每轮优先——决定她怎么开口，而不是背哪句台词。</p>
      </div>
      <div class="ama-identity-stack magnetic" aria-label="身份档案栈示意">
        <div class="ama-stack-layer ama-stack-layer--voice">
          <div class="ama-stack-tag">每轮优先 · 口吻层</div>
          <div class="ama-stack-file">kurisu_voice.txt</div>
          <p class="ama-stack-desc">语气、断句、吐槽习惯——<strong>对外怎么说话</strong>只看这一层。</p>
        </div>
        <div class="ama-stack-layer ama-stack-layer--core">
          <div class="ama-stack-tag">不可突破 · 边界层</div>
          <div class="ama-stack-file">kurisu_core_prompt.txt</div>
          <p class="ama-stack-desc">身份断言与红线：「你就是牧濑红莉栖本人」，不是助手、不是程序。</p>
        </div>
        <div class="ama-stack-layer ama-stack-layer--soul">
          <div class="ama-stack-tag">底色 · 传记层</div>
          <div class="ama-stack-file">kurisu_soul.txt</div>
          <p class="ama-stack-desc">长传记只供记忆与情绪底色，<strong>不当作台词表</strong>逐句念出。</p>
        </div>
        <div class="ama-stack-foot">
          <span class="ama-stack-arrow" aria-hidden="true">↓</span>
          <span>运行时合并进上下文 · 口吻 &gt; 边界 &gt; 传记</span>
        </div>
      </div>
    </article>

    <article class="ama-v2-module alt reveal" data-ama-section="palace">"""


V9_CSS = r"""
/* ═══ EVA v9 ═══ */
body.eva-skin .ama-dnote--vision{
  background:#fff!important;
  border-top:1px solid rgba(153,0,0,.2)!important;
}
body.eva-skin .ama-dnote-vrule--vision{
  position:absolute;left:clamp(16px,4vw,48px);top:clamp(48px,8vh,80px);
  writing-mode:vertical-rl;font-family:var(--eva-wall);
  font-size:10px;letter-spacing:.48em;color:rgba(153,0,0,.35);
}
body.eva-skin .ama-dnote--vision .ama-dnote-big{display:none}
body.eva-skin .ama-dnote-hero-line--vision{
  font-size:clamp(2.4rem,9vw,5.8rem)!important;
  color:var(--eva-crimson-lit,#b30000)!important;
}
body.eva-skin .ama-dnote--vision .ama-dnote-sub--center{color:rgba(10,10,10,.58)!important}

/* 身份档案栈（非 code block） */
body.eva-skin .ama-identity-stack{
  display:flex;flex-direction:column;gap:0;
  max-width:min(520px,100%);margin:0 auto;
  border:2px solid rgba(153,0,0,.35);
  box-shadow:14px 16px 0 rgba(0,56,255,.1);
  background:#fff;
}
body.eva-skin .ama-stack-layer{
  padding:18px 20px 16px;
  border-bottom:1px solid rgba(10,10,10,.08);
  position:relative;
}
body.eva-skin .ama-stack-layer--voice{
  background:linear-gradient(90deg,rgba(153,0,0,.08),#fff);
  border-left:4px solid var(--eva-crimson-lit,#b30000);
}
body.eva-skin .ama-stack-layer--core{background:#f8f9fc}
body.eva-skin .ama-stack-layer--soul{background:#f4f4f4}
body.eva-skin .ama-stack-tag{
  font-family:var(--eva-wall);font-size:9px;letter-spacing:.32em;
  text-transform:uppercase;color:var(--eva-crimson,#990000);
  margin-bottom:8px;
}
body.eva-skin .ama-stack-file{
  font-family:"Share Tech Mono","Courier New",monospace;
  font-size:13px;color:#0a0a0a;margin-bottom:10px;
}
body.eva-skin .ama-stack-desc{
  font-family:"Noto Serif SC",serif;font-size:13px;line-height:1.85;
  color:rgba(10,10,10,.62);
}
body.eva-skin .ama-stack-desc strong{color:var(--eva-crimson-lit,#b30000);font-weight:600}
body.eva-skin .ama-stack-foot{
  padding:14px 20px;font-family:var(--eva-wall);
  font-size:9px;letter-spacing:.22em;text-transform:uppercase;
  color:rgba(10,10,10,.45);background:#fafafa;
  display:flex;align-items:center;gap:10px;
}
body.eva-skin .ama-stack-arrow{color:var(--eva-crimson-lit,#b30000);font-size:14px}

/* 记忆宫殿房间：高对比可读 */
body.eva-skin #timewalker .ama-palace-v2{gap:16px!important}
body.eva-skin #timewalker .ama-palace-room{
  background:#fff!important;
  border:2px solid rgba(153,0,0,.32)!important;
  box-shadow:8px 10px 0 rgba(0,56,255,.1)!important;
}
body.eva-skin #timewalker .ama-palace-room:hover{
  border-color:var(--eva-crimson-lit,#b30000)!important;
  transform:translateY(-6px)!important;
}
body.eva-skin #timewalker .ama-palace-room b{
  color:var(--eva-crimson-lit,#b30000)!important;
  font-size:clamp(28px,5vw,38px)!important;
  opacity:1!important;
}
body.eva-skin #timewalker .ama-palace-room strong{
  color:#0048ff!important;
  font-family:var(--eva-wall)!important;
}
body.eva-skin #timewalker .ama-palace-room span{
  color:#1a1a1a!important;
  font-size:14px!important;line-height:1.9!important;
}
"""


def patch_text_snippets(t: str) -> str:
    t = t.replace("<h3>人格不是一句 system prompt。</h3>", "<h3>人格是一套可执行的档案栈。</h3>")
    t = t.replace(
        "<h3>记忆宫殿是分层索引，不是装饰。</h3>",
        "<h3>记忆宫殿：按语义分房间检索</h3>",
    )
    t = t.replace(
        "Hall / Lab / Cafe / Forbidden 对应不同语义层。新信息先压缩成短标签，再按语义归房间；检索时默认带 Hall，并按当前输入命中的房间补充局部记忆，让 RAG 与上下文更可控。",
        "RAG 默认带 Hall，再按输入命中 Lab / Cafe / Forbidden。新信息先压成短标签入库，检索时只拉相关房间——避免所有记忆搅在一个池子里。",
    )
    if "ama-identity-stack" not in t:
        t = re.sub(
            r'<div class="ama-system-card magnetic">\s*<header><span>kurisu_core_prompt\.txt \+ kurisu_voice\.txt</span>[\s\S]*?</pre>\s*</div>',
            "",
            t,
            count=1,
        )
    t = t.replace(
        "用连续人格、分层记忆、情绪矩阵、主动编排——把「像一个人」拆成可运行的系统。",
        "用连续人格、分层记忆、情绪矩阵、主动编排——把在场感拆成可运行的系统。",
    )
    t = t.replace(
        "她终局进入真实动线：家居联动、实体投影、起居节律；接入 AR 眼镜与手机。此刻先把长期陪伴做实，再谈终端形态。",
        "家居联动、实体投影、起居节律；接入 AR 眼镜与手机。先把长期陪伴做实，再谈形态。",
    ) if "她终局进入真实动线" in t else t
    t = re.sub(
        r"'愿景是智能终端[^']*'",
        "'愿景：从对话到场，走向家居、投影与多终端。'",
        t,
    )
    t = t.replace(
        "记忆宫殿不是摆设。分层以后，检索才不会把日常、知识和高权重情节搅成一团。",
        "记忆按房间路由：Hall 打底，命中哪间拉哪间，别把池子搅成一团。",
    )
    return t


def inject_css(t: str) -> str:
    if "EVA v9" in t:
        t = re.sub(r"/\* ═══ EVA v9[\s\S]*?/\* 记忆宫殿房间", "/* 记忆宫殿房间", t, count=1)
        t = re.sub(r"/\* ═══ EVA v9[\s\S]*?(?=</style>)", "", t, count=1)
    # 盖过 v8 蓝底愿景
    t = t.replace(
        "body.eva-skin .ama-dnote--vision{\n  min-height:clamp(320px,48vh,480px)",
        "body.eva-skin .ama-dnote--vision__v8disabled{\n  min-height:clamp(320px,48vh,480px)",
        1,
    )
    if "EVA v9" not in t:
        t = t.replace("</style>", V9_CSS + "\n</style>", 1)
    return t


def main():
    t = P.read_text(encoding="utf-8")
    t = VISION_OLD.sub(VISION_NEW, t, count=1)
    if "ama-identity-stack" not in t:
        t = SOUL_OLD.sub(SOUL_NEW, t, count=1)
    t = patch_text_snippets(t)
    t = inject_css(t)
    # 禁用 v8 蓝底愿景块（保留其余 v8）
    t = t.replace(
        "body.eva-skin .ama-dnote--vision{\n  min-height:clamp(320px,48vh,480px)!important;",
        "body.eva-skin .ama-dnote--vision--legacy-blue{\n  min-height:clamp(320px,48vh,480px)!important;",
        1,
    )
    if "EVA v9" not in t.split("</style>")[0][-4000:]:
        t = t.replace("</style>", V9_CSS + "\n</style>", 1)
    P.write_text(t, encoding="utf-8")
    t2 = P.read_text(encoding="utf-8")
    print(
        "ok",
        "我的愿景" in t2 and "智能终端" not in t2.split("ama-dnote--vision")[1][:800],
        "ama-identity-stack" in t2,
        "不是装饰" not in t2,
        "EVA v9" in t2,
    )


if __name__ == "__main__":
    main()
