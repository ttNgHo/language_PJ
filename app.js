/* ==========================================
   🌈 FunWords - Main Application
   Navigation, effects, initialization
   ========================================== */

// ===== Page Navigation =====
function showPage(pageId) {
    // Stop any running game timers
    stopTimer();

    // Stop background music if leaving gameplay
    if (pageId !== 'gameplay' && window.soundEngine && typeof window.soundEngine.stopBgm === 'function') {
        window.soundEngine.stopBgm();
        if (typeof updateBgmUI === 'function') updateBgmUI(false);
    }

    // Close any open modals
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show target page
    const page = document.getElementById(`page-${pageId}`);
    if (page) {
        page.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });

    // Close mobile menu
    document.querySelector('.nav-links')?.classList.remove('show');

    // Page-specific init
    if (pageId === 'curriculum') renderCurriculumPage();
    if (pageId === 'admin') renderAdminPage();
    if (pageId === 'games') populateGamesList();
    if (pageId === 'achievements') populateAchievements();
}

function toggleMobileMenu() {
    document.querySelector('.nav-links')?.classList.toggle('show');
}

// ===== Games List Page =====
function populateGamesList() {
    const grid = document.getElementById('gamesListGrid');
    if (!grid) return;

    grid.innerHTML = GAMES_LIST.map(game => `
        <div class="game-card" onclick="startGame('${game.id}')" 
             style="--card-color: ${game.color}; --card-gradient: ${game.gradient};"
             data-difficulty="${game.difficulty}">
            <div class="game-card-bg"></div>
            <div class="game-card-content">
                <div class="game-card-icon">${game.icon}</div>
                <h3 class="game-card-title">${game.title}</h3>
                <p class="game-card-desc">${game.desc}</p>
                <div class="game-card-meta">
                    <span class="game-difficulty ${game.difficulty}">
                        ${game.difficulty === 'easy' ? '🟢 Dễ' : game.difficulty === 'medium' ? '🟡 Trung bình' : '🔴 Khó'}
                    </span>
                    <span class="game-players">👥 ${game.players} đã chơi</span>
                </div>
            </div>
            <div class="game-card-stars">⭐⭐⭐</div>
        </div>
    `).join('');

    // Animate cards in
    grid.querySelectorAll('.game-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, i * 100);
    });
}

function filterGames(difficulty) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(
            difficulty === 'all' ? 'tất cả' : difficulty === 'easy' ? 'dễ' : difficulty === 'medium' ? 'trung bình' : 'khó'
        ));
    });

    const cards = document.querySelectorAll('#gamesListGrid .game-card');
    cards.forEach(card => {
        if (difficulty === 'all' || card.dataset.difficulty === difficulty) {
            card.style.display = '';
            card.style.animation = 'bounceIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===== Category Selection =====
function selectCategory(category) {
    gameState.category = category;
    showToast(`📚 Đã chọn chủ đề: ${getCategoryName(category)}`, 'info');
    showPage('games');
}

function getCategoryName(cat) {
    const names = {
        animals: '🐾 Động vật', fruits: '🍎 Trái cây', colors: '🎨 Màu sắc',
        family: '👨‍👩‍👧‍👦 Gia đình', food: '🍕 Đồ ăn', school: '🏫 Trường học',
        body: '🧍 Cơ thể', weather: '🌤️ Thời tiết', transport: '🚗 Phương tiện',
        nature: '🌿 Thiên nhiên'
    };
    return names[cat] || cat;
}

// ===== Global User Stats (Được đồng bộ vĩnh viễn từ MySQL) =====
window.USER_STATS = {
    total_stars: 0,
    games_played: 0,
    words_learned: 0,
    streak: 1,
    name: 'Bé Yêu',
    age: 7,
    avatar: '🦊'
};

function applyUserStats(stats) {
    if (!stats) return;
    window.USER_STATS = { ...window.USER_STATS, ...stats };

    const stars = stats.total_stars ?? stats.totalStars ?? 0;
    const games = stats.games_played ?? stats.gamesPlayed ?? 0;
    const words = stats.words_learned ?? stats.wordsLearned ?? 0;
    const streak = Math.max(1, stats.streak ?? 1);
    const name = stats.name || 'Bé Yêu';
    const age = stats.age || 7;
    const avatar = stats.avatar || '🦊';

    // Cập nhật DOM
    const totalStarsEl = document.getElementById('totalStars');
    if (totalStarsEl) totalStarsEl.textContent = stars;

    const achStars = document.getElementById('achStars');
    if (achStars) achStars.textContent = stars;

    const achGames = document.getElementById('achGames');
    if (achGames) achGames.textContent = games;

    const achWords = document.getElementById('achWords');
    if (achWords) achWords.textContent = words;

    const achStreak = document.getElementById('achStreak');
    if (achStreak) achStreak.textContent = streak;

    const nameInput = document.getElementById('profileName');
    if (nameInput) nameInput.value = name;

    const ageInput = document.getElementById('profileAge');
    if (ageInput) ageInput.value = age;

    const avatarEl = document.querySelector('.avatar-emoji');
    if (avatarEl) avatarEl.textContent = avatar;

    // Lưu vào localStorage làm bản cache offline
    localStorage.setItem('totalStars', stars);
    localStorage.setItem('gamesPlayed', games);
    localStorage.setItem('wordsLearned', words);
    localStorage.setItem('userStreak', streak);
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileAge', age);
    localStorage.setItem('avatar', avatar);
}
window.applyUserStats = applyUserStats;

// ===== Achievements Page =====
function populateAchievements() {
    const stats = window.USER_STATS || {};
    const totalStars = parseInt(stats.total_stars ?? localStorage.getItem('totalStars') ?? '0');
    const gamesPlayed = parseInt(stats.games_played ?? localStorage.getItem('gamesPlayed') ?? '0');
    const wordsLearned = parseInt(stats.words_learned ?? localStorage.getItem('wordsLearned') ?? '0');
    const streak = Math.max(1, parseInt(stats.streak ?? localStorage.getItem('userStreak') ?? '1'));
    
    document.getElementById('achStars').textContent = totalStars;
    document.getElementById('achGames').textContent = gamesPlayed;
    document.getElementById('achWords').textContent = wordsLearned;
    document.getElementById('achStreak').textContent = streak;

    // Dynamically calculate badge unlocked status based on actual user progress
    const badges = [
        { emoji: '🌟', name: 'Ngôi Sao Mới', desc: 'Chơi ván game đầu tiên', unlocked: gamesPlayed >= 1 },
        { emoji: '📚', name: 'Mọt Sách', desc: 'Học 20 từ vựng', unlocked: wordsLearned >= 20 },
        { emoji: '🎯', name: 'Bách Phát', desc: 'Đạt từ 50 sao trở lên', unlocked: totalStars >= 50 },
        { emoji: '⚡', name: 'Tia Chớp', desc: 'Chơi 3 ván game', unlocked: gamesPlayed >= 3 },
        { emoji: '🔥', name: 'Siêu Nhiệt', desc: 'Chơi chăm chỉ 5 ván', unlocked: gamesPlayed >= 5 },
        { emoji: '👑', name: 'Vua Từ Vựng', desc: 'Học 50 từ vựng', unlocked: wordsLearned >= 50 },
        { emoji: '🏆', name: 'Nhà Vô Địch', desc: 'Đạt 300 sao', unlocked: totalStars >= 300 },
        { emoji: '🦄', name: 'Kỳ Lân', desc: 'Đạt 500 sao', unlocked: totalStars >= 500 },
        { emoji: '🎨', name: 'Nghệ Sĩ', desc: 'Tích luỹ 80 sao', unlocked: totalStars >= 80 },
        { emoji: '🐾', name: 'Bạn Thú Cưng', desc: 'Học 15 từ vựng', unlocked: wordsLearned >= 15 },
        { emoji: '💎', name: 'Kim Cương', desc: 'Đạt 1000 sao', unlocked: totalStars >= 1000 },
        { emoji: '🌈', name: 'Cầu Vồng', desc: 'Chơi xuất sắc 10 ván game', unlocked: gamesPlayed >= 10 },
    ];

    // Populate badges
    const badgesGrid = document.getElementById('badgesGrid');
    if (badgesGrid) {
        badgesGrid.innerHTML = badges.map(badge => `
            <div class="badge-card ${badge.unlocked ? '' : 'locked'}">
                <span class="badge-emoji">${badge.emoji}</span>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
            </div>
        `).join('');
    }

    // Populate calendar
    populateCalendar();
}

function populateCalendar() {
    const calendarEl = document.getElementById('learningCalendar');
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    // Simulated active days
    const activeDays = [1, 2, 3, 5, 6, 7, 10, 11, 14, 15, 16, 19, 20, 21, 22, today.getDate()];

    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    let html = '<div class="calendar-grid">';
    dayHeaders.forEach(d => {
        html += `<div class="calendar-day-header">${d}</div>`;
    });

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isActive = activeDays.includes(day);
        const isToday = day === today.getDate();
        html += `<div class="calendar-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}">${day}</div>`;
    }

    html += '</div>';
    calendarEl.innerHTML = html;
}

// ===== Profile Functions (Lưu đồng thời vào MySQL Database & LocalStorage) =====
async function selectAvatar(emoji) {
    document.querySelector('.avatar-emoji').textContent = emoji;
    localStorage.setItem('avatar', emoji);
    if (window.USER_STATS) window.USER_STATS.avatar = emoji;
    showToast('🎨 Đã đổi avatar!', 'success');

    try {
        const apiBase = window.location.origin.startsWith('http') ? '' : 'http://localhost:3000';
        await fetch(`${apiBase}/api/user-stats/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: emoji })
        });
    } catch (e) {
        console.warn('Lỗi đồng bộ avatar lên MySQL:', e);
    }
}

async function saveProfile() {
    const name = document.getElementById('profileName').value;
    const age = document.getElementById('profileAge').value;
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileAge', age);
    if (window.USER_STATS) {
        window.USER_STATS.name = name;
        window.USER_STATS.age = parseInt(age) || 7;
    }
    showToast('💾 Đã lưu hồ sơ vào cơ sở dữ liệu!', 'success');

    try {
        const apiBase = window.location.origin.startsWith('http') ? '' : 'http://localhost:3000';
        const res = await fetch(`${apiBase}/api/user-stats/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, age })
        });
        if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
                applyUserStats(json.data);
            }
        }
    } catch (e) {
        console.warn('Lỗi lưu profile lên MySQL:', e);
    }
}

