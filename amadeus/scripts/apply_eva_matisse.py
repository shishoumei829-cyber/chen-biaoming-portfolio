# -*- coding: utf-8 -*-
import re
from pathlib import Path

P = Path(r"C:\Users\SHIKIMORI\Desktop\个人网站\portfolio (4).html")

NEW_CSS = r"""
/* ═══ EVA · Matisse 字卡排版（非 HUD 皮肤）═══ */
.eva-skin{
  background:var(--eva-paper);
  color:var(--eva-red);
  font-family:var(--eva-body);
}
.eva-skin #progress{background:var(--eva-red);box-shadow:none;height:2px}
.eva-skin .cursor-dot{background:var(--eva-red)}
.eva-skin .cursor-ring{border-color:rgba(188,0,0,.45)}

/* —— 导航：极简红字 —— */
.eva-skin .nav{
  mix-blend-mode:normal;
  color:var(--eva-red);
  background:transparent;
  border-bottom:0;
  padding-top:clamp(20px,3vw,32px);
}
.eva-skin .brand{
  font-family:var(--eva-matisse);
  font-style:normal;
  font-weight:900;
  font-size:clamp(18px,2.2vw,26px);
  letter-spacing:.18em;
  color:var(--eva-red);
  text-shadow:none;
}
.eva-skin .nav a{
  font-family:var(--eva-body);
  font-size:11px;
  letter-spacing:.26em;
  font-weight:600;
}
.eva-skin .nav a::after{background:var(--eva-red);height:1px}

/* —— 首页：EVA 字卡海报 —— */
.eva-skin .hero.eva-poster{
  min-height:100svh;
  padding:0;
  display:block;
  background:var(--eva-paper);
  color:var(--eva-red);
  overflow:hidden;
}
.eva-skin .hero-bg,.eva-skin .hero-vignette,.eva-skin .hero-grid,.eva-skin .hero-copy,.eva-skin .hero-meta{display:none!important}

.eva-ghost{
  position:absolute;inset:-8% -4%;
  z-index:0;pointer-events:none;
  font-family:var(--eva-matisse);
  font-size:10px;line-height:1.45;letter-spacing:.14em;
  color:var(--eva-red);opacity:.055;
  columns:5;column-gap:2.4em;text-align:justify;
  word-break:break-all;transform:rotate(-1.5deg) scale(1.05);
}
.eva-quote{
  position:absolute;z-index:3;
  max-width:min(320px,42vw);
  font-family:var(--eva-body);
  font-size:11px;line-height:1.85;
  letter-spacing:.04em;
  color:var(--eva-red);
  font-weight:400;
}
.eva-quote--tl{top:clamp(88px,12vh,128px);left:clamp(20px,4vw,56px)}
.eva-frag{
  position:absolute;z-index:3;top:clamp(150px,24vh,240px);
  display:grid;gap:2px;
  font-family:var(--eva-matisse);
  font-weight:700;font-size:clamp(13px,1.4vw,17px);
  letter-spacing:.12em;line-height:1.15;
  color:var(--eva-red);
}
.eva-frag--left{left:clamp(20px,4vw,56px)}
.eva-frag--right{right:clamp(20px,4vw,56px);text-align:right}
.eva-frag-big{
  display:block;
  font-size:clamp(28px,4.2vw,52px);
  font-weight:900;
  letter-spacing:-.02em;
  line-height:.9;
  margin-top:4px;
}
.eva-vtext{
  position:absolute;z-index:4;
  right:clamp(18px,3.5vw,48px);
  top:clamp(120px,18vh,200px);
  writing-mode:vertical-rl;
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(15px,1.8vw,22px);
  letter-spacing:.35em;
  color:rgba(188,0,0,.42);
  border-right:1px solid rgba(188,0,0,.28);
  padding-right:12px;
}
.eva-letterbox{
  position:absolute;z-index:2;
  left:0;right:0;
  top:clamp(168px,26vh,260px);
  height:clamp(160px,26vh,300px);
  display:grid;
  grid-template-rows:minmax(28px,1fr) clamp(48px,9vh,88px) minmax(28px,1fr);
}
.eva-band{background:var(--eva-red)}
.eva-slit{
  position:relative;overflow:hidden;background:#0a0002;
  box-shadow:inset 0 0 80px rgba(0,0,0,.8);
}
.eva-slit::before{
  content:"";
  position:absolute;inset:-20% -10%;
  background:
    radial-gradient(ellipse 22% 85% at 48% 50%,rgba(255,48,48,.95) 0%,rgba(140,0,8,.85) 38%,transparent 58%),
    radial-gradient(ellipse 9% 24% at 50% 48%,#fff 0%,#f8c4c4 35%,transparent 72%),
    radial-gradient(circle at 50% 50%,#1a0004 0%,#000 70%);
  filter:contrast(1.35) saturate(1.15);
  animation:evaSlitPulse 6s ease-in-out infinite;
}
@keyframes evaSlitPulse{0%,100%{opacity:.92;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}

.eva-title-plate{
  position:absolute;z-index:5;left:0;right:0;bottom:0;
  background:var(--eva-black);
  padding:clamp(36px,6vw,72px) clamp(20px,5vw,72px) clamp(108px,15vh,168px);
  text-align:center;
}
.eva-matisse-main{
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(3rem,10.8vw,7.8rem);
  line-height:.84;
  letter-spacing:-.02em;
  color:var(--eva-red-hot);
  text-transform:uppercase;
}
.eva-m-line{display:block;overflow:hidden}
.eva-m-line span{display:inline-block;animation:rise 1.2s var(--ease) both}
.eva-m-line:nth-child(2) span{animation-delay:.14s;color:#fff}
.eva-matisse-cn{
  margin-top:clamp(14px,2vw,24px);
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(1.6rem,4.8vw,3.6rem);
  letter-spacing:.28em;
  color:var(--eva-red-hot);
}
.eva-script{
  margin-top:clamp(18px,2.5vw,28px);
  font-family:Georgia,"Times New Roman",serif;
  font-style:italic;
  font-size:clamp(13px,1.5vw,18px);
  letter-spacing:.1em;
  color:rgba(255,255,255,.62);
}
.eva-ep-rail{
  position:absolute;z-index:6;
  right:clamp(16px,3.5vw,52px);
  bottom:clamp(118px,16vh,168px);
  display:grid;gap:clamp(22px,3.5vh,40px);
  text-align:right;
}
.eva-ep-rail a{
  display:grid;gap:5px;
  padding-right:14px;
  border-right:2px solid var(--eva-red-hot);
  color:var(--eva-red);
  transition:opacity .3s var(--ease),transform .3s var(--ease);
}
.eva-ep-rail a:hover{opacity:.65;transform:translateX(-4px)}
.eva-ep-rail .ep-no{
  font-size:10px;letter-spacing:.32em;font-weight:600;
}
.eva-ep-rail strong{
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(20px,2.4vw,30px);
  letter-spacing:.06em;
  line-height:1;
  color:var(--eva-red-hot);
}
.eva-ep-rail span:last-child{
  font-size:10px;letter-spacing:.08em;
  color:rgba(188,0,0,.72);max-width:180px;margin-left:auto;
}
.eva-skin .hero-index{
  position:absolute;z-index:6;left:0;right:0;bottom:0;
  margin:0;border-top:1px solid rgba(188,0,0,.35);
  background:rgba(5,5,5,.94);
  grid-template-columns:repeat(3,1fr);
  animation:floatIn 1.4s .5s var(--ease) both;
}
.eva-skin .hero-work{
  padding:18px clamp(16px,3vw,32px) 20px;
  min-height:0;border-right:1px solid rgba(188,0,0,.2);
}
.eva-skin .hero-work:last-child{border-right:0}
.eva-skin .hero-work::after{display:none}
.eva-skin .hero-work small{
  color:rgba(188,0,0,.75);
  font-size:9px;letter-spacing:.34em;
}
.eva-skin .hero-work h3{
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(18px,2vw,26px);
  letter-spacing:.08em;
  color:#f5f2ec;
}
.eva-skin .hero-work p{
  font-family:var(--eva-body);
  font-size:10px;line-height:1.6;
  letter-spacing:.04em;
  color:rgba(245,242,236,.42);
  max-width:none;
}

.eva-intertitle{
  display:grid;place-items:center;
  padding:clamp(48px,8vw,88px) 24px;
  background:var(--eva-red);
  color:#fff;
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(14px,2vw,20px);
  letter-spacing:.55em;
  text-indent:.55em;
}

/* —— 章节：字卡 / 红黑条 —— */
.eva-skin .section.dark{
  background:var(--eva-black);
  color:#f2f0ea;
}
.eva-skin .section.dark::before{
  content:"";
  position:absolute;left:0;top:0;right:0;height:6px;
  background:var(--eva-red);
  width:auto;bottom:auto;box-shadow:none;
}
.eva-skin .num{
  font-family:var(--eva-body);
  font-style:normal;
  font-size:11px;
  font-weight:600;
  letter-spacing:.34em;
  color:var(--eva-red-hot);
}
.eva-skin .section-title,
.eva-skin .mirage-head .section-title,
.eva-skin .case-copy h3,
.eva-skin .ama-v2-title,
.eva-skin .ama-v2-copy-block h3,
.eva-skin .self-copy h2,
.eva-skin .spec-copy h3{
  font-family:var(--eva-matisse);
  font-weight:900;
  letter-spacing:-.01em;
  line-height:.88;
}
.eva-skin .mirage-head .section-title{
  color:var(--eva-red-hot);
  text-shadow:none;
}
.eva-skin .section-desc,.eva-skin .case-lead,.eva-skin .thought-sub{font-family:var(--eva-body)}
.eva-skin .case-index{
  font-family:var(--eva-body);
  font-style:normal;
  font-weight:600;
  color:var(--eva-red-hot);
  letter-spacing:.3em;
}
.eva-skin .case-list strong{color:var(--eva-red-hot);letter-spacing:.24em;font-weight:600}
.eva-skin .case-visual{
  border-radius:0;
  border:1px solid rgba(188,0,0,.35);
  box-shadow:8px 8px 0 rgba(188,0,0,.12);
}

/* 思考页 = 全幅字卡 */
.eva-skin .thought-page{
  background:var(--eva-paper)!important;
  color:var(--eva-red)!important;
  min-height:min(88vh,820px);
  margin-left:0;margin-right:0;
  padding:clamp(60px,10vw,120px) clamp(22px,5vw,72px);
}
.eva-skin .thought-page::before{opacity:.35}
.eva-skin .thought-page::after{
  content:"";
  position:absolute;left:50%;top:12%;bottom:12%;width:1px;
  transform:translateX(-50%);
  background:rgba(188,0,0,.25);
}
.eva-skin .thought-line{
  font-family:var(--eva-matisse);
  font-weight:900;
  font-size:clamp(2.2rem,7.5vw,5.5rem)!important;
  line-height:1.02!important;
  letter-spacing:.06em;
  color:var(--eva-red)!important;
  text-align:center;
  min-height:auto;
  white-space:normal;
}
.eva-skin .thought-copy{max-width:100%;text-align:center;margin:0 auto}
.eva-skin .thought-kicker{
  text-align:center;
  color:var(--eva-red);
  letter-spacing:.42em;
  font-size:10px;
}
.eva-skin .thought-sub{
  text-align:center;
  margin-left:auto;margin-right:auto;
  color:rgba(188,0,0,.68)!important;
  max-width:520px;
}
.eva-skin .thought-aside{
  writing-mode:horizontal-tb;
  text-align:center;
  color:rgba(188,0,0,.35);
  letter-spacing:.3em;
  font-size:10px;
  align-self:center;
  margin-bottom:24px;
}
.eva-skin .thought-page.split-thought{
  grid-template-columns:1fr;
  place-items:center;
  text-align:center;
}
.eva-skin .type-caret::after{background:var(--eva-red)}

.eva-skin .amadeus-case{
  background:var(--eva-black);
}
.eva-skin .amadeus-case::before{
  opacity:.08;
  background-image:
    linear-gradient(rgba(188,0,0,.2) 1px,transparent 1px),
    linear-gradient(90deg,rgba(188,0,0,.15) 1px,transparent 1px);
  background-size:64px 64px;
}
.eva-skin .ama-kicker,.eva-skin .ama-v2-sub{color:var(--eva-red-hot)}
.eva-skin .ama-v2-title{color:#f2f0ea}
.eva-skin .ama-v2-title em{color:var(--eva-red-hot);font-style:italic}
.eva-skin .ama-v2-ring{border-color:rgba(188,0,0,.3);box-shadow:none;animation:none}
.eva-skin .ama-v2-focus span{
  border-radius:0;
  border-color:rgba(188,0,0,.35);
  font-family:var(--eva-body);
  letter-spacing:.2em;
}

.eva-skin .section.light{
  background:var(--eva-paper);
  background-image:none;
}
.eva-skin .metric{
  border-radius:0;
  border-color:rgba(188,0,0,.22);
  background:rgba(255,255,255,.5);
}
.eva-skin .metric strong{
  font-family:var(--eva-matisse);
  font-weight:900;
  color:var(--eva-red);
}
.eva-skin .contact-card{
  border-radius:0;
  background:var(--eva-black);
  border:1px solid rgba(188,0,0,.4);
}
.eva-skin .contact-card a{color:var(--eva-red-hot)}
.eva-skin footer{
  background:var(--eva-black);
  border-top:3px solid var(--eva-red);
  font-family:var(--eva-body);
  letter-spacing:.22em;
  color:rgba(242,240,234,.4);
}

"""

