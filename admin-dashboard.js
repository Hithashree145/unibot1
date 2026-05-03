document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const currentAdmin = localStorage.getItem('current_admin');
    if (!currentAdmin) {
        window.location.href = 'admin-auth.html';
        return;
    }
    
    document.getElementById('current-admin-email').innerText = currentAdmin;

    const toastEl = document.getElementById('toast');
    const showToast = (message, type = 'success') => {
        toastEl.innerText = message;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    };

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('current_admin');
        window.location.href = 'admin-auth.html';
    });

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Add to clicked
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Fetch and Populate Students Data
    const getStudents = async () => {
        try {
            const response = await fetch('api.php?table=students');
            const result = await response.json();
            return result.data || [];
        } catch (e) {
            console.error("Error fetching students:", e);
            return [];
        }
    };

    const viewStudentsBody = document.getElementById('students-table-body');
    const attendanceBody = document.getElementById('attendance-table-body');
    const resultsBody = document.getElementById('results-table-body');

    const renderTables = async () => {
        const students = await getStudents();
        const pendingCount = students.filter(s => s.approved == 0).length;
        
        // Update Stats (Assuming elements exist or creating them)
        const statEl = document.getElementById('stat-pending-students');
        if (statEl) statEl.innerText = pendingCount;

        viewStudentsBody.innerHTML = '';
        attendanceBody.innerHTML = '';
        resultsBody.innerHTML = '';

        if (students.length === 0) {
            const emptyRow = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No students registered yet.</td></tr>`;
            viewStudentsBody.innerHTML = emptyRow;
            attendanceBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No students registered yet.</td></tr>`;
            resultsBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-dim);">No students registered yet.</td></tr>`;
        } else {
            students.forEach(student => {
                // Ensure field names match MySQL
                const regNo = student.register_no;
                const isApproved = student.approved == 1;
                const attendance = student.attendance || '0%';
                const cgpa = student.cgpa || '0.0';

                // View Students
                const statusBadge = isApproved 
                    ? `<span style="color: var(--primary); font-weight: bold;">Approved</span>` 
                    : `<span style="color: #ef4444; font-weight: bold;">Pending</span>`;
                
                const actionBtns = isApproved
                    ? `<button class="secondary-btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="editStudent(${student.id})">Edit</button>`
                    : `<button class="primary-btn" style="padding: 6px 12px; font-size: 0.8rem; margin-right: 5px;" onclick="approveStudent(${student.id})">Approve</button>
                       <button class="secondary-btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="editStudent(${student.id})">Edit</button>`;

                viewStudentsBody.innerHTML += `
                    <tr>
                        <td>${regNo}</td>
                        <td>${student.name}</td>
                        <td>${student.phone}</td>
                        <td>${statusBadge}</td>
                        <td>${actionBtns}</td>
                    </tr>
                `;

                // Monitor Attendance
                attendanceBody.innerHTML += `
                    <tr>
                        <td>${regNo}</td>
                        <td>${student.name}</td>
                        <td><span id="att-${regNo}">${attendance}</span></td>
                        <td>
                            <button class="secondary-btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="updateAttendance(${student.id})">Update</button>
                        </td>
                    </tr>
                `;

                // Manage Results
                resultsBody.innerHTML += `
                    <tr>
                        <td>${regNo}</td>
                        <td>${student.name}</td>
                        <td><span id="cgpa-${regNo}">${cgpa}</span></td>
                        <td>
                            <button class="secondary-btn" style="padding: 6px 12px; font-size: 0.8rem;" onclick="updateCGPA(${student.id})">Update</button>
                        </td>
                    </tr>
                `;
            });

        }
    };

    // Initial render
    renderTables();

    // --- Modal Logic ---
    const modalOverlay = document.getElementById('edit-modal-overlay');
    const editForm = document.getElementById('edit-student-form');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');

    const openModal = (studentData) => {
        document.getElementById('edit-student-id').value = studentData.id;
        document.getElementById('edit-original-name').value = studentData.name;
        document.getElementById('edit-name').value = studentData.name;
        document.getElementById('edit-reg-number').value = studentData.regNumber;
        document.getElementById('edit-phone').value = studentData.phone;
        document.getElementById('edit-email').value = studentData.email;
        document.getElementById('edit-password').value = '';
        modalOverlay.style.display = 'flex';
        lucide.createIcons(); // Re-render icons inside modal
    };

    const closeModal = () => {
        modalOverlay.style.display = 'none';
        editForm.reset();
    };

    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-student-id').value;
        const payload = {
            name: document.getElementById('edit-name').value.trim(),
            register_no: document.getElementById('edit-reg-number').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            email: document.getElementById('edit-email').value.trim()
        };
        const password = document.getElementById('edit-password').value;
        if (password) payload.password = password;

        try {
            const response = await fetch(`api.php?table=students&id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                showToast('Student details updated successfully!');
                closeModal();
                renderTables();
            } else {
                const result = await response.json();
                showToast(result.error || 'Update failed.', 'error');
            }
        } catch (e) {
            showToast('Error updating student.', 'error');
        }
    });


    window.approveStudent = async (id) => {
        try {
            const response = await fetch(`api.php?table=students&id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: 1 })
            });
            if (response.ok) {
                showToast('Student approved successfully!');
                renderTables();
            } else {
                showToast('Failed to approve student.', 'error');
            }
        } catch (e) {
            showToast('Error approving student.', 'error');
        }
    };

    window.updateAttendance = async (id) => {
        const newAtt = prompt('Enter new attendance percentage (e.g. 90%):');
        if (newAtt) {
            try {
                const response = await fetch(`api.php?table=students&id=${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attendance: newAtt })
                });
                if (response.ok) {
                    showToast('Attendance updated successfully.');
                    renderTables();
                } else {
                    showToast('Failed to update attendance.', 'error');
                }
            } catch (e) {
                showToast('Error updating attendance.', 'error');
            }
        }
    };

    window.editStudent = async (id) => {
        try {
            const response = await fetch(`api.php?table=students&id=${id}`);
            const result = await response.json();
            const studentData = result.data;
            if (studentData) {
                studentData.regNumber = studentData.register_no;
                openModal(studentData);
            }
        } catch (e) {
            showToast('Could not load student data.', 'error');
        }
    };

    window.updateCGPA = async (id) => {
        const newVal = prompt("Enter new CGPA (e.g., 9.2):");
        if (newVal) {
             try {
                const response = await fetch(`api.php?table=students&id=${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cgpa: newVal })
                });
                if (response.ok) {
                    showToast('CGPA updated successfully.');
                    renderTables();
                } else {
                    showToast('Failed to update CGPA.', 'error');
                }
            } catch (e) {
                showToast('Error updating CGPA.', 'error');
            }
        }
    };

    renderTables();
});
