#!/usr/bin/env python3
"""Sync Digital Ark public UI into portfolio copies with static-path fixes."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = Path(r"E:\数字方舟\digital-ark\public")
DESTS = [
    ROOT / "digitalark" / "app",
    ROOT / "assets" / "digitalark-app",
]
EMBED_CSS = ROOT / "assets" / "digitalark-app" / "css" / "portfolio-embed.css"
EMBED_HEAD = (
    '<link rel="stylesheet" href="../css/portfolio-embed.css"/>\n'
    '<script>if(/embed=portfolio/.test(location.search))'
    'document.documentElement.classList.add(\'da-portfolio-embed\');</script>\n'
)


def patch_content(text: str, rel: str) -> str:
    if rel.startswith("apps/"):
        text = text.replace('href="/css/', 'href="../css/')
        text = text.replace('href="/js/', 'href="../js/')
        text = text.replace('src="/js/', 'src="../js/')
        text = text.replace('href="/apps/', 'href="')
    elif rel.startswith("js/"):
        text = text.replace("'/assets/", "'../assets/")
        text = text.replace('"/assets/', '"../assets/')
        text = text.replace('`/assets/', '`../assets/')
        text = text.replace("= '/assets/", "= '../assets/")
        text = text.replace('= "/assets/', '= "../assets/')
        text = text.replace("'/../assets/", "'../assets/")
        text = text.replace('"/../assets/', '"../assets/')
        text = text.replace('= "/../assets/', '= "../assets/')
    elif rel == "index.html":
        text = text.replace('url=/apps/', 'url=apps/')
        text = text.replace('href="/apps/', 'href="apps/')

    if rel == "apps/sanctuary.html":
        if "portfolio-embed.css" not in text:
            text = text.replace(
                '<link rel="stylesheet" href="../css/digital-ark-ui.css"/>',
                '<link rel="stylesheet" href="../css/digital-ark-ui.css"/>\n' + EMBED_HEAD,
                1,
            )
    return text


def sync_dest(dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(SRC, dest)

    if EMBED_CSS.exists():
        shutil.copy2(EMBED_CSS, dest / "css" / "portfolio-embed.css")

    for path in sorted(dest.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(dest).as_posix()
        if path.suffix.lower() not in {".html", ".js", ".css"}:
            continue
        raw = path.read_text(encoding="utf-8")
        patched = patch_content(raw, rel)
        if patched != raw:
            path.write_text(patched, encoding="utf-8", newline="\n")

    print(f"OK  {dest.relative_to(ROOT)}  ({sum(1 for _ in dest.rglob('*') if _.is_file())} files)")


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"源目录不存在: {SRC}")
    for dest in DESTS:
        sync_dest(dest)
    print("数字方舟 App UI 已同步到作品集。")


if __name__ == "__main__":
    main()
