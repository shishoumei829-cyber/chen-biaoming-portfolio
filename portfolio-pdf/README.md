# 陈彪明 · 设计作品集（PDF 版）

莫兰迪「咖绿撞色」杂志风格的作品集，**以文字与排版为主、不使用图片**，输出为**单页连续**的极简 PDF（页面高度按内容自适应，无多余留白）。

## 文件

- `index.html` — 杂志版面源文件（9 页：封面 / 关于我 / 目录 / AMADEUS / 数字方舟 / 墨舟 / MIRAGE / 能力 / 再会）。
- `fonts.css` + `fonts/` — 本地嵌入的拉丁字体（Playfair Display 标题 · Allura 花体 · Jost 标签），保证 PDF 字体可移植。中文使用系统的 **Noto Serif CJK SC**。
- `fetch_fonts.py` — 重新下载拉丁字体的脚本。
- `陈彪明-设计作品集-2026.pdf` — 导出的成品 PDF。

## 重新生成 PDF

需要 Chrome / Chromium 与中文衬线字体（`fonts-noto-cjk`）。页面内联脚本会把纸张高度设为整页内容高度，导出单页连续 PDF：

```bash
google-chrome --headless --no-sandbox --disable-gpu \
  --user-data-dir=/tmp/chrome-pdf --no-pdf-header-footer \
  --print-to-pdf="陈彪明-设计作品集-2026.pdf" \
  "file://$PWD/index.html"
```

## 设计

- 配色：橄榄咖绿 `#75785b` · 深咖 `#2c2820` · 米杏 `#ece4d3` · 橙色撞色 `#cf7d3c`
- 字体：Playfair Display（高对比衬线）+ Allura（手写花体）+ Jost（标签）+ Noto Serif CJK SC（中文衬线）
- 版式：杂志编辑式，极简、克制留白、编号目录、双语小标签、整段色块分章；单页连续、高度随内容自适应。
