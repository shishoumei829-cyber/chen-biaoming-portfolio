import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
html = subprocess.check_output(
    ["git", "-C", str(root), "show", "71d4569:index.html"]
).decode("utf-8")
start = html.index('<section class="section da-chapter" id="digitalark"')
end = html.index('<section class="section light self', start)
(root / "scripts" / "_da_restore.html").write_text(html[start:end], encoding="utf-8")
print("wrote", end - start, "chars")
