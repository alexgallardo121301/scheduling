// staff-logic.js — Patient Records & Scheduling page

document.addEventListener("DOMContentLoaded", () => {
  const recordsBody = document.getElementById("recordsBody");
  const modal       = document.getElementById("actionModal");

  // Modal sections
  const viewSection   = document.getElementById("viewSection");
  const updateSection = document.getElementById("updateSection");
  const assignSection = document.getElementById("assignSection");
  const remindSection = document.getElementById("remindSection");

  const saveBtn       = document.getElementById("saveBtn");
  const mismatchBanner = document.getElementById("mismatchBanner");

  let activeRow = null;

  // ── Helper: hide all sections ──────────────────────────────────────────
  function hideAllSections() {
    viewSection.style.display   = "none";
    updateSection.style.display = "none";
    assignSection.style.display = "none";
    remindSection.style.display = "none";
    if (mismatchBanner) mismatchBanner.style.display = "none";
  }

  // ── Open modal ─────────────────────────────────────────────────────────
  function openModal() {
    modal.style.display = "flex";
  }

  // ── Close modal ────────────────────────────────────────────────────────
  function closeModal() {
    modal.style.display = "none";
  }

  // ── Table button delegation ────────────────────────────────────────────
  if (recordsBody) {
    recordsBody.addEventListener("click", (e) => {
      const target = e.target;
      activeRow = target.closest("tr");
      if (!activeRow) return;

      const recordId        = activeRow.cells[0].innerText.trim();
      const patientName     = activeRow.cells[1].innerText.trim();
      const currentDiagnosis = activeRow.cells[3].innerText.trim();

      document.getElementById("modalPatientInfo").innerText =
        `${patientName} | ${recordId}`;

      // ── 1. VIEW HISTORY ──────────────────────────────────────────────
      if (target.classList.contains("view-btn")) {
        document.getElementById("modalTitle").innerText = "Consultation History";
        document.getElementById("historyContent").innerHTML = `
          <small style="color:#666;">Current Status:</small><br>
          ${currentDiagnosis}<br><br>
          <small style="color:#666;">April 10, 2026:</small><br>
          Routine check-up. Patient reported minor fatigue.
        `;
        hideAllSections();
        viewSection.style.display = "block";
        saveBtn.style.display = "none";
        openModal();
      }

      // ── 2. UPDATE PROGRESS ──────────────────────────────────────────
      if (target.classList.contains("update-btn")) {
        document.getElementById("modalTitle").innerText = "Update Progress Note";
        document.getElementById("progressInput").value  = currentDiagnosis;
        hideAllSections();
        updateSection.style.display = "block";
        saveBtn.innerText          = "Save Progress";
        saveBtn.dataset.action     = "update";
        saveBtn.style.display      = "block";
        openModal();
      }

      // ── 3. ASSIGN DOCTOR ────────────────────────────────────────────
      if (target.classList.contains("assign-btn")) {
        document.getElementById("modalTitle").innerText = "Assign Doctor";
        const prefDateRaw = activeRow.dataset.prefdate || "";
        document.getElementById("prefDate").value    = prefDateRaw;
        document.getElementById("assignedDate").value = activeRow.dataset.assigneddate || "";
        document.getElementById("doctorSelect").value = "";
        hideAllSections();
        assignSection.style.display = "block";
        saveBtn.innerText           = "Confirm Assignment";
        saveBtn.dataset.action      = "assign";
        saveBtn.style.display       = "block";
        openModal();
      }

      // ── 4. REMIND PATIENT ────────────────────────────────────────────
      if (target.classList.contains("remind-btn")) {
        document.getElementById("modalTitle").innerText = "Set Patient Reminder";
        const assignedDate  = activeRow.dataset.assigneddate;
        const displayField  = document.getElementById("remindDateDisplay");

        if (assignedDate) {
          displayField.value = new Date(assignedDate).toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day: "numeric",
          });
        } else {
          displayField.value = "Pending Doctor Assignment";
        }

        hideAllSections();
        remindSection.style.display = "block";
        saveBtn.innerText           = "Schedule Reminder";
        saveBtn.dataset.action      = "remind";
        saveBtn.style.display       = "block";
        openModal();
      }
    });
  }

  // ── Doctor select → auto-fill appointment date ─────────────────────────
  const doctorSelect = document.getElementById("doctorSelect");
  if (doctorSelect) {
    doctorSelect.addEventListener("change", (e) => {
      const opt = e.target.options[e.target.selectedIndex];
      const assignedDateInput = document.getElementById("assignedDate");
      assignedDateInput.value = opt.dataset.avail || "";

      // Show/hide mismatch banner live
      if (mismatchBanner && opt.dataset.avail) {
        const prefDate     = document.getElementById("prefDate").value;
        const assignedDate = opt.dataset.avail;
        if (prefDate && prefDate !== assignedDate) {
          const readablePref     = new Date(prefDate + "T00:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
          const readableAssigned = new Date(assignedDate + "T00:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
          const method = document.getElementById("notifyMethod").value;
          mismatchBanner.style.display = "block";
          mismatchBanner.innerHTML = `
            <strong>⚠ Schedule mismatch detected.</strong><br>
            Patient preferred <strong>${readablePref}</strong> — doctor available on <strong>${readableAssigned}</strong>.<br>
            Saving will dispatch a notification via <em>${method}</em> proposing the new date.
          `;
        } else {
          mismatchBanner.style.display = "none";
        }
      }
    });
  }

  // Update mismatch banner when notification method changes
  const notifyMethod = document.getElementById("notifyMethod");
  if (notifyMethod) {
    notifyMethod.addEventListener("change", () => {
      // Re-trigger doctor select change to refresh banner text
      doctorSelect?.dispatchEvent(new Event("change"));
    });
  }

  // ── Close modal ────────────────────────────────────────────────────────
  document.getElementById("closeModal").addEventListener("click", closeModal);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });

  // ── Save / Confirm actions ─────────────────────────────────────────────
  saveBtn.addEventListener("click", () => {
    const actionType = saveBtn.dataset.action;

    // --- Update progress ---
    if (actionType === "update") {
      const newText = document.getElementById("progressInput").value.trim();
      if (!newText) {
        showToast("Please enter a progress note before saving.", "error");
        return;
      }
      if (activeRow) {
        activeRow.cells[3].innerText = newText;
      }
      closeModal();
      showToast("Patient progress note updated successfully.", "success");
    }

    // --- Assign doctor ---
    else if (actionType === "assign") {
      const docName      = document.getElementById("doctorSelect").value;
      const prefDate     = document.getElementById("prefDate").value;
      const assignedDate = document.getElementById("assignedDate").value;
      const method       = document.getElementById("notifyMethod").value;

      if (!docName || !assignedDate) {
        showToast("Please select a doctor to establish an assigned date.", "error");
        return;
      }

      if (activeRow) {
        activeRow.cells[4].innerText        = docName;
        activeRow.dataset.assigneddate      = assignedDate;
      }

      closeModal();

      if (prefDate !== assignedDate) {
        const readablePref     = new Date(prefDate + "T00:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
        const readableAssigned = new Date(assignedDate + "T00:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
        showToast(
          `Mismatch: patient preferred ${readablePref}; assigned ${readableAssigned}. Notification sent via ${method}.`,
          "info"
        );
      } else {
        showToast(`${docName} assigned on the patient's preferred date.`, "success");
      }
    }

    // --- Set reminder ---
    else if (actionType === "remind") {
      if (!activeRow) return;
      const assignedDate = activeRow.dataset.assigneddate;

      if (!assignedDate) {
        showToast("Please assign a doctor and confirm a schedule before setting a reminder.", "error");
        return;
      }

      const interval       = document.getElementById("remindInterval").value;
      const method         = document.getElementById("remindMethod").value;
      const scheduleObj    = new Date(assignedDate + "T00:00");
      const daysToSubtract = parseInt(interval.split(" ")[0], 10);
      scheduleObj.setDate(scheduleObj.getDate() - daysToSubtract);

      const dispatchDateStr = scheduleObj.toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
      });

      closeModal();
      showToast(
        `Reminder scheduled via ${method} on ${dispatchDateStr} (${interval} before appointment).`,
        "success"
      );
    }
  });

  // ── Staff page search (scoped — won't affect other pages) ─────────────
  const staffSearch = document.getElementById("staffSearch");
  if (staffSearch && recordsBody) {
    staffSearch.addEventListener("input", () => {
      const q    = staffSearch.value.toLowerCase().trim();
      const rows = Array.from(recordsBody.querySelectorAll("tr"));
      rows.forEach(row => {
        row.classList.toggle("row-hidden", q !== "" && !row.innerText.toLowerCase().includes(q));
      });
    });
  }
});