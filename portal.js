document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // HELPERS
    // ==========================================
    const toastEl = document.getElementById('toast');
    const showToast = (msg, type = 'success') => {
        toastEl.innerText = msg;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => toastEl.classList.remove('show'), 3000);
    };

    const showStatus = (elId, msg, type) => {
        const el = document.getElementById(elId);
        el.innerText = msg;
        el.className = `status-msg show ${type}`;
        setTimeout(() => el.classList.remove('show'), 4000);
    };

    const announce = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    // Voice guidance on start
    setTimeout(() => {
        announce("Welcome to Unibot. Please choose Student or Admin to begin.");
    }, 1000);

    const showPanel = (id) => {
        const panels = [
            'student-login-panel','student-register-panel',
            'admin-login-panel','admin-register-panel','admin-otp-panel'
        ];
        panels.forEach(p => {
            const el = document.getElementById(p);
            if (p === id) {
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    };


    // ==========================================
    // ROLE TOGGLE (Student / Admin)
    // ==========================================
    const btnStudent = document.getElementById('btn-student');
    const btnAdmin   = document.getElementById('btn-admin');

    btnStudent.addEventListener('click', () => {
        btnStudent.classList.add('active');
        btnAdmin.classList.remove('active');
        showPanel('student-login-panel');
        stopCamera();
    });

    btnAdmin.addEventListener('click', () => {
        btnAdmin.classList.add('active');
        btnStudent.classList.remove('active');
        showPanel('admin-login-panel');
        stopCamera();
    });

    // ==========================================
    // STUDENT — Method Toggle (Face ID / OTP)
    // ==========================================
    const methodFaceBtn = document.getElementById('method-face');
    const methodOtpBtn  = document.getElementById('method-otp');
    const facePan = document.getElementById('face-login-panel');
    const otpPan  = document.getElementById('otp-login-panel');

    methodFaceBtn.addEventListener('click', () => {
        methodFaceBtn.classList.add('active');
        methodOtpBtn.classList.remove('active');
        facePan.classList.add('visible');
        otpPan.classList.remove('visible');
    });

    methodOtpBtn.addEventListener('click', () => {
        methodOtpBtn.classList.add('active');
        methodFaceBtn.classList.remove('active');
        otpPan.classList.add('visible');
        facePan.classList.remove('visible');
        stopCamera();
    });

    // ==========================================
    // STUDENT REGISTRATION ↔ LOGIN links
    // ==========================================
    document.getElementById('go-register').addEventListener('click', () => {
        showPanel('student-register-panel');
        stopCamera();
    });

    document.getElementById('go-login').addEventListener('click', () => {
        showPanel('student-login-panel');
    });

    // ==========================================
    // FACE ID LOGIN (Camera + Simulated Scan)
    // ==========================================
    const cameraFeed    = document.getElementById('camera-feed');
    const cameraBox     = document.getElementById('camera-box');
    const scanOverlay   = document.getElementById('scan-overlay');
    const placeholder   = document.getElementById('camera-placeholder');
    const faceBtn       = document.getElementById('start-face-scan-btn');
    let cameraStream    = null;
    let scanTimer       = null;

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        cameraFeed.classList.remove('active');
        scanOverlay.classList.remove('active');
        placeholder.style.display = 'flex';
        faceBtn.innerHTML = '<i data-lucide="scan-face" style="display:inline;margin-right:6px;"></i>Start Face Scan';
        lucide.createIcons();
        clearTimeout(scanTimer);
    };

    faceBtn.addEventListener('click', async () => {
        if (cameraStream) {
            stopCamera();
            return;
        }

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraFeed.srcObject = cameraStream;
            cameraFeed.classList.add('active');
            placeholder.style.display = 'none';
            scanOverlay.classList.add('active');
            faceBtn.innerHTML = '<i data-lucide="loader" style="display:inline;margin-right:6px;"></i>Scanning...';
            lucide.createIcons();

            // Simulate face recognition: scan for 3 seconds
            scanTimer = setTimeout(async () => {
                // Try to find a student with stored face images from DB
                const matchedStudent = await getStudentByFace();
                stopCamera();
                
                if (matchedStudent) {
                    showStatus('face-status', `✓ Face matched: ${matchedStudent.name}`, 'success');
                    if (!matchedStudent.approved) {
                        announce("Your account is pending admin approval.");
                        showToast('Your account is pending admin approval.', 'error');
                        return;
                    }
                    // Save session - ensure format matches script.js requirements
                    const sessionData = {
                        id: matchedStudent.id,
                        name: matchedStudent.name,
                        regNumber: matchedStudent.register_no
                    };
                    localStorage.setItem('current_student', JSON.stringify(sessionData));
                    announce(`Welcome, ${matchedStudent.name}! Redirecting you now.`);
                    showToast(`Welcome, ${matchedStudent.name}! 👋`);
                    setTimeout(() => window.location.href = 'index.html', 1200);
                } else {
                    announce("Face not recognized. Please try again or use your Register Number.");
                    showStatus('face-status', '✗ Face not recognized. Try Reg No + OTP.', 'error');
                }
            }, 3000);

        } catch (err) {
            showToast('Camera access denied. Use Reg No + OTP instead.', 'error');
        }
    });

    const getStudentByFace = async () => {
        try {
            const response = await fetch('api.php?table=students');
            const result = await response.json();
            const students = result.data || [];
            // Simulation: return the first student who has images stored
            return students.find(s => s.face_images && s.face_images.length > 10) || null;
        } catch (e) {
            console.error("Error fetching students for face match:", e);
            return null;
        }
    };

    // ==========================================
    // STUDENT — Reg No + OTP LOGIN
    // ==========================================
    let studentOtpGenerated = null;
    let studentForLogin = null;

    document.getElementById('send-student-otp-btn').addEventListener('click', async () => {
        const regNo = document.getElementById('student-reg-input').value.trim();
        if (!regNo) { announce("Please enter your Register Number."); showStatus('otp-status', 'Please enter your Register Number.', 'error'); return; }

        try {
            // Fetch student from MySQL via API
            const response = await fetch(`api.php?table=students&register_no=${encodeURIComponent(regNo)}`);
            const result = await response.json();
            const found = result.data ? result.data[0] : null;

            if (!found) {
                announce("Register number not found. Please register first.");
                showStatus('otp-status', 'Register number not found. Please register first.', 'error');
                return;
            }

            if (!found.approved) {
                announce("Your account is pending admin approval.");
                showStatus('otp-status', 'Your account is pending admin approval.', 'error');
                return;
            }

            studentForLogin = {
                id: found.id,
                name: found.name,
                regNumber: found.register_no
            };
            studentOtpGenerated = Math.floor(1000 + Math.random() * 9000).toString();
            announce("Code sent to your phone. Please enter it below.");
            alert(`[OTP SIMULATION] Your login OTP is: ${studentOtpGenerated}`);

            document.getElementById('otp-step1').style.display = 'none';
            document.getElementById('otp-step2').style.display = 'block';
            showStatus('otp-status', `OTP sent! Check your registered phone/email.`, 'info');
            
            // Reset resend link state
            const resendLink = document.getElementById('resend-otp-link');
            resendLink.innerText = "Resend OTP";
            resendLink.style.pointerEvents = 'auto';
            resendLink.style.opacity = '1';
        } catch (e) {
            showStatus('otp-status', 'Server error. Please try again.', 'error');
        }
    });

    document.getElementById('resend-otp-link').addEventListener('click', () => {
        studentOtpGenerated = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`[OTP SIMULATION] Your new login OTP is: ${studentOtpGenerated}`);
        announce("OTP has been resent to your phone.");
        showToast('OTP resent!');
        
        // Disable for 30s
        const link = document.getElementById('resend-otp-link');
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.4';
        let countdown = 30;
        const interval = setInterval(() => {
            countdown--;
            link.innerText = `Resend in ${countdown}s`;
            if (countdown <= 0) {
                clearInterval(interval);
                link.innerText = "Resend OTP";
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
            }
        }, 1000);
    });


    document.getElementById('verify-student-otp-btn').addEventListener('click', () => {
        const entered = document.getElementById('student-otp-input').value.trim();
        if (entered === studentOtpGenerated) {
            // Save session
            localStorage.setItem('current_student', JSON.stringify(studentForLogin));
            showToast(`Welcome, ${studentForLogin.name}! 👋`);
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            showStatus('otp-status', 'Invalid OTP. Please try again.', 'error');
        }
    });

    document.getElementById('resend-otp-link').addEventListener('click', () => {
        studentOtpGenerated = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`[OTP SIMULATION] Your new OTP is: ${studentOtpGenerated}`);
        showStatus('otp-status', 'OTP resent!', 'info');
    });

    // ==========================================
    // STUDENT REGISTRATION
    // ==========================================
    const fileInput   = document.getElementById('face-images');
    const uploadArea  = document.getElementById('upload-area');
    const previewGrid = document.getElementById('preview-grid');
    let uploadedImages = [];

    const handleFiles = (files) => {
        for (let file of files) {
            if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                showToast(`${file.name} is not JPG/JPEG!`, 'error'); continue;
            }
            if (uploadedImages.length >= 5) { showToast('Max 5 images.', 'error'); break; }
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImages.push(e.target.result);
                const item = document.createElement('div');
                item.className = 'preview-item';
                item.innerHTML = `<img src="${e.target.result}" alt="Face">`;
                previewGrid.appendChild(item);
            };
            reader.readAsDataURL(file);
        }
    };

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault(); uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    document.getElementById('register-submit-btn').addEventListener('click', async () => {
        const name     = document.getElementById('reg-name').value.trim();
        const phone    = document.getElementById('reg-phone').value.trim();
        const regNum   = document.getElementById('reg-number').value.trim();
        const email    = document.getElementById('reg-email').value.trim();

        if (!/^[A-Za-z\s]+$/.test(name)) { showToast('Name must contain only alphabets.', 'error'); return; }
        if (!/^\d{10}$/.test(phone))      { showToast('Phone must be exactly 10 digits.', 'error'); return; }
        if (!regNum)                       { showToast('Register number is required.', 'error'); return; }
        if (!email)                        { showToast('Email is required.', 'error'); return; }
        if (uploadedImages.length === 0)   { showToast('Please upload at least one face image.', 'error'); return; }

        const payload = { 
            name, 
            phone, 
            register_no: regNum, 
            email, 
            face_images: JSON.stringify(uploadedImages), 
            approved: 0 
        };

        try {
            const response = await fetch('api.php?table=students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Registration successful! Pending admin approval.', 'success');
                uploadedImages = [];
                previewGrid.innerHTML = '';
                document.getElementById('reg-name').value = '';
                document.getElementById('reg-phone').value = '';
                document.getElementById('reg-number').value = '';
                document.getElementById('reg-email').value = '';
                setTimeout(() => showPanel('student-login-panel'), 1500);
            } else {
                showToast(result.error || 'Registration failed.', 'error');
            }
        } catch (e) {
            showToast('Connection error. Please try again.', 'error');
        }
    });

    // ==========================================
    // ADMIN LOGIN (Email + Password)
    // ==========================================
    document.getElementById('admin-login-btn').addEventListener('click', () => {
        const email = document.getElementById('admin-email-input').value.trim();
        const pass  = document.getElementById('admin-password-input').value;

        const adminData = localStorage.getItem(`admin_${email}`);
        if (!adminData) { showToast('Email not registered as Admin.', 'error'); return; }

        const admin = JSON.parse(adminData);
        if (admin.password === pass) {
            showToast('Admin login successful!');
            localStorage.setItem('current_admin', email);
            setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
        } else {
            showToast('Incorrect password.', 'error');
        }
    });

    document.getElementById('admin-forgot-link').addEventListener('click', () => showPanel('admin-otp-panel'));
    document.getElementById('go-admin-register').addEventListener('click', () => showPanel('admin-register-panel'));
    document.getElementById('go-admin-login').addEventListener('click', () => showPanel('admin-login-panel'));
    document.getElementById('back-to-admin-login').addEventListener('click', () => showPanel('admin-login-panel'));

    // ==========================================
    // ADMIN REGISTRATION
    // ==========================================
    document.getElementById('admin-register-btn').addEventListener('click', () => {
        const name  = document.getElementById('admin-reg-name').value.trim();
        const phone = document.getElementById('admin-reg-phone').value.trim();
        const email = document.getElementById('admin-reg-email').value.trim();
        const pass  = document.getElementById('admin-reg-password').value;

        if (!/^[A-Za-z\s]+$/.test(name)) { showToast('Name must contain only alphabets.', 'error'); return; }
        if (!/^\d{10}$/.test(phone))      { showToast('Phone must be exactly 10 digits.', 'error'); return; }
        if (!email)                        { showToast('Email is required.', 'error'); return; }
        if (!pass)                         { showToast('Password is required.', 'error'); return; }

        localStorage.setItem(`admin_${email}`, JSON.stringify({ name, phone, email, password: pass, role: 'admin' }));
        showToast('Admin registered successfully!');
        setTimeout(() => showPanel('admin-login-panel'), 1500);
    });

    // ==========================================
    // ADMIN OTP PASSWORD RESET
    // ==========================================
    let adminOtp = null;
    let adminResetEmail = null;

    document.getElementById('admin-send-otp-btn').addEventListener('click', () => {
        const email = document.getElementById('admin-reset-email').value.trim();
        if (!localStorage.getItem(`admin_${email}`)) { showToast('Email not found.', 'error'); return; }

        adminOtp = Math.floor(1000 + Math.random() * 9000).toString();
        adminResetEmail = email;
        alert(`[OTP SIMULATION] Your password reset OTP is: ${adminOtp}`);
        showToast('OTP sent!');

        document.getElementById('admin-reset-email-group').style.display = 'none';
        document.getElementById('admin-send-otp-btn').style.display = 'none';
        document.getElementById('admin-otp-verify-block').style.display = 'flex';
        
        // Reset resend button state
        const resendBtn = document.getElementById('admin-resend-otp-btn');
        resendBtn.innerText = "Didn't receive OTP? Resend";
        resendBtn.style.pointerEvents = 'auto';
        resendBtn.style.opacity = '1';
    });

    document.getElementById('admin-resend-otp-btn').addEventListener('click', () => {
        adminOtp = Math.floor(1000 + Math.random() * 9000).toString();
        alert(`[OTP SIMULATION] Your new password reset OTP is: ${adminOtp}`);
        announce("OTP has been resent to your email.");
        showToast('OTP resent!');
        
        // Disable for 30s to prevent spam
        const btn = document.getElementById('admin-resend-otp-btn');
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.4';
        let countdown = 30;
        const interval = setInterval(() => {
            countdown--;
            btn.innerText = `Resend in ${countdown}s`;
            if (countdown <= 0) {
                clearInterval(interval);
                btn.innerText = "Didn't receive OTP? Resend";
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
            }
        }, 1000);
    });

    document.getElementById('admin-verify-otp-btn').addEventListener('click', () => {
        const entered = document.getElementById('admin-otp-input').value.trim();
        if (entered === adminOtp) {
            showToast('OTP verified!');
            document.getElementById('admin-otp-verify-block').style.display = 'none';
            document.getElementById('admin-new-pwd-block').style.display = 'flex';
        } else {
            showToast('Invalid OTP.', 'error');
        }
    });

    document.getElementById('admin-reset-pwd-btn').addEventListener('click', () => {
        const newPass = document.getElementById('admin-new-password').value;
        if (!newPass) { showToast('Enter a new password.', 'error'); return; }
        const adminData = JSON.parse(localStorage.getItem(`admin_${adminResetEmail}`));
        adminData.password = newPass;
        localStorage.setItem(`admin_${adminResetEmail}`, JSON.stringify(adminData));
        showToast('Password reset successfully!');
        setTimeout(() => showPanel('admin-login-panel'), 1500);
    });

    // Init
    showPanel('student-login-panel');
});
