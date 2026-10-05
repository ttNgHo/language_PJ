/* ==========================================
   🌈 FunWords - Main Application
   Navigation, effects, initialization
   ========================================== */

// ===== Page Navigation =====
function showPage(pageId) {
    // Stop any running game timers
    stopTimer();

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

// ===== Achievements Page =====
function populateAchievements() {
    // Update stats
    const totalStars = parseInt(localStorage.getItem('totalStars') || '0');
    const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const wordsLearned = parseInt(localStorage.getItem('wordsLearned') || '0');
    
    document.getElementById('achStars').textContent = totalStars;
    document.getElementById('achGames').textContent = gamesPlayed;
    document.getElementById('achWords').textContent = wordsLearned;
    document.getElementById('achStreak').textContent = '3';

    // Populate badges
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = BADGES.map(badge => `
        <div class="badge-card ${badge.unlocked ? '' : 'locked'}">
            <span class="badge-emoji">${badge.emoji}</span>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.desc}</div>
        </div>
    `).join('');

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

// ===== Profile Functions =====
function selectAvatar(emoji) {
    document.querySelector('.avatar-emoji').textContent = emoji;
    localStorage.setItem('avatar', emoji);
    showToast('🎨 Đã đổi avatar!', 'success');
}

function saveProfile() {
    const name = document.getElementById('profileName').value;
    const age = document.getElementById('profileAge').value;
    localStorage.setItem('profileName', name);
    localStorage.setItem('profileAge', age);
    showToast('💾 Đã lưu hồ sơ!', 'success');
}

// ===== Sound & Music Engine (Web Audio API - No External Files) =====
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
        this.musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        this.bgmTimer = null;
        this.bgmStep = 0;
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
            // Funny cartoon slide / trombone wah-wah: 320Hz -> 220Hz -> 140Hz
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
            // Funny cartoon spring boing: rapid frequency sweep up with vibrato
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
        }
    }

    startBgm() {
        if (!this.musicEnabled) return;
        this.init();
        if (!this.ctx || this.bgmTimer) return;

        const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 349.23, 392.00];
        this.bgmStep = 0;

        this.bgmTimer = setInterval(() => {
            if (!this.musicEnabled || !this.ctx) {
                this.stopBgm();
                return;
            }
            const now = this.ctx.currentTime;
            const freq = melody[this.bgmStep % melody.length];
            this.bgmStep++;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.5);
        }, 550);
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    setSound(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('soundEnabled', enabled);
    }

    setMusic(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled);
        if (enabled) {
            this.startBgm();
        } else {
            this.stopBgm();
        }
    }
}

const soundEngine = new SoundEngine();
window.soundEngine = soundEngine;

// ===== Text-to-Speech =====
function speakWord(word) {
    if (!soundEngine.soundEnabled) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.05;
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
        utterance.pitch = 1.35; // Cute cheerful pitch for kids
        utterance.volume = 0.95;
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

// ===== Mascot Speech =====
function initMascotSpeech() {
    let phraseIndex = 0;
    setInterval(() => {
        phraseIndex = (phraseIndex + 1) % MASCOT_PHRASES.length;
        const speechEl = document.getElementById('mascotSpeech');
        if (speechEl) {
            speechEl.style.opacity = '0';
            setTimeout(() => {
                speechEl.textContent = MASCOT_PHRASES[phraseIndex];
                speechEl.style.opacity = '1';
                speechEl.style.transition = 'opacity 0.3s';
            }, 300);
        }
    }, 4000);
}

// ===== Daily Word =====
function initDailyWord() {
    const dayIndex = new Date().getDay();
    const word = DAILY_WORDS[dayIndex % DAILY_WORDS.length];
    
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

    if (wordEl) wordEl.textContent = word.en;
    if (phoneticEl) phoneticEl.textContent = word.phonetic;
    if (meaningEl) meaningEl.textContent = word.meaning;
    if (exampleEl) exampleEl.textContent = word.example;
    if (emojiEl) emojiEl.textContent = word.emoji;
}

// ===== Eye Following Cursor =====
function initEyeFollow() {
    document.addEventListener('mousemove', (e) => {
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

    document.querySelectorAll('.section-header, .game-card, .category-chip, .leader-card, .daily-word-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

// ===== Load User Data =====
function loadUserData() {
    const stars = localStorage.getItem('totalStars') || '0';
    document.getElementById('totalStars').textContent = stars;

    const avatar = localStorage.getItem('avatar') || '🦊';
    const avatarEl = document.querySelector('.avatar-emoji');
    if (avatarEl) avatarEl.textContent = avatar;

    const name = localStorage.getItem('profileName') || 'Bé Yêu';
    const nameInput = document.getElementById('profileName');
    if (nameInput) nameInput.value = name;
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
        const [wordsRes, dailyWordsRes, fillBlankRes] = await Promise.all([
            fetch(`${apiBase}/api/words`),
            fetch(`${apiBase}/api/daily-words`),
            fetch(`${apiBase}/api/fill-blank`)
        ]);
        
        if (wordsRes.ok) {
            const data = await wordsRes.json();
            if (data.success) VOCABULARY = data.data;
        }
        if (dailyWordsRes.ok) {
            const data = await dailyWordsRes.json();
            if (data.success) DAILY_WORDS = data.data;
        }
        if (fillBlankRes.ok) {
            const data = await fillBlankRes.json();
            if (data.success) FILL_BLANK_DATA = data.data;
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
