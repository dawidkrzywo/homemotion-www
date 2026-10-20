// Dane kontaktowe w jednym miejscu — zmiana tutaj podmienia numer na całej stronie.
const KONTAKT = {
  telefon: "+48 608 590 939",
  email: "kontakt@homemotion.pl",
};

(() => {
  const tel = "tel:" + KONTAKT.telefon.replace(/\s/g, "");
  document.querySelectorAll("[data-phone]").forEach(a => { a.href = tel; a.textContent = KONTAKT.telefon; });
  document.querySelectorAll("[data-phone-btn]").forEach(a => { a.href = tel; });

  // Nagłówek: przezroczysty nad filmem, pełny po przewinięciu
  const top = document.querySelector(".top");
  const hero = document.querySelector(".hero");
  const onScroll = () => top.classList.toggle("solid", window.scrollY > hero.offsetHeight - 80);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Film: jeśli pliku jeszcze nie ma, zostaje tło zastępcze
  const video = document.querySelector(".hero-video");
  const src = video.querySelector("source");
  const hide = () => video.classList.add("missing");
  src.addEventListener("error", hide);
  video.addEventListener("error", hide);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.removeAttribute("autoplay"); video.pause(); }

  // Licznik czasu w wizjerze (godz:min:sek:klatki, 25 kl/s)
  const tc = document.querySelector(".tc");
  const t0 = performance.now();
  const pad = n => String(n).padStart(2, "0");
  const tick = () => {
    const f = Math.floor((performance.now() - t0) / 40);
    const s = Math.floor(f / 25);
    tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 25)}`;
    requestAnimationFrame(tick);
  };
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(tick);

  // Galeria sesji: pliki w assets/sesje/<folder>/NN.webp (duże) i NN-m.webp (miniatury)
  const SESJE = {
    "warszawski-swit": { tytul: "Mieszkanie 51 m², Targówek · ul. Warszawski Świt", zdjec: 14 },
    "polna": { tytul: "Mieszkanie 40 m², Śródmieście · ul. Polna", zdjec: 10 },
    "skrajna": { tytul: "Mieszkanie 56 m², Ząbki · Garden Plaza II", zdjec: 4 },
  };
  const lb = document.getElementById("galeria");
  const lbImg = lb.querySelector(".lb-img");
  const lbN = lb.querySelector(".lb-n");
  let cur = null, idx = 0;
  const plik = (s, i) => `assets/sesje/${s}/${String(i + 1).padStart(2, "0")}.webp`;
  const pokaz = i => {
    const n = SESJE[cur].zdjec;
    idx = (i + n) % n;
    lbImg.src = plik(cur, idx);
    lbImg.alt = `${SESJE[cur].tytul}, zdjęcie ${idx + 1}`;
    lbN.textContent = `${idx + 1} / ${n}`;
    [idx + 1, idx - 1].forEach(j => { new Image().src = plik(cur, (j + n) % n); });
  };
  document.querySelectorAll("[data-sesja]").forEach(b => b.addEventListener("click", () => {
    cur = b.dataset.sesja;
    lb.querySelector(".lb-title").textContent = SESJE[cur].tytul;
    lb.showModal();
    pokaz(0);
  }));
  lb.querySelector(".lb-x").addEventListener("click", () => lb.close());
  lb.querySelector(".lb-prev").addEventListener("click", () => pokaz(idx - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => pokaz(idx + 1));
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") pokaz(idx + 1);
    if (e.key === "ArrowLeft") pokaz(idx - 1);
  });
  let x0 = null;
  const stage = lb.querySelector(".lb-stage");
  stage.addEventListener("pointerdown", e => { x0 = e.clientX; });
  stage.addEventListener("pointerup", e => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) pokaz(idx + (dx < 0 ? 1 : -1));
  });
  lb.addEventListener("close", () => { lbImg.removeAttribute("src"); });

  // Formularz: na razie otwiera maila z wypełnioną treścią (bez serwera)
  const form = document.getElementById("quote");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const zakres = d.getAll("zakres").join(", ") || "do ustalenia";
    const body = `Adres: ${d.get("adres")}\nMetraż: ${d.get("metraz") || "-"}\nZakres: ${zakres}\nTelefon: ${d.get("telefon")}`;
    location.href = `mailto:${KONTAKT.email}?subject=${encodeURIComponent("Sesja: " + d.get("adres"))}&body=${encodeURIComponent(body)}`;
    form.querySelector(".form-note").textContent = "Otworzyłem twoją pocztę z gotową wiadomością. Wystarczy ją wysłać.";
  });
})();
