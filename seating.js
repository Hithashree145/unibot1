document.addEventListener('DOMContentLoaded', () => {

    const TOTAL_SEATS = 30;
    const STORAGE_KEY = 'seating_arrangement';

    // --- Helpers ---
    const toastEl = document.getElementById('toast');
    const showToast = (msg, type = 'success') => {
        toastEl.innerText = msg;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => toastEl.classList.remove('show'), 3000);
    };

    // --- Load students from MySQL Database ---
    const getApprovedStudents = async () => {
        try {
            // API now returns students sorted by name ASC by default
            const response = await fetch('api.php?table=students&approved=1');
            const result = await response.json();
            const students = result.data || [];
            
            // Double check sort on client side for absolute certainty
            return students.sort((a, b) => {
                const nameA = a.name.trim().toLowerCase();
                const nameB = b.name.trim().toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0;
            });
        } catch (e) {
            console.error("Error fetching students:", e);
            return [];
        }
    };


    // --- Seat Assignment Storage (MySQL) ---
    const saveSeatingToDB = async (studentId, seatNumber) => {
        await fetch('api.php?table=seating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ student_id: studentId, seat_number: seatNumber })
        });
    };

    const loadSeatingFromDB = async () => {
        try {
            const response = await fetch('api.php?table=seating');
            const result = await response.json();
            const raw = result.data || [];
            
            const mapping = {};
            for (const item of raw) {
                // Now item already contains name and register_no due to SQL JOIN
                mapping[item.seat_number] = { 
                    name: item.name, 
                    regNumber: item.register_no 
                };
            }
            return mapping;
        } catch (e) {
            console.error("Error loading seating mapping:", e);
            return {};
        }
    };


    // --- Render Classroom Grid ---
    const grid = document.getElementById('classroom-grid');
    const studentListEl = document.getElementById('student-list');
    const alertLogEl = document.getElementById('alert-log');

    let mismatchSeats = new Set(); // track simulated mismatches

    const renderGrid = async () => {
        const arrangement = await loadSeatingFromDB(); // { seatNumber: { name, regNumber } }
        grid.innerHTML = '';
        studentListEl.innerHTML = '';

        let occupied = 0;
        let entries = [];

        for (let i = 1; i <= TOTAL_SEATS; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.id = `seat-${i}`;

            if (arrangement[i]) {
                const student = arrangement[i];
                occupied++;
                const isMismatch = mismatchSeats.has(i);

                seat.classList.add(isMismatch ? 'mismatch' : 'occupied');
                seat.innerHTML = `
                    <span class="seat-number">Seat ${i}</span>
                    <span class="seat-name">${student.name.split(' ')[0]}</span>
                    ${isMismatch ? '<span style="font-size:0.6rem; color:#fca5a5;">⚠ MISMATCH</span>' : ''}
                `;
                seat.title = `${student.name} — ${student.regNumber}`;
                entries.push({ seat: i, name: student.name, regNumber: student.regNumber });
            } else {
                seat.classList.add('empty');
                seat.innerHTML = `<span class="seat-number">Seat ${i}</span><span style="font-size: 0.7rem; color: var(--text-dim);">Empty</span>`;
            }

            grid.appendChild(seat);
        }

        // Update stats
        document.getElementById('stat-occupied').innerText = occupied;
        document.getElementById('stat-empty').innerText = TOTAL_SEATS - occupied;
        document.getElementById('stat-mismatches').innerText = mismatchSeats.size;

        // Update sidebar student list
        if (entries.length === 0) {
            studentListEl.innerHTML = `<p style="color: var(--text-dim); font-size: 0.85rem;">No seats assigned yet.</p>`;
        } else {
            entries.forEach(e => {
                const pill = document.createElement('div');
                pill.className = 'student-pill';
                pill.innerHTML = `
                    <span>${e.name}</span>
                    <span class="seat-badge">${e.seat}</span>
                `;
                studentListEl.appendChild(pill);
            });
        }
    };

    // --- Auto-Assign Seats ---
    document.getElementById('assign-seats-btn').addEventListener('click', async () => {
        const students = await getApprovedStudents();
        if (students.length === 0) {
            showToast('No approved students found in database.', 'error');
            return;
        }

        showToast('Clearing existing records...', 'info');
        
        // 1. CLEAR existing seating records first (Now batch delete is supported)
        await fetch('api.php?table=seating', { method: 'DELETE' });

        // 2. ASSIGN in strict alphabetical order
        showToast('Assigning A-Z order...', 'info');

        // Re-verify sort just in case
        students.sort((a, b) => a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase()));

        const assignCount = Math.min(students.length, TOTAL_SEATS);
        for (let index = 0; index < assignCount; index++) {
            const student = students[index];
            const seatNum = index + 1;
            // Use student.id to link, seatNum as the target
            await saveSeatingToDB(student.id, seatNum);
        }

        mismatchSeats.clear();
        await renderGrid();
        clearAlerts();
        
        if (students.length > TOTAL_SEATS) {
            showToast(`Assigned ${assignCount} students. ${students.length - assignCount} students could not be seated (Capacity full).`, 'warning');
        } else {
            showToast(`Success! ${assignCount} students assigned in alphabetical order (Seat 1 to ${assignCount}).`);
        }
    });


    // --- Clear Seats ---
    document.getElementById('clear-seats-btn').addEventListener('click', async () => {
        // Optimized: Single DELETE call to clear table
        await fetch('api.php?table=seating', { method: 'DELETE' });

        mismatchSeats.clear();
        await renderGrid();
        clearAlerts();
        showToast('Database seating cleared.', 'error');
    });


    // --- Simulate Wrong Seating ---
    document.getElementById('simulate-mismatch-btn').addEventListener('click', async () => {
        const arrangement = await loadSeatingFromDB();
        const occupiedSeats = Object.keys(arrangement).map(Number);

        if (occupiedSeats.length < 2) {
            showToast('Assign at least 2 students first to simulate a mismatch.', 'error');
            return;
        }

        // Randomly pick 1–2 seats to flag as mismatch
        const shuffled = [...occupiedSeats].sort(() => Math.random() - 0.5);
        const mismatched = shuffled.slice(0, Math.min(2, shuffled.length));

        mismatchSeats.clear();
        mismatched.forEach(s => mismatchSeats.add(s));

        renderGrid();
        renderAlerts(arrangement, mismatched);
    });

    // --- Alert Log ---
    const clearAlerts = () => {
        alertLogEl.innerHTML = `<p class="alert-empty">No alerts. All students are seated correctly.</p>`;
    };

    const renderAlerts = (arrangement, mismatchedSeats) => {
        alertLogEl.innerHTML = '';

        mismatchedSeats.forEach(seatNum => {
            const student = arrangement[seatNum];
            if (!student) return;

            // Mismatch alert
            const alertEl = document.createElement('div');
            alertEl.className = 'alert-item';
            alertEl.innerHTML = `
                <i data-lucide="alert-triangle" style="min-width:16px;"></i>
                <span><strong>Seat ${seatNum} MISMATCH:</strong> ${student.name} (${student.regNumber}) is sitting in wrong seat!</span>
            `;
            alertLogEl.appendChild(alertEl);

            // Simulated SMS
            const smsEl = document.createElement('div');
            smsEl.className = 'alert-item sms';
            smsEl.innerHTML = `
                <i data-lucide="message-square" style="min-width:16px;"></i>
                <span><strong>[SMS SIMULATED]</strong> Alert sent: "${student.name} is sitting in wrong seat (Seat ${seatNum}). Please report to invigilator."</span>
            `;
            alertLogEl.appendChild(smsEl);

            // Show toast for first mismatch
            showToast(`⚠ Mismatch detected for ${student.name} at Seat ${seatNum}!`, 'error');
        });

        lucide.createIcons();
    };

    // --- Initial Render ---
    renderGrid();
});
