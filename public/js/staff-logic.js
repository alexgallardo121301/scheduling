// staff-logic.js — Patient Records & Scheduling page

document.addEventListener("DOMContentLoaded", () => {
  const recordsBody = document.getElementById("recordsBody");
  const modal       = document.getElementById("actionModal");

  // Modal sections
  const viewSection    = document.getElementById("viewSection");
  const updateSection  = document.getElementById("updateSection");
  const assignSection  = document.getElementById("assignSection");
  const remindSection  = document.getElementById("remindSection");

  const saveBtn        = document.getElementById("saveBtn");
  const mismatchBanner = document.getElementById("mismatchBanner");

  let activeRow = null;

  // ── In-memory progress-note log keyed by Record ID ────────────────────
  // Seeded with the initial diagnosis text shown in the table on page load.
  const notesLog = {};

  function seedNotes() {
    if (!recordsBody) return;
    recordsBody.querySelectorAll("tr").forEach(row => {
      const id   = row.cells[0]?.innerText.trim();
      const diag = row.cells[3]?.innerText.trim();
      if (id && diag) {
        notesLog[id] = [{ date: "Initial Record", text: diag }];
      }
    });
  }
  seedNotes();

  // ── Helper: hide all modal sections ───────────────────────────────────
  function hideAllSections() {
    viewSection.style.display   = "none";
    updateSection.style.display = "none";
    assignSection.style.display = "none";
    remindSection.style.display = "none";
    if (mismatchBanner) mismatchBanner.style.display = "none";
  }

  function openModal()  { modal.style.display = "flex"; }
  function closeModal() { modal.style.display = "none"; }

  // ── Table button delegation ────────────────────────────────────────────
  if (recordsBody) {
    recordsBody.addEventListener("click", (e) => {
      const target = e.target;
      activeRow = target.closest("tr");
      if (!activeRow) return;

      const recordId         = activeRow.cells[0].innerText.trim();
      const patientName      = activeRow.cells[1].innerText.trim();
      const currentDiagnosis = activeRow.cells[3].innerText.trim();

      document.getElementById("modalPatientInfo").innerText =
        `${patientName} | ${recordId}`;

      // ── 1. VIEW HISTORY ────────────────────────────────────────────
      if (target.classList.contains("view-btn")) {
        document.getElementById("modalTitle").innerText = "Consultation History";

        const entries = notesLog[recordId] || [{ date: "Initial Record", text: currentDiagnosis }];
        const html = entries.map((entry, i) => `
          <div style="margin-bottom:10px; padding-bottom:10px;
               ${i < entries.length - 1 ? "border-bottom:1px solid var(--border-color);" : ""}">
            <small style="color:#888; font-weight:600;">${entry.date}</small><br>
            <span style="font-size:.9rem;">${entry.text}</span>
          </div>
        `).join("");

        document.getElementById("historyContent").innerHTML = html ||
          '<span style="color:var(--muted);font-size:.88rem;">No records found.</span>';

        hideAllSections();
        viewSection.style.display = "block";
        saveBtn.style.display     = "none";
        openModal();
      }

      // ── 2. UPDATE PROGRESS ─────────────────────────────────────────
      if (target.classList.contains("update-btn")) {
        document.getElementById("modalTitle").innerText = "Update Progress Note";
        document.getElementById("progressInput").value  = ""; // blank — user types a new note
        hideAllSections();
        updateSection.style.display = "block";
        saveBtn.innerText           = "Save Progress";
        saveBtn.dataset.action      = "update";
        saveBtn.style.display       = "block";
        openModal();
      }

      // ── 3. ASSIGN DOCTOR ───────────────────────────────────────────
      if (target.classList.contains("assign-btn")) {
        document.getElementById("modalTitle").innerText = "Assign Doctor";
        const prefDateRaw = activeRow.dataset.prefdate || "";
        document.getElementById("prefDate").value     = prefDateRaw;
        document.getElementById("assignedDate").value = activeRow.dataset.assigneddate || "";
        document.getElementById("doctorSelect").value = "";
        hideAllSections();
        assignSection.style.display = "block";
        saveBtn.innerText           = "Confirm Assignment";
        saveBtn.dataset.action      = "assign";
        saveBtn.style.display       = "block";
        openModal();
      }

      // ── 4. REMIND PATIENT ──────────────────────────────────────────
      if (target.classList.contains("remind-btn")) {
        document.getElementById("modalTitle").innerText = "Set Patient Reminder";
        const assignedDate = activeRow.dataset.assigneddate;
        const displayField = document.getElementById("remindDateDisplay");

        displayField.value = assignedDate
          ? new Date(assignedDate + "T00:00").toLocaleDateString("en-PH", {
              year: "numeric", month: "long", day: "numeric",
            })
          : "Pending Doctor Assignment";

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
      document.getElementById("assignedDate").value = opt.dataset.avail || "";

      if (mismatchBanner && opt.dataset.avail) {
        const prefDate     = document.getElementById("prefDate").value;
        const assignedDate = opt.dataset.avail;
        const method       = document.getElementById("notifyMethod").value;
        if (prefDate && prefDate !== assignedDate) {
          const fmt = d => new Date(d + "T00:00").toLocaleDateString("en-PH", {
            month: "long", day: "numeric", year: "numeric",
          });
          mismatchBanner.style.display = "block";
          mismatchBanner.innerHTML = `
            <strong>⚠ Schedule mismatch detected.</strong><br>
            Patient preferred <strong>${fmt(prefDate)}</strong> —
            doctor available on <strong>${fmt(assignedDate)}</strong>.<br>
            Saving will send a notification via <em>${method}</em> proposing the new date.
          `;
        } else {
          mismatchBanner.style.display = "none";
        }
      }
    });
  }

  const notifyMethod = document.getElementById("notifyMethod");
  if (notifyMethod) {
    notifyMethod.addEventListener("change", () => {
      doctorSelect?.dispatchEvent(new Event("change"));
    });
  }

  // ── Close modal ────────────────────────────────────────────────────────
  document.getElementById("closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });

  // ── Save / Confirm actions ─────────────────────────────────────────────
  saveBtn.addEventListener("click", () => {
    const actionType = saveBtn.dataset.action;

    // --- Update progress (append to log, update cell) ---
    if (actionType === "update") {
      const newText = document.getElementById("progressInput").value.trim();
      if (!newText) {
        showToast("Please enter a progress note before saving.", "error");
        return;
      }
      if (activeRow) {
        const recordId = activeRow.cells[0].innerText.trim();

        // Timestamp for the new entry
        const now = new Date().toLocaleDateString("en-PH", {
          year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit",
        });

        if (!notesLog[recordId]) notesLog[recordId] = [];
        notesLog[recordId].push({ date: now, text: newText });

        // Table cell shows the latest note
        activeRow.cells[3].innerText = newText;
      }
      closeModal();
      showToast("Progress note saved. Open History to see all entries.", "success");
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
        activeRow.cells[4].innerText   = docName;
        activeRow.dataset.assigneddate = assignedDate;
      }

      closeModal();

      if (prefDate !== assignedDate) {
        const fmt = d => new Date(d + "T00:00").toLocaleDateString("en-PH", {
          month: "long", day: "numeric", year: "numeric",
        });
        showToast(
          `Mismatch: preferred ${fmt(prefDate)}, assigned ${fmt(assignedDate)}. Notification sent via ${method}.`,
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

  // ── Staff page search ──────────────────────────────────────────────────
  const staffSearch = document.getElementById("staffSearch");
  if (staffSearch && recordsBody) {
    staffSearch.addEventListener("input", () => {
      const q = staffSearch.value.toLowerCase().trim();
      recordsBody.querySelectorAll("tr").forEach(row => {
        row.classList.toggle("row-hidden", q !== "" && !row.innerText.toLowerCase().includes(q));
      });
    });
  }
});