/* MEATSPACE site. Scroll motion ported from the Pepito site (umano-style):
   Lenis smooth scroll + GSAP ScrollTrigger. Everything degrades to a plain,
   readable page without JS or with reduced motion. */
(() => {
  const CFG = window.MEATSPACE || {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---- links from config ------------------------------------------------- */
  $$(".js-steam").forEach(a => { a.href = CFG.steamUrl || "#"; });
  $$(".js-social").forEach(a => {
    const url = (CFG.socials || {})[a.dataset.social];
    if (url) a.href = url; else a.classList.add("is-empty");
  });
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  /* ---- progressive top-edge blur: stacked backdrop blurs, strong at the top ---- */
  const tb = $("#topblur");
  if (tb) {
    for (let i = 0; i < 10; i++) {
      const a = Math.max(0, (i - 2) * 10), b = i * 10, c = b + 10, d = Math.min(100, b + 30);
      const mask = i === 0
        ? "linear-gradient(#000 0%, #000 10%, rgba(0,0,0,0) 30%)"
        : `linear-gradient(rgba(0,0,0,0) ${a}%, #000 ${b}%, #000 ${c}%, rgba(0,0,0,0) ${d}%)`;
      const blur = (48 / Math.pow(1.9, i)).toFixed(2) + "px";
      const el = document.createElement("div");
      el.style.backdropFilter = el.style.webkitBackdropFilter = `blur(${blur})`;
      el.style.maskImage = el.style.webkitMaskImage = mask;
      tb.appendChild(el);
    }
  }

  /* ---- FAQ accordion ----------------------------------------------------- */
  $$(".qa button").forEach(btn => {
    btn.addEventListener("click", () => {
      const qa = btn.parentElement, ans = $(".ans", qa);
      const open = qa.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      ans.style.maxHeight = open ? ans.scrollHeight + "px" : "0px";
    });
  });

  /* ---- hero loop: only decode (and run the VHS grain) while the hero is on screen ---- */
  const heroVideo = $("#heroVideo"), heroSec = $(".hero");
  if (heroVideo && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      heroSec.classList.toggle("is-off", !e.isIntersecting);
      if (e.isIntersecting) heroVideo.play().catch(() => {}); else heroVideo.pause();
    }).observe(heroVideo);
  }

  /* ---- hero VCR counter follows the loop's playhead ---------------------------- */
  const heroTc = $("#heroTc");
  if (heroVideo && heroTc) {
    const p = n => String(n).padStart(2, "0");
    heroVideo.addEventListener("timeupdate", () => {
      const s = Math.floor(heroVideo.currentTime);
      heroTc.textContent = `00:${p(Math.floor(s / 60))}:${p(s % 60)}`;
    });
  }

  /* ---- full-screen player -------------------------------------------------- */
  const player = $("#player"), pv = $("#playerVideo");
  let lenis = null;
  const isFs = () => document.fullscreenElement || document.webkitFullscreenElement;
  function openPlayer() {
    if (!pv.src) pv.src = CFG.demoVideo || "assets/video/meatspace-demo.mp4";
    player.hidden = false;
    if (!reduce) {                                                           // the tape catches as it starts
      player.classList.remove("is-glitch"); void player.offsetWidth; player.classList.add("is-glitch");
    }
    if (lenis) lenis.stop();
    heroVideo && heroVideo.pause();
    pv.currentTime = 0;
    pv.play().catch(() => {});
    const req = player.requestFullscreen || player.webkitRequestFullscreen;
    if (req) req.call(player).catch?.(() => {});
    else if (pv.webkitEnterFullscreen) pv.webkitEnterFullscreen();          // iPhone
  }
  function closePlayer() {
    pv.pause();
    player.hidden = true;
    if (isFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    if (lenis) lenis.start();
    heroVideo && heroVideo.play().catch(() => {});
  }
  $("#playFull").addEventListener("click", openPlayer);
  $("#playerClose").addEventListener("click", closePlayer);
  pv.addEventListener("ended", closePlayer);
  pv.addEventListener("webkitendfullscreen", closePlayer);                   // iPhone "Done"
  const onFsChange = () => { if (!isFs() && !player.hidden) closePlayer(); };
  document.addEventListener("fullscreenchange", onFsChange);
  document.addEventListener("webkitfullscreenchange", onFsChange);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !player.hidden) closePlayer(); });

  /* ---- early-access sign-up ------------------------------------------------- */
  const form = $("#early-access");
  const msg = $(".signup__msg", form);
  const say = (text, kind) => { msg.textContent = text; msg.className = "signup__msg" + (kind ? " is-" + kind : ""); };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (form.website.value) return;                                         // honeypot
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say("That email doesn't look right.", "err"); form.email.focus(); return; }
    const s = CFG.signup || {};
    if (!s.action) {
      console.warn("[MEATSPACE] signup.action is empty in config.js: nothing was stored.");
      say("Sign-ups aren't connected yet. Check back soon.", "err");
      return;
    }
    // POST into a hidden frame: works with Kit, Buttondown, MailerLite, Google Forms, no CORS needed.
    let frame = $("#signup-frame");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.name = frame.id = "signup-frame"; frame.hidden = true;
      document.body.appendChild(frame);
    }
    const post = document.createElement("form");
    post.action = s.action; post.method = "POST"; post.target = "signup-frame"; post.hidden = true;
    const field = document.createElement("input");
    field.name = s.emailField || "email"; field.value = email;
    post.appendChild(field); document.body.appendChild(post);
    say("Sending…");
    const done = () => {
      form.classList.add("is-done");
      say("You're on the list. Check your inbox, and while you're there, wishlist us on Steam.", "ok");
      post.remove();
    };
    frame.addEventListener("load", done, { once: true });
    setTimeout(() => { if (!form.classList.contains("is-done")) done(); }, 6000);
    post.submit();
  });

  if (reduce || !window.gsap || !window.ScrollTrigger || !window.Lenis) {
    $$(".reveal").forEach(el => { el.style.opacity = 1; el.style.transform = "none"; });
    return;
  }

  /* ======================================================================== */
  gsap.registerPlugin(ScrollTrigger);

  /* Lenis smooth scroll (duration 1.2, same as Pepito/umano) */
  lenis = new Lenis({ duration: 1.2, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* Hero intro waits for the loader's stripe wipe, then starts while the wipe is mid-screen.
     Logo: wipe-up reveal; the clip is cleared afterwards so the VHS glow is never boxed in. */
  const logoImg = $(".hero__logo .line > img");
  gsap.set(logoImg, { clipPath: "inset(100% -20% -20% -20%)", y: 40 });
  const heroCard = $("#heroCard");
  gsap.set(heroCard, { opacity: 0, y: 24, scale: 0.97, filter: "blur(8px)" });
  const heroIntro = () => {
    gsap.to(heroCard, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out", delay: 0.25, clearProps: "filter" });
    gsap.to(logoImg, { clipPath: "inset(-20% -20% -20% -20%)", y: 0, duration: 1.1, ease: "expo.out", delay: 0.4, clearProps: "clipPath" });
    $$(".hero .reveal").forEach((el, i) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", delay: 0.55 + i * 0.07 });
    });
  };
  if (document.body.classList.contains("loaded")) heroIntro();
  else document.addEventListener("ms:loaded", heroIntro, { once: true });

  /* Fade-up reveal */
  $$(".reveal").forEach(el => {
    if (el.closest(".hero")) return;
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* Stripe bars draw in from the left (or out from the centre) once */
  $$(".js-bar").forEach(b => {
    const from = b.classList.contains("vhs-bar--center") ? "inset(-20px 50% -20px 50%)" : "inset(-20px 100% -20px -20px)";
    gsap.fromTo(b, { clipPath: from }, {
      clipPath: "inset(-20px -20px -20px -20px)", duration: 0.9, ease: "expo.out", clearProps: "clipPath",
      scrollTrigger: { trigger: b, start: "top 90%", once: true },
    });
  });

  /* Tape tear: two bands jitter across the screen as each new section arrives.
     Once per section, and never twice within a second, so fast scrolling stays calm. */
  const tear = $("#tear"), tearBands = $$("i", tear);
  let lastTear = -1e4;
  const playTear = () => {
    const now = performance.now();
    if (now - lastTear < 1000) return;
    lastTear = now;
    const tl = gsap.timeline({
      onStart: () => { tear.style.visibility = "visible"; },
      onComplete: () => { tear.style.visibility = "hidden"; },
    });
    tearBands.forEach((b, i) => {
      const at = i * 0.06;
      gsap.set(b, { top: gsap.utils.random(14, 76) + "vh", height: gsap.utils.random(3, 11) + "vh", x: 0, opacity: 0 });
      tl.to(b, { opacity: 1, duration: 0.04, ease: "none" }, at)
        .to(b, { keyframes: { x: [-28, 18, -10, 6, 0] }, duration: 0.26, ease: "steps(5)" }, at)
        .to(b, { opacity: 0, duration: 0.1, ease: "power2.out" }, at + 0.22);
    });
  };
  $$(".band, .fill, .features, .world, .faq").forEach(sec => {
    ScrollTrigger.create({ trigger: sec, start: "top 65%", once: true, onEnter: playTear });
  });

  /* Hero: inner block tilts + parallaxes; the hero insets with rounded bottom corners */
  const heroEl = $(".hero"), heroInner = $("#heroInner"), pill = $("#pill");
  const heroScroll = () => {
    const y = window.scrollY;
    pill.classList.toggle("minimized", y > 90);
    const r = Math.min(1, y / 150);
    heroEl.style.marginLeft = heroEl.style.marginRight = (r * 10) + "px";
    heroEl.style.borderBottomLeftRadius = heroEl.style.borderBottomRightRadius = (r * 28) + "px";
    const mob = window.innerWidth <= 768;
    const ty = mob ? y * 0.06 : y * 0.14;
    const rx = mob ? 0 : Math.min(6, y * 0.015);
    heroInner.style.transform = `perspective(1100px) rotateX(${rx}deg) translateY(${ty}px)`;
  };
  lenis.on("scroll", heroScroll);
  heroScroll();

  /* Marquee: two identical sets, loop by half the width */
  const bt = $("#bandTrack");
  if (bt) gsap.to(bt, { x: () => -bt.scrollWidth / 2, duration: 34, ease: "none", repeat: -1 });

  /* Word-by-word blur + rise + fade, scrubbed to scroll. Each word arrives in one of
     the logo's stripe colours (in order) and settles to the heading's own colour. */
  const STRIPE = ["#18e0ff", "#3b6dff", "#8b45ff", "#ff2ad4", "#ff2f57", "#ff8a1e", "#ffe41c"];
  const wordReveal = (el, trigger, start, end) => {
    const finalColor = getComputedStyle(el).color;
    const frag = document.createDocumentFragment();
    el.childNodes.forEach(node => {
      if (node.nodeName === "BR") { frag.appendChild(document.createElement("br")); return; }
      if (node.nodeType !== 3) return;
      node.textContent.split(/(\s+)/).forEach(tok => {
        if (/^\s+$/.test(tok)) frag.appendChild(document.createTextNode(tok));
        else if (tok) { const s = document.createElement("span"); s.className = "word"; s.textContent = tok; frag.appendChild(s); }
      });
    });
    el.textContent = ""; el.appendChild(frag);
    const spans = $$(".word", el);
    gsap.set(spans, { opacity: 0, filter: "blur(10px)", yPercent: 42, color: i => STRIPE[i % STRIPE.length] });
    gsap.timeline({ scrollTrigger: { trigger, start, end, scrub: 2 } })
      .to(spans, { opacity: 1, filter: "blur(0px)", yPercent: 0, ease: "power2.out", stagger: 0.5, duration: 1 }, 0)
      .to(spans, { color: finalColor, ease: "power1.in", stagger: 0.5, duration: 1 }, 0.7);
  };
  wordReveal($("#fillText"), ".fill", "top 82%", "top 22%");
  wordReveal($("#featTitle"), "#featTitle", "top 85%", "top 40%");
  wordReveal($("#worldTitle"), "#worldTitle", "top 85%", "top 40%");

  /* Section 2 background drifts slower than the page */
  gsap.fromTo("#fillImg", { yPercent: -6 }, {
    yPercent: 6, ease: "none",
    scrollTrigger: { trigger: ".fill", start: "top bottom", end: "bottom top", scrub: true },
  });

  /* Sub copy: measured into visual lines, each slides up from a clip */
  const sub = $("#fillSub");
  if (sub) {
    const words = sub.textContent.trim().split(/\s+/);
    sub.innerHTML = words.map(w => `<span class="sw">${w}</span>`).join(" ");
    const lines = [];
    $$(".sw", sub).forEach(s => {
      const top = s.offsetTop, last = lines[lines.length - 1];
      if (!last || Math.abs(top - last.top) > 2) lines.push({ top, words: [s.textContent] });
      else last.words.push(s.textContent);
    });
    sub.innerHTML = lines.map(l => `<span class="subline"><span class="subline-i">${l.words.join(" ")}</span></span>`).join("");
    const inners = $$(".subline-i", sub);
    gsap.set(inners, { yPercent: 115 });
    gsap.to(inners, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: sub, start: "top 85%", once: true } });
  }

  /* Features: ONE pinned timeline. 0 -> 0.8 cards scroll sideways, 0.8 -> 1 the
     last card zooms to fill the screen and wipes into the dark section. */
  const track = $("#ftrack"), pin = $("#featPin"), zoomCard = $("#zoomCard");
  const dots = $$("#navDots .dot");
  const featCards = $$(".fcard:not(.zoom-card)", track);
  const PHASE1 = 0.8, PH2 = 1 - PHASE1;
  const cardStep = () => {
    const c = $(".fcard", track);
    const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    return c.getBoundingClientRect().width + gap;
  };
  function horizDist() { return ($$(".fcard", track).length - 1) * cardStep(); }
  const fillScale = () => Math.max(innerWidth / zoomCard.offsetWidth, innerHeight / zoomCard.offsetHeight) * 1.08;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin, start: "top top",
      end: () => "+=" + (horizDist() + innerHeight * 1.1),
      pin: true, scrub: 1, invalidateOnRefresh: true, refreshPriority: 1,
      onToggle: self => pill.classList.toggle("progress", self.isActive),
      onUpdate: self => {
        const hp = Math.min(1, self.progress / PHASE1);
        const i = Math.min(dots.length - 1, Math.floor(hp * dots.length));
        dots.forEach((d, idx) => d.classList.toggle("on", idx === i));
      },
    },
  });
  tl.to(track, { x: () => -horizDist(), ease: "none", duration: PHASE1 }, 0)
    .fromTo(zoomCard, { scale: 1, borderRadius: 14 }, { scale: () => fillScale(), borderRadius: 0, ease: "power2.in", duration: PH2 }, PHASE1)
    .to($(".zcinner", zoomCard), { autoAlpha: 0, ease: "none", duration: PH2 * 0.12 }, PHASE1)
    .to("#zoomFill", { autoAlpha: 1, ease: "none", duration: PH2 * 0.12 }, PHASE1)
    .fromTo("#zoomFillInner", { scale: () => 1 / fillScale() }, { scale: 1, ease: "power2.in", duration: PH2 }, PHASE1);

  /* Card images drift inside their frames */
  $$(".pimg").forEach(img => {
    gsap.set(img, { scale: 1.2 });
    gsap.fromTo(img, { xPercent: -6 }, {
      xPercent: 6, ease: "none",
      scrollTrigger: { trigger: "#featPin", start: "top top", end: () => "+=" + horizDist(), scrub: true, invalidateOnRefresh: true },
    });
  });

  /* In-card text sized to exactly match the crisp overlay at hand-off */
  const matchZoomText = () => {
    const f = fillScale();
    const om = parseFloat(getComputedStyle($(".zoomfill .zmark")).fontSize);
    const ot = parseFloat(getComputedStyle($(".zoomfill .ztag")).fontSize);
    $(".zmark", zoomCard).style.fontSize = (om / f) + "px";
    $(".ztag", zoomCard).style.fontSize = (ot / f) + "px";
  };
  matchZoomText();
  ScrollTrigger.addEventListener("refresh", matchZoomText);

  /* Cards lag on scroll velocity, then spring back: the gaps breathe */
  let lag = 0;
  gsap.ticker.add(() => {
    const target = Math.max(-20, Math.min(20, (lenis.velocity || 0) * 0.9));
    lag += (target - lag) * 0.12;
    featCards.forEach((c, i) => c.style.setProperty("--lag", (lag * (i + 1)) + "px"));
  });

  /* Gallery: each still drifts at its own rate */
  const amp = [42, 68, 30, 78, 52, 36];
  $$(".gitem").forEach((item, i) => {
    const a = amp[i % amp.length];
    gsap.fromTo(item, { y: a / 2 }, {
      y: -a / 2, ease: "none",
      scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
  });

  /* Nav: highlight the current section */
  const links = $$(".pill nav a");
  ["features", "world", "faq"].forEach(id => {
    ScrollTrigger.create({
      trigger: "#" + id, start: "top center", end: "bottom center",
      onToggle: self => { if (self.isActive) links.forEach(l => l.classList.toggle("active", l.dataset.sec === id)); },
    });
  });

  /* Anchor links through Lenis */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      const t = id.length > 1 && $(id);
      if (t) { e.preventDefault(); lenis.scrollTo(id === "#top" ? 0 : t, { offset: id === "#early-access" ? -110 : -10 }); }
    });
  });

  /* Footer curtain: the page lifts off a fixed footer, which rises + un-tilts in */
  const pageEl = $("#page"), footerEl = $(".footer"), footerWrap = $(".wrap", footerEl);
  const sizeFooter = () => { pageEl.style.marginBottom = footerEl.offsetHeight + "px"; };
  sizeFooter();
  gsap.fromTo(footerWrap, { yPercent: 16, autoAlpha: 0.3, rotateX: 7 }, {
    yPercent: 0, autoAlpha: 1, rotateX: 0, ease: "none",
    scrollTrigger: { trigger: pageEl, start: "bottom bottom", end: () => "+=" + footerEl.offsetHeight, scrub: true, invalidateOnRefresh: true },
  });
  const tuckCheck = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    pill.classList.toggle("tucked", max - scrollY < footerEl.offsetHeight * 0.55);
  };
  lenis.on("scroll", tuckCheck);
  tuckCheck();

  window.addEventListener("resize", () => { sizeFooter(); ScrollTrigger.refresh(); });
  window.addEventListener("load", () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
})();
