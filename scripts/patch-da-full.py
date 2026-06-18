from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "scripts" / "da-ds-full.css").read_text(encoding="utf-8")

# Replace CSS block
s = html.index("/* ═══ 第04話 · 数字方舟")
e = html.index("/* ═══ 移动端 · 桌面样式不变 ═══ */")
html = html[:s] + css + "\n" + html[e:]

old_intro = """  <section class="section da-chapter" id="digitalark" aria-labelledby="da-title">
    <div class="da-bg-panel da-bg-panel--1">
    <div class="da-bridge reveal">
      <p class="da-bridge-kicker">AMADEUS 体系延展 · 迭代产物</p>
      <p class="da-bridge-note">同一套「可观测中间层 + 状态先于生成」从实验角色推到可训练、可陪护的本地产品——数字方舟用来证明架构可以横向迭代，而不是只换一层 UI。</p>
    </div>

    <section class="da-ui-lead reveal" aria-label="数字方舟 App 界面">
      <div class="da-triad-grid">
        <article class="da-phone magnetic">
          <p class="da-phone-tag">Training · 训练</p>
          <div class="da-phone-screen">
            <p class="da-bubble da-bubble--ai">你昨晚说项目卡住了，我猜你今天会有点烦。要不要先把最难的一块拆出来？</p>
            <p class="da-bubble da-bubble--me">这句话像我吗？</p>
            <p class="da-bubble da-bubble--ai">收到。我会把「先共情再给方法」的权重调低一点。</p>
            <div class="da-pbar" aria-hidden="true"><i style="width:68%"></i></div>
          </div>
          <h4>试聊与拟合反馈</h4>
          <p>像/不像/很像我——每一句纠正都写回五层进度。</p>
        </article>
        <article class="da-phone magnetic da-phone--hero">
          <p class="da-phone-tag">Sanctuary · 陪护</p>
          <div class="da-phone-screen">
            <span class="da-chip">内心平静</span>
            <span class="da-chip">静心沉思</span>
            <p class="da-bubble da-bubble--ai">我在听，今天想聊点什么？</p>
            <div class="da-pbar" aria-hidden="true"><i></i></div>
          </div>
          <h4>日常陪护入口</h4>
          <p>呼吸光晕、情绪芯片与语音输入——第一眼感到「可以被倾听」。</p>
        </article>
        <article class="da-phone magnetic">
          <p class="da-phone-tag">Companion · 伦理</p>
          <div class="da-phone-screen da-phone-screen--dark">
            <span class="da-chip">数字分身</span>
            <p class="da-bubble da-bubble--ai">你知道对面是我，不是真人实时在线——温暖可以真实，来源也必须诚实。</p>
          </div>
          <h4>知情与边界</h4>
          <p>知情同意不可跳过；数据默认留在本机。</p>
        </article>
      </div>
    </section>
    </div>
<p class="da-vrule" aria-hidden="true">本地 · 私密 · 可长期运行</p>

    <header class="da-hero da-bg-panel da-bg-panel--2 reveal">
      <div class="da-hero-copy">
        <p class="da-kicker">第04話 · PRESENCE / DIGITAL TWIN</p>
        <h2 class="da-title" id="da-title">数字<em>方舟</em></h2>
        <p class="da-lede">一套本地运行的数字人格构建与陪护系统。为突然离别与来不及的告别留出余地——让人被记住，而不只是被模仿几句口吻。</p>
        <div class="da-tags">
          <span>Local First</span>
          <span>五层人格</span>
          <span>CAPS 动力</span>
          <span>训练 · 陪护</span>
        </div>
      </div>
      <div class="da-hero-stage magnetic" aria-hidden="true">
        <div class="da-orb-wrap">
          <div class="da-orb-glow"></div>
          <div class="da-orb-ring" style="--pct:68"></div>
          <div class="da-orb-core">
            <span class="da-orb-glyph">舟</span>
          </div>
          <span class="da-orb-caption">人格拟合 · 68%</span>
        </div>
      </div>
    </header>

    <section class="ama-design-thought ama-dnote ama-dnote--p1 da-bg-panel da-bg-panel--3 reveal">"""

