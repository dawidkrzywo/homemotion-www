#!/usr/bin/env python3
"""Przenosi galerię z edytora na claude.ai na stronę homemotion.pl/galeria.

Użycie:
  python3 narzedzia/galeria-sync.py <uklad.json z edytora> <folder z pobranymi plikami>

<uklad.json z edytora>  — zawartość bloku g-data z edytora (zakładki, pozycje okien, kadry).
<folder z plikami>      — pliki z edytora nazwane <id-pliku>.<rozszerzenie> (tak je zapisuje Claude).

Co robi:
  - zdjęcia: assets/galeria/<id>.webp (1920 px, q80) i <id>-m.webp (800 px, q74),
  - filmy (bez dźwięku, 30 kl./s, faststart): <id>.mp4 (H.264 1080p) i <id>-720.mp4 (telefony)
    oraz kadr zastępczy <id>.jpg,
  - zapisuje galeria/uklad.json, który czyta strona,
  - usuwa z assets/galeria pliki, których nie ma już w układzie.
Pliki, które już istnieją, nie są konwertowane drugi raz.
Wymaga: pillow, ffmpeg.
"""
import json, pathlib, subprocess, sys
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
CEL = ROOT / "assets" / "galeria"
UKLAD = ROOT / "galeria" / "uklad.json"
LIMIT = 25 * 1024 * 1024  # Cloudflare Pages: 25 MB na plik

if len(sys.argv) != 3:
    sys.exit(__doc__)
dane = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
zrodla = pathlib.Path(sys.argv[2])
CEL.mkdir(parents=True, exist_ok=True)


def znajdz(asset):
    hit = sorted(zrodla.glob(asset + ".*"))
    return hit[0] if hit else None


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def zdjecie(src, ident):
    out = [CEL / f"{ident}.webp", CEL / f"{ident}-m.webp"]
    if all(o.exists() for o in out):
        return
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for (szer, q), o in zip(((1920, 80), (800, 74)), out):
        k = im.copy()
        k.thumbnail((szer, szer * 2), Image.LANCZOS)
        k.save(o, "WEBP", quality=q, method=6)


def film(src, ident):
    full, small, poster = CEL / f"{ident}.mp4", CEL / f"{ident}-720.mp4", CEL / f"{ident}.jpg"
    wspolne = ["-an", "-r", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    if not full.exists():
        ffmpeg("-i", str(src), "-vf", "scale='min(1920,iw)':-2", "-c:v", "libx264", "-preset", "slower",
               "-crf", "21", "-maxrate", "6M", "-bufsize", "12M", *wspolne, str(full))
    if not small.exists():
        ffmpeg("-i", str(src), "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-preset", "slower",
               "-crf", "22", "-maxrate", "3M", "-bufsize", "6M", *wspolne, str(small))
    if not poster.exists():
        ffmpeg("-i", str(full), "-frames:v", "1", "-q:v", "3", str(poster))
    for f in (full, small):
        if f.stat().st_size > LIMIT:
            print(f"UWAGA: {f.name} ma {f.stat().st_size / 1e6:.1f} MB, Cloudflare przyjmie do 25 MB — skróć film.")


uklad = {"v": 1, "tabs": {}}
uzyte = set()
for zakladka, lista in dane.get("tabs", {}).items():
    uklad["tabs"][zakladka] = []
    for it in lista:
        src = znajdz(it.get("asset", ""))
        if not src:
            print(f"pomijam {it.get('id')}: brak pliku {it.get('asset')} w {zrodla}")
            continue
        ident = it["id"]
        if it.get("type") == "video":
            film(src, ident)
            uzyte |= {f"{ident}.mp4", f"{ident}-720.mp4", f"{ident}.jpg"}
        else:
            zdjecie(src, ident)
            uzyte |= {f"{ident}.webp", f"{ident}-m.webp"}
        wpis = {k: it[k] for k in ("id", "type", "x", "y", "w", "h", "z", "ar", "px", "py", "zoom", "fit") if k in it}
        uklad["tabs"][zakladka].append(wpis)
        print(f"{zakladka:12} {it.get('type', 'image'):5} {ident}")

for f in CEL.iterdir():
    if f.is_file() and f.name not in uzyte:
        f.unlink()
        print(f"usunięto {f.name} (nie ma go już w galerii)")

UKLAD.parent.mkdir(exist_ok=True)
UKLAD.write_text(json.dumps(uklad, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
mb = sum(f.stat().st_size for f in CEL.iterdir()) / 1e6
n = sum(len(v) for v in uklad["tabs"].values())
print(f"\nGotowe: {n} plików w galerii, {mb:.1f} MB w assets/galeria, układ w galeria/uklad.json")
