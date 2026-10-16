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
