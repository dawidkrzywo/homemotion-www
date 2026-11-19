#!/usr/bin/env python3
"""Dodaje sesję do galerii na stronie.

Użycie:
  python3 narzedzia/dodaj-sesje.py <folder-ze-zdjeciami> --folder mokotow-pulawska \
      --miasto Warszawa --dzielnica Mokotów --ulica "ul. Puławska"

Co robi:
  - bierze zdjęcia JPG/PNG/WEBP z folderu w kolejności nazw plików (pierwsze = okładka),
  - zapisuje assets/sesje/<folder>/NN.webp (1920 px, q80) i NN-m.webp (800 px, q74),
  - dopisuje sesję na górę listy SESJE w main.js.
Wymaga: pip install pillow
"""
import argparse, pathlib, re, sys
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
p = argparse.ArgumentParser()
p.add_argument("zrodlo")
p.add_argument("--folder", required=True, help="nazwa folderu, małe litery i myślniki, np. mokotow-pulawska")
p.add_argument("--miasto", required=True)
p.add_argument("--dzielnica", default="")
p.add_argument("--ulica", required=True, help='np. "ul. Puławska"')
a = p.parse_args()

if not re.fullmatch(r"[a-z0-9-]+", a.folder):
    sys.exit("--folder: tylko małe litery bez polskich znaków, cyfry i myślniki")
pliki = sorted(f for f in pathlib.Path(a.zrodlo).iterdir() if f.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
if not pliki:
    sys.exit("Brak zdjęć w " + a.zrodlo)
cel = ROOT / "assets" / "sesje" / a.folder
if cel.exists():
    sys.exit(f"{cel} już istnieje — wybierz inną nazwę albo usuń stary folder")
cel.mkdir(parents=True)

for i, f in enumerate(pliki, 1):
    im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
    for szer, q, kon in ((1920, 80, ""), (800, 74, "-m")):
        k = im.copy()
        k.thumbnail((szer, szer * 2), Image.LANCZOS)
        k.save(cel / f"{i:02d}{kon}.webp", "WEBP", quality=q, method=6)
    print(f"{i:02d}  {f.name}")

js = ROOT / "main.js"
s = js.read_text(encoding="utf-8")
wpis = (f'    {{ folder: "{a.folder}", miasto: "{a.miasto}", dzielnica: "{a.dzielnica}", '
        f'ulica: "{a.ulica}", zdjec: {len(pliki)} }},\n')
s = s.replace("  const SESJE = [\n", "  const SESJE = [\n" + wpis, 1)
js.write_text(s, encoding="utf-8")
mb = sum(x.stat().st_size for x in cel.iterdir()) / 1e6
print(f"\nGotowe: {len(pliki)} zdjęć, {mb:.1f} MB, sesja dopisana na górę listy w main.js")
