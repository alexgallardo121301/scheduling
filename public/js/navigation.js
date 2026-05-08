// navigation.js

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const navbar = document.querySelector(".navbar");

  // Mobile Menu Toggle
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      const spans = hamburger.querySelectorAll("span");
      spans.forEach((span) => span.classList.toggle("open"));
    });
  }

  // Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
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
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }

      // Close mobile menu on click
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        if (hamburger) {
          const spans = hamburger.querySelectorAll("span");
          spans.forEach((span) => span.classList.remove("open"));
        }
      }
    });
  });
});

// Schedule Tabs Logic
window.openScheduleTab = function (evt, departmentName) {
  const tabContent = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  const tabLinks = document.getElementsByClassName("tab-btn");
  for (let i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active", "");
  }

  const selectedTab = document.getElementById(departmentName);
  if (selectedTab) {
    selectedTab.style.display = "block";
  }
  evt.currentTarget.className += " active";
};