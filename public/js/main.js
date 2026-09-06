(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = !mobileNav.hidden;
      mobileNav.hidden = isOpen;
      navToggle.setAttribute("aria-expanded", String(!isOpen));
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Hero video (falls back to canvas particle network) ---------- */
  const canvas = document.getElementById("networkCanvas");
  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo && canvas) {
    heroVideo.addEventListener("playing", () => {
      canvas.classList.add("hero-canvas--dimmed");
    });
    heroVideo.addEventListener("error", () => {
      canvas.classList.remove("hero-canvas--dimmed");
    });
    if (prefersReducedMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute("autoplay");
    }
  }

  /* ---------- Hero particle network ---------- */
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let width, height, particles, animationId;
    const MAX_DIST = 140;
    const PARTICLE_COUNT_DIVISOR = 9000;

    function resize() {
      const hero = canvas.closest(".hero");
      width = canvas.width = hero.offsetWidth * devicePixelRatio;
      height = canvas.height = hero.offsetHeight * devicePixelRatio;
      canvas.style.width = hero.offsetWidth + "px";
      canvas.style.height = hero.offsetHeight + "px";
      const count = Math.min(
        90,
        Math.floor((width * height) / (PARTICLE_COUNT_DIVISOR * devicePixelRatio * devicePixelRatio))
      );
      particles = Array.from({ length: Math.max(30, count) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.35 * devicePixelRatio,
        r: (Math.random() * 1.4 + 0.8) * devicePixelRatio,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = MAX_DIST * devicePixelRatio;
          if (dist < maxDist) {
            ctx.strokeStyle = `rgba(139, 143, 242, ${0.16 * (1 - dist / maxDist)})`;
            ctx.lineWidth = devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(34, 211, 238, 0.55)";
        ctx.fill();
      });

      animationId = requestAnimationFrame(step);
    }

    resize();
    step();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(animationId);
        resize();
        step();
      }, 200);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animationId = requestAnimationFrame(step);
      }
    });
  }

  /* ---------- Waitlist ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const LOCAL_QUEUE_KEY = "autonoma_waitlist_queue";

  function queueLocally(email) {
    try {
      const queue = JSON.parse(localStorage.getItem(LOCAL_QUEUE_KEY) || "[]");
      if (!queue.includes(email)) queue.push(email);
      localStorage.setItem(LOCAL_QUEUE_KEY, JSON.stringify(queue));
    } catch (_) {
      /* localStorage unavailable — nothing to do */
    }
  }

  function setStatus(statusEl, message, kind) {
    statusEl.textContent = message;
    statusEl.classList.remove("success", "error");
    if (kind) statusEl.classList.add(kind);
  }

  function wireWaitlistForm(formId, statusId) {
    const form = document.getElementById(formId);
    const statusEl = document.getElementById(statusId);
    if (!form || !statusEl) return;

    const input = form.querySelector(".waitlist-input");
    const button = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim().toLowerCase();

      if (!EMAIL_RE.test(email)) {
        setStatus(statusEl, "Please enter a valid email address.", "error");
        input.focus();
        return;
      }

      button.disabled = true;
      setStatus(statusEl, "Joining…", "");

      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong.");
        }

        const data = await res.json();
        form.reset();
        setStatus(
          statusEl,
          data.alreadyJoined
            ? "You're already on the list — we'll be in touch."
            : "You're on the list! We'll email you when it's your turn.",
          "success"
        );
        updateWaitlistCount(data.count);
      } catch (err) {
        // Static hosting (e.g. GitHub Pages) with no /api backend — degrade gracefully.
        queueLocally(email);
        form.reset();
        setStatus(
          statusEl,
          "You're on the list! We'll email you when it's your turn.",
          "success"
        );
      } finally {
        button.disabled = false;
      }
    });
  }

  function updateWaitlistCount(count) {
    const el = document.getElementById("waitlistCount");
    if (!el || typeof count !== "number") return;
    el.textContent =
      count > 0
        ? `Join ${count.toLocaleString()}+ builders already on the list`
        : "Be among the first to join";
  }

  async function loadWaitlistCount() {
    try {
      const res = await fetch("/api/waitlist/count");
      if (!res.ok) return;
      const data = await res.json();
      updateWaitlistCount(data.count);
    } catch (_) {
      /* API not available on static hosting — keep default copy */
    }
  }

  wireWaitlistForm("waitlistForm", "formStatus");
  wireWaitlistForm("waitlistFormFooter", "formStatusFooter");
  loadWaitlistCount();
})();
