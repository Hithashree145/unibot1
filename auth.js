document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const subtitle = document.getElementById('auth-subtitle');

    const switchTab = (isLogin) => {
        if (isLogin) {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            subtitle.innerText = 'Login to access your campus companion';
        } else {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
            subtitle.innerText = 'Create your student account';
        }
    };

    tabLogin.addEventListener('click', () => switchTab(true));
    tabRegister.addEventListener('click', () => switchTab(false));

    // Toast Notification
    const toastEl = document.getElementById('toast');
    const showToast = (message, type = 'success') => {
        toastEl.innerText = message;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    };

    const regPasswordInput = document.getElementById('reg-password');


    // Image Upload & Preview
    const fileInput = document.getElementById('face-images');
    const uploadArea = document.getElementById('upload-area');
    const previewGrid = document.getElementById('preview-grid');
    let uploadedImagesBase64 = [];

    const handleFiles = (files) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate JPG only
            if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                showToast(`${file.name} is not a valid JPG/JPEG image!`, 'error');
                continue;
            }

            if (uploadedImagesBase64.length >= 5) {
                showToast('Maximum 5 images allowed.', 'error');
                break;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Str = e.target.result;
                uploadedImagesBase64.push(base64Str);
                
                // Create preview element
                const item = document.createElement('div');
                item.className = 'preview-item';
                item.innerHTML = `<img src="${base64Str}" alt="Face Preview">`;
                previewGrid.appendChild(item);
            };
            reader.readAsDataURL(file);
        }
    };

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // Registration Form Submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const regNumber = document.getElementById('reg-number').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = regPasswordInput.value;

        // Custom Validation (though HTML5 pattern handles most)
        if (!/^[A-Za-z\s]+$/.test(name)) {
            showToast('Name must contain only alphabets.', 'error');
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            showToast('Phone number must be exactly 10 digits.', 'error');
            return;
        }

        if (!password) {
            showToast('Please create a password.', 'error');
            return;
        }

        if (uploadedImagesBase64.length === 0) {
            showToast('Please upload at least one face image.', 'error');
            return;
        }

        // Save to localStorage
        const studentData = {
            name, phone, regNumber, email, password,
            images: uploadedImagesBase64
        };
        localStorage.setItem(`student_${name}`, JSON.stringify(studentData));
        
        showToast('Registration successful! Please login.', 'success');
        
        // Clear form and switch to login
        registerForm.reset();
        previewGrid.innerHTML = '';
        uploadedImagesBase64 = [];
        regPasswordInput.value = '';
        setTimeout(() => switchTab(true), 1500);
    });

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const loginName = document.getElementById('login-name').value.trim();
        const loginPwd = document.getElementById('login-password').value;

        const storedData = localStorage.getItem(`student_${loginName}`);
        
        if (storedData) {
            const student = JSON.parse(storedData);
            if (student.password === loginPwd) {
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showToast('Incorrect password.', 'error');
            }
        } else {
            showToast('Student name not found. Please register.', 'error');
        }
    });
});
