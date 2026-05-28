# -*- coding: utf-8 -*-
"""Merge digitalark-redesign.html into index.html, keep da-ds-bg background."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
index_path = root / "index.html"
redesign_path = Path(r"C:\Users\SHIKIMORI\Downloads\digitalark-redesign.html")

index = index_path.read_text(encoding="utf-8")
redesign = redesign_path.read_text(encoding="utf-8")

css_start = redesign.index('<style id="da-redesign-css">') + len('<style id="da-redesign-css">')
css_end = redesign.index("</style>", css_start)
da2_css = redesign[css_start:css_end].strip()
da2_css = re.sub(r"^#digitalark\{[^}]+\}\s*", "", da2_css, count=1, flags=re.S)

html_start = redesign.index('<section class="section da-chapter" id="digitalark"')
html_end = redesign.index("</section>", html_start) + len("</section>")
da2_html = redesign[html_start:html_end]
inner_start = da2_html.index(">") + 1
inner_end = da2_html.rindex("</section>")
da2_body = da2_html[inner_start:inner_end].strip()
da2_body = re.sub(
    r"<!-- HUD 边框.*?-->\s*<div class=\"da-ds-frame\".*?</div>\s*",
    "",
    da2_body,
    flags=re.S,
)

bg_block = """    <div class="da-ds-wrap">
      <div class="da-ds-bg" aria-hidden="true">
        <div class="da-ds-bg-panel"><img src="assets/digitalark/ds-bg-coast.png" alt="" width="768" height="1024" loading="lazy" decoding="async"></div>
        <div class="da-ds-bg-panel"><img src="assets/digitalark/ds-bg-mist.png" alt="" width="768" height="1024" loading="lazy" decoding="async"></div>
        <div class="da-ds-bg-panel"><img src="assets/digitalark/ds-bg-foam.png" alt="" width="768" height="1024" loading="lazy" decoding="async"></div>
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
""" + da2_body + """
      </div>
    </div>"""

new_section = f"""  <section class="section da-chapter" id="digitalark" aria-labelledby="da2-title">
{bg_block}
  </section>"""

js_start = redesign.index('<script id="da-redesign-js">') + len('<script id="da-redesign-js">')
js_end = redesign.index("</script>", js_start)
da2_js = redesign[js_start:js_end].strip()

css_marker_start = "/* ═══ 第04話 · 数字方舟"
css_marker_end = "/* ═══ 移动端 · 桌面样式不变 ═══ */"
i0 = index.index(css_marker_start)
i1 = index.index(css_marker_end)

base_css = """/* ═══ 第04話 · 数字方舟 · 长卷背景 + 改版 ═══ */
#digitalark{
  --ds-ink:#f4f1ec;
  --ds-muted:rgba(244,241,236,.58);
  --ds-dim:rgba(244,241,236,.36);
  --ds-line:rgba(255,255,255,.10);
  --ds-red:rgba(153,0,0,.9);
  --ds-red-glow:rgba(153,0,0,.32);
  --ds-hud:"Barlow Condensed","Share Tech Mono",monospace;
  --ds-serif:"Noto Serif SC",Georgia,serif;
  --ds-sans:"Noto Sans SC","Helvetica Neue",sans-serif;
  padding:0!important;
  color:var(--ds-ink);
  background:#060608;
  overflow:hidden;
}
#digitalark .da2-p strong{color:var(--ds-ink);font-weight:400}
body.eva-skin #digitalark .ama-flow-v2>div,
body.eva-skin #digitalark .ama-v2-module,
body.eva-skin #digitalark .ama-chapter-break{
  box-shadow:none!important;transform:none!important;
}
body.eva-skin #digitalark .ama-v2-module{background:transparent!important}

.da-ds-wrap{position:relative;isolation:isolate;background:transparent}
.da-ds-bg{
  position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;
  display:flex;flex-direction:column;
}
.da-ds-bg-panel{flex:none;width:100%;min-height:100svh;overflow:hidden}
.da-ds-bg-panel img{
  width:100%;height:100%;min-height:100svh;display:block;
  object-fit:cover;object-position:center;
  filter:saturate(.96) contrast(1.05);
}
.da-ds-bg__grain{
  position:absolute;inset:0;opacity:.12;mix-blend-mode:overlay;z-index:2;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.da-ds-bg__readability{
  position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,rgba(6,6,8,.78) 0%,rgba(6,6,8,.52) 40%,rgba(6,6,8,.68) 100%);
  pointer-events:none;
}
.da-ds-frame{
  position:fixed;inset:clamp(10px,1.6vw,20px);z-index:5;pointer-events:none;
  opacity:0;transition:opacity .6s var(--ease);
}
#digitalark.in-view .da-ds-frame{opacity:1}
.da-ds-corner{position:absolute;width:24px;height:24px;border-color:rgba(255,255,255,.34);border-style:solid}
.da-ds-corner--tl{top:0;left:0;border-width:1px 0 0 1px}
.da-ds-corner--tr{top:0;right:0;border-width:1px 1px 0 0}
.da-ds-corner--bl{bottom:0;left:0;border-width:0 0 1px 1px}
.da-ds-corner--br{bottom:0;right:0;border-width:0 1px 1px 0}
.da-ds-body{position:relative;z-index:2}

@media (prefers-reduced-motion:reduce){
  #digitalark .da2-reveal,#digitalark .da2-tl-item,#digitalark .da2-eight-item,
  #digitalark .da2-training-step,#digitalark .da2-card{
    opacity:1!important;transform:none!important;transition:none!important;
  }
  #digitalark .da2-title-word{transform:none!important}
  #digitalark .da2-title-cn,#digitalark .da2-tagline,#digitalark .da2-scroll-hint{opacity:1!important;transform:none!important}
  #digitalark .da2-scroll-line{animation:none!important}
  #da2Canvas{display:none!important}
}

@media (max-width:768px){
  #digitalark{scroll-margin-top:72px}
}

"""

index = index[:i0] + base_css + da2_css + "\n" + index[i1:]

sec_start = index.index('  <section class="section da-chapter" id="digitalark"')
sec_end = index.index('  <section class="section timewalker', sec_start)
index = index[:sec_start] + new_section + "\n\n" + index[sec_end:]

old_js = """const daChapter=document.getElementById('digitalark');
if(daChapter){
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
}
"""
if old_js not in index:
    raise SystemExit("old daChapter JS block not found")
index = index.replace(old_js, da2_js + "\n")

index_path.write_text(index, encoding="utf-8")
print("Applied redesign to", index_path)
