// navigation.js

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  const navbar    = document.querySelector(".navbar");

  // ── Mobile menu toggle ──
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const spans = hamburger.querySelectorAll("span");
      spans.forEach(span => span.classList.toggle("open"));
    });
  }

  // ── Smooth scrolling ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href").substring(1);

      if (targetId === "") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        const navbarHeight   = navbar ? navbar.offsetHeight : 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition  = elementPosition + window.pageYOffset - navbarHeight;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }

      // Close mobile menu on nav click
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        if (hamburger) {
          hamburger.querySelectorAll("span").forEach(span => span.classList.remove("open"));
        }
      }
    });
  });

  // ── Schedules page boot ──
  // Only runs when the schedules page elements are present.
  if (document.getElementById("clockTime")) {
    // Start live clock
    updateClock();
    setInterval(updateClock, 1000);

    // Set initial "last updated" timestamp
    setUpdatedTime();

    // Compute summary stats from the HTML on first load
    calcScheduleStats();

    // Auto-refresh every 30 seconds
    setInterval(refreshSchedules, 30000);
  }
});

// ── Schedule tab switching ────────────────────────────────────────────────────
window.openScheduleTab = function (evt, departmentName) {
  document.querySelectorAll(".tab-content").forEach(el => {
    el.style.display = "none";
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const panel = document.getElementById(departmentName);
  if (panel) panel.style.display = "block";

  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("active");
  }
};