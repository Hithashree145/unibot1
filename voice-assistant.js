/**
 * Unibot Voice Assistant Module
 * Extends Campus Navigation with Speech-to-Text capabilities.
 */

(function() {
    // Check for SpeechRecognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("Speech Recognition API not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isListening = false;

    // Create the Voice Assistant Button in the Search Bar
    function injectVoiceAssistant() {
        const destInputGroup = document.querySelector('#dest-search').parentElement;
        if (!destInputGroup) return;

        // Create mic button
        const micBtn = document.createElement('button');
        micBtn.id = 'voice-search-btn';
        micBtn.type = 'button';
        micBtn.style.cssText = `
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 4px 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
        `;
        micBtn.title = "Speak Destination";
        micBtn.innerHTML = `<i data-lucide="mic" style="width: 18px;"></i>`;

        // Pulse effect element
        const pulse = document.createElement('div');
        pulse.id = 'voice-pulse';
        pulse.style.cssText = `
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(245, 158, 11, 0.4);
            display: none;
            animation: pulse-voice 1.5s infinite;
            z-index: -1;
        `;
        micBtn.appendChild(pulse);

        // Insert into DOM - place it before search results
        destInputGroup.insertBefore(micBtn, document.getElementById('dest-results'));

        // Add animations to head
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse-voice {
                0% { transform: scale(0.8); opacity: 0.8; }
                100% { transform: scale(2.2); opacity: 0; }
            }
            #voice-search-btn.active {
                color: #f59e0b !important;
            }
            #voice-search-btn.active i {
                filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.5));
            }
        `;
        document.head.appendChild(style);

        micBtn.addEventListener('click', toggleListening);
        
        // Sidebar Button as fallback/secondary
        const controls = document.querySelector('.guidance-controls');
        if (controls) {
            const sidebarBtn = document.createElement('button');
            sidebarBtn.className = 'secondary-btn';
            sidebarBtn.style.cssText = 'padding: 10px; font-size: 0.85rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px;';
            sidebarBtn.innerHTML = `<i data-lucide="mic" style="width:16px;"></i> Voice Command`;
            sidebarBtn.addEventListener('click', toggleListening);
            controls.appendChild(sidebarBtn);
        }

        if (window.lucide) window.lucide.createIcons();
    }

    function toggleListening() {
        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
                updateUI(true);
            } catch (e) {
                console.error("Speech recognition error:", e);
            }
        }
    }

    function updateUI(listening) {
        isListening = listening;
        const micBtn = document.getElementById('voice-search-btn');
        const pulse = document.getElementById('voice-pulse');
        
        if (listening) {
            micBtn.classList.add('active');
            pulse.style.display = 'block';
            if (typeof showToast === 'function') showToast("Listening for destination...", "info");
        } else {
            micBtn.classList.remove('active');
            pulse.style.display = 'none';
        }
    }

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Recognized:", transcript);
        handleVoiceCommand(transcript);
    };

    recognition.onend = () => {
        updateUI(false);
    };

    recognition.onerror = (event) => {
        console.error("Speech error", event.error);
        updateUI(false);
        if (typeof showToast === 'function') showToast("Could not understand. Try again.", "error");
    };

    function handleVoiceCommand(cmd) {
        if (typeof allRooms !== 'function') return;
        
        const rooms = allRooms();
        let match = null;

        // Command parsing (e.g., "Take me to room 101", "Navigate to library")
        // Remove common filler words
        const cleanCmd = cmd.replace(/take me to|navigate to|go to|show me|where is|the/g, '').trim();

        // Try exact name match first
        match = rooms.find(r => r.name.toLowerCase() === cleanCmd);
        
        // Try fuzzy match
        if (!match) {
            match = rooms.find(r => 
                cleanCmd.includes(r.id.toLowerCase()) || 
                cleanCmd.includes(r.name.toLowerCase()) ||
                r.name.toLowerCase().includes(cleanCmd)
            );
        }

        if (match) {
            if (typeof selectRoom === 'function') {
                selectRoom(match);
                if (typeof showToast === 'function') showToast(`Setting destination: ${match.name}`);
                if (typeof announce === 'function') announce(`Navigating to ${match.name}`);
            }
        } else {
            if (typeof showToast === 'function') showToast(`Could not find "${cleanCmd}"`, "error");
            if (typeof announce === 'function') announce("Sorry, I couldn't find that location.");
        }
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectVoiceAssistant);
    } else {
        injectVoiceAssistant();
    }
})();