// ===== Game BGM Tracks Definition (Web Audio API Procedural Music) =====
const BGM_TRACKS = {
    // 1. Word Match: Sunny tropical calypso marimba (128 BPM)
    wordmatch: {
        bpm: 128,
        leadType: 'triangle',
        bassType: 'sine',
        leadVol: 0.12,
        bassVol: 0.16,
        patternLen: 32,
        lead: [
            [0, 523.25, 0.16], [2, 659.25, 0.16], [4, 783.99, 0.22], [6, 880.00, 0.16],
            [8, 783.99, 0.20], [10, 659.25, 0.16], [12, 523.25, 0.22], [14, 587.33, 0.16],
            [16, 659.25, 0.16], [18, 783.99, 0.16], [20, 1046.50, 0.26], [22, 880.00, 0.16],
            [24, 783.99, 0.20], [26, 659.25, 0.16], [28, 587.33, 0.20], [30, 523.25, 0.26]
        ],
        bass: [
            [0, 130.81, 0.24], [4, 196.00, 0.20], [8, 220.00, 0.24], [12, 174.61, 0.20],
            [16, 130.81, 0.24], [20, 196.00, 0.20], [24, 174.61, 0.20], [28, 196.00, 0.24]
        ],
        percSteps: [2, 6, 10, 14, 18, 22, 26, 30]
    },

    // 2. Spelling Bee: Whimsical music-box & gentle toy bells (106 BPM)
    spelling: {
        bpm: 106,
        leadType: 'sine',
        bassType: 'triangle',
        leadVol: 0.10,
        bassVol: 0.12,
        patternLen: 32,
        lead: [
            [0, 783.99, 0.18], [4, 987.77, 0.18], [8, 1174.66, 0.22], [12, 987.77, 0.16],
            [14, 1046.50, 0.16], [16, 880.00, 0.22], [20, 783.99, 0.20], [24, 587.33, 0.24],
            [26, 659.25, 0.16], [28, 783.99, 0.18], [30, 880.00, 0.22]
        ],
        bass: [
            [0, 196.00, 0.25], [8, 146.83, 0.25], [16, 130.81, 0.25], [24, 146.83, 0.25]
        ],
        percSteps: [0, 8, 16, 24]
    },

    // 3. Word Scramble: Funky puzzle detective groove (118 BPM)
    scramble: {
        bpm: 118,
        leadType: 'triangle',
        bassType: 'sawtooth',
        leadVol: 0.12,
        bassVol: 0.11,
        bassFilter: 380,
        patternLen: 32,
        lead: [
            [0, 293.66, 0.18], [3, 349.23, 0.18], [6, 392.00, 0.18], [8, 440.00, 0.24],
            [11, 523.25, 0.20], [14, 440.00, 0.18], [16, 392.00, 0.22], [19, 349.23, 0.18],
            [22, 293.66, 0.24], [26, 329.63, 0.18], [28, 293.66, 0.28]
        ],
        bass: [
            [0, 73.42, 0.18], [4, 146.83, 0.16], [8, 87.31, 0.18], [12, 98.00, 0.18],
            [16, 73.42, 0.18], [20, 130.81, 0.16], [24, 110.00, 0.18], [28, 130.81, 0.18]
        ],
        percSteps: [4, 12, 20, 28]
    },

    // 4. Flashcards: Cozy, soothing study chimes & peaceful harmony (94 BPM)
    flashcards: {
        bpm: 94,
        leadType: 'sine',
        bassType: 'sine',
        leadVol: 0.09,
        bassVol: 0.12,
        patternLen: 32,
        lead: [
            [0, 440.00, 0.28], [4, 554.37, 0.26], [8, 659.25, 0.28], [12, 880.00, 0.32],
            [16, 369.99, 0.28], [20, 440.00, 0.26], [24, 554.37, 0.28], [28, 739.99, 0.35]
        ],
        bass: [
            [0, 110.00, 0.45], [8, 164.81, 0.40], [16, 146.83, 0.45], [24, 164.81, 0.40]
        ],
        percSteps: []
    },

    // 5. Fill the Blank: Energetic TV Quiz Game Show Gala (126 BPM)
    fillblank: {
        bpm: 126,
        leadType: 'sawtooth',
        bassType: 'triangle',
        leadVol: 0.08,
        bassVol: 0.15,
        leadFilter: 850,
        patternLen: 32,
        lead: [
            [0, 659.25, 0.16], [2, 830.61, 0.16], [4, 987.77, 0.22], [7, 987.77, 0.16],
            [8, 1318.51, 0.28], [11, 1244.51, 0.20], [12, 987.77, 0.22], [14, 830.61, 0.18],
            [16, 880.00, 0.16], [18, 1108.73, 0.16], [20, 1318.51, 0.26], [22, 1318.51, 0.16],
            [24, 987.77, 0.20], [26, 830.61, 0.18], [28, 739.99, 0.20], [30, 659.25, 0.28]
        ],
        bass: [
            [0, 164.81, 0.20], [4, 207.65, 0.20], [8, 220.00, 0.20], [12, 246.94, 0.22],
            [16, 138.59, 0.20], [20, 220.00, 0.20], [24, 246.94, 0.22], [28, 164.81, 0.26]
        ],
        percSteps: [4, 12, 20, 28]
    },

    // 6. Word Catcher: Fast 8-bit Arcade Chiptune Runner (146 BPM)
    wordcatcher: {
        bpm: 146,
        leadType: 'square',
        bassType: 'square',
        leadVol: 0.07,
        bassVol: 0.09,
        bassFilter: 600,
        patternLen: 32,
        lead: [
            [0, 523.25, 0.12], [2, 392.00, 0.12], [4, 329.63, 0.12], [6, 392.00, 0.12],
            [8, 523.25, 0.14], [10, 659.25, 0.14], [12, 587.33, 0.16], [14, 493.88, 0.14],
            [16, 523.25, 0.12], [18, 392.00, 0.12], [20, 329.63, 0.12], [22, 392.00, 0.12],
            [24, 440.00, 0.14], [26, 493.88, 0.14], [28, 523.25, 0.16], [30, 587.33, 0.18]
        ],
        bass: [
            [0, 130.81, 0.10], [2, 65.41, 0.10], [4, 130.81, 0.10], [6, 65.41, 0.10],
            [8, 110.00, 0.10], [10, 55.00, 0.10], [12, 110.00, 0.10], [14, 55.00, 0.10],
            [16, 87.31, 0.10], [18, 43.65, 0.10], [20, 87.31, 0.10], [22, 43.65, 0.10],
            [24, 98.00, 0.10], [26, 49.00, 0.10], [28, 98.00, 0.10], [30, 49.00, 0.10]
        ],
        percSteps: [4, 12, 20, 28]
    }
};

