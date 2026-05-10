// navigation.js — handles navbar behaviour across all pages

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  const navbar    = document.getElementById("navbar");

  /* ── Mobile menu toggle ── */
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("active");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Navbar scroll shadow ── */
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // init
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);

      if (!targetId) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offset = (navbar?.offsetHeight ?? 64) + 8;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ── Schedules page clock (only on pages that have #clockTime) ── */
  if (document.getElementById("clockTime")) {
    updateClock();
    setInterval(updateClock, 1000);
    setUpdatedTime();
    if (typeof calcScheduleStats === "function") calcScheduleStats();
    setInterval(() => {
      if (typeof refreshSchedules === "function") refreshSchedules();
    }, 30000);
  }
});

/* ── Schedule tab switching (called inline from HTML) ── */
window.openScheduleTab = function (evt, departmentName) {
  document.querySelectorAll(".tab-content").forEach(el => (el.style.display = "none"));
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

  const panel = document.getElementById(departmentName);
  if (panel) panel.style.display = "block";
  if (evt?.currentTarget) evt.currentTarget.classList.add("active");
};