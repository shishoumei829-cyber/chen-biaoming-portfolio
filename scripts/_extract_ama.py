import subprocess
import sys

text = subprocess.check_output(
    ["git", "show", "1ae1f27:index.html"],
    cwd=r"C:\Users\SHIKIMORI\Desktop\个人网站",
    text=True,
    encoding="utf-8",
    errors="replace",
)
start = text.find('id="ama-formula"')
end = text.find("ama-paper-cta")
out = r"C:\Users\SHIKIMORI\Desktop\个人网站\scripts\_ama_original_04-07.html"
with open(out, "w", encoding="utf-8") as f:
    f.write(text[start:end])
print("written", len(text[start:end]))
