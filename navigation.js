// =============================================
// CAMPUS DATA — Rooms per floor with positions
// =============================================
const FLOORS = {
    0: {
        name: 'Ground Floor',
        rooms: [
            // { id, name, type, x, y, w, h, description }
            { id: 'entrance', name: 'Main Entrance', type: 'common', x: 280, y: 20,  w: 160, h: 45,  description: 'College main entrance gate' },
            { id: '101',      name: 'Room 101',      type: 'class',  x: 30,  y: 110, w: 110, h: 70,  description: 'Ground floor classroom' },
            { id: '102',      name: 'Room 102',      type: 'class',  x: 160, y: 110, w: 110, h: 70,  description: 'Ground floor classroom' },
            { id: '103',      name: 'Room 103',      type: 'class',  x: 290, y: 110, w: 110, h: 70,  description: 'Ground floor classroom' },
            { id: '104',      name: 'Room 104',      type: 'class',  x: 420, y: 110, w: 110, h: 70,  description: 'Ground floor classroom' },
            { id: 'library',  name: 'Library',       type: 'common', x: 570, y: 110, w: 130, h: 150, description: 'College library and reading room' },
            { id: 'admin',    name: 'Admin Office',  type: 'office', x: 30,  y: 230, w: 160, h: 80,  description: 'Administrative office' },
            { id: 'staffroom',name: 'Staff Room',    type: 'office', x: 210, y: 230, w: 130, h: 80,  description: 'Faculty and staff room' },
            { id: 'canteen',  name: 'Canteen',       type: 'common', x: 360, y: 230, w: 170, h: 80,  description: 'College canteen / cafeteria' },
            { id: 'toilet-g', name: 'Restrooms',     type: 'common', x: 30,  y: 360, w: 100, h: 60,  description: 'Ground floor restrooms' },
            { id: 'store',    name: 'Store Room',    type: 'office', x: 150, y: 360, w: 100, h: 60,  description: 'Storage and maintenance' },
            { id: 'parking',  name: 'Parking',       type: 'common', x: 420, y: 360, w: 220, h: 80,  description: 'Vehicle parking area' },
        ],
        corridors: [
            { x: 30, y: 185, w: 680, h: 40 }, // Corridor A (horizontal)
            { x: 30, y: 320, w: 680, h: 35 }, // Corridor B (horizontal)
            { x: 350, y: 20,  w: 40, h: 470 }, // Central corridor (vertical)
        ],
        entryPoint: { x: 360, y: 55 }, // "You are here" on ground floor
    },
    1: {
        name: 'First Floor',
        rooms: [
            { id: '201', name: 'Room 201', type: 'class',  x: 30,  y: 80,  w: 110, h: 70, description: 'First floor classroom' },
            { id: '202', name: 'Room 202', type: 'class',  x: 160, y: 80,  w: 110, h: 70, description: 'First floor classroom' },
            { id: '203', name: 'Room 203', type: 'class',  x: 290, y: 80,  w: 110, h: 70, description: 'First floor classroom' },
            { id: '204', name: 'Room 204', type: 'class',  x: 420, y: 80,  w: 110, h: 70, description: 'First floor classroom' },
            { id: 'lab1',name: 'Lab 1',   type: 'lab',    x: 30,  y: 220, w: 160, h: 90, description: 'Computer Science lab' },
            { id: 'lab2',name: 'Lab 2',   type: 'lab',    x: 210, y: 220, w: 160, h: 90, description: 'Physics / Chemistry lab' },
            { id: 'lab3',name: 'Lab 3',   type: 'lab',    x: 390, y: 220, w: 160, h: 90, description: 'Electronics lab' },
            { id: 'seminar', name: 'Seminar Hall', type: 'common', x: 570, y: 80,  w: 130, h: 230, description: 'Seminar / presentation hall' },
            { id: '205', name: 'Room 205', type: 'class',  x: 30,  y: 360, w: 110, h: 70, description: 'First floor classroom' },
            { id: '206', name: 'Room 206', type: 'class',  x: 160, y: 360, w: 110, h: 70, description: 'First floor classroom' },
            { id: 'hod',     name: 'HoD Office',   type: 'office', x: 290, y: 360, w: 140, h: 70, description: 'Head of Department office' },
        ],
        corridors: [
            { x: 30, y: 155, w: 680, h: 60 },
            { x: 30, y: 330, w: 560, h: 25 },
        ],
        entryPoint: { x: 360, y: 157 },
    },
    2: {
        name: 'Second Floor',
        rooms: [
            { id: '301', name: 'Room 301', type: 'class',  x: 30,  y: 80,  w: 110, h: 70, description: 'Second floor classroom' },
            { id: '302', name: 'Room 302', type: 'class',  x: 160, y: 80,  w: 110, h: 70, description: 'Second floor classroom' },
            { id: '303', name: 'Room 303', type: 'class',  x: 290, y: 80,  w: 110, h: 70, description: 'Second floor classroom' },
            { id: 'proj-lab', name: 'Project Lab', type: 'lab', x: 420, y: 80, w: 140, h: 70, description: 'Final year project lab' },
            { id: 'auditorium', name: 'Auditorium', type: 'common', x: 30,  y: 210, w: 380, h: 150, description: 'Main college auditorium' },
            { id: 'server',    name: 'Server Room', type: 'office', x: 430, y: 210, w: 120, h: 70, description: 'IT server room' },
            { id: 'principal', name: "Principal's Office", type: 'office', x: 570, y: 80, w: 130, h: 130, description: "Principal's office" },
            { id: 'terrace',   name: 'Terrace Access', type: 'common', x: 430, y: 300, w: 270, h: 60, description: 'Access to open terrace' },
        ],
        corridors: [
            { x: 30, y: 155, w: 680, h: 50 },
        ],
        entryPoint: { x: 360, y: 157 },
    },
};

