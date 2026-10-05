/* ==========================================
   🌈 FunWords - Game Engines
   All game logic and mechanics
   ========================================== */

// ===== Game State =====
let currentGame = null;
let gameState = {
    score: 0,
    lives: 3,
    currentQuestion: 0,
    totalQuestions: 10,
    timer: 60,
    timerInterval: null,
    correctAnswers: 0,
    startTime: null,
    category: 'animals',
    words: [],
};

// ===== Utility Functions =====
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function getRandomWords(count, category, allowDuplicates = false) {
    let pool = [];
    if (gameState.customWords && gameState.customWords.length > 0) {
        pool = [...gameState.customWords];
    } else {
        const cat = category || gameState.category;
        if (cat === 'all') {
            Object.values(VOCABULARY).forEach(w => pool.push(...w));
        } else if (VOCABULARY[cat]) {
            pool = [...VOCABULARY[cat]];
        } else {
            Object.values(VOCABULARY).forEach(w => pool.push(...w));
        }
    }
    if (pool.length === 0) {
        Object.values(VOCABULARY).forEach(w => pool.push(...w));
    }
    if (pool.length >= count) {
        return shuffle(pool).slice(0, count);
    }
    if (!allowDuplicates) {
        // Bổ sung thêm từ vựng theo chủ đề để đủ số lượng thẻ mà không bị trùng lặp
        const cat = category || gameState.category;
        const backupPool = (cat && VOCABULARY[cat]) ? VOCABULARY[cat] : Object.values(VOCABULARY).flat();
        const existingEns = new Set(pool.map(w => w.en.toLowerCase()));
        const extraWords = shuffle(backupPool.filter(w => !existingEns.has(w.en.toLowerCase())));
        const combined = [...pool, ...extraWords];
        return combined.slice(0, count);
    }
    // Nếu từ vựng ít hơn số lượng yêu cầu và cho phép lặp, lặp lại danh sách từ vựng để đủ vòng chơi
    const result = [];
    while (result.length < count && pool.length > 0) {
        result.push(...shuffle(pool));
    }
    return result.slice(0, count);
}

function updateGameUI() {
    document.getElementById('gpScore').textContent = gameState.score;
    document.getElementById('gpLives').textContent = gameState.lives;
    document.getElementById('gpTimer').textContent = gameState.timer;
    const progress = (gameState.currentQuestion / gameState.totalQuestions) * 100;
    document.getElementById('gpProgress').style.width = progress + '%';
    document.getElementById('gpProgressText').textContent = `${gameState.currentQuestion}/${gameState.totalQuestions}`;
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        document.getElementById('gpTimer').textContent = gameState.timer;
        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(gameState.timerInterval);
    if (gameState.catcherInterval) {
        clearInterval(gameState.catcherInterval);
        gameState.catcherInterval = null;
    }
    // Xóa các từ rơi còn sót lại trong Word Catcher và hiệu ứng điểm nổi
    document.querySelectorAll('.falling-word, .floating-score-float').forEach(e => e.remove());
    // Hủy lắng nghe phím tắt thẻ ghi nhớ
    if (window.flashcardKeyHandler) {
        window.removeEventListener('keydown', window.flashcardKeyHandler);
        window.flashcardKeyHandler = null;
    }
}

function resetGameState() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.currentQuestion = 0;
    gameState.timer = 60;
    gameState.correctAnswers = 0;
    gameState.streak = 0;
    gameState.startTime = Date.now();
    gameState.words = [];
    stopTimer();
}

// ===== Humorous Cartoon Reactions & Motivating Messages =====
const CORRECT_REACTIONS = [
    { emoji: '🐱‍👓', text: 'Tuyệt đỉnh nóc kịch trần! +10⭐' },
    { emoji: '🦄', text: 'Kỳ lân thả tim: Bé quá siêu! ✨' },
    { emoji: '🐒', text: 'Khỉ con vỗ tay bôm bốp! 👏' },
    { emoji: '🦖', text: 'Khủng long gầm vang: Xuất sắc! 🌟' },
    { emoji: '🐼', text: 'Gấu trúc nhảy hiphop mừng bé! 💃' },
    { emoji: '🚀', text: 'Tên lửa vút bay: Thông minh quá! 🚀' },
    { emoji: '🦁', text: 'Sư tử nhí vẫy đuôi khen ngợi! 👑' },
    { emoji: '🐬', text: 'Cá heo tung tăng: Chuẩn không cần chỉnh! 🌊' }
];

const WRONG_REACTIONS = [
    { emoji: '🍌', text: 'Úi chà chà! Trượt vỏ chuối mất tiêu! 🍌' },
    { emoji: '😵‍💫', text: 'Mắt quay chong chóng! Bé nhìn kỹ lại nha! 👀' },
    { emoji: '🐶', text: 'Cún cưng gãi tai: Gần đúng rồi, cố lên! 🐶' },
    { emoji: '🐢', text: 'Rùa con bảo: Chậm lại một tí xíu nào bé ơi! 🐢' },
    { emoji: '🧅', text: 'Hành tây nháy mắt: Suýt trúng phóc rồi đó! 🧅' },
    { emoji: '🐸', text: 'Ếch ộp nhảy nhầm lá sen! Thử lại nha! 🐸' }
];

function showComboBanner(streak) {
    const existing = document.querySelector('.combo-banner-popup');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = 'combo-banner-popup';
    const praise = streak >= 5 ? '🌈 BẤT KHẢ CHIẾN BẠI!' :
                   streak === 4 ? '🌟 SIÊU SAO NHÍ!' :
                   streak === 3 ? '⚡ TỐC ĐỘ ÁNH SÁNG!' : '🔥 ĐANG NÓNG LÊN RỒI!';
    banner.innerHTML = `<span>🔥</span><span>COMBO x${streak}! ${praise}</span>`;
    document.body.appendChild(banner);
    setTimeout(() => {
        if (banner.parentNode) banner.remove();
    }, 1200);
}

