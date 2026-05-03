class Unibot {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.micBtn = document.getElementById('mic-btn');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.actionBtns = document.querySelectorAll('.action-btn');
        this.isRecording = false;
        
        this.initSession();
        this.initSpeechRecognition();
        this.initSpeechSynthesis();
        this.initEventListeners();
        lucide.createIcons();
    }

    announce(text) {
        if (!window.speechSynthesis) return;
        // Stop any current speech
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }

    initSession() {
        const currentStudent = JSON.parse(localStorage.getItem('current_student'));
        const profileDiv = document.getElementById('student-profile');
        
        if (currentStudent) {
            profileDiv.style.display = 'flex';
            document.getElementById('display-name').innerText = currentStudent.name;
            document.getElementById('display-reg').innerText = currentStudent.regNumber;
            
            const msg = `Welcome back, ${currentStudent.name}! You can ask me anything, or click the big buttons below.`;
            this.addMessage(msg, 'bot');
            setTimeout(() => this.announce(msg), 500);
        } else {
            window.location.href = 'portal.html';
        }

        document.getElementById('student-logout-btn').addEventListener('click', () => {
            localStorage.removeItem('current_student');
            window.location.href = 'portal.html';
        });
    }


    initSpeechSynthesis() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // Load voices
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
        };
        
        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    speak(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find a nice premium-sounding voice (like Google UK English or similar)
        const preferredVoice = this.voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                               this.voices.find(v => v.lang.startsWith('en')) || 
                               this.voices[0];
        
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.pitch = 1;
        utterance.rate = 1;
        this.synth.speak(utterance);
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.isRecording = true;
                this.micBtn.classList.add('recording');
                this.updateMicIcon('mic-off');
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.micBtn.classList.remove('recording');
                this.updateMicIcon('mic');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleUserMessage(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.addMessage('Sorry, I couldn\'t hear you clearly. Could you try again?', 'bot');
            };
        } else {
            console.warn('Speech recognition not supported in this browser.');
            this.micBtn.style.display = 'none';
        }
    }

    initEventListeners() {
        this.micBtn.addEventListener('click', () => {
            if (this.isRecording) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        });

        this.sendBtn.addEventListener('click', () => {
            this.handleTextInput();
        });

        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleTextInput();
            }
        });

        this.actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                const label = btn.querySelector('span').innerText;
                this.announce(`Checking your ${label}`);
                this.handleUserMessage(label);
            });
        });
    }

    handleTextInput() {
        const text = this.userInput.value.trim();
        if (text) {
            this.handleUserMessage(text);
            this.userInput.value = '';
        }
    }

    updateMicIcon(iconName) {
        const icon = this.micBtn.querySelector('i');
        icon.setAttribute('data-lucide', iconName);
        lucide.createIcons();
    }

    async handleUserMessage(text) {
        this.addMessage(text, 'user');
        
        // Show typing indicator
        const typingId = this.showTypingIndicator();
        
        try {
            const response = await this.getBotResponse(text);
            this.removeTypingIndicator(typingId);
            this.addMessage(response, 'bot');
            this.speak(response);
        } catch (error) {
            this.removeTypingIndicator(typingId);
            const errMsg = "I'm having trouble connecting to the campus server. Is the backend running?";
            this.addMessage(errMsg, 'bot');
            this.speak(errMsg);
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerText = text;
        this.chatWindow.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.className = 'message bot-message typing';
        typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        this.chatWindow.appendChild(typingDiv);
        this.scrollToBottom();
        return id;
    }

    removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    async getBotResponse(text) {
        const query = text.toLowerCase();
        
        // Check for navigation commands first (priority redirect)
        const navMatch = query.match(/(?:take me to|navigate to|where is|find|go to|show me)\s+(.+)/i);
        if (navMatch) {
            const destination = navMatch[1].trim();
            setTimeout(() => {
                window.location.href = `navigation.html?room=${encodeURIComponent(destination)}`;
            }, 1800);
            return `Opening the Campus Map and navigating to "${destination}" for you! 🗺️`;
        }

        // Identify student
        const currentStudent = JSON.parse(localStorage.getItem('current_student'));
        const regNumber = currentStudent ? currentStudent.regNumber : null;

        try {
            const res = await fetch('http://127.0.0.1:5000/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: query, reg_number: regNumber })
            });
            const data = await res.json();
            
            if (data.response === 'redirect_nav') {
                setTimeout(() => { window.location.href = 'navigation.html'; }, 1800);
                return "Opening the Campus Navigation Map for you! 🗺️";
            }
            
            return data.response;
        } catch (e) {
            // Fallback for greetings if backend is unreachable
            if (query.includes('hello') || query.includes('hi')) {
                return "Hi there! I'm Unibot. I can help with attendance, results, and more if you start the Flask backend.";
            }
            return "Server unreachable. Please ensure 'python app.py' is running on port 5000.";
        }
    }
}

// Initialize Unibot when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.unibot = new Unibot();
});