// Room type colors
const TYPE_COLORS = {
    class:  { fill: 'rgba(99,102,241,0.15)',  stroke: '#6366f1', text: '#1e1b4b' },
    lab:    { fill: 'rgba(8,145,178,0.15)',   stroke: '#0891b2', text: '#164e63' },
    common: { fill: 'rgba(5,150,105,0.15)',   stroke: '#059669', text: '#064e3b' },
    office: { fill: 'rgba(217,119,6,0.15)',   stroke: '#d97706', text: '#78350f' },
};

// =============================================
// STATE
// =============================================
let currentFloor = 0;
let selectedSource = { id: 'entrance', name: 'Main Entrance', x: 280, y: 20 }; // Default source
let selectedRoom = null; // Destination
let animFrame = null;
let arrowOffset = 0; 

// =============================================
// CANVAS SETUP
// =============================================
const canvas  = document.getElementById('map-canvas');
const ctx     = canvas.getContext('2d');
const mapArea = document.getElementById('map-area');

const resizeCanvas = () => {
    canvas.width  = mapArea.clientWidth;
    canvas.height = mapArea.clientHeight;
    drawMap();
};
window.addEventListener('resize', resizeCanvas);

// =============================================
// DRAW
// =============================================
const drawMap = () => {
    const W = canvas.width;
    const H = canvas.height;
    const floor = FLOORS[currentFloor];

    // Scale based on canvas size
    const SCALE_X = (W - 60) / 720;
    const SCALE_Y = (H - 60) / 460;
    const SCALE   = Math.min(SCALE_X, SCALE_Y);
    const OX = (W - 720 * SCALE) / 2;
    const OY = 30;

    ctx.clearRect(0, 0, W, H);

    // Grid background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    const sc = (room) => ({
        x: OX + room.x * SCALE,
        y: OY + room.y * SCALE,
        w: room.w * SCALE,
        h: room.h * SCALE,
    });

    // Draw corridors
    floor.corridors.forEach(c => {
        const { x, y, w, h } = sc(c);
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, w, h, 4);
        ctx.fill();
        ctx.stroke();
    });

    // Draw rooms
    floor.rooms.forEach(room => {
        const { x, y, w, h } = sc(room);
        const colors = TYPE_COLORS[room.type];
        const isDest = selectedRoom && selectedRoom.id === room.id;
        const isSource = selectedSource && selectedSource.id === room.id;

        ctx.save();
        if (isDest || isSource) {
            ctx.shadowColor = isDest ? '#f59e0b' : '#6366f1';
            ctx.shadowBlur = 20;
        }

        ctx.fillStyle = isDest ? 'rgba(245,158,11,0.35)' : (isSource ? 'rgba(99,102,241,0.35)' : colors.fill);
        ctx.strokeStyle = isDest ? '#f59e0b' : (isSource ? '#6366f1' : colors.stroke);
        ctx.lineWidth = (isDest || isSource) ? 2.5 : 1.5;
        roundRect(ctx, x, y, w, h, 8 * SCALE);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Room label
        ctx.fillStyle = (isDest || isSource) ? 'white' : colors.text;
        ctx.font = `bold ${Math.max(8, 11 * SCALE)}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = wrapText(room.name, w * 0.9, ctx);
        lines.forEach((line, i) => {
            const lineH = Math.max(10, 13 * SCALE);
            ctx.fillText(line, x + w/2, y + h/2 + (i - (lines.length-1)/2) * lineH);
        });
    });

    // Draw Path
    if (selectedSource && selectedRoom) {
        // Start point
        const sx = OX + selectedSource.x * SCALE + (selectedSource.w ? selectedSource.w * SCALE / 2 : 0);
        const sy = OY + selectedSource.y * SCALE + (selectedSource.h ? selectedSource.h * SCALE / 2 : 0);
        
        // End point
        const destRoom = floor.rooms.find(r => r.id === selectedRoom.id);
        if (destRoom) {
            const { x, y, w, h } = sc(destRoom);
            const dx = x + w/2;
            const dy = y + h/2;
            
            drawPath(sx, sy, dx, dy, floor, SCALE, OX, OY);
            drawYouAreHere(sx, sy); // Pulse at source
            drawDestinationPin(dx, dy - 15);
        }
    } else if (selectedSource) {
        const sx = OX + selectedSource.x * SCALE + (selectedSource.w ? selectedSource.w * SCALE / 2 : 0);
        const sy = OY + selectedSource.y * SCALE + (selectedSource.h ? selectedSource.h * SCALE / 2 : 0);
        drawYouAreHere(sx, sy);
    }
};

// Helper: Rounded rect path
const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
};

// Helper: Wrap long text
const wrapText = (text, maxW, ctx) => {
    const words = text.split(' ');
    const lines = [];
    let curr = '';
    words.forEach(w => {
        const test = curr ? `${curr} ${w}` : w;
        if (ctx.measureText(test).width > maxW && curr) {
            lines.push(curr);
            curr = w;
        } else { curr = test; }
    });
    if (curr) lines.push(curr);
    return lines;
};

// Draw "You Are Here" marker
const drawYouAreHere = (x, y) => {
    // Outer pulse ring
    const t = arrowOffset * 0.05;
    const pulseR = 14 + Math.sin(t) * 5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, pulseR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(99,102,241,${0.4 - Math.sin(t) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 0;
    ctx.fill();

    // Label
    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('You Are Here', x, y - 12);
    ctx.restore();
};

// Draw destination pin
const drawDestinationPin = (x, y) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x, y);
    ctx.restore();
};

// Draw animated dashed arrow path
const drawPath = (sx, sy, dx, dy, floor, scale, ox, oy) => {
    const mid1x = sx;
    const mid1y = dy;

    ctx.save();
    ctx.setLineDash([12, 8]);
    ctx.lineDashOffset = -arrowOffset;
    ctx.strokeStyle = 'rgba(245,158,11,0.85)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(mid1x, mid1y);
    ctx.lineTo(dx, dy);
    ctx.stroke();
    ctx.restore();

    // Arrowhead at destination
    drawArrowHead(dx, dy, mid1x, mid1y);
};

const drawArrowHead = (tipX, tipY, fromX, fromY) => {
    const angle = Math.atan2(tipY - fromY, tipX - fromX);
    const size  = 14;
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - size * Math.cos(angle - Math.PI/6), tipY - size * Math.sin(angle - Math.PI/6));
    ctx.lineTo(tipX - size * Math.cos(angle + Math.PI/6), tipY - size * Math.sin(angle + Math.PI/6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};

// =============================================
// ANIMATION LOOP
// =============================================
const animate = () => {
    arrowOffset += 0.8;
    drawMap();
    animFrame = requestAnimationFrame(animate);
};

// =============================================
// UI — Floor Buttons
// =============================================
const floorBtns = document.querySelectorAll('.floor-btn');
const floorIndicator = document.getElementById('floor-indicator');

floorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFloor = parseInt(btn.getAttribute('data-floor'));
        floorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        floorIndicator.innerText = FLOORS[currentFloor].name;
        selectedRoom = null;
        document.getElementById('destination-card').classList.remove('visible');
        document.getElementById('rooms-quick-list').querySelectorAll('.room-quick-item').forEach(i => i.classList.remove('selected'));
        populateRoomsList();
    });
});

// =============================================
// UI — Room Quick List
// =============================================
const populateRoomsList = () => {
    const list = document.getElementById('rooms-quick-list');
    list.innerHTML = '';
    FLOORS[currentFloor].rooms.forEach(room => {
        const item = document.createElement('div');
        item.className = 'room-quick-item';
        item.dataset.id = room.id;
        item.innerHTML = `
            <span>${room.name}</span>
            <span class="room-type-badge">${capitalize(room.type)}</span>
        `;
        item.addEventListener('click', () => selectRoom(room));
        list.appendChild(item);
    });
};

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// =============================================
// SELECT ROOM
// =============================================
const selectRoom = (room, isSource = false) => {
    if (isSource) {
        selectedSource = room;
        sourceInput.value = room.name;
    } else {
        selectedRoom = room;
        destInput.value = room.name;

        // Highlight in list
        document.querySelectorAll('.room-quick-item').forEach(i => {
            i.classList.toggle('selected', i.dataset.id === room.id);
        });

        // Destination card
        updateDestinationCard(room);
        showToast(`Navigating to ${room.name}`);
    }

    // Switch floor if needed
    if (room.floor !== undefined && room.floor !== currentFloor) {
        currentFloor = room.floor;
        updateFloorButtons();
    }

    drawMap();
};

const updateFloorButtons = () => {
    document.querySelectorAll('.floor-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.floor) === currentFloor);
    });
    document.getElementById('floor-indicator').innerText = FLOORS[currentFloor].name;
    populateRoomsList();
};

let isVoiceEnabled = true;
const voiceToggleBtn = document.getElementById('voice-toggle-btn');
const voiceIcon      = document.getElementById('voice-icon');

voiceToggleBtn.addEventListener('click', () => {
    isVoiceEnabled = !isVoiceEnabled;
    voiceToggleBtn.innerHTML = isVoiceEnabled 
        ? `<i data-lucide="volume-2" style="width:16px;"></i> Voice Guidance: ON`
        : `<i data-lucide="volume-x" style="width:16px;"></i> Voice Guidance: OFF`;
    lucide.createIcons();
    showToast(`Voice Guidance turned ${isVoiceEnabled ? 'ON' : 'OFF'}`, 'info');
});

const announce = (text) => {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
};

const updateDestinationCard = (room) => {
    const card = document.getElementById('destination-card');
    card.classList.add('visible');
    document.getElementById('dest-name').innerText = room.name;
    document.getElementById('dest-meta').innerText = `From: ${selectedSource.name} • ${FLOORS[currentFloor].name}`;
    
    const steps = [
        `Starting point: ${selectedSource.name}`,
        `Head towards the central corridor`,
        `Your destination ${room.name} is ahead`
    ];

    document.getElementById('steps-list').innerHTML = steps.map(s => `
        <div class="step-item"><span class="step-dot"></span> ${s}</div>
    `).join('');

    // Voice Announcement
    announce(`Navigating from ${selectedSource.name} to ${room.name}. ${steps[1]}. ${steps[2]}.`);
};

// =============================================
// SEARCH
// =============================================
const sourceInput = document.getElementById('source-search');
const destInput   = document.getElementById('dest-search');
const sourceResults = document.getElementById('source-results');
const destResults   = document.getElementById('dest-results');

const allRooms = () => {
    const rooms = [];
    Object.keys(FLOORS).forEach(fl => {
        FLOORS[fl].rooms.forEach(r => rooms.push({ ...r, floor: parseInt(fl) }));
    });
    return rooms;
};

const setupSearch = (input, results, isSource) => {
    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        if (!query) { results.classList.remove('open'); return; }

        const matches = allRooms().filter(r =>
            r.name.toLowerCase().includes(query) || r.id.toLowerCase().includes(query)
        );

        results.innerHTML = '';
        if (matches.length === 0) {
            results.innerHTML = `<div class="search-result-item" style="color:var(--text-dim);">No rooms found</div>`;
        } else {
            matches.forEach(room => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <span style="font-size:1rem;">${room.type === 'lab' ? '🔬' : room.type === 'common' ? '🏛' : '📚'}</span>
                    <div>
                        <div style="font-weight:600;">${room.name}</div>
                        <div style="font-size:0.75rem;color:var(--text-dim);">${FLOORS[room.floor].name}</div>
                    </div>
                `;
                item.addEventListener('click', () => {
                    results.classList.remove('open');
                    selectRoom(room, isSource);
                });
                results.appendChild(item);
            });
        }
        results.classList.add('open');
    });
};

