document.addEventListener('DOMContentLoaded', () => {

    const MAX_MARKS = 100;
    const PASS_MARK = 35;
    const RESULTS_STORE = 'student_results';

    // --- Toast ---
    const toastEl = document.getElementById('toast');
    const showToast = (msg, type = 'success') => {
        toastEl.innerText = msg;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => toastEl.classList.remove('show'), 3000);
    };

    // --- Load students from localStorage ---
    const getStudents = () => {
        const students = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('student_')) {
                try {
                    const s = JSON.parse(localStorage.getItem(key));
                    if (s) students.push(s);
                } catch(e) {}
            }
        }
        return students.sort((a, b) => a.name.localeCompare(b.name));
    };

    // --- Populate student dropdown ---
    const studentSelect = document.getElementById('student-select');
    const populateDropdown = () => {
        const students = getStudents();
        studentSelect.innerHTML = '<option value="">-- Choose a student --</option>';
        students.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.regNumber;
            opt.text = `${s.name} (${s.regNumber})`;
            studentSelect.appendChild(opt);
        });
    };
    populateDropdown();

    // --- Results Storage Helpers ---
    const getAllResults = () => {
        const raw = localStorage.getItem(RESULTS_STORE);
        return raw ? JSON.parse(raw) : {};
    };
    const saveResult = (regNumber, data) => {
        const all = getAllResults();
        all[regNumber] = data;
        localStorage.setItem(RESULTS_STORE, JSON.stringify(all));
    };
    const getResult = (regNumber) => {
        const all = getAllResults();
        return all[regNumber] || null;
    };

    // --- Grade Calculator ---
    const getGrade = (pct) => {
        if (pct >= 90) return 'O';
        if (pct >= 80) return 'A+';
        if (pct >= 70) return 'A';
        if (pct >= 60) return 'B+';
        if (pct >= 50) return 'B';
        if (pct >= 35) return 'C';
        return 'F';
    };
    const getBarClass = (pct) => {
        if (pct >= 60) return 'good';
        if (pct >= 35) return 'warning';
        return 'danger';
    };
    const getChartColor = (pct) => {
        if (pct >= 60) return 'linear-gradient(to top, #10b981, #06b6d4)';
        if (pct >= 35) return 'linear-gradient(to top, #f59e0b, #eab308)';
        return 'linear-gradient(to top, #ef4444, #f97316)';
    };
    const toCGPA = (pct) => {
        if (pct >= 90) return '10.0';
        if (pct >= 80) return '9.0';
        if (pct >= 70) return '8.0';
        if (pct >= 60) return '7.0';
        if (pct >= 50) return '6.0';
        if (pct >= 35) return '5.0';
        return '0.0';
    };

    // =============================================
    // DYNAMIC SUBJECT ROWS
    // =============================================
    const rowsContainer = document.getElementById('subject-rows-container');
    let rowCount = 0;

    const addSubjectRow = (subject = '', marks = '') => {
        rowCount++;
        const id = `subj-row-${rowCount}`;
        const row = document.createElement('div');
        row.id = id;
        row.style.cssText = 'display: flex; gap: 12px; align-items: center;';
        row.innerHTML = `
            <div style="flex: 2;">
                <input type="text" class="subj-name-input"
                    placeholder="Subject Name (e.g. Mathematics)"
                    value="${subject}"
                    style="width:100%; background:rgba(255,255,255,0.08); border:1px solid var(--glass-border); border-radius:10px; color:var(--text-main); padding:10px 14px; font-family:'Outfit',sans-serif; font-size:0.95rem; outline:none;">
            </div>
            <div style="flex: 1;">
                <input type="number" class="subj-marks-input"
                    placeholder="Marks (0-100)"
                    min="0" max="100"
                    value="${marks}"
                    style="width:100%; background:rgba(255,255,255,0.08); border:1px solid var(--glass-border); border-radius:10px; color:var(--text-main); padding:10px 14px; font-family:'Outfit',sans-serif; font-size:0.95rem; outline:none;">
            </div>
            <button onclick="document.getElementById('${id}').remove()"
                style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:8px; padding:8px 12px; cursor:pointer; font-size:1rem; flex-shrink:0;"
                title="Remove subject">✕</button>
        `;
        rowsContainer.appendChild(row);
        lucide.createIcons();
    };

    // Start with 3 empty rows
    addSubjectRow();
    addSubjectRow();
    addSubjectRow();

    document.getElementById('add-subject-btn').addEventListener('click', () => {
        addSubjectRow();
    });

    // =============================================
    // MARKS CARD UPLOAD
    // =============================================
    let marksCardBase64 = null;
    const marksCardInput = document.getElementById('marks-card-input');
    const marksCardPreview = document.getElementById('marks-card-preview');
    const marksCardImg = document.getElementById('marks-card-img');
    const marksCardFilename = document.getElementById('marks-card-filename');
    const uploadArea = document.getElementById('marks-upload-area');

    marksCardInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
            showToast('Only JPG/JPEG files are allowed!', 'error');
            marksCardInput.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            marksCardBase64 = ev.target.result;
            marksCardImg.src = marksCardBase64;
            marksCardFilename.innerText = file.name;
            marksCardPreview.style.display = 'block';
            lucide.createIcons();
        };
        reader.readAsDataURL(file);
    });

    document.getElementById('remove-card-btn').addEventListener('click', () => {
        marksCardBase64 = null;
        marksCardInput.value = '';
        marksCardPreview.style.display = 'none';
        marksCardImg.src = '';
    });

    // Drag & drop support
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            marksCardInput.files = dt.files;
            marksCardInput.dispatchEvent(new Event('change'));
        }
    });

    // =============================================
    // LOAD STUDENT
    // =============================================
    let currentStudent = null;

    document.getElementById('load-student-btn').addEventListener('click', () => {
        const regNumber = studentSelect.value;
        if (!regNumber) { showToast('Please select a student.', 'error'); return; }

        const students = getStudents();
        currentStudent = students.find(s => s.regNumber === regNumber);
        if (!currentStudent) { showToast('Student not found.', 'error'); return; }

        document.getElementById('selected-student-name').innerText = currentStudent.name;
        document.getElementById('enter-marks-panel').classList.add('visible');

        // Pre-fill existing data
        const existing = getResult(regNumber);
        rowsContainer.innerHTML = '';
        rowCount = 0;
        marksCardBase64 = null;
        marksCardPreview.style.display = 'none';
        marksCardImg.src = '';

        if (existing && existing.subjects && existing.subjects.length > 0) {
            existing.subjects.forEach(s => addSubjectRow(s.label, s.marks));
            if (existing.marksCard) {
                marksCardBase64 = existing.marksCard;
                marksCardImg.src = marksCardBase64;
                marksCardFilename.innerText = 'Uploaded marks card';
                marksCardPreview.style.display = 'block';
            }
            renderResults(existing);
        } else {
            addSubjectRow(); addSubjectRow(); addSubjectRow();
            document.getElementById('results-display').classList.remove('visible');
        }
    });

    // =============================================
    // SAVE MARKS
    // =============================================
    document.getElementById('save-marks-btn').addEventListener('click', () => {
        if (!currentStudent) return;

        const nameInputs = document.querySelectorAll('.subj-name-input');
        const marksInputs = document.querySelectorAll('.subj-marks-input');
        const subjects = [];

        let valid = true;
        for (let i = 0; i < nameInputs.length; i++) {
            const label = nameInputs[i].value.trim();
            const marksVal = parseInt(marksInputs[i].value);

            if (!label && isNaN(marksVal)) continue; // skip completely empty rows
            if (!label) { showToast('Please enter a subject name for all rows.', 'error'); valid = false; break; }
            if (isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
                showToast(`Invalid marks for "${label}". Enter 0–100.`, 'error');
                valid = false;
                break;
            }
            subjects.push({ label, marks: marksVal });
        }

        if (!valid) return;
        if (subjects.length === 0) { showToast('Please add at least one subject.', 'error'); return; }

        const data = { subjects, marksCard: marksCardBase64 };
        saveResult(currentStudent.regNumber, data);
        renderResults(data);
        showToast(`Marks saved for ${currentStudent.name}!`);
    });

    // =============================================
    // RENDER RESULTS
    // =============================================
    const renderResults = (data) => {
        const { subjects } = data;
        if (!subjects || subjects.length === 0) return;

        document.getElementById('results-display').classList.add('visible');

        const total = subjects.reduce((sum, s) => sum + s.marks, 0);
        const maxTotal = subjects.length * MAX_MARKS;
        const percentage = ((total / maxTotal) * 100).toFixed(1);
        const cgpa = toCGPA(parseFloat(percentage));
        const allPassed = subjects.every(s => s.marks >= PASS_MARK);

        // Summary cards — update "out of" dynamically
        document.getElementById('total-marks').innerText = total;
        document.querySelector('#total-marks + div') && (document.querySelector('#total-marks + div').innerText = `out of ${maxTotal}`);
        document.getElementById('percentage').innerText = `${percentage}%`;
        document.getElementById('cgpa-val').innerText = cgpa;
        document.getElementById('pass-fail').innerHTML = allPassed
            ? `<span class="pass-badge pass">✓ PASS</span>`
            : `<span class="pass-badge fail">✗ FAIL</span>`;

        // Subject Bars
        const barsContainer = document.getElementById('subject-bars-container');
        barsContainer.innerHTML = '';
        subjects.forEach(sub => {
            const pct = (sub.marks / MAX_MARKS) * 100;
            barsContainer.innerHTML += `
                <div class="bar-row">
                    <span class="bar-label">${sub.label}</span>
                    <div class="bar-track">
                        <div class="bar-fill ${getBarClass(pct)}" style="width: 0%;" data-target="${pct}"></div>
                    </div>
                    <span class="bar-score" style="color: ${pct < PASS_MARK ? '#f87171' : '#a3e635'};">
                        ${sub.marks}/${MAX_MARKS}
                    </span>
                </div>
            `;
        });

        // Animate bars
        setTimeout(() => {
            document.querySelectorAll('.bar-fill').forEach(b => {
                b.style.width = b.getAttribute('data-target') + '%';
            });
        }, 50);

        // Bar Chart
        const chartEl = document.getElementById('bar-chart');
        chartEl.innerHTML = '';
        subjects.forEach(sub => {
            const pct = (sub.marks / MAX_MARKS) * 100;
            const col = document.createElement('div');
            col.className = 'chart-bar-col';
            col.style.position = 'relative';
            col.innerHTML = `
                <div class="chart-bar"
                     style="height:0%; background:${getChartColor(pct)}; width:100%; max-width:60px;"
                     data-target="${pct}"
                     data-value="${sub.marks}/${MAX_MARKS}">
                </div>
                <span class="chart-col-label">${sub.label.split(' ')[0]}</span>
            `;
            chartEl.appendChild(col);
        });

        setTimeout(() => {
            document.querySelectorAll('.chart-bar').forEach(b => {
                b.style.height = b.getAttribute('data-target') + '%';
                b.style.transition = 'height 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        }, 50);

        // Marks Table
        const tbody = document.getElementById('marks-table-body');
        tbody.innerHTML = '';
        subjects.forEach(sub => {
            const pct = ((sub.marks / MAX_MARKS) * 100).toFixed(1);
            const grade = getGrade(parseFloat(pct));
            const passed = sub.marks >= PASS_MARK;
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight:600;">${sub.label}</td>
                    <td style="font-weight:700;font-size:1.05rem;">${sub.marks}</td>
                    <td style="color:var(--text-dim);">${MAX_MARKS}</td>
                    <td>${pct}%</td>
                    <td>
                        <span style="background:rgba(99,102,241,0.15);color:#818cf8;padding:3px 10px;border-radius:6px;font-weight:700;">
                            ${grade}
                        </span>
                    </td>
                    <td>
                        <span class="pass-badge ${passed ? 'pass' : 'fail'}" style="font-size:0.8rem;padding:4px 12px;">
                            ${passed ? '✓ Pass' : '✗ Fail'}
                        </span>
                    </td>
                </tr>
            `;
        });

        // Show uploaded marks card in results if available
        const existingPreview = document.getElementById('result-card-section');
        if (existingPreview) existingPreview.remove();
        if (data.marksCard) {
            const cardSection = document.createElement('div');
            cardSection.id = 'result-card-section';
            cardSection.style.cssText = 'background:rgba(0,0,0,0.15);border:1px solid var(--glass-border);border-radius:18px;padding:28px;';
            cardSection.innerHTML = `
                <h3 style="font-size:0.8rem;font-weight:700;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">Uploaded Marks Card</h3>
                <img src="${data.marksCard}" alt="Marks Card"
                     style="max-width:100%;max-height:400px;border-radius:12px;border:1px solid var(--glass-border);object-fit:contain;">
            `;
            document.getElementById('results-display').appendChild(cardSection);
        }
    };
});