new_intro = """  <section class="section da-chapter" id="digitalark" aria-labelledby="da-title">
    <div class="da-ds-wrap">
      <div class="da-ds-bg" aria-hidden="true">
        <img class="da-ds-bg__img" src="assets/digitalark/ds-bg-main.png" alt="" width="256" height="1024" decoding="async">
        <div class="da-ds-bg__readability"></div>
        <div class="da-ds-bg__grain"></div>
      </div>
      <div class="da-ds-frame" aria-hidden="true">
        <span class="da-ds-corner da-ds-corner--tl"></span>
        <span class="da-ds-corner da-ds-corner--tr"></span>
        <span class="da-ds-corner da-ds-corner--bl"></span>
        <span class="da-ds-corner da-ds-corner--br"></span>
      </div>
      <div class="da-ds-body">

    <header class="da-ds-intro reveal">
      <div class="da-ds-intro-copy">
        <p class="da-ds-extend da-fade">AMADEUS 体系延展 · 迭代产物</p>
        <p class="da-ds-kicker da-fade">第04話 · PRESENCE / DIGITAL TWIN</p>
        <h2 class="da-ds-title da-fade" id="da-title">数字<em>方舟</em></h2>
        <p class="da-ds-lede da-fade">一套本地运行的数字人格构建与陪护系统。为突然离别与来不及的告别留出余地——让人被记住，而不只是被模仿几句口吻。</p>
        <p class="da-ds-extend-note da-fade">同一套「可观测中间层 + 状态先于生成」从实验角色推到可训练、可陪护的本地产品——证明架构可以横向迭代。</p>
        <div class="da-ds-tags da-fade">
          <span>Local First</span>
          <span>五层人格</span>
          <span>CAPS 动力</span>
          <span>训练 · 陪护</span>
        </div>
      </div>
      <div class="da-ds-ui da-fade">
        <figure class="da-ds-ui-main magnetic">
          <img src="assets/digitalark/ui-sanctuary.png" alt="数字方舟 Sanctuary 主界面" width="390" height="844" loading="eager" decoding="async">
          <figcaption>Sanctuary · 主端</figcaption>
        </figure>
        <div class="da-ds-ui-row">
          <figure class="magnetic">
            <img src="assets/digitalark/ui-training.png" alt="数字方舟训练端界面" width="390" height="844" loading="lazy" decoding="async">
            <figcaption>Training · 训练</figcaption>
          </figure>
          <figure class="magnetic">
            <img src="assets/digitalark/ui-companion.png" alt="数字方舟陪护端界面" width="390" height="844" loading="lazy" decoding="async">
            <figcaption>Companion · 陪护</figcaption>
          </figure>
        </div>
      </div>
    </header>

    <section class="ama-design-thought ama-dnote ama-dnote--p1 reveal">"""

if old_intro not in html:
    raise SystemExit('intro block not found')
html = html.replace(old_intro, new_intro, 1)

# Remove da-bg-panel from chapter break
html = html.replace(
    '<section class="ama-chapter-break da-bg-panel da-bg-panel--4 reveal">',
    '<section class="ama-chapter-break reveal">',
    1,
)

