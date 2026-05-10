// utils.js — shared utility functions

/**
 * Format ISO date string (YYYY-MM-DD) to readable form.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

/**
 * Get trimmed value of a form element by id.
 * @param {string} id
 * @returns {string}
 */
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/**
 * Set text content of an element by id.
 * @param {string} id
 * @param {string|number} value
 */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * Show the toast notification with an optional message and type.
 * @param {string} [message]
 * @param {"success"|"error"|"info"} [type]
 */
function showToast(message = "Action completed successfully.", type = "success") {
  const toast  = document.getElementById("successToast");
  const msgEl  = document.getElementById("toastMsg");
  const iconEl = toast?.querySelector(".toast-icon");

  if (!toast) return;

  if (msgEl)  msgEl.textContent = message;
  if (iconEl) iconEl.textContent = type === "error" ? "✕" : type === "info" ? "ℹ" : "✓";

  toast.className = "toast";
  toast.classList.add(`toast-${type}`);
  toast.style.display = "flex";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.style.display = "none"; }, 350);
  }, 4000);
}

// Legacy alias
function showSuccessToast(msg) { showToast(msg); }

/**
 * Format the current time as HH:MM:SS AM/PM.
 * @returns {string}
 */
function currentTimeString() {
  const now  = new Date();
  const h    = ((now.getHours() % 12) || 12).toString().padStart(2, "0");
  const m    = now.getMinutes().toString().padStart(2, "0");
  const s    = now.getSeconds().toString().padStart(2, "0");
  const ampm = now.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m}:${s} ${ampm}`;
}

/**
 * Set "last updated" timestamp element (#updatedTime).
 */
function setUpdatedTime() {
  setText("updatedTime", currentTimeString());
}

/**
 * Update the live clock elements (#clockTime, #clockDate).
 */
function updateClock() {
  const now   = new Date();
  const hours = now.getHours();
  const mins  = now.getMinutes().toString().padStart(2, "0");
  const secs  = now.getSeconds().toString().padStart(2, "0");
  const ampm  = hours >= 12 ? "PM" : "AM";
  const h12   = ((hours % 12) || 12).toString().padStart(2, "0");

  setText("clockTime", `${h12}:${mins}:${secs} ${ampm}`);

  const days   = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const clockDate = document.getElementById("clockDate");
  if (clockDate) {
    clockDate.textContent =
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
}

/**
 * Animate a stat value from its current displayed value to a target.
 * @param {string} id
 * @param {number} target
 */
function animateStatTo(id, target) {
  const el = document.getElementById(id);
  if (!el) return;

  const start  = parseInt(el.textContent, 10) || 0;
  const diff   = target - start;
  const dur    = 400;
  const startT = performance.now();

  function step(now) {
    const p = Math.min((now - startT) / dur, 1);
    el.textContent = Math.round(start + diff * p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Export an HTML table to a CSV file download.
 * @param {HTMLTableElement} table
 * @param {string} filename
 */
function exportTableToCSV(table, filename = "export.csv") {
  const rows = Array.from(table.querySelectorAll("tr"));
  const csv  = rows.map(row =>
    Array.from(row.querySelectorAll("th, td"))
      .map(cell => `"${cell.innerText.trim().replace(/"/g, '""')}"`)
      .join(",")
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Schedules page functions ───────────────────────────────────────────────
   These only run when the relevant DOM elements are present, so they are
   completely inert on every other page.
   ─────────────────────────────────────────────────────────────────────────── */

/**
 * Count status badges on the schedules page and update the four stat cards.
 * Called on load and after each simulated refresh.
 */
function calcScheduleStats() {
  const badges = document.querySelectorAll(".status-badge");
  if (!badges.length) return;

  let avail = 0, booked = 0, leave = 0;

  badges.forEach(function (badge) {
    if (badge.classList.contains("badge-available"))     avail++;
    else if (badge.classList.contains("badge-booked"))   booked++;
    else if (badge.classList.contains("badge-leave"))    leave++;
  });

  animateStatTo("statTotal",  avail + booked + leave);
  animateStatTo("statAvail",  avail);
  animateStatTo("statBooked", booked);
  animateStatTo("statLeave",  leave);
}

/**
 * Show the "Schedules refreshed just now." banner briefly.
 */
function showRefreshBanner() {
  const banner = document.getElementById("refreshBanner");
  if (!banner) return;
  banner.classList.add("show");
  setTimeout(() => banner.classList.remove("show"), 3500);
}

/**
 * Full refresh cycle: update timestamp, recalculate stats, show banner.
 * Swap the body for a real fetch() call once your backend is ready.
 */
function refreshSchedules() {
  setUpdatedTime();
  calcScheduleStats();
  showRefreshBanner();

  // ── Future API hook ──────────────────────────────
  // fetch("/api/schedules")
  //   .then(res => res.json())
  //   .then(data => renderSchedules(data))
  //   .catch(err => console.error("Schedule refresh failed:", err));
}