setupSearch(sourceInput, sourceResults, true);
setupSearch(destInput, destResults, false);

document.addEventListener('click', (e) => {
    if (!sourceInput.contains(e.target) && !sourceResults.contains(e.target)) sourceResults.classList.remove('open');
    if (!destInput.contains(e.target) && !destResults.contains(e.target)) destResults.classList.remove('open');
});

// =============================================
// CLEAR ROUTE
// =============================================
document.getElementById('clear-route-btn').addEventListener('click', () => {
    selectedRoom = null;
    selectedSource = { id: 'entrance', name: 'Main Entrance', x: 280, y: 20 };
    sourceInput.value = '';
    destInput.value = '';
    document.getElementById('destination-card').classList.remove('visible');
    document.querySelectorAll('.room-quick-item').forEach(i => i.classList.remove('selected'));
    drawMap();
});

// =============================================
// CANVAS CLICK — select room by clicking
// =============================================
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = canvas.width;
    const H = canvas.height;
    const SCALE = Math.min((W - 60) / 720, (H - 60) / 460);
    const OX = (W - 720 * SCALE) / 2;
    const OY = 30;

    const floor = FLOORS[currentFloor];
    for (const room of floor.rooms) {
        const x = OX + room.x * SCALE;
        const y = OY + room.y * SCALE;
        const w = room.w * SCALE;
        const h = room.h * SCALE;
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
            selectRoom(room);
            return;
        }
    }
});

