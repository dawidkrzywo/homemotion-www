// Dane kontaktowe w jednym miejscu — zmiana tutaj podmienia numer na całej stronie.
const KONTAKT = {
  telefon: "+48 608 590 939",
  email: "kontakt@homemotion.pl",
  instagram: "https://www.instagram.com/homemotion.pl/",
};

(() => {
  const tel = "tel:" + KONTAKT.telefon.replace(/\s/g, "");
  document.querySelectorAll("[data-phone]").forEach(a => { a.href = tel; a.textContent = KONTAKT.telefon; });
  document.querySelectorAll("[data-phone-btn]").forEach(a => { a.href = tel; });
  // Numer bez +48 (np. w nagłówku)
  const krotki = KONTAKT.telefon.replace(/^\+48\s*/, "");
  document.querySelectorAll("[data-phone-short]").forEach(a => { a.href = tel; a.setAttribute("aria-label", "Zadzwoń: " + krotki); const s = a.querySelector("span"); if (s) s.textContent = krotki; });
  document.querySelectorAll("[data-instagram]").forEach(a => { a.href = KONTAKT.instagram; });

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

  // Galeria sesji: pliki w assets/sesje/<folder>/NN.webp (duże) i NN-m.webp (miniatury), 01 = okładka.
  // NOWA SESJA: wrzuć zdjęcia do assets/sesje/<folder>/ i dopisz linijkę NA GÓRZE listy (najnowsza pierwsza).
  // dzielnica może być pusta ("") — np. dla Ząbek, Marek.
  const SESJE = [
    { folder: "warszawski-swit", miasto: "Warszawa", dzielnica: "Targówek",   ulica: "ul. Warszawski Świt", zdjec: 14 },
    { folder: "polna",           miasto: "Warszawa", dzielnica: "Śródmieście", ulica: "ul. Polna",          zdjec: 10 },
    { folder: "skrajna",         miasto: "Ząbki",    dzielnica: "",            ulica: "ul. Skrajna",        zdjec: 4 },
  ];
  const NA_START = 6; // tyle kafelków widać od razu, reszta pod „Pokaż wszystkie”
  const miejsce = s => [s.miasto, s.dzielnica].filter(Boolean).join(" · ");
  const tytul = s => [s.ulica, s.dzielnica, s.miasto].filter(Boolean).join(", ");
  const siatka = document.getElementById("sesje");
  siatka.innerHTML = SESJE.map((s, i) => {
    const okl = `assets/sesje/${s.folder}/01`;
    return `<li class="w${i === 0 ? " w-feature" : ""}"${i >= NA_START ? " hidden" : ""}>
      <button class="w-open" type="button" data-i="${i}" aria-label="Galeria: ${tytul(s)}, ${s.zdjec} zdjęć">
        <img src="${okl}-m.webp" srcset="${okl}-m.webp 800w, ${okl}.webp 1920w" sizes="${i === 0 ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"}" alt="" loading="lazy" decoding="async">
        <span class="w-cap"><span class="w-loc">${miejsce(s)}</span><strong>${s.ulica}</strong></span>
      </button>
    </li>`;
  }).join("");
  const wiecej = document.querySelector(".w-more");
  if (SESJE.length > NA_START) {
    wiecej.hidden = false;
    wiecej.textContent = `Pokaż wszystkie sesje (${SESJE.length})`;
    wiecej.addEventListener("click", () => { siatka.querySelectorAll("li[hidden]").forEach(li => { li.hidden = false; }); wiecej.hidden = true; });
  }
  const lb = document.getElementById("galeria");
  const lbImg = lb.querySelector(".lb-img");
  const lbN = lb.querySelector(".lb-n");
  let cur = null, idx = 0;
  const plik = (s, i) => `assets/sesje/${s.folder}/${String(i + 1).padStart(2, "0")}.webp`;
  const pokaz = i => {
    const n = SESJE[cur].zdjec;
    idx = (i + n) % n;
    lbImg.src = plik(SESJE[cur], idx);
    lbImg.alt = `${tytul(SESJE[cur])}, zdjęcie ${idx + 1}`;
    lbN.textContent = `${idx + 1} / ${n}`;
    [idx + 1, idx - 1].forEach(j => { new Image().src = plik(SESJE[cur], (j + n) % n); });
  };
  siatka.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => {
    cur = +b.dataset.i;
    lb.querySelector(".lb-title").textContent = tytul(SESJE[cur]);
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
