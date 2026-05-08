// auth.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const user = document.getElementById("loginUser").value.trim();
      const pass = document.getElementById("loginPass").value;

      const adminCreds = { user: "admin", pass: "admin123", redirect: "admin-dashboard.html" };
      const staffCreds = { user: "staff", pass: "staff123", redirect: "staff-dashboard.html" };

      if (user === adminCreds.user) {
        if (pass === adminCreds.pass) {
          window.location.href = adminCreds.redirect;
        } else {
          alert("Access Denied: Invalid password for Administrator.");
        }
      } else if (user === staffCreds.user) {
        if (pass === staffCreds.pass) {
          window.location.href = staffCreds.redirect;
        } else {
          alert("Access Denied: Invalid password for Medical Staff.");
        }
      } else {
        alert("Access Denied: Unrecognized username or email.");
      }
    });
  }
});