function showFeedback(correct) {
    if (correct) {
        gameState.streak = (gameState.streak || 0) + 1;
        gameState.score += 10;
        gameState.correctAnswers++;
        if (gameState.streak >= 2) {
            if (window.soundEngine) window.soundEngine.playSfx('combo');
            showComboBanner(gameState.streak);
        } else {
            if (window.soundEngine) window.soundEngine.playSfx('correct');
        }
        if (gameState.streak === 2 || gameState.streak === 4 || gameState.streak === 6) {
            setTimeout(() => { if (typeof window.speakCheer === 'function') window.speakCheer(); }, 350);
        }
    } else {
        gameState.streak = 0;
        gameState.lives--;
        if (window.soundEngine) window.soundEngine.playSfx('wrong');
        if (gameState.lives <= 0) {
            setTimeout(() => endGame(), 600);
        }
    }
    updateGameUI();

    // Hiển thị Cartoon Feedback Card hài hước, kích thích cảm xúc các em nhỏ
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';

    const reactionList = correct ? CORRECT_REACTIONS : WRONG_REACTIONS;
    const reaction = reactionList[Math.floor(Math.random() * reactionList.length)];
    const cardClass = correct ? 'correct-card' : 'wrong-card';
    const avatarClass = correct ? 'bounce-spin' : 'wobble-fall';
    const bubbleClass = correct ? 'correct-bubble' : 'wrong-bubble';

    // Các hạt hiệu ứng lấp lánh / giọt mồ hôi bay xung quanh
    const flyingEmojis = correct ? ['✨', '⭐', '🎉', '💫', '💖'] : ['💦', '🍌', '💫', '❓'];
    const flyingHtml = flyingEmojis.map((em, i) => {
        const angle = (i / flyingEmojis.length) * 2 * Math.PI;
        const dist = 85 + Math.random() * 45;
        const tx = Math.cos(angle) * dist + 'px';
        const ty = Math.sin(angle) * dist + 'px';
        const rot = (Math.random() * 60 - 30) + 'deg';
        return `<span class="flying-emoji-item" style="--tx:${tx}; --ty:${ty}; --rot:${rot}; top:40%; left:45%;">${em}</span>`;
    }).join('');

    overlay.innerHTML = `
        <div class="feedback-cartoon-card ${cardClass}">
            <div class="cartoon-avatar ${avatarClass}">${reaction.emoji}</div>
            <div class="cartoon-bubble ${bubbleClass}">${reaction.text}</div>
            <div class="cartoon-flying-emojis">${flyingHtml}</div>
        </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => {
        overlay.remove();
    }, 950);
}

function endGame() {
    stopTimer();
    if (window.soundEngine && typeof window.soundEngine.stopBgm === 'function') {
        window.soundEngine.stopBgm();
    }
    const timeTaken = Math.round((Date.now() - (gameState.startTime || Date.now())) / 1000);
    const totalStars = gameState.correctAnswers >= gameState.totalQuestions ? 3 :
                       gameState.correctAnswers >= gameState.totalQuestions * 0.7 ? 2 :
                       gameState.correctAnswers >= gameState.totalQuestions * 0.4 ? 1 : 0;

    const isGreat = totalStars >= 2;
    if (window.soundEngine) {
        window.soundEngine.playSfx(isGreat ? 'win' : 'correct');
    }

    // Update result modal
    const emojiEl = document.getElementById('resultEmoji');
    const titleEl = document.getElementById('resultTitle');
    const msgEl = document.getElementById('resultMessage');
    const scoreEl = document.getElementById('resultScore');
    const correctEl = document.getElementById('resultCorrect');
    const timeEl = document.getElementById('resultTime');

    if (emojiEl) emojiEl.textContent = isGreat ? '🎉' : '😊';
    if (titleEl) titleEl.textContent = isGreat ? 'Tuyệt Vời!' : 'Cố Gắng Hơn Nhé!';
    if (msgEl) msgEl.textContent = isGreat ? `Bạn đã hoàn thành xuất sắc! Giỏi lắm!` : 'Đừng nản chí, hãy thử lại nhé!';
    if (scoreEl) scoreEl.textContent = gameState.score;
    if (correctEl) correctEl.textContent = `${gameState.correctAnswers}/${gameState.totalQuestions}`;
    if (timeEl) timeEl.textContent = `${timeTaken}s`;

    // Show stars
    const starsContainer = document.getElementById('resultStars');
    if (starsContainer) {
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const star = document.createElement('span');
            star.className = 'result-star';
            star.textContent = i < totalStars ? '⭐' : '☆';
            star.style.animationDelay = `${0.2 + i * 0.2}s`;
            starsContainer.appendChild(star);
        }
    }

    // Update total stars and game stats (Lưu đồng thời vào LocalStorage và MySQL Database)
    const newScore = gameState.score || 0;
    const newWords = gameState.correctAnswers || 0;

    const currentStars = parseInt(localStorage.getItem('totalStars') || '0');
    localStorage.setItem('totalStars', currentStars + newScore);
    const totalStarsEl = document.getElementById('totalStars');
    if (totalStarsEl) totalStarsEl.textContent = currentStars + newScore;

    const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    localStorage.setItem('gamesPlayed', gamesPlayed + 1);

    const wordsLearned = parseInt(localStorage.getItem('wordsLearned') || '0');
    localStorage.setItem('wordsLearned', wordsLearned + newWords);

    // Gửi lên server để lưu vĩnh viễn vào cơ sở dữ liệu MySQL
    if (typeof fetch !== 'undefined') {
        (async () => {
            try {
                const apiBase = (typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) ? '' : 'http://localhost:3000';
                const res = await fetch(`${apiBase}/api/user-stats/record-game`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score: newScore, wordsCount: newWords })
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        if (typeof window !== 'undefined' && window.applyUserStats) window.applyUserStats(json.data);
                    }
                }
            } catch (e) {
                console.warn('Lỗi lưu thành tích vào MySQL:', e);
            }
        })();
    }

    // Update result buttons for teaching mode
    const buttonsContainer = document.querySelector('#resultModal .result-buttons');
    if (buttonsContainer) {
        if (gameState.isTeachingMode) {
            buttonsContainer.innerHTML = `
                <button class="btn btn-primary" onclick="replayGame()">🔄 Dạy lại lượt này</button>
                <button class="btn btn-secondary" onclick="nextTeachingPart()">➡️ Part tiếp theo</button>
                <button class="btn btn-ghost" onclick="exitTeachingMode()">📚 Về danh sách Unit</button>
            `;
        } else {
            buttonsContainer.innerHTML = `
                <button class="btn btn-primary" onclick="replayGame()">🔄 Chơi lại</button>
                <button class="btn btn-secondary" onclick="closeResultModal(); showPage('games')">📋 Trò chơi khác</button>
            `;
        }
    }

    // Show modal with confetti
    const resultModal = document.getElementById('resultModal');
    if (resultModal) resultModal.classList.add('show');
    if (isGreat && typeof launchConfetti === 'function') launchConfetti();
}

function closeResultModal() {
    const rm = document.getElementById('resultModal');
    if (rm) rm.classList.remove('show');
}
window.closeResultModal = closeResultModal;

function replayGame() {
    closeResultModal();
    if (currentGame) startGame(currentGame);
}

function nextTeachingPart() {
    document.getElementById('resultModal').classList.remove('show');
    if (!gameState.isTeachingMode || !gameState.currentUnitId || !gameState.currentPartId) {
        showPage('curriculum');
        return;
    }
    const unit = UNITS_DATA.find(u => u.id === gameState.currentUnitId);
    if (!unit || !unit.parts) {
        showPage('curriculum');
        return;
    }
    const currentIndex = unit.parts.findIndex(p => p.id === gameState.currentPartId);
    if (currentIndex !== -1 && currentIndex < unit.parts.length - 1) {
        const nextPart = unit.parts[currentIndex + 1];
        launchPartGame(unit.id, nextPart.id);
    } else {
        showToast('🎉 Chúc mừng bạn và các em đã hoàn thành toàn bộ bài học trong Unit này!', 'success');
        exitTeachingMode();
    }
}

// ===== GAME 1: Word Match =====
function initWordMatch() {
    const container = document.getElementById('gameplayContainer');
    document.getElementById('gameplayTitle').textContent = '🎯 Nối Từ';
    
    const words = getRandomWords(5);
    gameState.words = words;
    gameState.totalQuestions = words.length;
    gameState.timer = 90;

    const shuffledVi = shuffle(words.map(w => ({ vi: w.vi, en: w.en })));

    let selectedEn = null;
    let selectedEnIndex = null;
    let matchedCount = 0;
    let isEvaluating = false;

    container.innerHTML = `
        <div class="match-game">
            <div class="match-prompt">
                <h3>Nối từ tiếng Anh với nghĩa tiếng Việt</h3>
                <p>Chọn một từ tiếng Anh, sau đó chọn nghĩa tiếng Việt tương ứng</p>
            </div>
            <div class="match-columns">
                <div class="match-column">
                    <div class="match-column-title">🇬🇧 Tiếng Anh</div>
                    ${words.map((w, i) => `
                        <div class="match-item en-item" data-word="${w.en}" data-index="${i}" onclick="selectMatchItem(this, 'en')">
                            ${w.emoji} ${w.en}
                        </div>
                    `).join('')}
                </div>
                <div class="match-column">
                    <div class="match-column-title">🇻🇳 Tiếng Việt</div>
                    ${shuffledVi.map((w, i) => `
                        <div class="match-item vi-item" data-word="${w.en}" data-index="${i}" onclick="selectMatchItem(this, 'vi')">
                            ${w.vi}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    window.selectMatchItem = function(el, type) {
        if (isEvaluating || el.classList.contains('matched')) return;

        if (type === 'en') {
            if (window.soundEngine) window.soundEngine.playSfx('pop');
            container.querySelectorAll('.en-item').forEach(e => e.classList.remove('selected'));
            el.classList.add('selected');
            selectedEn = el.dataset.word;
            selectedEnIndex = el.dataset.index;
        } else if (type === 'vi') {
            if (!selectedEn) {
                if (window.soundEngine) window.soundEngine.playSfx('boing');
                return;
            }
            const isCorrect = (el.dataset.word === selectedEn);
            isEvaluating = true;
            
            if (isCorrect) {
                el.classList.add('correct', 'matched');
                const matchedEn = container.querySelector(`.en-item[data-index="${selectedEnIndex}"]`);
                if (matchedEn) matchedEn.classList.add('correct', 'matched');
                matchedCount++;
                gameState.currentQuestion = matchedCount;
                showFeedback(true);
                
                container.querySelectorAll('.en-item').forEach(e => e.classList.remove('selected'));
                selectedEn = null;
                selectedEnIndex = null;
                isEvaluating = false;

                if (matchedCount >= words.length) {
                    setTimeout(() => endGame(), 500);
                }
            } else {
                el.classList.add('wrong');
                showFeedback(false);
                setTimeout(() => {
                    el.classList.remove('wrong');
                    container.querySelectorAll('.en-item').forEach(e => e.classList.remove('selected'));
                    selectedEn = null;
                    selectedEnIndex = null;
                    isEvaluating = false;
                }, 500);
            }
            updateGameUI();
        }
    };

    startTimer();
    updateGameUI();
}

// ===== GAME 2: Spelling Bee =====
function initSpelling() {
    const container = document.getElementById('gameplayContainer');
    document.getElementById('gameplayTitle').textContent = '🐝 Đánh Vần';
    
    const words = getRandomWords(8, null, true);
    gameState.words = words;
    gameState.totalQuestions = words.length;
    gameState.timer = 120;
    let currentWordIndex = 0;
    let isProcessing = false;
    let autoNextTimer = null;

    function showSpellingWord(index) {
        if (autoNextTimer) {
            clearTimeout(autoNextTimer);
            autoNextTimer = null;
        }
        isProcessing = false;

        if (index >= words.length) {
            endGame();
            return;
        }

        const word = words[index];
        const rawChars = word.en.split('');
        let letterInputIndex = 0;

        const charElementsHtml = rawChars.map((char) => {
            if (char === ' ') {
                return `<span class="letter-space" title="Dấu cách">&nbsp;</span>`;
            } else if (char === '-') {
                return `<span class="letter-hyphen">-</span>`;
            } else if (!/[a-zA-Z]/i.test(char)) {
                return `<span class="letter-hyphen">${char}</span>`;
            } else {
                const idx = letterInputIndex++;
                return `
                    <input type="text" class="letter-box" maxlength="1" data-index="${idx}"
                        oninput="handleSpellingInput(event, ${idx})"
                        onkeydown="handleSpellingKeydown(event, ${idx})"
                        onkeyup="handleSpellingKeyup(event, ${idx})"
                        onclick="this.select()">
                `;
            }
        }).join('');

        container.innerHTML = `
            <div class="spelling-game">
                <div class="spelling-prompt">
                    <div class="spelling-emoji">${word.emoji || '⭐'}</div>
                    <div class="spelling-meaning">${word.vi}</div>
                    <div class="spelling-hint">"${word.example || ''}"</div>
                    <button class="spelling-listen-btn" onclick="speakWord('${word.en}')">
                        🔊 Nghe phát âm
                    </button>
                </div>

                <div class="spelling-input-area" id="spellingInputArea">
                    ${charElementsHtml}
                </div>

                <!-- Thanh điều khiển: Kiểm tra, Câu tiếp theo, Gợi ý, Làm lại -->
                <div class="spelling-action-bar">
                    <button type="button" class="spelling-act-btn btn-hint" onclick="hintSpellingLetter()" title="Gợi ý 1 chữ cái">
                        💡 Gợi Ý
                    </button>
                    <button type="button" class="spelling-act-btn btn-clear" onclick="clearSpellingInputs()" title="Xóa để gõ lại">
                        🔄 Làm Lại
                    </button>
                    <button type="button" class="spelling-act-btn btn-check" id="spellingCheckBtn" onclick="checkSpellingAnswer()" title="Kiểm tra đáp án (Phím Enter)">
                        ✅ Kiểm Tra
                    </button>
                    <button type="button" class="spelling-act-btn btn-next" id="spellingNextBtn" onclick="nextSpellingWord()" title="Bỏ qua hoặc chuyển sang từ tiếp theo">
                        Câu Tiếp ➔
                    </button>
                </div>

                <!-- Bàn phím ảo trên màn hình -->
                <div class="spelling-keyboard" id="spellingKeyboard">
                    ${'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(l => `
                        <button class="key-btn" onclick="pressKey('${l}')">${l}</button>
                    `).join('')}
                    <button class="key-btn backspace" onclick="pressBackspace()">⌫ Xóa</button>
                </div>
            </div>
        `;

        // Focus ô nhập đầu tiên
        setTimeout(() => {
            const firstInput = container.querySelector('.letter-box');
            if (firstInput) firstInput.focus();
        }, 100);

        // Tự động phát âm từ
        setTimeout(() => speakWord(word.en), 400);
    }

    // Kiểm tra đúng / sai đáp án
    window.checkSpellingAnswer = function(isAuto = false) {
        const inputs = Array.from(container.querySelectorAll('.letter-box'));
        if (inputs.length === 0 || isProcessing) return;

        const targetWord = words[currentWordIndex];
        if (!targetWord) return;

        const correct = targetWord.en.toLowerCase().replace(/[^a-z]/gi, '');
        const answer = inputs.map(inp => (inp.value || '').toLowerCase()).join('');

        // Nếu người chơi chủ động bấm nút "Kiểm Tra" nhưng chưa điền đủ
        if (!isAuto && answer.length < correct.length) {
            const firstEmpty = inputs.find(inp => !inp.value);
            if (firstEmpty) {
                firstEmpty.focus();
                firstEmpty.classList.add('wrong');
                setTimeout(() => firstEmpty.classList.remove('wrong'), 500);
            }
            if (window.soundEngine) window.soundEngine.playSfx('click');
            return;
        }

        isProcessing = true;

        if (answer === correct) {
            // Đúng đáp án
            inputs.forEach(inp => {
                inp.disabled = true;
                inp.classList.add('correct');
            });
            showFeedback(true);
            gameState.currentQuestion++;
            updateGameUI();

            // Đổi nút Tiếp Theo thành trạng thái chúc mừng
            const nextBtn = document.getElementById('spellingNextBtn');
            if (nextBtn) {
                nextBtn.classList.add('highlight-next');
                nextBtn.textContent = 'Câu Tiếp ➔ 🎉';
            }

            // Phát lại phát âm chuẩn của từ
            setTimeout(() => speakWord(targetWord.en), 300);

            // Tự động chuyển câu sau 1.3 giây nếu người chơi không tự bấm
            autoNextTimer = setTimeout(() => {
                nextSpellingWord(true);
            }, 1300);
        } else {
            // Sai đáp án
            inputs.forEach((inp, i) => {
                if (inp.value.toLowerCase() !== correct[i]) {
                    inp.classList.add('wrong');
                }
            });
            showFeedback(false);

            setTimeout(() => {
                inputs.forEach(inp => {
                    inp.classList.remove('wrong');
                });
                // Focus vào ô sai đầu tiên để sửa
                const firstWrong = inputs.find((inp, i) => inp.value.toLowerCase() !== correct[i]) || inputs[0];
                if (firstWrong) {
                    firstWrong.focus();
                    firstWrong.select();
                }
                isProcessing = false;
                updateGameUI();
            }, 700);
        }
    };

    // Chuyển sang câu tiếp theo
    window.nextSpellingWord = function(fromCorrect = false) {
        if (autoNextTimer) {
            clearTimeout(autoNextTimer);
            autoNextTimer = null;
        }

        // Nếu chuyển do người chơi bấm "Bỏ qua" khi chưa đúng
        if (!fromCorrect) {
            gameState.currentQuestion++;
            updateGameUI();
        }

        currentWordIndex++;
        showSpellingWord(currentWordIndex);
    };

    // Gợi ý 1 chữ cái còn thiếu hoặc sai
    window.hintSpellingLetter = function() {
        if (isProcessing) return;
        const targetWord = words[currentWordIndex];
        if (!targetWord) return;

        const correct = targetWord.en.toLowerCase().replace(/[^a-z]/gi, '');
        const inputs = Array.from(container.querySelectorAll('.letter-box'));

        for (let i = 0; i < inputs.length; i++) {
            if ((inputs[i].value || '').toLowerCase() !== correct[i]) {
                inputs[i].value = correct[i];
                inputs[i].classList.add('hint-glow');
                setTimeout(() => inputs[i].classList.remove('hint-glow'), 600);
                if (window.soundEngine) window.soundEngine.playSfx('pop');
                
                // Nếu là ô cuối thì kiểm tra luôn
                if (i === inputs.length - 1 || inputs.every(inp => inp.value)) {
                    setTimeout(() => checkSpellingAnswer(true), 200);
                } else if (i < inputs.length - 1) {
                    inputs[i + 1].focus();
                }
                break;
            }
        }
    };

    // Xóa tất cả để gõ lại từ đầu
    window.clearSpellingInputs = function() {
        if (isProcessing) return;
        const inputs = Array.from(container.querySelectorAll('.letter-box'));
        inputs.forEach(inp => {
            inp.value = '';
            inp.classList.remove('correct', 'wrong');
            inp.disabled = false;
        });
        if (inputs[0]) inputs[0].focus();
        if (window.soundEngine) window.soundEngine.playSfx('click');
    };

    window.handleSpellingKeydown = function(e, index) {
        const inputs = Array.from(container.querySelectorAll('.letter-box'));
        const input = inputs[index];
        if (!input) return;

        if (e.key === 'Enter') {
            e.preventDefault();
            checkSpellingAnswer();
        } else if (e.key === 'Backspace') {
            if (window.soundEngine) window.soundEngine.playSfx('click');
            if (index > 0 && !input.value) {
                e.preventDefault();
                inputs[index - 1].value = '';
                inputs[index - 1].focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    };

    window.handleSpellingKeyup = function(e, index) {
        // Hỗ trợ đồng bộ
    };

    window.handleSpellingInput = function(e, index) {
        const inputs = Array.from(container.querySelectorAll('.letter-box'));
        const input = inputs[index];
        if (!input || isProcessing) return;
        
        if (input.value) {
            if (window.soundEngine) window.soundEngine.playSfx('pop');
            input.value = input.value.slice(-1);
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }

        // Tự động kiểm tra nếu đã điền đủ các ô
        const allFilled = inputs.length > 0 && inputs.every(inp => inp.value);
        if (allFilled) {
            checkSpellingAnswer(true);
        }
    };

    window.pressKey = function(letter) {
        const inputs = Array.from(container.querySelectorAll('.letter-box'));
        const emptyInput = inputs.find(inp => !inp.value && !inp.disabled);
        if (emptyInput) {
            if (window.soundEngine) window.soundEngine.playSfx('pop');
            emptyInput.value = letter.toLowerCase();
            const idx = parseInt(emptyInput.dataset.index);
            const event = new Event('input');
            handleSpellingInput(event, idx);
        }
    };

    window.pressBackspace = function() {
        const inputs = Array.from(container.querySelectorAll('.letter-box'));
        const filledInputs = inputs.filter(inp => inp.value && !inp.disabled);
        if (filledInputs.length > 0) {
            if (window.soundEngine) window.soundEngine.playSfx('click');
            const lastFilled = filledInputs[filledInputs.length - 1];
            lastFilled.value = '';
            lastFilled.focus();
        }
    };

    showSpellingWord(0);
    startTimer();
    updateGameUI();
}

// ===== GAME 3: Word Scramble =====
function initScramble() {
    const container = document.getElementById('gameplayContainer');
    document.getElementById('gameplayTitle').textContent = '🧩 Xếp Chữ';
    
    const words = getRandomWords(8, null, true);
    gameState.words = words;
    gameState.totalQuestions = words.length;
    gameState.timer = 120;
    let currentWordIndex = 0;
    let selectedLetters = [];

    function showScrambleWord(index) {
        if (index >= words.length) {
            endGame();
            return;
        }

        const word = words[index];
        const cleanLetters = word.en.toUpperCase().replace(/[^A-Z]/g, '').split('');
        const scrambled = shuffle(cleanLetters);
        selectedLetters = [];

        // Hỗ trợ hiển thị từ ghép (ngăn cách bởi khoảng trắng)
        const subWords = word.en.toUpperCase().split(/\s+/);
        let slotCounter = 0;

        const slotsHtml = subWords.map((sw) => {
            const swSlots = sw.split('').map(() => {
                const sIdx = slotCounter++;
                return `<div class="scramble-slot" data-slot-index="${sIdx}"></div>`;
            }).join('');
            return `<div class="scramble-word-group">${swSlots}</div>`;
        }).join('<span class="scramble-word-gap">&nbsp;</span>');

        container.innerHTML = `
            <div class="scramble-game">
                <div class="scramble-prompt">
                    <div class="scramble-hint-emoji">${word.emoji || '⭐'}</div>
                    <div class="scramble-meaning">Gợi ý: <strong>${word.vi}</strong></div>
                </div>
                <div class="scramble-answer-area" id="scrambleAnswer">
                    ${slotsHtml}
                </div>
                <div class="scramble-letters" id="scrambleLetters">
                    ${scrambled.map((l, i) => `
                        <button class="scramble-letter" data-letter="${l}" data-index="${i}" onclick="selectScrambleLetter(this)">
                            ${l}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    let isScrambleLocked = false;

    window.selectScrambleLetter = function(btn) {
        if (isScrambleLocked || btn.classList.contains('used')) return;

        if (window.soundEngine) window.soundEngine.playSfx('pop');
        btn.classList.add('used');
        selectedLetters.push({ letter: btn.dataset.letter, index: btn.dataset.index });

        // Cập nhật ô đáp án
        const slots = container.querySelectorAll('.scramble-slot');
        const slot = slots[selectedLetters.length - 1];
        if (slot) {
            slot.textContent = btn.dataset.letter;
            slot.classList.add('filled');
            slot.onclick = function() {
                removeScrambleLetter(selectedLetters.length - 1);
            };
        }

        // Kiểm tra khi đã điền đủ các chữ cái
        const targetClean = words[currentWordIndex].en.toUpperCase().replace(/[^A-Z]/g, '');
        if (selectedLetters.length === targetClean.length) {
            isScrambleLocked = true;
            const answer = selectedLetters.map(s => s.letter).join('');

            if (answer === targetClean) {
                showFeedback(true);
                gameState.currentQuestion++;
                updateGameUI();
                currentWordIndex++;
                setTimeout(() => {
                    isScrambleLocked = false;
                    showScrambleWord(currentWordIndex);
                }, 800);
            } else {
                showFeedback(false);
                updateGameUI();
                // Reset khi sai
                setTimeout(() => {
                    selectedLetters = [];
                    const allBtns = container.querySelectorAll('.scramble-letter');
                    allBtns.forEach(b => b.classList.remove('used'));
                    const allSlots = container.querySelectorAll('.scramble-slot');
                    allSlots.forEach(s => {
                        s.textContent = '';
                        s.classList.remove('filled');
                    });
                    isScrambleLocked = false;
                }, 600);
            }
        }
    };

    window.removeScrambleLetter = function(slotIndex) {
        if (slotIndex < 0 || slotIndex >= selectedLetters.length) return;
        if (window.soundEngine) window.soundEngine.playSfx('boing');
        const removed = selectedLetters.splice(slotIndex);
        
        // Kích hoạt lại các nút chữ cái
        removed.forEach(item => {
            const btn = container.querySelector(`.scramble-letter[data-index="${item.index}"]`);
            if (btn) btn.classList.remove('used');
        });

        // Cập nhật lại các ô
        const slots = container.querySelectorAll('.scramble-slot');
        slots.forEach((slot, i) => {
            if (i < selectedLetters.length) {
                slot.textContent = selectedLetters[i].letter;
                slot.classList.add('filled');
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
            }
        });
    };

    showScrambleWord(0);
    startTimer();
    updateGameUI();
}

// ===== GAME 4: Flashcards =====
function initFlashcards() {
    const container = document.getElementById('gameplayContainer');
    document.getElementById('gameplayTitle').textContent = '🃏 Thẻ Ghi Nhớ';
    
    const words = getRandomWords(10, null, true);
    gameState.words = words;
    gameState.totalQuestions = words.length;
    gameState.timer = 300; // 5 minutes
    let currentCardIndex = 0;
    let isFlipped = false;

    // Hỗ trợ phím tắt cho giáo viên giảng dạy
    if (window.flashcardKeyHandler) {
        window.removeEventListener('keydown', window.flashcardKeyHandler);
    }
    window.flashcardKeyHandler = function(e) {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            flipCard();
        } else if (e.key === 'ArrowRight' || e.key === 'y' || e.key === 'Y') {
            e.preventDefault();
            flashcardAnswer(true);
        } else if (e.key === 'ArrowLeft' || e.key === 'n' || e.key === 'N') {
            e.preventDefault();
            flashcardAnswer(false);
        }
    };
    window.addEventListener('keydown', window.flashcardKeyHandler);

    function showCard(index) {
        if (index >= words.length) {
            endGame();
            return;
        }

        const word = words[index];
        isFlipped = false;

        container.innerHTML = `
            <div class="flashcard-game">
                <div class="flashcard-counter">Thẻ ${index + 1} / ${words.length}</div>
                <div class="flashcard-wrapper" onclick="flipCard()">
                    <div class="flashcard" id="flashcard">
                        <div class="flashcard-front">
                            <div class="fc-emoji">${word.emoji || '⭐'}</div>
                            <div class="fc-word">${word.en}</div>
                            <div class="fc-tap-hint">👆 Nhấn để lật thẻ</div>
                        </div>
                        <div class="flashcard-back">
                            <div class="fc-meaning">${word.vi}</div>
                            <div class="fc-phonetic">${word.phonetic || ''}</div>
                            <div class="fc-example">"${word.example || ''}"</div>
                        </div>
                    </div>
                </div>
                <div class="flashcard-controls">
                    <button class="fc-btn dont-know" onclick="flashcardAnswer(false)">
                        😅 Chưa nhớ
                    </button>
                    <button class="fc-btn know" onclick="flashcardAnswer(true)">
                        😊 Đã nhớ!
                    </button>
                </div>
                <div class="flashcard-shortcuts-hint">
                    ⌨️ Phím tắt giáo viên: <strong>[Phím Cách]</strong> Lật thẻ &nbsp;|&nbsp; <strong>[←]</strong> Chưa nhớ &nbsp;|&nbsp; <strong>[→]</strong> Đã nhớ
                </div>
            </div>
        `;
    }

    window.flipCard = function() {
        const card = document.getElementById('flashcard');
        if (card) {
            if (window.soundEngine) window.soundEngine.playSfx('whoosh');
            card.classList.toggle('flipped');
            isFlipped = !isFlipped;
            if (isFlipped) {
                speakWord(words[currentCardIndex].en);
            }
        }
    };

    window.flashcardAnswer = function(knew) {
        if (knew) {
            showFeedback(true);
        } else {
            if (window.soundEngine) window.soundEngine.playSfx('boing');
            if (typeof showToast === 'function') {
                showToast('🌱 Không sao hết! Xem lại một chút là nhớ liền nè!', 'info');
            }
        }
        gameState.currentQuestion = currentCardIndex + 1;
        updateGameUI();
        currentCardIndex++;
        showCard(currentCardIndex);
    };

    showCard(0);
    startTimer();
    updateGameUI();
}

// ===== GAME 5: Fill in the Blank =====
function initFillBlank() {
    const container = document.getElementById('gameplayContainer');
    document.getElementById('gameplayTitle').textContent = '📝 Điền Từ';
    
    let sourceQuestions = FILL_BLANK_DATA;
    if (gameState.customQuestions && gameState.customQuestions.length > 0) {
        sourceQuestions = gameState.customQuestions;
    }
    if (!sourceQuestions || sourceQuestions.length === 0) {
        sourceQuestions = [
            { sentence: 'The ___ is playing with a ball.', answer: 'cat', options: ['cat', 'dog', 'fish', 'bird'], hint: 'Con mèo 🐱' },
            { sentence: 'I eat an ___ every day.', answer: 'apple', options: ['apple', 'orange', 'banana', 'lemon'], hint: 'Quả táo 🍎' }
        ];
    }
    const questions = shuffle([...sourceQuestions]).slice(0, Math.min(8, sourceQuestions.length));
    gameState.totalQuestions = questions.length;
    gameState.timer = 120;
    let currentQIndex = 0;

    function showQuestion(index) {
        if (index >= questions.length) {
            endGame();
            return;
        }

        const q = questions[index];
        const options = shuffle([...q.options]);

        container.innerHTML = `
            <div class="fillblank-game">
                <div class="fillblank-sentence">
                    ${q.sentence.replace('___', `<span class="fillblank-blank" id="blankSlot">___</span>`)}
                </div>
                <div class="fillblank-hint">${q.hint}</div>
                <div class="fillblank-options">
                    ${options.map(opt => `
                        <button class="fillblank-option" onclick="selectFillBlankOption(this, '${opt}', '${q.answer}')">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    window.selectFillBlankOption = function(btn, selected, correct) {
        if (window.soundEngine) window.soundEngine.playSfx('pop');
        const options = container.querySelectorAll('.fillblank-option');
        options.forEach(o => o.style.pointerEvents = 'none');

        const blank = document.getElementById('blankSlot');
        if (blank) {
            blank.textContent = selected;
            blank.classList.add('filled');
        }

        const isCorrect = (selected.trim().toLowerCase() === correct.trim().toLowerCase());

        if (isCorrect) {
            btn.classList.add('correct');
            if (blank) blank.classList.add('correct');
            showFeedback(true);
        } else {
            btn.classList.add('wrong');
            if (blank) blank.classList.add('wrong');
            // Highlight correct answer
            options.forEach(o => {
                if (o.textContent.trim().toLowerCase() === correct.trim().toLowerCase()) {
                    o.classList.add('correct');
                }
            });
            showFeedback(false);
        }

        gameState.currentQuestion++;
        updateGameUI();
        currentQIndex++;
        setTimeout(() => showQuestion(currentQIndex), 1200);
    };

    showQuestion(0);
    startTimer();
    updateGameUI();
}

// ===== GAME 6: Word Catcher =====
function initWordCatcher() {
    const container = document.getElementById('gameplayContainer');
    document.getElementById('gameplayTitle').textContent = '🎮 Bắt Từ';
    
    gameState.totalQuestions = 10;
    gameState.timer = 60;
    let caughtCount = 0;
    let activeWords = [];

    function getAvailableWords() {
        if (gameState.customWords && gameState.customWords.length > 0) {
            return gameState.customWords;
        }
        const cat = gameState.category;
        if (cat && VOCABULARY[cat] && VOCABULARY[cat].length > 0) {
            return VOCABULARY[cat];
        }
        const allWords = [];
        Object.values(VOCABULARY).forEach(c => allWords.push(...c));
        return allWords;
    }

    function getTargetWord() {
        const words = getAvailableWords();
        return shuffle(words)[0];
    }

    function startCatcherGame() {
        let currentTarget = getTargetWord();
        const availableWords = getAvailableWords();

        function updateTargetPrompt() {
            const promptEl = container.querySelector('.wordcatcher-prompt');
            if (promptEl && currentTarget) {
                promptEl.innerHTML = `Bắt từ: <span class="target-word bounce-pop">${currentTarget.emoji || '⭐'} ${currentTarget.vi}</span>`;
            }
        }
        
        container.innerHTML = `
            <div class="wordcatcher-game" id="catcherArea">
                <div class="wordcatcher-prompt">
                    Bắt từ: <span class="target-word">${currentTarget.emoji || '⭐'} ${currentTarget.vi}</span>
                </div>
                <div class="wordcatcher-clouds">
                    <span class="cloud" style="top: 10px; left: 10%; animation-delay: 0s;">☁️</span>
                    <span class="cloud" style="top: 30px; left: 50%; animation-delay: 5s;">☁️</span>
                    <span class="cloud" style="top: 15px; left: 80%; animation-delay: 10s;">☁️</span>
                </div>
            </div>
        `;

        const catcherArea = document.getElementById('catcherArea');
        
        function spawnWord() {
            if (gameState.timer <= 0 || caughtCount >= gameState.totalQuestions) return;

            // Mix correct and wrong words
            const isTarget = Math.random() < 0.4;
            const otherWords = availableWords.filter(w => w.en.toLowerCase() !== currentTarget.en.toLowerCase());
            const word = isTarget || otherWords.length === 0 ? currentTarget : shuffle(otherWords)[0];
            
            const fallingWord = document.createElement('div');
            fallingWord.className = 'falling-word';
            fallingWord.textContent = word.en;

            // Tính toán vị trí left an toàn trong khung chơi
            const safeWidth = Math.max(300, (catcherArea ? catcherArea.clientWidth : 320) || 320);
            const maxLeft = Math.max(20, safeWidth - 110);
            const leftPos = Math.floor(10 + Math.random() * maxLeft);
            fallingWord.style.left = leftPos + 'px';
            fallingWord.style.setProperty('--fall-duration', (3 + Math.random() * 2.5) + 's');
            
            fallingWord.onclick = function() {
                if (gameState.timer <= 0 || caughtCount >= gameState.totalQuestions) return;
                if (fallingWord.classList.contains('clicked')) return;
                fallingWord.classList.add('clicked');

                if (word.en.toLowerCase() === currentTarget.en.toLowerCase()) {
                    fallingWord.classList.add('correct-catch');

                    // Floating score +10 popup
                    const floatScore = document.createElement('div');
                    floatScore.className = 'floating-score-float';
                    floatScore.textContent = '+10 ⭐';
                    floatScore.style.left = fallingWord.style.left;
                    floatScore.style.top = Math.max(10, fallingWord.offsetTop - 20) + 'px';
                    if (catcherArea) catcherArea.appendChild(floatScore);
                    setTimeout(() => { if (floatScore.parentNode) floatScore.remove(); }, 850);

                    showFeedback(true);
                    caughtCount++;
                    gameState.currentQuestion = caughtCount;
                    updateGameUI();

                    if (caughtCount >= gameState.totalQuestions) {
                        stopTimer();
                        setTimeout(() => endGame(), 500);
                    } else {
                        // Đổi từ vựng mục tiêu mới để trò chơi phong phú, cuốn hút
                        const nextPool = availableWords.filter(w => w.en.toLowerCase() !== currentTarget.en.toLowerCase());
                        currentTarget = nextPool.length > 0 ? shuffle(nextPool)[0] : getTargetWord();
                        updateTargetPrompt();
                    }
                } else {
                    fallingWord.classList.add('wrong-catch');

                    // Flop popup
                    const flopEl = document.createElement('div');
                    flopEl.className = 'floating-score-float';
                    flopEl.style.color = '#FF4757';
                    flopEl.textContent = 'Oops! 🍌';
                    flopEl.style.left = fallingWord.style.left;
                    flopEl.style.top = Math.max(10, fallingWord.offsetTop - 20) + 'px';
                    if (catcherArea) catcherArea.appendChild(flopEl);
                    setTimeout(() => { if (flopEl.parentNode) flopEl.remove(); }, 850);

                    showFeedback(false);
                    updateGameUI();
                }
                setTimeout(() => { if (fallingWord.parentNode) fallingWord.remove(); }, 400);
            };

            if (catcherArea) catcherArea.appendChild(fallingWord);
            activeWords.push(fallingWord);

            // Remove word when it falls off screen
            setTimeout(() => {
                if (fallingWord.parentNode) fallingWord.remove();
            }, 6000);
        }

        gameState.catcherInterval = setInterval(spawnWord, 1200);
        spawnWord(); // Spawn first word immediately
    }

    startCatcherGame();
    startTimer();
    updateGameUI();
}

// ===== Start Game Router =====
function startGame(gameId) {
    currentGame = gameId;
    resetGameState();
    showPage('gameplay');

    // Khởi động nhạc nền vui nhộn dành riêng cho từng trò chơi
    if (window.soundEngine && typeof window.soundEngine.startBgm === 'function') {
        window.soundEngine.startBgm(gameId);
    }
    if (typeof updateBgmUI === 'function' && window.soundEngine) {
        updateBgmUI(window.soundEngine.musicEnabled);
    }

    // Small delay for page transition
    setTimeout(() => {
        switch(gameId) {
            case 'wordmatch': initWordMatch(); break;
            case 'spelling': initSpelling(); break;
            case 'scramble': initScramble(); break;
            case 'flashcards': initFlashcards(); break;
            case 'fillblank': initFillBlank(); break;
            case 'wordcatcher': initWordCatcher(); break;
            default: initWordMatch();
        }
    }, 300);
}
