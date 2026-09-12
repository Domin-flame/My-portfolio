/* ── HAMBURGER ───────────────────────────────── */
function toggleMenu() {
  document.querySelector(".menu-links").classList.toggle("open");
  document.querySelector(".hamburger-icon").classList.toggle("open");
}
document.querySelectorAll(".menu-links a").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelector(".menu-links").classList.remove("open");
    document.querySelector(".hamburger-icon").classList.remove("open");
  });
});

/* ── DARK MODE ───────────────────────────────── */
const root = document.documentElement;

// On load: respect OS preference, then stored preference
(function initTheme() {
  const stored = localStorage.getItem("theme");
  if (stored) {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
})();

function toggleTheme() {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

// Also respond if OS preference changes
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
  if (!localStorage.getItem("theme")) {
    root.setAttribute("data-theme", e.matches ? "dark" : "light");
  }
});

/* ── LANGUAGE TOGGLE ─────────────────────────── */
let currentLang = localStorage.getItem("lang") || "en";

function applyLang(lang) {
  document.querySelectorAll("[data-en][data-fr]").forEach(el => {
    const text = lang === "fr" ? el.dataset.fr : el.dataset.en;
    if (text) {
      // Handle innerHTML for elements that contain <br> or HTML
      if (text.includes("<br>") || text.includes("<")) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });
  // Update hero title accent span (it's inside the h1 but not a data-* element itself)
  const accent = document.querySelector(".hero-title .accent");
  if (accent) accent.textContent = lang === "fr" ? "vraiment." : "hold up.";

  document.querySelectorAll(".lang-toggle").forEach(btn => {
    btn.textContent = lang === "fr" ? "FR / EN" : "EN / FR";
  });
  currentLang = lang;
  localStorage.setItem("lang", lang);
}

function toggleLang() {
  applyLang(currentLang === "en" ? "fr" : "en");
}

// Apply on load
applyLang(currentLang);

/* ── TERMINAL ANIMATION ─────────────────────── */
function animateTerminal() {
  const terminal = document.querySelector("#terminal-output");
  if (!terminal) return;
  
  const lines = [
    "<span class='cmd'>❯</span> <span class='val'>npm run deploy</span>",
    "<span class='val'>» Building application...</span>",
    "<span class='val'>» Bundling assets complete</span>",
    "<span class='val'>» Deploying to production</span>",
    "<span class='val'>✓ Deployment successful</span>"
  ];
  
  let lineIndex = 0;
  const typeNextLine = () => {
    if (lineIndex < lines.length) {
      const line = document.createElement('div');
      line.innerHTML = lines[lineIndex];
      terminal.appendChild(line);
      lineIndex++;
      setTimeout(typeNextLine, 400);
    }
  };
  
  typeNextLine();
}

// Animate terminal on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', animateTerminal);
} else {
  animateTerminal();
}

/* ── ANIMATED COUNTERS ───────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const duration = 1600;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ── SKILL BARS + COUNTERS ON SCROLL ─────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll(".skill-bar").forEach(bar => bar.classList.add("animated"));
      entry.target.querySelectorAll(".stat-value[data-target]").forEach(el => animateCounter(el));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll("#skills, #stats-bar").forEach(el => observer.observe(el));