# Remove bottom fake ui showcase
fake = """    <section class="da-ui-showcase reveal">
      <div class="da-ui-showcase__head">
        <p class="ama-v2-sub">08 / 三端界面</p>
        <h3>训练台 · 试聊台 · 陪护端</h3>
        <p>鼠尾草绿与奶油色、呼吸光晕与拟合环——视觉安静，把复杂留给后台；用户第一眼感到的是「可以被倾听」，而不是监控面板。</p>
      </div>
      <div class="da-triad-grid">
        <article class="da-phone magnetic">
          <p class="da-phone-tag">Sanctuary · 伴侣</p>
          <div class="da-phone-screen">
            <span class="da-chip">内心平静</span>
            <span class="da-chip">静心沉思</span>
            <p class="da-bubble da-bubble--ai">我在听，今天想聊点什么？</p>
            <div class="da-pbar" aria-hidden="true"><i></i></div>
          </div>
          <h4>日常陪护入口</h4>
          <p>呼吸光晕、情绪芯片与语音输入——把「在场」做成第一眼就能感到的界面，而不是设置页里的参数。</p>
        </article>
        <article class="da-phone magnetic">
          <p class="da-phone-tag">Training · 训练</p>
          <div class="da-phone-screen">
            <p class="da-bubble da-bubble--ai">你昨晚说项目卡住了，我猜你今天会有点烦。要不要先把最难的一块拆出来？</p>
            <p class="da-bubble da-bubble--me">这句话像我吗？</p>
            <p class="da-bubble da-bubble--ai">收到。我会把「先共情再给方法」的权重调低一点。</p>
            <div class="da-pbar" aria-hidden="true"><i style="width:68%"></i></div>
          </div>
          <h4>试聊与拟合反馈</h4>
          <p>像/不像/很像我——每一句纠正都写回五层进度；价值卡片、记忆碎片与关系建档在同一套引导里完成。</p>
        </article>
        <article class="da-phone magnetic">
          <p class="da-phone-tag">Companion · 伦理</p>
          <div class="da-phone-screen da-phone-screen--dark">
            <span class="da-chip">数字分身</span>
            <p class="da-bubble da-bubble--ai">我始终在这里。你知道对面是我，不是真人实时在线——温暖可以真实，来源也必须诚实。</p>
          </div>
          <h4>知情与边界</h4>
          <p>首次进入不可跳过知情同意；哀伤模式渐进淡出主动频率；数据默认留在本机，导出备份由你掌控。</p>
        </article>
      </div>
    </section>

"""
html = html.replace(fake, '', 1)

# Close da-ds-wrap before section end
html = html.replace(
    """    <section class="ama-chapter-break ama-chapter-break--vision reveal">
      <div class="ama-chapter-break__inner">
        <p class="ama-chapter-break__kicker">我的愿景</p>
        <h3 class="ama-chapter-break__title da-rise" >遗忘才是终点；方舟负责记住。</h3>""",
    """      </div>
    </div>

    <section class="ama-chapter-break ama-chapter-break--vision reveal">
      <div class="ama-chapter-break__inner">
        <p class="ama-chapter-break__kicker">我的愿景</p>
        <h3 class="ama-chapter-break__title da-rise">遗忘才是终点；方舟负责记住。</h3>""",
    1,
)

# JS: parallax bg + fade
old_js = """const daChapter=document.getElementById('digitalark');
if(daChapter){
  const daRiseObs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      daChapter.classList.add('in');
      entry.target.querySelectorAll('.da-rise').forEach((el,i)=>{
        el.classList.add('in');
        el.style.transitionDelay=(i*.08)+'s';
      });
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  daRiseObs.observe(daChapter);
}"""

new_js = """const daChapter=document.getElementById('digitalark');
if(daChapter){
  const daBgImg=daChapter.querySelector('.da-ds-bg__img');
  const daWrap=daChapter.querySelector('.da-ds-wrap');
  function syncDaBg(){
    if(!daBgImg||!daWrap) return;
    const imgH=daBgImg.offsetHeight;
    const chH=daChapter.offsetHeight;
    const maxShift=Math.max(0,imgH-chH);
    const top=daChapter.getBoundingClientRect().top;
    const span=Math.max(1,chH-innerHeight);
    const p=Math.min(1,Math.max(0,-top/span));
    daBgImg.style.transform='translate3d(0,'+(-p*maxShift)+'px,0)';
  }
  const daInObs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ daChapter.classList.toggle('in-view',entry.isIntersecting); });
  },{threshold:0,rootMargin:'0px'});
  daInObs.observe(daChapter);
  const daFadeObs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      entry.target.classList.add('in');
      daFadeObs.unobserve(entry.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  daChapter.querySelectorAll('.da-fade,.da-rise').forEach((el,i)=>{
    el.style.transitionDelay=(i*.05)+'s';
    daFadeObs.observe(el);
  });
  window.addEventListener('scroll',syncDaBg,{passive:true});
  window.addEventListener('resize',syncDaBg,{passive:true});
  syncDaBg();
}"""

html = html.replace(old_js, new_js)

(root / "index.html").write_text(html, encoding="utf-8")
print("ok")
