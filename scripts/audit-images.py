import os, re, struct, urllib.request

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, "index.html"), encoding="utf-8").read()
refs = sorted(set(re.findall(r"assets/[a-zA-Z0-9_\-/.]+\.(?:jpg|jpeg|png|gif|webp)", html)))

def png_size(path):
    with open(path, "rb") as f:
        f.seek(16)
        w, h = struct.unpack(">II", f.read(8))
        return w, h

def jpeg_size(path):
    with open(path, "rb") as f:
        f.read(2)
        while True:
            marker = f.read(2)
            if len(marker) < 2:
                break
            while marker[0] != 0xFF:
                marker = marker[1:] + f.read(1)
            kind = marker[1]
            if kind in (0xC0, 0xC1, 0xC2):
                f.read(3)
                h, w = struct.unpack(">HH", f.read(4))
                return w, h
            length = struct.unpack(">H", f.read(2))[0]
            f.read(length - 2)

print("=== HTML references (local) ===")
for r in refs:
    p = os.path.join(root, r.replace("/", os.sep))
    if not os.path.isfile(p):
        print(f"MISSING  {r}")
        continue
    ext = os.path.splitext(p)[1].lower()
    size_fn = png_size if ext == ".png" else jpeg_size
    try:
        w, h = size_fn(p)
        dim = f"{w}x{h}"
    except Exception:
        dim = "?"
    print(f"{os.path.getsize(p)//1024:5}KB  {dim:>12}  {r}")

tracked = os.popen(f'git -C "{root}" ls-files assets').read().splitlines()
print("\n=== In git but NOT referenced in HTML ===")
for t in tracked:
    if t not in refs:
        p = os.path.join(root, t.replace("/", os.sep))
        ext = os.path.splitext(p)[1].lower()
        size_fn = png_size if ext == ".png" else jpeg_size
        try:
            w, h = size_fn(p)
            dim = f"{w}x{h}"
        except Exception:
            dim = "?"
        print(f"  {os.path.getsize(p)//1024:5}KB  {dim:>12}  {t}")

print("\n=== Untracked images in project root ===")
for f in os.listdir(root):
    if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        p = os.path.join(root, f)
        ext = os.path.splitext(p)[1].lower()
        size_fn = png_size if ext == ".png" else jpeg_size
        try:
            w, h = size_fn(p)
            dim = f"{w}x{h}"
        except Exception:
            dim = "?"
        print(f"  {os.path.getsize(p)//1024:5}KB  {dim:>12}  {f}")

print("\n=== Live site HTTP ===")
base = "https://shishoumei829-cyber.github.io/chen-biaoming-portfolio/"
for r in refs:
    try:
        req = urllib.request.urlopen(base + r, timeout=20)
        print(f"{req.status}  {req.headers.get('Content-Length', '?'):>8}  {r}")
    except Exception as e:
        print(f"FAIL  {r}  {e}")
