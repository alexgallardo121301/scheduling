// registration.js

document.addEventListener("DOMContentLoaded", () => {
  const birthdateInput = document.getElementById("birthdate");
  const ageInput = document.getElementById("age");
  const patientType = document.getElementById("patientType");
  const appointmentType = document.getElementById("appointmentType");
  const regForm = document.getElementById("regForm");

  // 1. Auto-calculate age from birthdate
  if (birthdateInput && ageInput) {
    birthdateInput.addEventListener("change", () => {
      const birthDate = new Date(birthdateInput.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();

      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      ageInput.value = age >= 0 ? age : 0;
    });
  }

  // 2. Forced Walk-in for first-time patients
  if (patientType && appointmentType) {
    patientType.addEventListener("change", () => {
      if (patientType.value === "first-time") {
        appointmentType.value = "walk-in";
        Array.from(appointmentType.options).forEach((opt) => {
          if (opt.value === "online") opt.disabled = true;
        });
        alert("Note: First-time patients are required to register as Walk-ins for initial assessment.");
      } else {
        Array.from(appointmentType.options).forEach(
          (opt) => (opt.disabled = false)
        );
      }
    });
  }

  // 3. FORM SUBMISSION (BUG FIXED: Un-nested from birthdate logic)
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Stop page from refreshing instantly

      try {
        // Populate the modal data
        if (typeof populateSummary === "function") {
          populateSummary();
        } else {
          console.error("populateSummary function is missing! Check modal-export.js");
        }

        // Show the Modal
        const modal = document.getElementById("summaryModal");
        if (modal) {
          modal.style.display = "flex";
          document.body.style.overflow = "hidden"; // Prevent background scroll
        } else {
          alert("Error: Modal element not found on the page.");
        }
      } catch (error) {
        console.error("Submission Error:", error);
        alert("An error occurred while generating the receipt.");
      }
    });
  }
});