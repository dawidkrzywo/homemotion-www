# homemotion.pl

Statyczna strona Home Motion: `index.html`, `styles.css`, `main.js`, pliki w `assets/`.

- Numer telefonu i e-mail: na górze `main.js` (obiekt `KONTAKT`).
- Film w hero: `assets/showreel.mp4` (H.264 1080p, dla wszystkich przeglądarek), `assets/showreel-av1.mp4` (AV1 1080p, lżejszy, dla nowszych), `assets/showreel-720.mp4` (telefony); kadr zastępczy `assets/hero-poster.jpg`. Pętla bez dźwięku, 30 kl./s.
- Źródła filmów (mastery) trzymamy poza repo: `E:\Home Motion\.Pliki źródłowe na stronę`.
- Publikacja: Cloudflare Pages podpięte pod gałąź `main`, bez kroku budowania (katalog wyjściowy `/`).