// =============================================
// CHATBOT INTEGRATION — URL param: ?room=101
// =============================================
const urlParams = new URLSearchParams(window.location.search);
const chatbotRoom = urlParams.get('room');
const chatbotCmd  = urlParams.get('cmd');

if (chatbotRoom || chatbotCmd) {
    const banner = document.getElementById('chatbot-banner');
    const bannerText = document.getElementById('chatbot-banner-text');
    const queryId = chatbotRoom || chatbotCmd;
    const match = allRooms().find(r =>
        r.id.toLowerCase() === queryId.toLowerCase() ||
        r.name.toLowerCase().includes(queryId.toLowerCase())
    );
    if (match) {
        bannerText.innerText = `Chatbot: Navigating to ${match.name}`;
        banner.classList.add('visible');
        currentFloor = match.floor;
        floorBtns.forEach(b => {
            b.classList.toggle('active', parseInt(b.getAttribute('data-floor')) === currentFloor);
        });
        floorIndicator.innerText = FLOORS[currentFloor].name;
        setTimeout(() => {
            populateRoomsList();
            selectRoom(match);
            setTimeout(() => banner.classList.remove('visible'), 5000);
        }, 300);
    }
}

// =============================================
// GPS MAPPING & CURRENT LOCATION
// =============================================
let isTracking = false;
let watchId = null;

