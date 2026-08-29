const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav-links");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   Page-load intro animations are one-shot: once each finishes,
   drop the class so it stops sitting in the render tree and can
   never compete with a later hover/scroll transform.
   ============================================================ */
document.querySelectorAll(".intro-nav, .intro-name, .intro-photo, .intro-copy").forEach((element) => {
  element.addEventListener("animationend", () => {
    element.classList.remove("intro-nav", "intro-name", "intro-photo", "intro-copy");
  }, { once: true });
});

/* ============================================================
   Scroll progress bar
   ============================================================ */
const progressFill = document.getElementById("scrollProgressFill");
let progressFrame = null;

function updateScrollProgress() {
  progressFrame = null;
  if (!progressFill) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0;
  progressFill.style.transform = `scaleX(${progress})`;
}

function requestScrollProgressUpdate() {
  if (progressFrame === null) progressFrame = window.requestAnimationFrame(updateScrollProgress);
}

if (progressFill) {
  updateScrollProgress();
  window.addEventListener("scroll", requestScrollProgressUpdate, { passive: true });
  window.addEventListener("resize", requestScrollProgressUpdate);
}

/* ============================================================
   Active nav-link highlighting as sections pass through view
   ============================================================ */
const navAnchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const trackedSections = Array.from(navAnchorLinks)
  .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  .filter(Boolean);

if (navAnchorLinks.length && trackedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchorLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.5, rootMargin: "-35% 0px -45% 0px" });

  trackedSections.forEach((section) => sectionObserver.observe(section));
}

const elements = document.querySelectorAll(".reveal");

if (reducedMotion) {
  elements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8%" });

  elements.forEach((element) => observer.observe(element));
}

const stack = document.querySelector(".stack-projects");
const stackCards = stack ? Array.from(stack.querySelectorAll(".stack-card")) : [];
let stackFrame = null;

function updateProjectStack() {
  stackFrame = null;
  if (!stack || reducedMotion || window.innerWidth <= 760) return;

  const rect = stack.getBoundingClientRect();
  const travel = stack.offsetHeight - window.innerHeight;
  const progress = Math.min(1, Math.max(0, -rect.top / Math.max(travel, 1)));
  const position = progress * (stackCards.length - 1);

  stackCards.forEach((card, index) => {
    const distance = index - position;
    const translate = Math.max(-1.08, Math.min(1.08, distance)) * 104;
    const scale = 1 - Math.min(Math.abs(distance), 1) * 0.018;
    card.style.transform = `translate3d(0, ${translate}%, 0) scale(${scale})`;
    card.style.zIndex = String(index + 1);
    card.style.opacity = Math.abs(distance) > 1.02 ? "0" : "1";

    const image = card.querySelector("img");
    if (image) image.style.transform = `translate3d(0, ${distance * 1.5}%, 0) scale(${1.025 - Math.min(Math.abs(distance), 1) * 0.025})`;
  });
}

function requestStackUpdate() {
  if (stackFrame === null) stackFrame = window.requestAnimationFrame(updateProjectStack);
}

if (stackCards.length) {
  updateProjectStack();
  window.addEventListener("scroll", requestStackUpdate, { passive: true });
  window.addEventListener("resize", requestStackUpdate);
}

/* ============================================================
   Work section filter tabs (All / Case Study / Exploration)
   ============================================================ */
const filterTabs = document.querySelectorAll(".filter-tab");
const workCards = document.querySelectorAll(".work-card");

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.getAttribute("data-filter");

    filterTabs.forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", String(t === tab));
    });

    workCards.forEach((card) => {
      const matches = filter === "all" || card.getAttribute("data-category") === filter;
      card.hidden = !matches;
    });
  });
});

/* ============================================================
   Cursor-following preview thumbnail (Service + Experience rows)
   ============================================================ */
const cursorPreview = document.getElementById("cursorPreview");
const cursorPreviewImg = document.getElementById("cursorPreviewImg");
const previewRows = document.querySelectorAll("[data-preview]");
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

if (cursorPreview && cursorPreviewImg && previewRows.length && !isCoarsePointer) {
  let previewTarget = null;
  let mouseX = 0;
  let mouseY = 0;
  let previewFrame = null;

  function movePreview() {
    previewFrame = null;
    cursorPreview.style.left = `${mouseX}px`;
    cursorPreview.style.top = `${mouseY}px`;
  }

  function requestPreviewMove() {
    if (previewFrame === null) previewFrame = window.requestAnimationFrame(movePreview);
  }

  previewRows.forEach((row) => {
    const src = row.getAttribute("data-preview");
    if (!src) return;

    row.addEventListener("mouseenter", (event) => {
      previewTarget = row;
      cursorPreviewImg.src = src;
      mouseX = event.clientX;
      mouseY = event.clientY;
      movePreview();
      cursorPreview.classList.add("is-visible");
    });

    row.addEventListener("mousemove", (event) => {
      if (previewTarget !== row) return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      requestPreviewMove();
    });

    row.addEventListener("mouseleave", () => {
      if (previewTarget !== row) return;
      previewTarget = null;
      cursorPreview.classList.remove("is-visible");
    });
  });
}

/* ============================================================
   Case-study overlay — opened from a project card, closed via
   Back button, backdrop click, or Escape.
   ============================================================ */
const caseOverlay = document.getElementById("caseOverlay");
const caseBack = document.getElementById("caseBack");
const caseTitle = document.getElementById("caseTitle");
const caseBadge = document.getElementById("caseBadge");
const caseDesc = document.getElementById("caseDesc");
const caseTags = document.getElementById("caseTags");
const caseService = document.getElementById("caseService");
const caseTimeline = document.getElementById("caseTimeline");
const caseImage = document.getElementById("caseImage");
const caseLive = document.getElementById("caseLive");

function openCaseStudy(card) {
  if (!caseOverlay) return;

  const title = card.getAttribute("data-title") || "";
  const badge = card.getAttribute("data-badge") || "";
  const description = card.getAttribute("data-description") || "";
  const tags = (card.getAttribute("data-tags") || "").split(",").map((t) => t.trim()).filter(Boolean);
  const service = card.getAttribute("data-service") || "";
  const timeline = card.getAttribute("data-timeline") || "";
  const image = card.getAttribute("data-image") || "";
  const live = card.getAttribute("data-live") || "#";

  caseTitle.textContent = title;
  caseBadge.textContent = badge ? `/${badge}` : "";
  caseDesc.textContent = description;
  caseTags.innerHTML = "";
  tags.forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    caseTags.appendChild(span);
  });
  caseService.textContent = service;
  caseTimeline.textContent = timeline;
  caseImage.src = image;
  caseImage.alt = title;
  caseLive.href = live;

  caseOverlay.classList.add("is-open");
  caseOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("case-open");
}

function closeCaseStudy() {
  if (!caseOverlay) return;
  caseOverlay.classList.remove("is-open");
  caseOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("case-open");
}

document.querySelectorAll(".work-card [data-open-case]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const card = link.closest(".work-card");
    if (card) openCaseStudy(card);
  });
});

if (caseBack) caseBack.addEventListener("click", closeCaseStudy);

if (caseOverlay) {
  caseOverlay.addEventListener("click", (event) => {
    if (event.target === caseOverlay) closeCaseStudy();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && caseOverlay && caseOverlay.classList.contains("is-open")) {
    closeCaseStudy();
  }
});

const caseContact = document.getElementById("caseContact");
if (caseContact) caseContact.addEventListener("click", closeCaseStudy);
