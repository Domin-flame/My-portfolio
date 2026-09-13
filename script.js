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
    if (!text) return;
    if (text.includes("<br>") || text.includes("<")) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Hero accent word
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

applyLang(currentLang);

/* ── TERMINAL TYPEWRITER ───────────────────────────────── */
const terminalLines = {
  en: [
    { cmd: "stack",  val: "React · TypeScript · Python"  },
    { cmd: "cloud",  val: "AWS · Docker · FastAPI"       },
    { cmd: "sec",    val: "ISO 27001 · Ethical Hacking"  },
    { cmd: "status", val: "Open to opportunities ✓"      },
  ],
  fr: [
    { cmd: "stack",  val: "React · TypeScript · Python"     },
    { cmd: "cloud",  val: "AWS · Docker · FastAPI"          },
    { cmd: "sec",    val: "ISO 27001 · Hacking éthique"     },
    { cmd: "statut", val: "Disponible pour opportunités ✓"  },
  ]
};

const terminalEl = document.getElementById("terminal-output");
if (terminalEl) {
  let i = 0;
  const lines = terminalLines[currentLang] || terminalLines.en;
  const type = () => {
    if (i >= lines.length) return;
    const { cmd, val } = lines[i++];
    const el = document.createElement("div");
    el.className = "terminal-line";
    el.innerHTML = `<span class="cmd">$ ${cmd}</span>  <span class="val">${val}</span>`;
    el.style.cssText = "opacity:0;transition:opacity 0.3s";
    terminalEl.appendChild(el);
    requestAnimationFrame(() => el.style.opacity = "1");
    setTimeout(type, 680);
  };
  setTimeout(type, 400);
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

/* ── WORDPRESS BLOG ARTICLES ─────────────────── */
async function loadArticles() {
  const grid = document.getElementById("articles-grid");
  if (!grid) return;

  const lang = currentLang;
  const readLabel   = lang === "fr" ? "Lire l'article →" : "Read article →";
  const errorLabel  = lang === "fr"
    ? "Impossible de charger les articles pour l'instant. <a href='https://dominicblog.me' target='_blank'>Visiter le blog →</a>"
    : "Couldn't load articles right now. <a href='https://dominicblog.me' target='_blank'>Visit the blog →</a>";

  try {
    const res = await fetch(
      "https://dominicblog.me/wp-json/wp/v2/posts?per_page=3&_fields=id,title,excerpt,date,link,featured_media,_links",
      { signal: AbortSignal.timeout(6000) }
    );

    if (!res.ok) throw new Error("API error");
    const posts = await res.json();

    // Fetch featured images in parallel
    const mediaIds = posts.map(p => p.featured_media).filter(id => id);
    const mediaMap = {};
    if (mediaIds.length) {
      await Promise.all(mediaIds.map(async id => {
        try {
          const r = await fetch(`https://dominicblog.me/wp-json/wp/v2/media/${id}?_fields=id,source_url`, { signal: AbortSignal.timeout(4000) });
          if (r.ok) { const m = await r.json(); mediaMap[id] = m.source_url; }
        } catch {}
      }));
    }

    grid.innerHTML = posts.map(post => {
      const date = new Date(post.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { year: "numeric", month: "short", day: "numeric" });
      const title = post.title.rendered.replace(/&amp;/g, "&").replace(/&#8211;/g, "–").replace(/&#8217;/g, "'");
      const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, "").replace(/\[&hellip;\]|\[…\]/g, "…").trim().slice(0, 120) + (post.excerpt.rendered.length > 120 ? "…" : "");
      const imgUrl = mediaMap[post.featured_media];

      const thumb = imgUrl
        ? `<div class="article-thumb"><img src="${imgUrl}" alt="${title}" loading="lazy" /></div>`
        : `<div class="article-thumb"><div class="article-thumb-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div></div>`;

      return `
        <a class="article-card" href="${post.link}" target="_blank" rel="noopener noreferrer">
          ${thumb}
          <div class="article-body">
            <div class="article-date">${date}</div>
            <div class="article-title">${title}</div>
            <div class="article-excerpt">${excerpt}</div>
            <div class="article-read">${readLabel} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>
          </div>
        </a>`;
    }).join("");

  } catch {
    grid.innerHTML = `<div class="articles-error">${errorLabel}</div>`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadArticles);
} else {
  loadArticles();
}