// ===== Sound & Music Engine (Web Audio API - No External Files) =====
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
        this.currentBgmGame = null;
        this.bgmTimer = null;
        this.bgmMasterGain = null;
        this.bgmStep = 0;
        this.nextNoteTime = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play(type) {
        return this.playSfx(type);
    }

    playSfx(type) {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        if (type === 'correct') {
            // Bright cheerful bell triad: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.2, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.38);
            });
        } else if (type === 'wrong') {
            // Funny cartoon slide / trombone wah-wah
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.linearRampToValueAtTime(220, now + 0.15);
            osc.frequency.linearRampToValueAtTime(130, now + 0.38);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.42);
        } else if (type === 'boing') {
            // Funny cartoon spring boing
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, now);
            osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);
            osc.frequency.exponentialRampToValueAtTime(380, now + 0.3);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        } else if (type === 'pop') {
            // Snappy bubble pop
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === 'whoosh') {
            // Card flip whoosh
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.19);
        } else if (type === 'combo') {
            // High-energy powerup arpeggio
            [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.05);
                gain.gain.setValueAtTime(0.22, now + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.05);
                osc.stop(now + idx * 0.05 + 0.38);
            });
        } else if (type === 'win') {
            // Celebration fanfare: C5, E5, G5, C6
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                gain.gain.setValueAtTime(0.25, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.48);
            });
        } else if (type === 'click') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'squeak') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(900, now + 0.16);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.19);
        } else if (type === 'giggle') {
            [0, 0.06, 0.12].forEach((offset, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800 + idx * 90, now + offset);
                osc.frequency.exponentialRampToValueAtTime(1150 + idx * 90, now + offset + 0.04);
                gain.gain.setValueAtTime(0.18, now + offset);
                gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.048);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + offset);
                osc.stop(now + offset + 0.05);
            });
        } else if (type === 'splat') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.14);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.16);
        } else if (type === 'dizzy') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.linearRampToValueAtTime(850, now + 0.2);
            osc.frequency.linearRampToValueAtTime(320, now + 0.4);
            osc.frequency.linearRampToValueAtTime(650, now + 0.6);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.66);
        }
    }

    scheduleBgmStep(track) {
        if (!this.musicEnabled || !this.ctx || !this.bgmMasterGain) return;
        const now = this.ctx.currentTime;
        const stepDuration = (60 / track.bpm) / 4;

        while (this.nextNoteTime < now + 0.18) {
            const step = this.bgmStep % track.patternLen;
            const playTime = Math.max(now, this.nextNoteTime);

            // 1. Giai điệu chính (Lead)
            for (const item of track.lead) {
                if (item[0] === step) {
                    const freq = item[1];
                    const dur = item[2];
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = track.leadType || 'triangle';
                    osc.frequency.setValueAtTime(freq, playTime);
                    gain.gain.setValueAtTime(track.leadVol || 0.1, playTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, playTime + dur);

                    if (track.leadFilter) {
                        const filter = this.ctx.createBiquadFilter();
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(track.leadFilter, playTime);
                        osc.connect(filter);
                        filter.connect(gain);
                    } else {
                        osc.connect(gain);
                    }

                    gain.connect(this.bgmMasterGain);
                    osc.start(playTime);
                    osc.stop(playTime + dur + 0.04);
                }
            }

            // 2. Giai điệu bè trầm (Bass)
            for (const item of track.bass) {
                if (item[0] === step) {
                    const freq = item[1];
                    const dur = item[2];
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = track.bassType || 'sine';
                    osc.frequency.setValueAtTime(freq, playTime);
                    gain.gain.setValueAtTime(track.bassVol || 0.14, playTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, playTime + dur);

                    if (track.bassFilter) {
                        const filter = this.ctx.createBiquadFilter();
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(track.bassFilter, playTime);
                        osc.connect(filter);
                        filter.connect(gain);
                    } else {
                        osc.connect(gain);
                    }

                    gain.connect(this.bgmMasterGain);
                    osc.start(playTime);
                    osc.stop(playTime + dur + 0.04);
                }
            }

            // 3. Nhịp gõ vui nhộn (Percussion Tick)
            if (track.percSteps && track.percSteps.includes(step)) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(850, playTime);
                osc.frequency.exponentialRampToValueAtTime(100, playTime + 0.025);
                gain.gain.setValueAtTime(0.025, playTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.025);
                osc.connect(gain);
                gain.connect(this.bgmMasterGain);
                osc.start(playTime);
                osc.stop(playTime + 0.03);
            }

            this.nextNoteTime += stepDuration;
            this.bgmStep++;
        }
    }

    startBgm(gameId = 'wordmatch') {
        this.currentBgmGame = gameId;
        if (!this.musicEnabled) return;
        this.init();
        if (!this.ctx) return;

        // Nếu đang chạy BGM, tắt tiến trình cũ một cách êm ái
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }

        const track = BGM_TRACKS[gameId] || BGM_TRACKS.wordmatch;
        this.bgmStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;

        // Tạo Master Gain cho nhạc nền với hiệu ứng Fade-in êm ái
        this.bgmMasterGain = this.ctx.createGain();
        this.bgmMasterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.bgmMasterGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.25);
        this.bgmMasterGain.connect(this.ctx.destination);

        // Lập lịch nhịp đầu tiên và kích hoạt bộ đếm thời gian
        this.scheduleBgmStep(track);
        this.bgmTimer = setInterval(() => {
            if (!this.musicEnabled || !this.ctx) {
                this.stopBgm(false);
                return;
            }
            this.scheduleBgmStep(track);
        }, 40);
    }

    stopBgm(clearCurrentGame = true) {
        if (clearCurrentGame) {
            this.currentBgmGame = null;
        }
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
        if (this.bgmMasterGain && this.ctx) {
            try {
                const now = this.ctx.currentTime;
                this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, now);
                this.bgmMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
                const oldGain = this.bgmMasterGain;
                setTimeout(() => {
                    try { oldGain.disconnect(); } catch (e) {}
                }, 250);
                this.bgmMasterGain = null;
            } catch (e) {
                this.bgmMasterGain = null;
            }
        }
    }

    duckBgm(ducking) {
        if (!this.bgmMasterGain || !this.ctx) return;
        const now = this.ctx.currentTime;
        try {
            if (ducking) {
                this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, now);
                this.bgmMasterGain.gain.linearRampToValueAtTime(0.03, now + 0.08);
            } else {
                this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, now);
                this.bgmMasterGain.gain.linearRampToValueAtTime(0.12, now + 0.25);
            }
        } catch (e) {}
    }

    setSound(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    setMusic(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        if (enabled) {
            const game = this.currentBgmGame || (typeof currentGame !== 'undefined' ? currentGame : 'wordmatch');
            this.startBgm(game);
        } else {
            this.stopBgm(false);
        }
        if (typeof updateBgmUI === 'function') {
            updateBgmUI(enabled);
        }
    }
}