const trackBtn = document.getElementById('track-location-btn');
const gpsStatus = document.getElementById('gps-status');

// Reference coordinates (Example: College Main Gate)
const CAMPUS_REF = {
    lat: 12.9716, // Change these to your actual college coordinates
    lng: 77.5946,
    scale: 100000 // Zoom factor for mapping degrees to pixels
};

trackBtn.addEventListener('click', () => {
    if (!isTracking) {
        startTracking();
    } else {
        stopTracking();
    }
});

const startTracking = () => {
    if (!navigator.geolocation) {
        showToast("Geolocation not supported by this browser.", "error");
        return;
    }

    isTracking = true;
    trackBtn.classList.add('active');
    trackBtn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;"></i> Finding...`;
    lucide.createIcons();
    gpsStatus.innerText = "GPS: Requesting Permission...";
    gpsStatus.style.color = "var(--primary)";

    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            
            // Map GPS to Canvas coordinates
            // We calculate offset from reference point and scale to 720x460 grid
            const dx = (longitude - CAMPUS_REF.lng) * CAMPUS_REF.scale;
            const dy = (CAMPUS_REF.lat - latitude) * CAMPUS_REF.scale;

            // Constrain within campus bounds (simulation)
            // If outside campus, we'll "snap" to nearest entry point for the demo
            let canvasX = 360 + dx;
            let canvasY = 230 + dy;

            // Snapping to stay within visible area for the demo
            canvasX = Math.max(50, Math.min(670, canvasX));
            canvasY = Math.max(50, Math.min(410, canvasY));

            // Update state
            FLOORS[currentFloor].entryPoint = { x: canvasX, y: canvasY };
            
            gpsStatus.innerHTML = `GPS: Active (Acc: ${Math.round(accuracy)}m)<br>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            trackBtn.innerHTML = `<i data-lucide="map-pin-off" style="width:16px;"></i> Stop Tracking`;
            lucide.createIcons();
            
            if (accuracy > 100) {
                showToast("Low GPS accuracy. Signal might be weak.", "info");
            }
        },
        (err) => {
            let msg = "GPS Error";
            if (err.code === 1) msg = "Location permission denied.";
            else if (err.code === 2) msg = "Position unavailable.";
            else if (err.code === 3) msg = "GPS Timeout.";
            
            showToast(msg, "error");
            stopTracking();
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
};

const stopTracking = () => {
    isTracking = false;
    if (watchId) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    
    trackBtn.classList.remove('active');
    trackBtn.innerHTML = `<i data-lucide="map-pin" style="width:16px;"></i> Locate Me`;
    lucide.createIcons();
    
    gpsStatus.innerText = "GPS: Inactive";
    gpsStatus.style.color = "var(--text-dim)";
    
    // Reset to default entry point
    if (currentFloor === 0) FLOORS[0].entryPoint = { x: 360, y: 55 };
    else if (currentFloor === 1) FLOORS[1].entryPoint = { x: 360, y: 157 };
    else if (currentFloor === 2) FLOORS[2].entryPoint = { x: 360, y: 157 };
    
    showToast("GPS Tracking Stopped", "info");
};

// =============================================
// USE GPS AS SOURCE
// =============================================
document.getElementById('use-gps-source-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        showToast("Geolocation not supported by this browser.", "error");
        return;
    }

    showToast("Detecting your location...", "info");
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            
            // Map GPS to Canvas
            const dx = (longitude - CAMPUS_REF.lng) * CAMPUS_REF.scale;
            const dy = (CAMPUS_REF.lat - latitude) * CAMPUS_REF.scale;

            let canvasX = 360 + dx;
            let canvasY = 230 + dy;

            // Stay within bounds
            canvasX = Math.max(30, Math.min(690, canvasX));
            canvasY = Math.max(30, Math.min(430, canvasY));

            selectedSource = {
                id: 'gps-source',
                name: 'My Current Location',
                x: canvasX,
                y: canvasY,
                floor: currentFloor
            };

            sourceInput.value = "My Current Location";
            drawMap();
            showToast("Source set to your location!");
            announce("Starting point set to your current location.");
        },
        (err) => showToast("Location access denied or unavailable.", "error"),
        { enableHighAccuracy: true }
    );
});

// =============================================
// TOAST
// =============================================
const toastEl = document.getElementById('toast');
const showToast = (msg, type = 'success') => {
    toastEl.innerText = msg;
    toastEl.className = `toast show ${type}`;
    setTimeout(() => toastEl.classList.remove('show'), 2500);
};

// =============================================
// INIT
// =============================================
populateRoomsList();
resizeCanvas();
animate();

