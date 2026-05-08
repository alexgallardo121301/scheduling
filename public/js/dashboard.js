// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const patientBody = document.getElementById("patientBody");

  if (patientBody) {
    patientBody.addEventListener("click", (e) => {
      const target = e.target;
      const row = target.closest("tr");
      const patientName = row.cells[1].innerText;
      const patientId = row.dataset.id;

      // Handle Approve Button
      if (target.classList.contains("approve-btn")) {
        if (confirm(`Approve registration for ${patientName}?`)) {
          const statusCell = row.querySelector(".status-badge");
          statusCell.className = "status-badge approved";
          statusCell.innerText = "Approved";
          
          target.innerText = "Manage";
          target.className = "btn-action manage-btn";
          
          console.log(`Log: ${patientId} approved at ${new Date().toLocaleString()}`);
          alert(`${patientName} has been approved.`);
        }
      } 
      // Handle Manage Button
      else if (target.classList.contains("manage-btn")) {
        alert(`Opening management profile for ${patientName} (${patientId})...`);
        // window.location.href = `edit-patient.html?id=${patientId}`;
      }
    });
  }
});