const soundEngine = new SoundEngine();
window.soundEngine = soundEngine;

// Mở khóa AudioContext ngay khi người dùng chạm hoặc nhấp chuột lần đầu
['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, () => {
        if (window.soundEngine) window.soundEngine.init();
    }, { once: true });
});

// Đồng bộ giao diện nút nhạc nền trong khi chơi và phần cài đặt
function updateBgmUI(enabled) {
    const isPlaying = (enabled !== undefined) ? enabled : (window.soundEngine ? window.soundEngine.musicEnabled : true);
    const toggleBtn = document.getElementById('gameBgmToggle');
    const icon = document.getElementById('gameBgmIcon');
    const label = document.getElementById('gameBgmLabel');
    const settingsToggle = document.getElementById('musicToggle');

    if (settingsToggle) settingsToggle.checked = isPlaying;
    if (toggleBtn) {
        toggleBtn.classList.toggle('muted', !isPlaying);
        if (icon) icon.textContent = isPlaying ? '🎵' : '🔇';
        if (label) label.textContent = isPlaying ? 'Nhạc: BẬT' : 'Nhạc: TẮT';
    }
}
window.updateBgmUI = updateBgmUI;

function toggleGameBgm() {
    if (!window.soundEngine) return;
    const newState = !window.soundEngine.musicEnabled;
    window.soundEngine.setMusic(newState);
    if (newState && typeof currentGame !== 'undefined' && currentGame) {
        window.soundEngine.startBgm(currentGame);
    }
    updateBgmUI(newState);
    showToast(newState ? '🎵 Đã bật nhạc nền vui nhộn!' : '🔇 Đã tắt nhạc nền', 'info');
}
window.toggleGameBgm = toggleGameBgm;

// ===== Text-to-Speech (Kèm Giảm Âm Lượng Nhạc Nền Tự Động) =====
function speakWord(word) {
    if (!soundEngine.soundEnabled) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.05;

        if (window.soundEngine && typeof window.soundEngine.duckBgm === 'function') {
            window.soundEngine.duckBgm(true);
            utterance.onend = () => window.soundEngine.duckBgm(false);
            utterance.onerror = () => window.soundEngine.duckBgm(false);
            setTimeout(() => window.soundEngine.duckBgm(false), 2500);
        }

        window.speechSynthesis.speak(utterance);
    }
}

// ===== Cheerful Voice Praise (Speech Synthesis) =====
function speakCheer(phrase) {
    if (!soundEngine.soundEnabled) return;
    if ('speechSynthesis' in window) {
        const cheerPhrases = ['Awesome!', 'Bingo!', 'Super star!', 'You rock!', 'Fantastic!', 'Hooray!'];
        const text = phrase || cheerPhrases[Math.floor(Math.random() * cheerPhrases.length)];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.05;
        utterance.pitch = 1.35; // Giọng nhí nhảnh, dễ thương cho các em
        utterance.volume = 0.95;

        if (window.soundEngine && typeof window.soundEngine.duckBgm === 'function') {
            window.soundEngine.duckBgm(true);
            utterance.onend = () => window.soundEngine.duckBgm(false);
            utterance.onerror = () => window.soundEngine.duckBgm(false);
            setTimeout(() => window.soundEngine.duckBgm(false), 2500);
        }

        window.speechSynthesis.speak(utterance);
    }
}
window.speakCheer = speakCheer;

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
}

