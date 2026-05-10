// logs.js — System Logs page logic

document.addEventListener("DOMContentLoaded", () => {
  /* ── Init ── */
  setUpdatedTime();
  refreshLogStats();

  /* ── References ── */
  const logsBody    = document.getElementById("logsBody");
  const searchInput = document.getElementById("searchInput");
  const filterBtns  = document.querySelectorAll(".filter-btn");
  const rowCountEl  = document.getElementById("rowCount");
  const emptyState  = document.getElementById("emptyState");
  const exportBtn   = document.getElementById("exportBtn");
  const clearBtn    = document.getElementById("clearLogsBtn");

  let currentFilter = "all";

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
      const table = document.getElementById("logsTable");
      if (table) {
        exportTableToCSV(table, "system-logs.csv");
        showToast("Logs exported as CSV.", "success");
      }
    });
  }

  /* ── Clear logs ── */
  if (clearBtn && logsBody) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("Clear all system logs? This cannot be undone.")) return;
      logsBody.innerHTML = "";
      refreshLogStats();
      applyFilters();
      showToast("All logs cleared.", "info");
    });
  }

  /* ── Helpers ── */

  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const rows  = logsBody ? Array.from(logsBody.querySelectorAll("tr")) : [];
    let visible = 0;

    rows.forEach(row => {
      const level = row.dataset.level ?? "info";
      const text  = row.innerText.toLowerCase();

      const matchFilter = currentFilter === "all" || level === currentFilter;
      const matchSearch = !query || text.includes(query);

      if (matchFilter && matchSearch) {
        row.classList.remove("row-hidden");
        visible++;
      } else {
        row.classList.add("row-hidden");
      }
    });

    if (emptyState) emptyState.hidden = visible > 0;

    if (rowCountEl) {
      rowCountEl.innerHTML = `Showing <strong>${visible}</strong> event${visible !== 1 ? "s" : ""}`;
    }
  }

  function refreshLogStats() {
    const rows    = logsBody ? Array.from(logsBody.querySelectorAll("tr")) : [];
    const total   = rows.length;
    const info    = rows.filter(r => r.dataset.level === "info").length;
    const warning = rows.filter(r => r.dataset.level === "warning").length;
    const error   = rows.filter(r => r.dataset.level === "error").length;

    animateStatTo("statTotal",   total);
    animateStatTo("statInfo",    info);
    animateStatTo("statWarning", warning);
    animateStatTo("statError",   error);

    if (rowCountEl) {
      rowCountEl.innerHTML = `Showing <strong>${total}</strong> event${total !== 1 ? "s" : ""}`;
    }
  }
});