(() => {
  const CFG = window.MEATSPACE || {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---- links from config ---------------------------------------------- */
  $$(".js-steam").forEach(a => { a.href = CFG.steamUrl || "#"; });
  $$(".js-social").forEach(a => {
    const url = (CFG.socials || {})[a.dataset.social];
    if (url) a.href = url; else a.classList.add("is-empty");
  });
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  /* ---- hero parallax ----------------------------------------------------- */
  const hero = $(".hero");
  const layers = $$(".hero [data-depth]").filter(el => !el.classList.contains("hero__logo"));
  const logo = $(".hero__logo");
  const topbar = $(".topbar");
  let lastY = 0, ticking = false;

  function frame() {
    ticking = false;
    const y = window.scrollY;
    const h = hero.offsetHeight;

    if (!reduceMotion && y < h * 1.1) {
      for (const el of layers) {
        el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.depth)).toFixed(1)}px, 0)`;
      }
      const ly = y * parseFloat(logo.dataset.depth);
      logo.style.transform = `translate(-50%, calc(-50% + ${ly.toFixed(1)}px))`;
      logo.style.opacity = Math.max(0, 1 - y / (h * 0.55)).toFixed(3);
    }

    topbar.classList.toggle("is-solid", y > h * 0.8);
    topbar.classList.toggle("is-hidden", y > h && y > lastY + 4);
    if (y < lastY - 4 || y < h) topbar.classList.remove("is-hidden");
    lastY = y;

    stackFrame();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---- stacking cards ------------------------------------------------------ */
  const items = $$(".stack__item");
  items.forEach((it, i) => it.style.setProperty("--i", i));
  const cards = items.map(it => $(".card", it));

  function stackFrame() {
    if (reduceMotion || !items.length) return;
    const vh = window.innerHeight;
    const tops = items.map(it => it.getBoundingClientRect().top);
    for (let i = 0; i < items.length - 1; i++) {
      // how far the cards above this one have slid over it (0 = none, 1 per card)
      let cover = 0;
      for (let j = i + 1; j < items.length; j++) {
        const stick = parseFloat(getComputedStyle(items[j]).top) || 0;
        cover += Math.min(1, Math.max(0, (vh - tops[j]) / (vh - stick)));
      }
      const scale = 1 - Math.min(cover, 4) * 0.045;
      const dim = 1 - Math.min(cover, 3) * 0.12;
      cards[i].style.transform = `scale(${scale.toFixed(4)})`;
      cards[i].style.filter = `brightness(${dim.toFixed(3)})`;
    }
  }

  /* ---- scroll reveal --------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -10% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  } else {
    $$(".reveal").forEach(el => el.classList.add("is-in"));
  }

  /* ---- trailer (loads YouTube only on click) ----------------------------------- */
  const video = $("#video");
  const ytId = (CFG.youtubeId || "").trim();
  if (ytId) {
    video.classList.add("has-id");
    $(".video__poster", video).src = `https://i.ytimg.com/vi/${encodeURIComponent(ytId)}/maxresdefault.jpg`;
    $(".video__play", video).addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ytId)}?autoplay=1&rel=0&modestbranding=1`;
      f.title = "MEATSPACE trailer";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      video.appendChild(f);
    });
  } else {
    $(".video__play", video).setAttribute("aria-disabled", "true");
  }

  /* ---- early-access sign-up ---------------------------------------------------- */
  const form = $("#early-access");
  const msg = $(".signup__msg", form);
  const say = (text, kind) => { msg.textContent = text; msg.className = "signup__msg" + (kind ? " is-" + kind : ""); };

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (form.website.value) return;                                  // bot filled the honeypot
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
      frame.name = frame.id = "signup-frame";
      frame.hidden = true;
      document.body.appendChild(frame);
    }
    const post = document.createElement("form");
    post.action = s.action; post.method = "POST"; post.target = "signup-frame"; post.hidden = true;
    const field = document.createElement("input");
    field.name = s.emailField || "email"; field.value = email;
    post.appendChild(field);
    document.body.appendChild(post);

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

  frame();
})();