// ===== Confetti Effect =====
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A78BFA', '#FF8C42', '#EC4899', '#6BCB77', '#4FC3F7'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 12 + 5,
            h: Math.random() * 8 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
        });
    }

    let frame = 0;
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.vy += 0.05;
            p.opacity -= 0.003;

            if (p.opacity <= 0) return;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        frame++;
        if (frame < 200) {
            requestAnimationFrame(animateConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animateConfetti();
}

// ===== Floating Decorations =====
function createFloatingDecorations() {
    const container = document.getElementById('floatingDecorations');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
        const deco = document.createElement('span');
        deco.className = 'floating-deco';
        deco.textContent = DECORATION_EMOJIS[Math.floor(Math.random() * DECORATION_EMOJIS.length)];
        deco.style.left = Math.random() * 100 + '%';
        deco.style.top = Math.random() * 100 + '%';
        deco.style.fontSize = (Math.random() * 20 + 14) + 'px';
        deco.style.animationDelay = Math.random() * 10 + 's';
        deco.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(deco);
    }
}

// ===== Sparkle Cursor Effect =====
function initSparkleEffect() {
    let lastSparkleTime = 0;
    
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSparkleTime < 100) return;
        lastSparkleTime = now;

        if (!document.getElementById('effectsToggle')?.checked) return;

        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle';
        sparkle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        document.getElementById('sparkleContainer').appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 800);
    });
}

// ===== Counter Animation =====
function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.floor(current);
        }, 30);
    });
}

// ===== Mascot Interactive & Prank Engine =====
let mascotState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    lastSqueakDist: 0,
    hasMoved: false,
    pokeCount: 0,
    lastPokeTime: 0,
    speechLockUntil: 0,
    currentCostumeIndex: 0,
    inflateLevel: 1.0,
    isDizzy: false,
    hasSplat: false,
    isGiggling: false
};
window.mascotState = mascotState;

function setMascotSpeech(text, lockDurationMs = 3000) {
    const speechEl = document.getElementById('mascotSpeech');
    if (!speechEl) return;
    mascotState.speechLockUntil = Date.now() + lockDurationMs;
    speechEl.style.opacity = '0';
    setTimeout(() => {
        speechEl.textContent = text;
        speechEl.style.opacity = '1';
        speechEl.style.transition = 'opacity 0.25s ease';
    }, 150);
}
window.setMascotSpeech = setMascotSpeech;

function spawnFloatingMascotEmoji(emoji, clientX = null, clientY = null) {
    const mascotChar = document.getElementById('mascotCharacter') || document.querySelector('.hero-mascot');
    if (!mascotChar) return;

    const el = document.createElement('div');
    el.className = 'mascot-float-emoji';
    el.textContent = emoji;

    let x, y;
    if (clientX !== null && clientY !== null) {
        const rect = mascotChar.getBoundingClientRect();
        x = clientX - rect.left;
        y = clientY - rect.top;
    } else {
        x = mascotChar.offsetWidth / 2 + (Math.random() * 80 - 40);
        y = mascotChar.offsetHeight / 2 + (Math.random() * 40 - 20);
    }

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);

    mascotChar.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, 1200);
}
window.spawnFloatingMascotEmoji = spawnFloatingMascotEmoji;

