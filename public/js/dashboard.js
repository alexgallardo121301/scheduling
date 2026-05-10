// dashboard.js — Patient Management page logic

document.addEventListener("DOMContentLoaded", () => {
  /* ── Init ── */
  setUpdatedTime();
  refreshStats();

  /* ── References ── */
  const patientBody  = document.getElementById("patientBody");
  const searchInput  = document.getElementById("searchInput");
  const filterBtns   = document.querySelectorAll(".filter-btn");
  const rowCountEl   = document.getElementById("rowCount");
  const emptyState   = document.getElementById("emptyState");
  const exportBtn    = document.getElementById("exportBtn");
  const confirmModal = document.getElementById("confirmModal");
  const modalTitle   = document.getElementById("modalTitle");
  const modalBody    = document.getElementById("modalBody");
  const modalIcon    = document.getElementById("modalIcon");
  const modalConfirm = document.getElementById("modalConfirm");
  const modalCancel  = document.getElementById("modalCancel");

  let currentFilter = "all";
  let pendingAction = null; // { type, row, name, id }

  /* ── Table button delegation ── */
  if (patientBody) {
    patientBody.addEventListener("click", e => {
      const btn  = e.target.closest(".btn-action");
      if (!btn) return;

      const row  = btn.closest("tr");
      const name = row?.querySelector(".patient-name")?.textContent ?? "this patient";
      const id   = row?.dataset.id ?? "";

      if (btn.classList.contains("approve-btn")) {
        openModal({
          type: "approve",
          row, name, id,
          title: "Approve Patient",
          body:  `Approve registration for <strong>${name}</strong> (${id})?`,
          icon:  "check",
          confirmLabel: "Approve",
          confirmClass: "",
        });
      } else if (btn.classList.contains("reject-btn")) {
        openModal({
          type: "reject",
          row, name, id,
          title: "Reject Registration",
          body:  `Are you sure you want to reject <strong>${name}</strong>? This cannot be undone.`,
          icon:  "warn",
          confirmLabel: "Reject",
          confirmClass: "danger",
        });
      } else if (btn.classList.contains("manage-btn")) {
        showToast(`Opening profile for ${name} (${id})…`, "info");
        // window.location.href = `edit-patient.html?id=${id}`;
      }
    });
  }

  /* ── Search ── */
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  /* ── Filter tabs ── */
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  /* ── Export ── */
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const table = document.getElementById("patientTable");
      if (table) {
        exportTableToCSV(table, "patients.csv");
        showToast("Table exported as CSV.", "success");
      }
    });
  }

  /* ── Modal cancel ── */
  if (modalCancel) {
    modalCancel.addEventListener("click", closeModal);
  }

  if (confirmModal) {
    confirmModal.addEventListener("click", e => {
      if (e.target === confirmModal) closeModal();
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  /* ── Helpers ── */

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const rows  = patientBody ? Array.from(patientBody.querySelectorAll("tr")) : [];
    let visible = 0;

    rows.forEach(row => {
      const rowStatus = row.dataset.status ?? "";
      const text      = row.innerText.toLowerCase();

      const matchFilter = currentFilter === "all" || rowStatus === currentFilter;
      const matchSearch = !query || text.includes(query);

      if (matchFilter && matchSearch) {
        row.classList.remove("row-hidden");
        visible++;
      } else {
        row.classList.add("row-hidden");
      }
    });

    // Empty state
    if (emptyState) emptyState.hidden = visible > 0;

    // Row count
    if (rowCountEl) {
      rowCountEl.innerHTML = `Showing <strong>${visible}</strong> patient${visible !== 1 ? "s" : ""}`;
    }
  }

  function refreshStats() {
    const rows     = patientBody ? Array.from(patientBody.querySelectorAll("tr")) : [];
    const total    = rows.length;
    const pending  = rows.filter(r => r.dataset.status === "pending").length;
    const approved = rows.filter(r => r.dataset.status === "approved").length;
    const rejected = rows.filter(r => r.dataset.status === "rejected").length;

    animateStatTo("statTotal",    total);
    animateStatTo("statPending",  pending);
    animateStatTo("statApproved", approved);
    animateStatTo("statRejected", rejected);

    // Row count label
    if (rowCountEl) {
      rowCountEl.innerHTML = `Showing <strong>${total}</strong> patient${total !== 1 ? "s" : ""}`;
    }
  }

  function openModal({ type, row, name, id, title, body, icon, confirmLabel, confirmClass }) {
    pendingAction = { type, row, name, id };

    if (modalTitle) modalTitle.textContent = title;
    if (modalBody)  modalBody.innerHTML    = body;
    if (modalConfirm) {
      modalConfirm.textContent = confirmLabel;
      modalConfirm.className   = "btn-modal-confirm" + (confirmClass ? ` ${confirmClass}` : "");
    }

    if (modalIcon) {
      modalIcon.className = "modal-icon" + (type === "reject" ? " danger-icon" : "");
      modalIcon.innerHTML = type === "reject"
        ? `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M9 9l6 6m0-6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none"><path d="M20 7L9 18l-5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    if (confirmModal) {
      confirmModal.hidden = false;
      modalConfirm?.focus();
    }
  }

  function closeModal() {
    if (confirmModal) confirmModal.hidden = true;
    pendingAction = null;
  }

  if (modalConfirm) {
    modalConfirm.addEventListener("click", () => {
      if (!pendingAction) return;

      const { type, row, name, id } = pendingAction;

      if (type === "approve") {
        applyRowStatus(row, "approved");
        replaceActionButtons(row, "manage");
        showToast(`${name} has been approved.`, "success");
        logEvent("Patient Approved", `${id} (${name}) approved.`);
      } else if (type === "reject") {
        applyRowStatus(row, "rejected");
        replaceActionButtons(row, "none");
        showToast(`${name}'s registration was rejected.`, "error");
        logEvent("Patient Rejected", `${id} (${name}) rejected.`);
      }

      row.dataset.status = type === "approve" ? "approved" : "rejected";
      closeModal();
      refreshStats();
      applyFilters();
      setUpdatedTime();
    });
  }

  function applyRowStatus(row, status) {
    const badge = row.querySelector(".status-badge");
    if (!badge) return;
    badge.className = `status-badge ${status}`;
    badge.innerHTML = `<span class="status-dot"></span>${capitalize(status)}`;
  }

  function replaceActionButtons(row, mode) {
    const group = row.querySelector(".action-group");
    if (!group) return;

    if (mode === "manage") {
      group.innerHTML = `<button class="btn-action manage-btn" title="Manage patient">Manage</button>`;
    } else {
      group.innerHTML = `<span style="font-size:.8rem;color:var(--muted);font-style:italic;">—</span>`;
    }
  }

  function logEvent(action, details) {
    // Placeholder: push to system-logs store / backend API
    console.info(`[${new Date().toLocaleString()}] ${action}: ${details}`);
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});