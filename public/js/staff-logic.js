// staff logic

document.addEventListener("DOMContentLoaded", () => {
    const recordsBody = document.getElementById("recordsBody");
    const modal = document.getElementById("actionModal");
    
    // Modal Sections
    const viewSection = document.getElementById("viewSection");
    const updateSection = document.getElementById("updateSection");
    const assignSection = document.getElementById("assignSection");
    const remindSection = document.getElementById("remindSection");
    
    const saveBtn = document.getElementById("saveBtn");
    
    let activeRow = null;

    if (recordsBody) {
        recordsBody.addEventListener("click", (e) => {
            const target = e.target;
            activeRow = target.closest("tr");
            if (!activeRow) return;

            const recordId = activeRow.cells[0].innerText;
            const patientName = activeRow.cells[1].innerText;
            const currentDiagnosis = activeRow.cells[3].innerText;

            document.getElementById("modalPatientInfo").innerText = `${patientName} | ${recordId}`;

            // --- 1. VIEW HISTORY ---
            if (target.classList.contains("view-btn")) {
                document.getElementById("modalTitle").innerText = "Consultation History";
                document.getElementById("historyContent").innerHTML = `
                    <small style="color: #666;">Current Status:</small><br>${currentDiagnosis}<br><br>
                    <small style="color: #666;">April 10, 2026:</small><br>Routine check-up. Patient reported minor fatigue.
                `;
                viewSection.style.display = "block";
                updateSection.style.display = "none";
                assignSection.style.display = "none";
                remindSection.style.display = "none";
                
                saveBtn.style.display = "none";
                modal.style.display = "flex";
            }

            // --- 2. UPDATE PROGRESS ---
            if (target.classList.contains("update-btn")) {
                document.getElementById("modalTitle").innerText = "Update Progress Note";
                document.getElementById("progressInput").value = currentDiagnosis;
                
                viewSection.style.display = "none";
                updateSection.style.display = "block";
                assignSection.style.display = "none";
                remindSection.style.display = "none";
                
                saveBtn.innerText = "Save Progress";
                saveBtn.dataset.action = "update"; 
                saveBtn.style.display = "block";
                modal.style.display = "flex";
            }

            // --- 3. ASSIGN DOCTOR ---
            if (target.classList.contains("assign-btn")) {
                document.getElementById("modalTitle").innerText = "Assign Doctor";
                
                const prefDateRaw = activeRow.dataset.prefdate || "";
                document.getElementById("prefDate").value = prefDateRaw;
                document.getElementById("assignedDate").value = activeRow.dataset.assigneddate || "";
                document.getElementById("doctorSelect").value = "";
                
                viewSection.style.display = "none";
                updateSection.style.display = "none";
                assignSection.style.display = "block";
                remindSection.style.display = "none";
                
                saveBtn.innerText = "Confirm Assignment";
                saveBtn.dataset.action = "assign"; 
                saveBtn.style.display = "block";
                modal.style.display = "flex";
            }

            // --- 4. REMIND PATIENT ---
            if (target.classList.contains("remind-btn")) {
                document.getElementById("modalTitle").innerText = "Set Patient Reminder";
                
                const assignedDate = activeRow.dataset.assigneddate;
                const displayField = document.getElementById("remindDateDisplay");

                if (assignedDate) {
                    displayField.value = new Date(assignedDate).toLocaleDateString("en-PH", {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });
                } else {
                    displayField.value = "Pending Doctor Assignment";
                }

                viewSection.style.display = "none";
                updateSection.style.display = "none";
                assignSection.style.display = "none";
                remindSection.style.display = "block";
                
                saveBtn.innerText = "Schedule Reminder";
                saveBtn.dataset.action = "remind"; 
                saveBtn.style.display = "block";
                modal.style.display = "flex";
            }
        });
    }

    // Auto-update Scheduled Appointment Date when a Doctor is chosen
    const doctorSelect = document.getElementById("doctorSelect");
    if (doctorSelect) {
        doctorSelect.addEventListener("change", (e) => {
            const selectedOpt = e.target.options[e.target.selectedIndex];
            if (selectedOpt.dataset.avail) {
                document.getElementById("assignedDate").value = selectedOpt.dataset.avail;
            } else {
                document.getElementById("assignedDate").value = "";
            }
        });
    }

    // Modal Close
    document.getElementById("closeModal").addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Handle Save / Confirm actions dynamically
    saveBtn.addEventListener("click", () => {
        const actionType = saveBtn.dataset.action;

        // Logic for Updating Patient Progress
        if (actionType === "update") {
            const newText = document.getElementById("progressInput").value;
            if (newText && activeRow) {
                activeRow.cells[3].innerText = newText; 
                modal.style.display = "none";
                alert("Patient record updated successfully.");
            }
        } 
        
        // Logic for Assigning Doctor & Checking Schedules
        else if (actionType === "assign") {
            const docName = document.getElementById("doctorSelect").value;
            const prefDate = document.getElementById("prefDate").value;
            const assignedDate = document.getElementById("assignedDate").value;
            const notifyMethod = document.getElementById("notifyMethod").value;

            if (!docName || !assignedDate) {
                alert("Please select a doctor to establish an assigned date.");
                return;
            }

            activeRow.cells[4].innerText = docName; 
            activeRow.dataset.assigneddate = assignedDate; // Save the confirmed schedule globally on the row
            
            if (prefDate !== assignedDate) {
                const readablePref = new Date(prefDate).toLocaleDateString();
                const readableAssigned = new Date(assignedDate).toLocaleDateString();
                
                alert(`SCHEDULE MISMATCH DETECTED:\n\nPatient Preferred: ${readablePref}\nDoctor Available: ${readableAssigned}\n\nAutomated System: A notification has been dispatched to the patient via ${notifyMethod} proposing the new schedule.`);
            } else {
                alert("Success: Doctor assigned on the patient's preferred date.");
            }
            
            modal.style.display = "none";
        }

        // Logic for Setting Reminders
        else if (actionType === "remind") {
            const assignedDate = activeRow.dataset.assigneddate;
            const interval = document.getElementById("remindInterval").value;
            const method = document.getElementById("remindMethod").value;

            if (!assignedDate) {
                alert("Action Required: Please assign a doctor and finalize the schedule before setting a reminder.");
                return;
            }

            // Calculate the actual reminder dispatch date
            const scheduleObj = new Date(assignedDate);
            const daysToSubtract = parseInt(interval.split(" ")[0], 10);
            scheduleObj.setDate(scheduleObj.getDate() - daysToSubtract);
            
            const dispatchDateStr = scheduleObj.toLocaleDateString("en-PH", {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            alert(`REMINDER SCHEDULED:\n\nA system notification will be sent via ${method} on ${dispatchDateStr} (${interval} before the appointment).`);
            modal.style.display = "none";
        }
    });
});