// modal-export.js

// 1. Populate the summary modal with form data safely
function populateSummary() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = Math.floor(1000 + Math.random() * 9000);

  // Safety checks added here to prevent crashes if the modal is missing
  const refEl = document.getElementById("refNumber");
  if (refEl) refEl.textContent = `REG-${datePart}-${randPart}`;

  const dateEl = document.getElementById("submittedDate");
  if (dateEl) {
    dateEl.textContent = now.toLocaleString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  const deptMap = { psychiatry: "OPU Psychiatry", general: "General Management", neurology: "Neurology" };
  const deptVal = getVal("department");
  setText("p-department", deptMap[deptVal] || deptVal || "—");

  setText("p-fullName",  getVal("fullName")      || "—");
  setText("p-gender",    getVal("gender")        || "—");
  setText("p-birthdate", formatDate(getVal("birthdate")) || "—");
  setText("p-age",       getVal("age")           || "—");
  setText("p-contact",   getVal("contactNumber") || "—");
  setText("p-email",     getVal("emailAddress")  || "N/A");
  setText("p-address",   getVal("address")       || "—");

  const companionRadio = document.querySelector('input[name="companion"]:checked');
  setText("p-companion", companionRadio ? (companionRadio.value === "yes" ? "Yes" : "No") : "—");

  setText("p-complaints",   getVal("chiefComplaints")    || "—");
  setText("p-consultation", getVal("consultationAbout")  || "—");
  setText("p-illness",      getVal("illnessDescription") || "N/A");

  const ptMap = { "first-time": "First Time Patient", "returning": "Returning Patient" };
  const atMap = { "walk-in": "Walk-in", "online": "Online" };
  setText("p-patientType",     ptMap[getVal("patientType")]     || "—");
  setText("p-appointmentType", atMap[getVal("appointmentType")] || "—");
  setText("p-mode",            getVal("consultationMode")       || "—");
  setText("p-appointmentDate", formatDate(getVal("appointmentDate")) || "—");
  setText("p-referral",        getVal("referralSource")         || "N/A");
}

// 2. Set textContent of a pdf-* element safely
function setPdf(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// 3. Populate the hidden #pdfContainer
function populatePdfContainer() {
  const deptMap = { psychiatry: "OPU Psychiatry", general: "General Management", neurology: "Neurology" };
  const ptMap   = { "first-time": "First Time Patient", "returning": "Returning Patient" };
  const atMap   = { "walk-in": "Walk-in", "online": "Online" };

  const refEl  = document.getElementById("refNumber");
  const dateEl = document.getElementById("submittedDate");
  setPdf("pdf-refNumber",     refEl  ? refEl.textContent  : "");
  setPdf("pdf-submittedDate", dateEl ? dateEl.textContent : "");

  const deptVal = getVal("department");
  setPdf("pdf-department",    deptMap[deptVal] || deptVal || "—");
  setPdf("pdf-fullName",      getVal("fullName")       || "—");
  setPdf("pdf-gender",        getVal("gender")         || "—");
  setPdf("pdf-birthdate",     formatDate(getVal("birthdate")) || "—");
  setPdf("pdf-age",           getVal("age")            || "—");
  setPdf("pdf-contact",       getVal("contactNumber")  || "—");
  setPdf("pdf-email",         getVal("emailAddress")   || "N/A");
  setPdf("pdf-address",       getVal("address")        || "—");

  const companionRadio = document.querySelector('input[name="companion"]:checked');
  setPdf("pdf-companion", companionRadio ? (companionRadio.value === "yes" ? "Yes" : "No") : "—");

  setPdf("pdf-complaints",    getVal("chiefComplaints")    || "—");
  setPdf("pdf-consultation",  getVal("consultationAbout")  || "—");
  setPdf("pdf-illness",       getVal("illnessDescription") || "N/A");

  setPdf("pdf-patientType",     ptMap[getVal("patientType")]     || "—");
  setPdf("pdf-appointmentType", atMap[getVal("appointmentType")] || "—");
  setPdf("pdf-mode",            getVal("consultationMode")       || "—");
  setPdf("pdf-appointmentDate", formatDate(getVal("appointmentDate")) || "—");
  setPdf("pdf-referral",        getVal("referralSource")         || "N/A");
}

// 4. Close and Confirm Logic
function closeAndConfirm() {
  const modal = document.getElementById("summaryModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
  
  if (typeof showSuccessToast === "function") showSuccessToast();

  const regForm = document.getElementById("regForm");
  if (regForm) regForm.reset();
  
  const ageInput = document.getElementById("age");
  if (ageInput) ageInput.value = "";

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1200);
}

// 5. Attach Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const btnClose = document.getElementById("btnClose");
  if (btnClose) {
    btnClose.onclick = function(e) { 
      e.preventDefault(); 
      closeAndConfirm(); 
    };
  }

  const summaryModal = document.getElementById("summaryModal");
  if (summaryModal) {
    summaryModal.addEventListener("click", (e) => {
      if (e.target === summaryModal) closeAndConfirm();
    });
  }

  const btnPrint = document.getElementById("btnPrint");
  if (btnPrint) {
    btnPrint.addEventListener("click", (e) => { 
      e.preventDefault();
      window.print(); 
    });
  }

  const btnDownloadPDF = document.getElementById("btnDownloadPDF");
  if (btnDownloadPDF) {
    btnDownloadPDF.addEventListener("click", (e) => {
      e.preventDefault();
      populatePdfContainer();
      
      const fullNameInput = document.getElementById("fullName");
      const patientName = fullNameInput && fullNameInput.value 
        ? fullNameInput.value.replace(/\s+/g, "_") 
        : "Patient";
        
      const element = document.getElementById("pdfContainer");
      element.style.left = "-9999px";
      element.style.top  = "0";

      const opt = {
        margin:      [10, 10, 10, 10],
        filename:    `Registration_${patientName}.pdf`,
        image:       { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, width: 794, windowWidth: 794, scrollX: 0, scrollY: 0, x: 0, y: 0 },
        jsPDF:       { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: "avoid-all" },
      };

      const originalText = btnDownloadPDF.innerHTML;
      btnDownloadPDF.innerHTML = "⏳ Generating...";
      btnDownloadPDF.disabled = true;

      html2pdf().set(opt).from(element).save().then(() => {
        btnDownloadPDF.innerHTML = originalText;
        btnDownloadPDF.disabled = false;
      }).catch((err) => {
        console.error("PDF Generation failed", err);
        btnDownloadPDF.innerHTML = originalText;
        btnDownloadPDF.disabled = false;
      });
    });
  }
});