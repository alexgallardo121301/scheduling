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

  // Trigger the CSS transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Auto-hide after 4 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.style.display = "none"; }, 350);
  }, 4000);
}