function triggerConfettiBurst(originX = null, originY = null) {
    const container = document.body;
    const emojis = ['🎉', '⭐', '✨', '💖', '🌟', '🎊', '🎈'];
    
    for (let i = 0; i < 20; i++) {
        const piece = document.createElement('div');
        piece.className = 'mascot-float-emoji';
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        piece.style.fontSize = `${1.2 + Math.random() * 1.5}rem`;
        piece.style.position = 'fixed';
        piece.style.zIndex = '9999';
        
        const startX = originX !== null ? originX : window.innerWidth * 0.72;
        const startY = originY !== null ? originY : window.innerHeight * 0.38;
        
        piece.style.left = `${startX}px`;
        piece.style.top = `${startY}px`;
        piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 220}px`);
        piece.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;
        
        container.appendChild(piece);
        setTimeout(() => piece.remove(), 1400);
    }
}
window.triggerConfettiBurst = triggerConfettiBurst;

function clearMascotActionState() {
    const mascotBody = document.getElementById('mascotBody');
    const mascotFace = document.getElementById('mascotFace');
    const tearL = document.getElementById('mascotTearL');
    const tearR = document.getElementById('mascotTearR');
    const dizzyRing = document.getElementById('mascotDizzyRing');
    const bounceWrapper = document.getElementById('mascotBounceWrapper');

    if (mascotState.tickleTimer) {
        clearTimeout(mascotState.tickleTimer);
        mascotState.tickleTimer = null;
    }
    if (mascotState.spinTimer) {
        clearTimeout(mascotState.spinTimer);
        mascotState.spinTimer = null;
    }

    if (mascotBody) {
        mascotBody.classList.remove('is-giggling', 'is-spinning');
    }
    if (mascotFace) {
        mascotFace.classList.remove('is-squinting');
    }
    if (tearL) tearL.classList.remove('active');
    if (tearR) tearR.classList.remove('active');
    if (bounceWrapper) bounceWrapper.style.animationPlayState = 'running';
    mascotState.isGiggling = false;
    mascotState.pokeCount = 0;
}
window.clearMascotActionState = clearMascotActionState;

function handleMascotClick(e) {
    const ptEl = (e.clientX && e.clientY) ? document.elementFromPoint(e.clientX, e.clientY) : null;
    const blushTarget = (ptEl && ptEl.closest('.mascot-blush')) || (e.target && e.target.closest && e.target.closest('.mascot-blush'));
    const eyeTarget = (ptEl && ptEl.closest('.mascot-eye')) || (e.target && e.target.closest && e.target.closest('.mascot-eye'));
    const mouthTarget = (ptEl && ptEl.closest('.mascot-mouth')) || (e.target && e.target.closest && e.target.closest('.mascot-mouth'));

    if (blushTarget) {
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('pop');
        setMascotSpeech("Á, véo má tui hả! Đỏ chét như quả cà chua rồi nè! 🍅😳", 2500);
        spawnFloatingMascotEmoji('😳', e.clientX, e.clientY);
        blushTarget.style.transform = 'scale(1.4)';
        setTimeout(() => { blushTarget.style.transform = ''; }, 300);
        return;
    }

    if (eyeTarget) {
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('squeak');
        setMascotSpeech("Ui da! Chọc trúng mắt tui rồi huhu! 🥺👁️", 2500);
        spawnFloatingMascotEmoji('🥺', e.clientX, e.clientY);
        eyeTarget.style.transform = 'scaleY(0.2)';
        setTimeout(() => { eyeTarget.style.transform = ''; }, 400);
        return;
    }

    if (mouthTarget) {
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('whoosh');
        setMascotSpeech("Lêu lêu! Cắn không được đâu nha! 😜👅", 2500);
        spawnFloatingMascotEmoji('😜', e.clientX, e.clientY);
        return;
    }

    // Body Poke
    const now = Date.now();
    if (now - mascotState.lastPokeTime < 1800) {
        mascotState.pokeCount++;
    } else {
        mascotState.pokeCount = 1;
    }
    mascotState.lastPokeTime = now;

    const mascotBody = document.getElementById('mascotBody');
    if (mascotBody) {
        mascotBody.style.transform = 'scale(1.15, 0.85)';
        setTimeout(() => {
            if (!mascotState.isDragging && !mascotState.isDizzy && !mascotState.isGiggling) {
                mascotBody.style.transform = mascotState.inflateLevel !== 1.0 ? `scale(${mascotState.inflateLevel})` : '';
            }
        }, 180);
    }

    if (mascotState.pokeCount >= 4) {
        triggerMascotPrank('tickle');
    } else {
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('pop');
        const pokePhrases = [
            "Ai chọc tui đó? 🤔",
            "Lại chọc nữa! Coi chừng tui nha! 😤",
            "Nhột... bắt đầu thấy nhột nhột rồi nha... 🤭"
        ];
        const phrase = pokePhrases[mascotState.pokeCount - 1] || "Hehe! Đừng chọc nữa! 😜";
        setMascotSpeech(phrase, 2000);
        spawnFloatingMascotEmoji('👉', e.clientX, e.clientY);
    }
}

function triggerMascotPrank(action) {
    const mascotBody = document.getElementById('mascotBody');
    const mascotFace = document.getElementById('mascotFace');
    const propsLayer = document.getElementById('mascotPropsLayer');
    const splatLayer = document.getElementById('mascotSplatLayer');
    const dizzyRing = document.getElementById('mascotDizzyRing');
    const sweatEl = document.getElementById('mascotSweat');
    const tearL = document.getElementById('mascotTearL');
    const tearR = document.getElementById('mascotTearR');
    const bounceWrapper = document.getElementById('mascotBounceWrapper');

    if (!mascotBody || !mascotFace) return;

    if (action === 'tickle') {
        clearMascotActionState();
        mascotState.isGiggling = true;
        mascotBody.classList.remove('spring-recoil');
        mascotBody.classList.add('is-giggling');
        mascotFace.classList.add('is-squinting');
        if (tearL) tearL.classList.add('active');
        if (tearR) tearR.classList.add('active');

        if (window.soundEngine && window.soundEngine.playSfx) {
            window.soundEngine.playSfx('giggle');
            setTimeout(() => { if (mascotState.isGiggling && window.soundEngine) window.soundEngine.playSfx('giggle'); }, 400);
            setTimeout(() => { if (mascotState.isGiggling && window.soundEngine) window.soundEngine.playSfx('giggle'); }, 900);
        }

        const laughEmojis = ['😂', '🤣', '😆', '😹', '💨', '✨'];
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                if (mascotState.isGiggling) {
                    const em = laughEmojis[Math.floor(Math.random() * laughEmojis.length)];
                    spawnFloatingMascotEmoji(em);
                }
            }, i * 180);
        }

        setMascotSpeech("Hahaha nhột quá buông ra té ghế rồi bà con ơiii! 🤣😂🤣", 2500);

        // Tự động ngắt cười sau 2 giây!
        mascotState.tickleTimer = setTimeout(() => {
            clearMascotActionState();
            setMascotSpeech("Phù... tha cho em, em cười muốn xỉu luôn á! 😮‍💨😂", 2500);
        }, 2000);
        return;
    }

    // Các hành động khác: lập tức hủy trạng thái cười nếu có
    clearMascotActionState();

    if (action === 'slap') {
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('splat');
        if (splatLayer) {
            splatLayer.innerHTML = `
                <div class="mascot-splat-art">
                    <span class="splat-cream">🥧</span>
                    <span class="splat-cream" style="font-size: 2.8rem;">🍓</span>
                    <span class="splat-cream" style="font-size: 2.5rem;">🍦</span>
                </div>`;
            splatLayer.classList.add('active');
        }
        mascotState.hasSplat = true;
        setMascotSpeech("Úi chà! Bánh kem dâu ngọt lịm! Cho thêm miếng nữa đi! 🍰😋", 3500);
        spawnFloatingMascotEmoji('🍰');
        spawnFloatingMascotEmoji('🍓');
        spawnFloatingMascotEmoji('😋');

    } else if (action === 'props') {
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('pop');
        mascotState.currentCostumeIndex = (mascotState.currentCostumeIndex + 1) % 5;
        const costumes = [
            {
                html: '',
                speech: "Tada! Về lại khuôn mặt mộc đáng yêu! ✨"
            },
            {
                html: '<span class="prop-hat-top">🧢</span><span class="prop-glasses">👓</span><span class="prop-mustache">🥸</span>',
                speech: "Râu của chú Mario vừa tặng tui đó, bảnh bao chưa! 🥸✨"
            },
            {
                html: '<span class="prop-hat-top">🏴‍☠️</span><span class="prop-glasses">👁️‍🗨️</span><span class="prop-mustache">🧔🏻</span>',
                speech: "A hoy! Thuyền trưởng Mặt Cười xin chào cả nhà! 🦜⚓"
            },
            {
                html: '<span class="prop-hat-top">🎪</span><span class="prop-clown-nose">🔴</span><span class="prop-bowtie">🎀</span>',
                speech: "Xiếc hề siêu cấp vui nhộn FunWords đã tới! 🎪🎈"
            },
            {
                html: '<span class="prop-glasses">🕶️</span><span class="prop-mustache">⭐</span><span class="prop-bowtie">👑</span>',
                speech: "Trông tui ngầu đét như ngôi sao Hollywood chưa! 😎✨"
            }
        ];
        const selected = costumes[mascotState.currentCostumeIndex];
        if (propsLayer) {
            propsLayer.innerHTML = selected.html;
        }
        setMascotSpeech(selected.speech, 3000);
        spawnFloatingMascotEmoji('✨');

    } else if (action === 'spin') {
        if (bounceWrapper) bounceWrapper.style.animationPlayState = 'paused';
        mascotBody.classList.remove('spring-recoil');
        mascotBody.style.transition = 'transform 1.2s cubic-bezier(0.15, 0.85, 0.35, 1.2)';
        mascotBody.style.transform = 'rotate(1440deg)';
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('dizzy');
        setMascotSpeech("Oé oé... đang quay 1440 độ... giữ tui lại với! 🌪️😵", 2000);

        mascotState.spinTimer = setTimeout(() => {
            mascotBody.style.transition = '';
            mascotBody.style.transform = '';
            if (bounceWrapper) bounceWrapper.style.animationPlayState = 'running';
            mascotState.isDizzy = true;
            mascotFace.classList.add('is-dizzy');
            if (dizzyRing) dizzyRing.classList.add('active');
            setMascotSpeech("Trời đất quay cuồng... hoa cả mắt rồi bạn ơi... 😵💫🌀", 4000);

            setTimeout(() => {
                if (mascotState.isDizzy) {
                    mascotFace.classList.remove('is-dizzy');
                    if (dizzyRing) dizzyRing.classList.remove('active');
                    mascotState.isDizzy = false;
                    setMascotSpeech("Phù... hết chóng mặt rồi! Cảm ơn nha! 😊", 2000);
                }
            }, 4500);
        }, 1250);

    } else if (action === 'inflate') {
        if (bounceWrapper) bounceWrapper.style.animationPlayState = 'paused';
        mascotState.inflateLevel += 0.25;
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('whoosh');

        if (mascotState.inflateLevel < 2.2) {
            mascotBody.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            mascotBody.style.transform = `scale(${mascotState.inflateLevel})`;
            setMascotSpeech(`Bơm căng ${Math.round(mascotState.inflateLevel * 100)}% rồi... sắp nổ đấy nha! 🎈😱`, 2000);
            spawnFloatingMascotEmoji('💨');
        } else {
            // EXPLODE!
            if (window.soundEngine && window.soundEngine.playSfx) {
                window.soundEngine.playSfx('pop');
                window.soundEngine.playSfx('win');
            }
            triggerConfettiBurst();

            setMascotSpeech("💥 BÙM! NỔ TUNG TÓE RỒI! 🎉💥", 2500);
            mascotBody.style.transition = 'transform 0.15s ease-in';
            mascotBody.style.transform = 'scale(0.01) rotate(360deg)';

            setTimeout(() => {
                mascotState.inflateLevel = 1.0;
                mascotBody.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                mascotBody.style.transform = 'scale(1)';
                mascotBody.classList.add('spring-recoil');
                if (bounceWrapper) bounceWrapper.style.animationPlayState = 'running';
                setMascotSpeech("Hú hồn chim én! Em đã tái sinh thành công! 🐣✨", 3500);
                spawnFloatingMascotEmoji('✨');
                spawnFloatingMascotEmoji('🎉');
            }, 380);
        }

    } else if (action === 'clean') {
        clearMascotActionState();
        if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('whoosh');
        if (bounceWrapper) bounceWrapper.style.animationPlayState = 'running';
        if (splatLayer) {
            splatLayer.innerHTML = '';
            splatLayer.classList.remove('active');
        }
        if (propsLayer) {
            propsLayer.innerHTML = '';
        }
        mascotState.currentCostumeIndex = 0;
        mascotState.hasSplat = false;
        mascotState.isDizzy = false;
        mascotState.inflateLevel = 1.0;
        mascotFace.classList.remove('is-dizzy', 'is-squinting');
        if (dizzyRing) dizzyRing.classList.remove('active');
        if (sweatEl) sweatEl.classList.remove('active');
        if (tearL) tearL.classList.remove('active');
        if (tearR) tearR.classList.remove('active');
        mascotBody.classList.remove('spring-recoil', 'is-giggling', 'is-spinning');
        mascotBody.style.transition = 'transform 0.3s ease';
        mascotBody.style.transform = '';

        spawnFloatingMascotEmoji('🫧');
        spawnFloatingMascotEmoji('🧼');
        spawnFloatingMascotEmoji('✨');
        setMascotSpeech("Aaaa thơm tho mát mẻ sạch bong kin kít! Cảm ơn bạn nha! 🫧🧼✨", 3500);
    }
}
window.triggerMascotPrank = triggerMascotPrank;

function initMascotInteractions() {
    const mascotBody = document.getElementById('mascotBody');
    const mascotMouth = document.getElementById('mascotMouth');
    const sweatEl = document.getElementById('mascotSweat');
    const bounceWrapper = document.getElementById('mascotBounceWrapper');
    if (!mascotBody) return;

    function onPointerDown(e) {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        try { mascotBody.setPointerCapture(e.pointerId); } catch (err) {}

        mascotState.isDragging = true;
        mascotState.hasMoved = false;
        mascotState.startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        mascotState.startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        mascotState.lastSqueakDist = 0;

        if (bounceWrapper) bounceWrapper.style.animationPlayState = 'paused';
        mascotBody.classList.remove('spring-recoil');
        mascotBody.classList.add('is-dragging');
    }

    function onPointerMove(e) {
        if (!mascotState.isDragging) return;
        const curX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const curY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        const dx = curX - mascotState.startX;
        const dy = curY - mascotState.startY;
        const dist = Math.hypot(dx, dy);

        if (dist > 6) {
            mascotState.hasMoved = true;
            const angleRad = Math.atan2(dy, dx);
            const stretchX = 1 + Math.min(dist / 85, 1.45);
            const stretchY = 1 / Math.sqrt(stretchX);
            const shiftX = dx * 0.42;
            const shiftY = dy * 0.42;

            mascotBody.style.transform = `translate(${shiftX}px, ${shiftY}px) rotate(${angleRad}rad) scale(${stretchX}, ${stretchY}) rotate(${-angleRad}rad)`;

            if (mascotMouth) {
                mascotMouth.style.transform = `scale(${1 + dist / 100}, ${Math.max(0.4, 1 - dist / 180)})`;
            }

            if (dist - mascotState.lastSqueakDist > 30) {
                if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('squeak');
                mascotState.lastSqueakDist = dist;
            }

            if (dist > 95) {
                setMascotSpeech("Á á á kéo dài như mì sợi rồi cứu tui! 🍜😱", 2000);
                if (sweatEl) sweatEl.classList.add('active');
            } else if (dist > 45) {
                setMascotSpeech("Ui da má ơi dãn rách áo tui rồiii! 😭🤏", 2000);
            } else if (dist > 18) {
                setMascotSpeech("Kéo dãn đã tay ghê chưa! 🍮😜", 1500);
            }
        }
    }

    function onPointerEnd(e) {
        if (!mascotState.isDragging) return;
        mascotState.isDragging = false;
        try { if (e.pointerId) mascotBody.releasePointerCapture(e.pointerId); } catch (err) {}
        mascotBody.classList.remove('is-dragging');
        if (bounceWrapper) bounceWrapper.style.animationPlayState = 'running';

        if (sweatEl && !mascotState.isDizzy) {
            sweatEl.classList.remove('active');
        }
        if (mascotMouth) {
            mascotMouth.style.transform = '';
        }

        if (mascotState.hasMoved) {
            if (window.soundEngine && window.soundEngine.playSfx) window.soundEngine.playSfx('boing');
            mascotBody.classList.add('spring-recoil');
            mascotBody.style.transform = mascotState.inflateLevel !== 1.0 ? `scale(${mascotState.inflateLevel})` : '';
            setTimeout(() => {
                mascotBody.classList.remove('spring-recoil');
            }, 750);

            const recoilPhrases = [
                "Bật lại u đầu tui luôn! 💥🤕",
                "Đã tay chưa bạn nhỏ? Kéo tiếp đê! 🤪",
                "Ui chu choa dẻo như kẹo cao su vậy! 🍬",
                "Đau điếng cả người nhưng mà vui! 😂"
            ];
            setMascotSpeech(recoilPhrases[Math.floor(Math.random() * recoilPhrases.length)], 3000);
        } else {
            handleMascotClick(e);
        }
    }

    mascotBody.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
}
window.initMascotInteractions = initMascotInteractions;

// ===== Mascot Speech Idle =====
function initMascotSpeech() {
    let phraseIndex = 0;
    setInterval(() => {
        if (Date.now() < mascotState.speechLockUntil) return;
        phraseIndex = (phraseIndex + 1) % MASCOT_PHRASES.length;
        const speechEl = document.getElementById('mascotSpeech');
        if (speechEl) {
            speechEl.style.opacity = '0';
            setTimeout(() => {
                if (Date.now() < mascotState.speechLockUntil) return;
                speechEl.textContent = MASCOT_PHRASES[phraseIndex];
                speechEl.style.opacity = '1';
                speechEl.style.transition = 'opacity 0.3s';
            }, 300);
        }
    }, 4500);
}

// ===== Daily Word =====
let currentDailyWord = null;

function speakDailyWord() {
    if (currentDailyWord && currentDailyWord.en) {
        speakWord(currentDailyWord.en);
    } else {
        const wordEl = document.getElementById('dailyWord');
        if (wordEl && wordEl.textContent) {
            speakWord(wordEl.textContent.trim());
        }
    }
}
window.speakDailyWord = speakDailyWord;

function initDailyWord() {
    if (!Array.isArray(DAILY_WORDS) || DAILY_WORDS.length === 0) return;
    const dayIndex = new Date().getDay();
    const word = DAILY_WORDS[dayIndex % DAILY_WORDS.length];
    currentDailyWord = word;
    
    const dateEl = document.getElementById('todayDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    const wordEl = document.getElementById('dailyWord');
    const phoneticEl = document.getElementById('dailyPhonetic');
    const meaningEl = document.getElementById('dailyMeaning');
    const exampleEl = document.getElementById('dailyExample');
    const emojiEl = document.getElementById('dailyEmoji');

    if (wordEl) wordEl.textContent = word.en || '';
    if (phoneticEl) phoneticEl.textContent = word.phonetic || '';
    if (meaningEl) meaningEl.textContent = word.meaning || word.vi || '';
    if (exampleEl) exampleEl.textContent = word.example || '';
    if (emojiEl) emojiEl.textContent = word.emoji || '⭐';

    const speakBtn = document.getElementById('dailySpeakBtn') || document.querySelector('.daily-word-main .btn-speak');
    if (speakBtn) {
        speakBtn.onclick = () => speakWord(word.en);
        speakBtn.setAttribute('title', `Nghe phát âm: ${word.en}`);
    }
}

// ===== Eye Following Cursor =====
function initEyeFollow() {
    document.addEventListener('mousemove', (e) => {
        if (window.mascotState && (window.mascotState.isDragging || window.mascotState.isDizzy)) return;
        const pupils = document.querySelectorAll('.eye-pupil');
        pupils.forEach(pupil => {
            const eye = pupil.parentElement;
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            
            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const distance = Math.min(6, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 30);
            
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    });
}

// ===== Dark Mode Toggle =====
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }

    toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', toggle.checked);
        localStorage.setItem('darkMode', toggle.checked);
    });
}

// ===== Sound & Music Settings Toggle =====
function initSettings() {
    const soundToggle = document.getElementById('soundToggle');
    const musicToggle = document.getElementById('musicToggle');
    
    if (soundToggle) {
        soundToggle.checked = soundEngine.soundEnabled;
        soundToggle.addEventListener('change', () => {
            soundEngine.setSound(soundToggle.checked);
            showToast(soundToggle.checked ? '🔊 Đã bật âm thanh hiệu ứng!' : '🔇 Đã tắt âm thanh', 'info');
        });
    }

    if (musicToggle) {
        musicToggle.checked = soundEngine.musicEnabled;
        musicToggle.addEventListener('change', () => {
            soundEngine.setMusic(musicToggle.checked);
            showToast(musicToggle.checked ? '🎵 Đã bật nhạc nền!' : '🎵 Đã tắt nhạc nền', 'info');
        });
    }
}

// ===== Scroll Reveal =====
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-header, .game-card, .category-chip, .daily-word-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

// ===== Load User Data =====
function loadUserData() {
    const stars = localStorage.getItem('totalStars') || '0';
    const totalStarsEl = document.getElementById('totalStars');
    if (totalStarsEl) totalStarsEl.textContent = stars;

    const avatar = localStorage.getItem('avatar') || '🦊';
    const avatarEl = document.querySelector('.avatar-emoji');
    if (avatarEl) avatarEl.textContent = avatar;

    const name = localStorage.getItem('profileName') || 'Bé Yêu';
    const nameInput = document.getElementById('profileName');
    if (nameInput) nameInput.value = name;

    const age = localStorage.getItem('profileAge') || '7';
    const ageInput = document.getElementById('profileAge');
    if (ageInput) ageInput.value = age;
}

// ===== Nav Scroll Effect =====
function initNavScroll() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('mainNav');
        if (window.scrollY > 50) {
            nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navLinks = document.querySelector('.nav-links');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (navLinks && navLinks.classList.contains('show') && !navLinks.contains(e.target) && !menuBtn?.contains(e.target)) {
            navLinks.classList.remove('show');
        }
    });
}

// ===== API Data Fetching =====
async function loadDataFromAPI() {
    const apiBase = window.location.origin.startsWith('http') ? '' : 'http://localhost:3000';
    try {
        const [wordsRes, dailyWordsRes, fillBlankRes, userStatsRes] = await Promise.all([
            fetch(`${apiBase}/api/words`),
            fetch(`${apiBase}/api/daily-words`),
            fetch(`${apiBase}/api/fill-blank`),
            fetch(`${apiBase}/api/user-stats`)
        ]);
        
        if (wordsRes.ok) {
            const data = await wordsRes.json();
            if (data.success) VOCABULARY = data.data;
        }
        if (dailyWordsRes.ok) {
            const data = await dailyWordsRes.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                DAILY_WORDS = data.data;
                initDailyWord();
            }
        }
        if (fillBlankRes.ok) {
            const data = await fillBlankRes.json();
            if (data.success) FILL_BLANK_DATA = data.data;
        }
        if (userStatsRes && userStatsRes.ok) {
            const data = await userStatsRes.json();
            if (data.success && data.data) {
                applyUserStats(data.data);
            }
        }
    } catch (error) {
        console.error("Không thể kết nối đến Backend. Đang dùng dữ liệu mẫu (offline mode).", error);
    }
}

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadDataFromAPI(); // Tải dữ liệu từ API (MySQL) trước
    await loadCurriculumData(); // Tải giáo trình Unit & Part từ API

    createFloatingDecorations();
    initSparkleEffect();
    initMascotSpeech();
    initMascotInteractions();
    initDailyWord();
    initEyeFollow();
    initDarkMode();
    initSettings();
    initScrollReveal();
    initNavScroll();
    loadUserData();
    animateCounters();
    
    // Show home page
    showPage('home');
});

// Handle window resize for confetti canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
