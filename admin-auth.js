document.addEventListener('DOMContentLoaded', () => {
    const tabLogin = document.getElementById('tab-admin-login');
    const tabRegister = document.getElementById('tab-admin-register');
    const loginForm = document.getElementById('admin-login-form');
    const registerForm = document.getElementById('admin-register-form');
    const otpSection = document.getElementById('otp-section');
    const subtitle = document.getElementById('admin-subtitle');

    const switchTab = (tab) => {
        // Reset visibility
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        otpSection.style.display = 'none';
        
        tabLogin.classList.remove('active');
        tabRegister.classList.remove('active');

        if (tab === 'login') {
            tabLogin.classList.add('active');
            loginForm.style.display = 'flex';
            subtitle.innerText = 'Secure access for administrators';
        } else if (tab === 'register') {
            tabRegister.classList.add('active');
            registerForm.style.display = 'flex';
            subtitle.innerText = 'Register new administrator';
        } else if (tab === 'otp') {
            tabLogin.classList.add('active'); // Keep login tab highlighted
            otpSection.style.display = 'flex';
            subtitle.innerText = 'Password Recovery';
        }
    };

    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    const toastEl = document.getElementById('toast');
    const showToast = (message, type = 'success') => {
        toastEl.innerText = message;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    };

    // Registration Logic
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if (!/^[A-Za-z\s]+$/.test(name)) {
            showToast('Name must contain only alphabets.', 'error');
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            showToast('Phone number must be exactly 10 digits.', 'error');
            return;
        }

        const adminData = { name, phone, email, password, role: 'admin' };
        localStorage.setItem(`admin_${email}`, JSON.stringify(adminData));
        
        showToast('Admin registration successful!', 'success');
        registerForm.reset();
        setTimeout(() => switchTab('login'), 1500);
    });

    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const loginName = document.getElementById('login-name').value.trim();
        const password = document.getElementById('login-password').value;

        let foundAdmin = null;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('admin_')) {
                try {
                    const adminData = JSON.parse(localStorage.getItem(key));
                    if (adminData && adminData.name && adminData.name.toLowerCase() === loginName.toLowerCase()) {
                        foundAdmin = adminData;
                        break;
                    }
                } catch(err) {}
            }
        }
        
        if (foundAdmin) {
            if (foundAdmin.password === password) {
                showToast('Login successful! Redirecting...', 'success');
                // Save session state to localStorage
                localStorage.setItem('current_admin', foundAdmin.email);
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1000);
            } else {
                showToast('Incorrect password.', 'error');
            }
        } else {
            showToast('Admin name not found.', 'error');
        }
    });

    // OTP Flow Logic
    const forgotPwdLink = document.getElementById('forgot-pwd-link');
    const backToLoginLink = document.getElementById('back-to-login');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const resetPwdBtn = document.getElementById('reset-pwd-btn');
    
    let generatedOTP = null;
    let targetEmailForReset = null;

    forgotPwdLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('otp');
    });

    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login');
        // Reset OTP forms
        document.getElementById('verify-otp-block').style.display = 'none';
        document.getElementById('new-pwd-block').style.display = 'none';
        document.getElementById('send-otp-btn').style.display = 'block';
        document.getElementById('otp-email-group').style.display = 'flex';
        generatedOTP = null;
    });

    sendOtpBtn.addEventListener('click', () => {
        const email = document.getElementById('otp-email').value.trim();
        if (!email) {
            showToast('Please enter your email.', 'error');
            return;
        }

        if (!localStorage.getItem(`admin_${email}`)) {
            showToast('This email is not registered as an Admin.', 'error');
            return;
        }

        // Simulate OTP generation
        generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        targetEmailForReset = email;
        
        // In a real app, this sends an email. We simulate with an alert/toast.
        alert(`[SIMULATION] Your OTP for password reset is: ${generatedOTP}`);
        showToast('OTP sent successfully to your email!', 'success');

        document.getElementById('send-otp-btn').style.display = 'none';
        document.getElementById('otp-email-group').style.display = 'none';
        document.getElementById('verify-otp-block').style.display = 'block';
    });

    verifyOtpBtn.addEventListener('click', () => {
        const enteredOtp = document.getElementById('otp-input').value;
        if (enteredOtp === generatedOTP) {
            showToast('OTP verified!', 'success');
            document.getElementById('verify-otp-block').style.display = 'none';
            document.getElementById('new-pwd-block').style.display = 'block';
        } else {
            showToast('Invalid OTP. Please try again.', 'error');
        }
    });

    resetPwdBtn.addEventListener('click', () => {
        const newPwd = document.getElementById('new-password').value;
        if (!newPwd) {
            showToast('Please enter a new password.', 'error');
            return;
        }

        const adminDataStr = localStorage.getItem(`admin_${targetEmailForReset}`);
        if (adminDataStr) {
            const adminData = JSON.parse(adminDataStr);
            adminData.password = newPwd;
            localStorage.setItem(`admin_${targetEmailForReset}`, JSON.stringify(adminData));
            showToast('Password reset successfully! Please login.', 'success');
            setTimeout(() => {
                backToLoginLink.click();
            }, 1500);
        }
    });
});
