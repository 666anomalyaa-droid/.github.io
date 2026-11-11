/* =====================================================================
   H-Rua!! CINEMATIC FX SUITE
   3Dパララックス / カーソルトレイル / ショックウェーブ / ポータル遷移
   タイプライター / スクロール進捗 / カードスポットライト / JACKPOTバースト
   外部ライブラリ不要。prefers-reduced-motion とタッチ端末に配慮。
   ===================================================================== */
(() => {
  "use strict";

  const reduceMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  const finePointerQuery = window.matchMedia
    ? window.matchMedia("(hover: hover) and (pointer: fine)")
    : { matches: false };

  const state = {
    active: false,
    reduced: Boolean(reduceMotionQuery.matches),
    finePointer: Boolean(finePointerQuery.matches),
    frame: 0,
    pointerX: window.innerWidth / 2,
    pointerY: window.innerHeight / 2,
    lastTrailAt: 0,
    lastTrailX: 0,
    lastTrailY: 0,
    scrollFrame: 0,
    burstCount: 0
  };

  const byId = (id) => document.getElementById(id);
  const random = (min, max) => Math.random() * (max - min) + min;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const fxRoot = document.createElement("div");
  fxRoot.className = "fx-suite-root";
  fxRoot.setAttribute("aria-hidden", "true");

  const progress = document.createElement("span");
  progress.className = "fx-scroll-progress";
  fxRoot.append(progress);

  const crosshair = document.createElement("span");
  crosshair.className = "fx-cursor-crosshair";
  fxRoot.append(crosshair);

  const portal = document.createElement("span");
  portal.className = "fx-portal-transition";
  fxRoot.append(portal);

  const flash = document.createElement("span");
  flash.className = "fx-screen-flash";
  fxRoot.append(flash);

  document.body.append(fxRoot);

  function updateScrollProgress() {
    state.scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  }

  function requestScrollUpdate() {
    if (state.scrollFrame) return;
    state.scrollFrame = window.requestAnimationFrame(updateScrollProgress);
  }

  function createParticleBurst(x, y, amount = 10, strength = 1) {
    if (state.reduced || state.burstCount > 3) return;
    state.burstCount += 1;

    const burst = document.createElement("span");
    burst.className = "fx-particle-burst";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;

    for (let index = 0; index < amount; index += 1) {
      const particle = document.createElement("i");
      const angle = (Math.PI * 2 * index) / amount + random(-0.2, 0.2);
      const distance = random(28, 86) * strength;
      particle.style.setProperty("--fx-x", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--fx-y", `${Math.sin(angle) * distance}px`);
      particle.style.setProperty("--fx-delay", `${random(0, 90)}ms`);
      particle.style.setProperty("--fx-size", `${random(2, 5)}px`);
      burst.append(particle);
    }

    fxRoot.append(burst);
    window.setTimeout(() => {
      burst.remove();
      state.burstCount = Math.max(0, state.burstCount - 1);
    }, 1050);
  }

  function showShockwave(x, y, intensity = 1) {
    if (state.reduced) return;
    const wave = document.createElement("span");
    wave.className = "fx-shockwave";
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    wave.style.setProperty("--fx-wave-scale", String(intensity > 1 ? 10 : 7));
    fxRoot.append(wave);
    window.setTimeout(() => wave.remove(), 850);
    createParticleBurst(x, y, intensity > 1 ? 14 : 8, intensity);
  }

  function runPortalTransition(x, y) {
    if (state.reduced) return;
    portal.style.setProperty("--fx-origin-x", `${x}px`);
    portal.style.setProperty("--fx-origin-y", `${y}px`);
    portal.classList.remove("is-active");
    void portal.offsetWidth;
    portal.classList.add("is-active");
    window.setTimeout(() => portal.classList.remove("is-active"), 760);
  }

  function runScreenFlash() {
    if (state.reduced) return;
    flash.classList.remove("is-active");
    void flash.offsetWidth;
    flash.classList.add("is-active");
    window.setTimeout(() => flash.classList.remove("is-active"), 500);
  }

  function addCursorTrail(x, y) {
    const now = performance.now();
    const distance = Math.hypot(x - state.lastTrailX, y - state.lastTrailY);
    if (now - state.lastTrailAt < 34 || distance < 9) return;
    state.lastTrailAt = now;
    state.lastTrailX = x;
    state.lastTrailY = y;

    const trail = document.createElement("i");
    trail.className = "fx-cursor-trail";
    trail.style.left = `${x}px`;
    trail.style.top = `${y}px`;
    trail.style.setProperty("--fx-trail-size", `${random(3, 6)}px`);
    fxRoot.append(trail);
    window.setTimeout(() => trail.remove(), 620);
  }

  function typeText(element, speed = 30, startDelay = 0) {
    if (!element || element.dataset.fxTyped === "true") return Promise.resolve();
    const fullText = element.textContent.trim();
    if (!fullText) return Promise.resolve();

    element.dataset.fxTyped = "true";
    element.setAttribute("aria-label", fullText);
    element.textContent = "";
    element.classList.add("fx-typewriter-active");

    return new Promise((resolve) => {
      let position = 0;
      window.setTimeout(() => {
        const tick = () => {
          if (state.reduced || !document.body.isConnected) {
            element.textContent = fullText;
            element.classList.remove("fx-typewriter-active");
            resolve();
            return;
          }
          const chars = Array.from(fullText);
          position += 1;
          element.textContent = chars.slice(0, position).join("");
          if (position >= chars.length) {
            element.classList.remove("fx-typewriter-active");
            resolve();
            return;
          }
          const current = chars[position - 1];
          const pause = /[、。,.!?！？」』]/u.test(current) ? 150 : 0;
          window.setTimeout(tick, speed + pause);
        };
        tick();
      }, startDelay);
    });
  }

  function startTypewriterSequence() {
    if (state.reduced) return;
    const kicker = byId("heroKicker");
    const lead = byId("heroCatchcopy");
    typeText(kicker, 44, 500).then(() => typeText(lead, 25, 160));
  }

  function setupTilt() {
    if (!state.finePointer || state.reduced) return;
    const selector = ".portrait-frame, .profile-card, .skill-card, .social-card:not(.is-disabled), .gallery-card, .collection-card";
    const targets = document.querySelectorAll(selector);

    targets.forEach((card) => {
      card.classList.add("fx-tilt-target");
      card.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = card.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / Math.max(1, rect.width);
        const ny = (event.clientY - rect.top) / Math.max(1, rect.height);
        const rotateY = (nx - 0.5) * 8;
        const rotateX = (0.5 - ny) * 7;
        card.style.setProperty("--fx-tilt-x", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--fx-tilt-y", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--fx-spot-x", `${(nx * 100).toFixed(1)}%`);
        card.style.setProperty("--fx-spot-y", `${(ny * 100).toFixed(1)}%`);
        card.style.setProperty("--fx-lift", card.matches(".portrait-frame, .profile-card") ? "0px" : "-4px");
        card.classList.add("fx-tilt-active");
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("fx-tilt-active");
        card.style.setProperty("--fx-tilt-x", "0deg");
        card.style.setProperty("--fx-tilt-y", "0deg");
        card.style.setProperty("--fx-lift", "0px");
      }, { passive: true });
    });
  }

  function setupMagneticControls() {
    if (!state.finePointer || state.reduced) return;
    const selector = ".button, .hero .text-link, .site-nav a, .music-page-arrow, .gallery-arrow, .bgm-toggle";
    document.querySelectorAll(selector).forEach((control) => {
      control.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const rect = control.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        control.style.setProperty("--fx-magnet-x", `${(x * 0.09).toFixed(1)}px`);
        control.style.setProperty("--fx-magnet-y", `${(y * 0.09).toFixed(1)}px`);
      }, { passive: true });
      control.addEventListener("pointerleave", () => {
        control.style.setProperty("--fx-magnet-x", "0px");
        control.style.setProperty("--fx-magnet-y", "0px");
      }, { passive: true });
    });
  }

  function setupHeroParallax() {
    if (!state.finePointer || state.reduced) return;
    const hero = byId("top");
    const visual = hero && hero.querySelector(".hero-visual");
    const frame = hero && hero.querySelector(".portrait-frame");
    if (!hero || !visual) return;

    hero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      const y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
      visual.style.setProperty("--fx-parallax-x", `${(x * 9).toFixed(1)}px`);
      visual.style.setProperty("--fx-parallax-y", `${(y * 8).toFixed(1)}px`);
      if (frame) {
        frame.style.setProperty("--fx-image-x", `${(x * -7).toFixed(1)}px`);
        frame.style.setProperty("--fx-image-y", `${(y * -7).toFixed(1)}px`);
      }
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      visual.style.setProperty("--fx-parallax-x", "0px");
      visual.style.setProperty("--fx-parallax-y", "0px");
      if (frame) {
        frame.style.setProperty("--fx-image-x", "0px");
        frame.style.setProperty("--fx-image-y", "0px");
      }
    }, { passive: true });
  }

  function addPortraitScan() {
    const frame = document.querySelector(".portrait-frame");
    if (!frame || frame.querySelector(".fx-image-scan")) return;
    const scan = document.createElement("span");
    scan.className = "fx-image-scan";
    scan.setAttribute("aria-hidden", "true");
    frame.append(scan);
  }

  function setupHeadingReveals() {
    if (state.reduced || !("IntersectionObserver" in window)) return;
    const headings = document.querySelectorAll(".section-heading h2, .hero h1");
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("fx-heading-active");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    headings.forEach((heading) => observer.observe(heading));
  }

  function setupAmbientBloom() {
    const hero = byId("top");
    if (!hero || state.reduced) return;
    let stopped = false;
    const pulse = () => {
      if (stopped) return;
      if (!document.hidden && state.active && Math.random() > 0.38) {
        hero.classList.remove("fx-ambient-bloom");
        void hero.offsetWidth;
        hero.classList.add("fx-ambient-bloom");
        window.setTimeout(() => hero.classList.remove("fx-ambient-bloom"), 1800);
      }
      window.setTimeout(pulse, random(14000, 23000));
    };
    window.setTimeout(pulse, 7000);
    window.addEventListener("pagehide", () => { stopped = true; }, { once: true });
  }

  function activateProfileEffects() {
    if (state.active) return;
    state.active = true;
    document.body.classList.add("fx-suite-active");
    setupTilt();
    setupMagneticControls();
    setupHeroParallax();
    setupHeadingReveals();
    addPortraitScan();
    startTypewriterSequence();
    setupAmbientBloom();
    requestScrollUpdate();
    runScreenFlash();
  }

  // Pointer FX: cursors, trails, button shockwaves and smooth screen tracking.
  if (state.finePointer && !state.reduced) {
    window.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      if (!state.frame) {
        state.frame = window.requestAnimationFrame(() => {
          crosshair.style.transform = `translate3d(${state.pointerX}px, ${state.pointerY}px, 0) translate(-50%, -50%)`;
          crosshair.classList.add("is-visible");
          state.frame = 0;
        });
      }
      addCursorTrail(event.clientX, event.clientY);
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => crosshair.classList.remove("is-visible"));
    window.addEventListener("blur", () => crosshair.classList.remove("is-visible"));
  }

  document.addEventListener("pointerdown", (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!target || target.closest(".slot-gate, input, textarea, select, [contenteditable='true']")) return;
    const interactive = target.closest("button, a, [role='button']");
    if (!interactive) return;
    const strength = interactive.matches(".button-primary, .nav-contact, .slot-enter-button") ? 1.35 : 1;
    showShockwave(event.clientX, event.clientY, strength);
  }, { passive: true });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    if (!target) return;
    const link = target.closest("a[href^='#']");
    if (!link || link.closest(".slot-gate")) return;
    const hash = link.getAttribute("href");
    const targetId = hash && hash.length > 1 ? hash.slice(1) : "";
    if (!targetId || !byId(targetId)) return;
    const rect = link.getBoundingClientRect();
    runPortalTransition(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  requestScrollUpdate();

  // スロット入場成功後にプロフィール側の豪華演出をアンロック。
  window.addEventListener("hr:profile-entered", activateProfileEffects);
  window.addEventListener("hr:jackpot", (event) => {
    const display = document.querySelector(".slot-machine-display");
    const rect = display ? display.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const x = event.detail && Number.isFinite(event.detail.x) ? event.detail.x : rect.left + rect.width / 2;
    const y = event.detail && Number.isFinite(event.detail.y) ? event.detail.y : rect.top + rect.height / 2;
    createParticleBurst(x, y, 24, 1.7);
    runScreenFlash();
  });

  // Reduced-motion users still get immediate, readable content and the scroll indicator.
  if (!document.body.classList.contains("gate-locked")) activateProfileEffects();
})();