NEW_HERO = """<header class="hero eva-poster" id="top">
  <div class="hero-bg" data-speed=".18" hidden></div>
  <div class="hero-vignette" hidden></div>
  <div class="hero-grid" hidden></div>

  <div class="eva-ghost" aria-hidden="true">PERCEPTION PRODUCT DESIGN MIRAGE AMADEUS 感知 設計 工業 交互 新世紀 作品集 陳彪明 人類 補完 計劃 特報 使徒 來襲 同步率 AT FIELD 插入栓 初号機 貳号機 現実 轉譯 数字 生命 記憶 情緒 矩阵 双脑 行为 决策 长期 关系 精神 慰藉 单身 时代 界面 叙事 产品 表达 观察 世界 审美 逻辑 交付 能力 设计 半径 扩展 人工智能 陪伴 终端 AR 眼镜 空间 计算 街巷 树影 通勤 城市 细节 美 沉默 在场 工具 百科 问答 程序 灵魂 档案 连续 人格 实验 本地 部署 端口 健康 检查 语音 合成 认知 架构 路由 工作 大脑 聊天 记忆 门控 逻辑 共情 智识 开口 前先 决定 姿态 靠近 防御 转移 投入 收住 候选 随机 扰动 重复 惩罚 表情 内生 目标 过期 想起 他说 过 的事 不是 固定 指令 克制 定时 弹窗 编造 用户 没 提过 的 实验 评审 不用 猜 是不是 剪 的 视频 权重 事件 分层 检索 日常 知识 高 权重 情节 搅 成 一团 分类 不是 中二 为了 少 胡说 开口 像 人 客服 讲义 之间 切换 界面 克制 复杂 留给 后台 监控 面板 高级 聊天 状态 开发者 视角 各占 一层 最后 才 放 UI 前面 证明 系统 存在 后面 再 让 它 看起来 像 产品 用户 界面 应该 克制 复杂 留给 后台 不然 陪伴 感 会 变成 监控 面板 </div>

  <p class="eva-quote eva-quote--tl">出生，是死亡的开始；活着，是走向死亡的过程；而人生，则是加快奔向死亡的脚步。</p>

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

  <div class="eva-title-plate">
    <h1 class="eva-matisse-main" aria-label="Designing perception as product">
      <span class="eva-m-line split-word"><span>DESIGNING</span></span>
      <span class="eva-m-line split-word"><span>PERCEPTION</span></span>
    </h1>
    <p class="eva-matisse-cn">感知 · 作为 · 产品</p>
    <p class="eva-script">Chen Biaoming — Industrial Design Portfolio</p>
  </div>

  <nav class="eva-ep-rail" aria-label="作品目录">
    <a class="magnetic" href="#mirage"><span class="ep-no">第01話</span><strong>MIRAGE</strong><span>AR · 现实转译</span></a>
    <a class="magnetic" href="#timewalker"><span class="ep-no">第02話</span><strong>AMADEUS</strong><span>数字生命 · 双脑</span></a>
    <a class="magnetic" href="#self"><span class="ep-no">第03話</span><strong>DESIGNER</strong><span>设计者本人</span></a>
  </nav>

  <div class="hero-index" data-speed=".12">
    <a class="hero-work magnetic" href="#mirage">
      <small>01 / AR Glasses</small>
      <h3>MIRAGE</h3>
      <p>以空间计算重构现实感知的 AR 眼镜概念。</p>
    </a>
    <a class="hero-work magnetic" href="#timewalker">
      <small>02 / Digital Life</small>
      <h3>AMADEUS</h3>
      <p>本地数字生命：连续记忆、情绪矩阵、双脑架构——长期在场，而非工具问答。</p>
    </a>
    <a class="hero-work magnetic" href="#self">
      <small>03 / Personal Work</small>
      <h3>Chen Biaoming</h3>
      <p>把设计者本人作为持续迭代的第三件作品。</p>
    </a>
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
    text = re.sub(
        r"/\* ═══ EVA · NERV 界面皮肤 ═══ \*/[\s\S]*?@keyframes evaPulse\{[\s\S]*?\.eva-corner b\{animation:evaPulse 2\.4s ease-in-out infinite\}\n\n",
        NEW_CSS + "\n",
        text,
        count=1,
    )
    text = re.sub(
        r"<header class=\"hero eva-hero\" id=\"top\">[\s\S]*?</header>\n\n<main>",
        NEW_HERO + "\n<main>",
        text,
        count=1,
    )
    text = re.sub(r"<nav class=\"nav\">[\s\S]*?</nav>", NEW_NAV, text, count=1)
    text = re.sub(
        r"@media \(max-width:980px\)\{\n  \.eva-vrule,\.eva-crosshair\{display:none\}\n  \.eva-frame\{inset:14px\}\n  \.eva-skin \.hero h1\.eva-title\{font-size:clamp\(3\.2rem,15vw,4\.6rem\);letter-spacing:\.1em\}\n  \.eva-line--accent\{padding-left:14px\}\n",
        "@media (max-width:980px){\n  .eva-frag,.eva-vtext{display:none}\n  .eva-quote--tl{max-width:70%;font-size:10px}\n  .eva-ep-rail{display:none}\n  .eva-letterbox{top:clamp(120px,18vh,160px);height:clamp(120px,20vh,200px)}\n  .eva-matisse-main{font-size:clamp(2.4rem,14vw,3.4rem)}\n  .eva-matisse-cn{font-size:clamp(1.2rem,6vw,2rem);letter-spacing:.18em}\n  .eva-title-plate{padding-bottom:clamp(200px,28vh,240px)}\n",
        text,
        count=1,
    )
    text = re.sub(
        r"  \.eva-skin \.hero h1\.eva-title\{font-size:clamp\(2\.8rem,14vw,3\.8rem\}\n",
        "  .eva-matisse-main{font-size:clamp(2rem,13vw,2.8rem)}\n",
        text,
        count=1,
    )
    P.write_text(text, encoding="utf-8")
    print("applied", "eva-poster" in text, "eva-matisse-main" in text)

if __name__ == "__main__":
    main()
