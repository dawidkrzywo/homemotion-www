// Galeria: czyta galeria/uklad.json (eksport z edytora na claude.ai, patrz narzedzia/galeria-sync.py)
// i rozkłada okna tak samo jak w edytorze. Tylko podgląd, bez edycji.
(() => {
  "use strict";
  const TABS = [{ id: "home-motion", label: "Home Motion" }, { id: "drones-dk", label: "drones.dk" }];
  const W = 1000;
  const DIR = "/assets/galeria/";
  const stackMQ = matchMedia("(max-width: 640px)");
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  const $ = id => document.getElementById(id);
  const nav = $("tabs"), canvas = $("canvas"), empty = $("empty");
  const lb = $("lb"), lbm = $("lbm"), lbc = $("lbc");

  let state = { tabs: {} };
  let tab = tabFromHash() || TABS[0].id;
  let scale = 1, lastWidth = 0;
  const els = new Map();

  function tabFromHash() { const h = location.hash.slice(1); return TABS.some(t => t.id === h) ? h : null; }
  const items = () => state.tabs[tab] || [];
  const readingOrder = (a, b) => (a.y - b.y) || (a.x - b.x);

  function renderTabs() {
    nav.textContent = "";
    for (const t of TABS) {
      const a = document.createElement("a");
      a.className = "tab"; a.href = "#" + t.id; a.textContent = t.label;
      if (t.id === tab) a.setAttribute("aria-current", "page");
      nav.append(a);
    }
  }

  function makeMedia(it, forLightbox) {
    let m;
    if (it.type === "video") {
      m = document.createElement("video");
      m.muted = !forLightbox; m.loop = true; m.playsInline = true;
      m.setAttribute("playsinline", "");
      if (!forLightbox) m.setAttribute("muted", "");
      m.preload = forLightbox ? "auto" : "metadata";
      m.poster = DIR + it.id + ".jpg";
      if (forLightbox) { m.controls = true; m.autoplay = true; }
      const s1 = document.createElement("source");
      s1.src = DIR + it.id + "-720.mp4"; s1.type = "video/mp4"; s1.media = "(max-width: 820px)";
      const s2 = document.createElement("source");
      s2.src = DIR + it.id + ".mp4"; s2.type = "video/mp4";
      m.append(s1, s2);
    } else {
      m = document.createElement("img");
      m.alt = ""; m.decoding = "async";
      m.src = DIR + it.id + (forLightbox ? ".webp" : "-m.webp");
      if (!forLightbox) {
        m.loading = "lazy";
        m.srcset = `${DIR}${it.id}-m.webp 800w, ${DIR}${it.id}.webp 1920w`;
      }
      m.draggable = false;
    }
    return m;
  }

  function render() {
    canvas.textContent = ""; els.clear();
    for (const it of items()) {
      const el = document.createElement("figure");
      el.className = "win"; el.dataset.id = it.id; el.tabIndex = 0;
      el.setAttribute("role", "button"); el.setAttribute("aria-label", it.type === "video" ? "Otwórz film" : "Otwórz zdjęcie");
      const m = makeMedia(it, false);
      m.classList.add("media");
      el.append(m);
      els.set(it.id, el);
      canvas.append(el);
    }
    empty.hidden = items().length > 0;
    renderTabs(); layout(); watchVideos();
  }

  // Kadr jak w edytorze: zdjęcie pokrywa okno (razy zoom) i jest przesunięte do punktu px/py (0–100).
  function fitMedia(el, it, bw, bh) {
    const m = el.querySelector(".media"); if (!m) return;
    const px = it.px ?? 50, py = it.py ?? 50;
    if (it.fit === "contain" || !it.ar || !bw || !bh) {
      m.classList.remove("pan");
      m.style.width = m.style.height = m.style.left = m.style.top = "";
      m.style.objectFit = it.fit === "contain" ? "contain" : "cover";
      m.style.objectPosition = `${px}% ${py}%`;
      return;
    }
    const rw = Math.max(bw, bh * it.ar) * (it.zoom || 1), rh = rw / it.ar;
    m.classList.add("pan");
    m.style.objectFit = "fill";
    m.style.width = rw + "px"; m.style.height = rh + "px";
    m.style.left = (bw - rw) * px / 100 + "px";
    m.style.top = (bh - rh) * py / 100 + "px";
    if (m.tagName === "IMG") m.sizes = Math.ceil(rw) + "px";
  }

  function layout() {
    const stack = stackMQ.matches;
    canvas.classList.toggle("stack", stack);
    lastWidth = canvas.clientWidth;
    scale = (lastWidth || 1) / W;
    const list = items();
    if (stack) {
      [...list].sort(readingOrder).forEach((it, i) => {
        const el = els.get(it.id); if (!el) return;
        el.style.cssText = ""; el.style.order = i; el.style.aspectRatio = (it.w / it.h).toFixed(4);
        fitMedia(el, it, lastWidth, lastWidth * it.h / it.w);
      });
      canvas.style.height = "";
      return;
    }
    let bottom = 0;
    for (const it of list) {
      const el = els.get(it.id); if (!el) continue;
      el.style.left = it.x * scale + "px"; el.style.top = it.y * scale + "px";
      el.style.width = it.w * scale + "px"; el.style.height = it.h * scale + "px";
      el.style.zIndex = it.z || 1; el.style.order = ""; el.style.aspectRatio = "";
      fitMedia(el, it, it.w * scale, it.h * scale);
      bottom = Math.max(bottom, it.y + it.h);
    }
    canvas.style.height = Math.ceil(bottom * scale) + "px";
  }

  new ResizeObserver(() => { if (canvas.clientWidth !== lastWidth) layout(); }).observe(canvas);
  stackMQ.addEventListener("change", layout);

  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (en.isIntersecting && !reduceMQ.matches) en.target.play().catch(() => {}); else en.target.pause();
    }
  }, { threshold: 0.25 });
  function watchVideos() { io.disconnect(); canvas.querySelectorAll("video").forEach(v => io.observe(v)); }

  /* podgląd */
  let lbList = [], lbI = 0;
  function openLb(id) {
    lbList = [...items()].sort(readingOrder);
    lbI = Math.max(0, lbList.findIndex(i => i.id === id));
    lb.hidden = false; document.body.classList.add("lb-open");
    canvas.querySelectorAll("video").forEach(v => v.pause());
    showLb(); $("lbx").focus();
  }
  function showLb() {
    lbm.textContent = "";
    lbm.append(makeMedia(lbList[lbI], true));
    lbc.textContent = `${String(lbI + 1).padStart(2, "0")} / ${String(lbList.length).padStart(2, "0")}`;
    $("lbp").hidden = $("lbn").hidden = lbList.length < 2;
  }
  function stepLb(d) { if (lbList.length < 2) return; lbI = (lbI + d + lbList.length) % lbList.length; showLb(); }
  function closeLb() {
    lbm.querySelector("video")?.pause();
    lbm.textContent = ""; lb.hidden = true; document.body.classList.remove("lb-open");
    watchVideos();
  }
  canvas.addEventListener("click", e => { const el = e.target.closest(".win"); if (el) openLb(el.dataset.id); });
  canvas.addEventListener("keydown", e => {
    const el = e.target.closest(".win");
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLb(el.dataset.id); }
  });
  $("lbx").addEventListener("click", closeLb);
  $("lbp").addEventListener("click", () => stepLb(-1));
  $("lbn").addEventListener("click", () => stepLb(1));
  lb.addEventListener("click", e => { if (e.target === lb || e.target === lbm) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowRight") stepLb(1);
    else if (e.key === "ArrowLeft") stepLb(-1);
  });
  let sw = null;
  lbm.addEventListener("pointerdown", e => { sw = { x: e.clientX, y: e.clientY }; });
  lbm.addEventListener("pointerup", e => {
    if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) stepLb(dx < 0 ? 1 : -1);
  });

  addEventListener("hashchange", () => {
    const t = tabFromHash(); if (!t || t === tab) return;
    tab = t; render(); scrollTo(0, 0);
  });

  renderTabs();
  fetch("/galeria/uklad.json", { cache: "no-cache" })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => { if (d && d.tabs) state = d; })
    .catch(() => {})
    .finally(render);
})();
