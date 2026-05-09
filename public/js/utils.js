// utils.js

// Format ISO date string (YYYY-MM-DD) to readable form
function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

// Get value of a form element by id safely
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

// Set text content of an element by id safely
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Show success toast notification
function showSuccessToast() {
  const toast = document.getElementById("successToast");
  if (!toast) return;

  toast.style.display = "flex";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.style.display = "none"; }, 350);
  }, 4000);
}

// ── Schedules page: live clock ───────────────────────────────────────────────
function updateClock() {
  const now   = new Date();
  const hours = now.getHours();
  const mins  = now.getMinutes().toString().padStart(2, "0");
  const secs  = now.getSeconds().toString().padStart(2, "0");
  const ampm  = hours >= 12 ? "PM" : "AM";
  const h12   = ((hours % 12) || 12).toString().padStart(2, "0");

  const clockEl = document.getElementById("clockTime");
  if (clockEl) clockEl.textContent = `${h12}:${mins}:${secs} ${ampm}`;

  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateEl = document.getElementById("clockDate");
  if (dateEl) {
    dateEl.textContent =
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
}

// ── Schedules page: "last updated" stamp ─────────────────────────────────────
function setUpdatedTime() {
  const now  = new Date();
  const h    = ((now.getHours() % 12) || 12).toString().padStart(2, "0");
  const m    = now.getMinutes().toString().padStart(2, "0");
  const s    = now.getSeconds().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  const el   = document.getElementById("updatedTime");
  if (el) el.textContent = `${h}:${m}:${s} ${ampm}`;
}

// ── Schedules page: summary stat cards ───────────────────────────────────────
function calcScheduleStats() {
  const badges = document.querySelectorAll(".status-badge");
  let avail = 0, booked = 0, leave = 0;

  badges.forEach(function (badge) {
    if (badge.classList.contains("badge-available")) avail++;
    else if (badge.classList.contains("badge-booked")) booked++;
    else if (badge.classList.contains("badge-leave"))  leave++;
  });

  setText("statTotal",  avail + booked + leave);
  setText("statAvail",  avail);
  setText("statBooked", booked);
  setText("statLeave",  leave);
}

// ── Schedules page: refresh banner ───────────────────────────────────────────
function showRefreshBanner() {
  const banner = document.getElementById("refreshBanner");
  if (!banner) return;
  banner.classList.add("show");
  setTimeout(() => banner.classList.remove("show"), 3500);
}

// ── Schedules page: full refresh cycle ───────────────────────────────────────
// When your backend API is ready, add your fetch() call inside this function.
function refreshSchedules() {
  setUpdatedTime();
  calcScheduleStats();
  showRefreshBanner();

  // --- future API hook ---
  // fetch("/api/schedules")
  //   .then(res => res.json())
  //   .then(data => renderSchedules(data))
  //   .catch(err => console.error("Schedule refresh failed:", err));
}