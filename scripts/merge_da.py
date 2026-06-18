import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
index = (root / "index.html").read_text(encoding="utf-8")
restore = (root / "scripts" / "_da_restore.html").read_text(encoding="utf-8")

# Remove typewriter in digital ark — use static headlines + fade class
restore = re.sub(
    r'<h3 class="thought-line ama-dnote-line(?: ama-dnote-line--offset)?" data-typewriter="[^"]*"></h3>',
    lambda m: m.group(0).replace(' data-typewriter="' + re.search(r'data-typewriter="([^"]*)"', m.group(0)).group(1) + '"', '').replace('thought-line ', 'da-rise '),
    restore,
)
restore = restore.replace('data-typewriter="本地训练、五层人格、&#10;三端陪护一体。"', '')
restore = restore.replace('data-typewriter="遗忘才是终点；&#10;方舟负责记住。"', '')
restore = re.sub(
    r'<h3 class="ama-chapter-break__title thought-line"([^>]*)></h3>',
    r'<h3 class="ama-chapter-break__title da-rise"\1>本地训练、五层人格、三端陪护一体。</h3>',
    restore,
    count=1,
)
restore = re.sub(
    r'<h3 class="ama-chapter-break__title thought-line"([^>]*)></h3>',
    r'<h3 class="ama-chapter-break__title da-rise"\1>遗忘才是终点；方舟负责记住。</h3>',
    restore,
    count=1,
)

bridge = """
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
"""

# Insert after opening section tag + atmo optional - after da-vrule or after section open
insert_at = restore.index('<p class="da-vrule"')
if insert_at < 0:
    insert_at = restore.index('<header class="da-hero')
restore = restore[:insert_at] + bridge + restore[insert_at:]

# Fix dnote headlines manually
restore = restore.replace(
    '<h3 class="da-rise ama-dnote-line" data-typewriter="遗忘，比离别&#10;更让人难以承受。"></h3>',
    '<h3 class="da-rise ama-dnote-line">遗忘，比离别更让人难以承受。</h3>',
)
restore = restore.replace(
    '<h3 class="da-rise ama-dnote-line ama-dnote-line--offset" data-typewriter="被记住，&#10;比被模仿更接近安慰。"></h3>',
    '<h3 class="da-rise ama-dnote-line ama-dnote-line--offset">被记住，比被模仿更接近安慰。</h3>',
)

# Remove inner ama-ds-ark from amadeus
start_ds = index.index('<section class="ama-ds-ark" id="digitalark"')
end_ds = index.index('</section>', start_ds) + len('</section>')
index = index[:start_ds] + index[end_ds:]

# Insert full chapter after amadeus closes (before timewalker)
marker = '  </section>\n\n  <section class="section timewalker'
pos = index.index(marker)
index = index[:pos] + '\n' + restore + '\n' + index[pos:]

# CSS from 71d4569
full71 = subprocess.check_output(["git", "-C", str(root), "show", "71d4569:index.html"]).decode("utf-8")
css_start = full71.index("/* ═══ 第04話 · 数字方舟 ═══ */")
css_end = full71.index("/* ═══ 移动端 · 桌面样式不变 ═══ */")
css71 = full71[css_start:css_end]

extra_css = """
.da-bridge{
  position:relative;z-index:1;
  padding:clamp(28px,4vw,40px) clamp(22px,5vw,72px);
  background:linear-gradient(180deg,#fff,var(--da-cream));
  border-top:1px solid var(--da-line);
}
.da-bridge-kicker{
  font-family:var(--eva-wall);font-size:10px;letter-spacing:.38em;
  text-transform:uppercase;color:var(--da-sage);margin:0 0 10px;
}
.da-bridge-note{
  font-family:"Noto Serif SC",serif;font-size:14px;line-height:1.95;
  color:var(--da-body);font-weight:300;max-width:52em;margin:0;
}
.da-ui-lead{
  position:relative;z-index:1;
  padding:clamp(40px,6vw,72px) clamp(22px,5vw,72px);
  background:var(--da-sand);
  border-top:1px solid var(--da-line);
}
.da-phone--hero{transform:translateY(-12px);box-shadow:0 36px 80px rgba(28,28,24,.14)}
#digitalark .da-rise{
  opacity:0;transform:translateY(20px);
  transition:opacity .95s var(--ease),transform .95s var(--ease);
}
#digitalark.in .da-rise,#digitalark .da-rise.in{
  opacity:1;transform:none;
}
"""

css_block = css71 + extra_css

cur_start = index.index("/* ═══ 数字方舟 · Death Stranding")
cur_end = index.index("/* ═══ 移动端 · 桌面样式不变 ═══ */")
index = index[:cur_start] + css_block + index[cur_end:]

(root / "index.html").write_text(index, encoding="utf-8")
print("merged ok")
