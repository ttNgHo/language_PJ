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

function getRandomWords(count, category) {
    const cat = category || gameState.category;
    let words = [];
    if (cat === 'all') {
        Object.values(VOCABULARY).forEach(w => words.push(...w));
    } else if (VOCABULARY[cat]) {
        words = [...VOCABULARY[cat]];
    } else {
        Object.values(VOCABULARY).forEach(w => words.push(...w));
    }
    return shuffle(words).slice(0, count);
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
}

function resetGameState() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.currentQuestion = 0;
    gameState.timer = 60;
    gameState.correctAnswers = 0;
    gameState.startTime = Date.now();
    gameState.words = [];
    stopTimer();
}

function showFeedback(correct) {
    const overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    overlay.textContent = correct ? '✅' : '❌';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 800);

    if (correct) {
        gameState.score += 10;
        gameState.correctAnswers++;
        showToast('Đúng rồi! +10 ⭐', 'success');
    } else {
        gameState.lives--;
        showToast('Sai rồi! Thử lại nhé! 💪', 'error');
        if (gameState.lives <= 0) {
            setTimeout(() => endGame(), 500);
            return;
        }
    }
    updateGameUI();
}

function endGame() {
    stopTimer();
    const timeTaken = Math.round((Date.now() - gameState.startTime) / 1000);
    const totalStars = gameState.correctAnswers >= gameState.totalQuestions ? 3 :
                       gameState.correctAnswers >= gameState.totalQuestions * 0.7 ? 2 :
                       gameState.correctAnswers >= gameState.totalQuestions * 0.4 ? 1 : 0;

    // Update result modal
    const isGreat = totalStars >= 2;
    document.getElementById('resultEmoji').textContent = isGreat ? '🎉' : '😊';
    document.getElementById('resultTitle').textContent = isGreat ? 'Tuyệt Vời!' : 'Cố Gắng Hơn Nhé!';
    document.getElementById('resultMessage').textContent = isGreat ?
        `Bạn đã hoàn thành xuất sắc! Giỏi lắm!` :
        'Đừng nản chí, hãy thử lại nhé!';
    document.getElementById('resultScore').textContent = gameState.score;
    document.getElementById('resultCorrect').textContent = `${gameState.correctAnswers}/${gameState.totalQuestions}`;
    document.getElementById('resultTime').textContent = `${timeTaken}s`;

    // Show stars
    const starsContainer = document.getElementById('resultStars');
    starsContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const star = document.createElement('span');
        star.className = 'result-star';
        star.textContent = i < totalStars ? '⭐' : '☆';
        star.style.animationDelay = `${0.2 + i * 0.2}s`;
        starsContainer.appendChild(star);
    }

    // Update total stars
    const currentStars = parseInt(localStorage.getItem('totalStars') || '0');
    localStorage.setItem('totalStars', currentStars + gameState.score);
    document.getElementById('totalStars').textContent = currentStars + gameState.score;

    // Show modal with confetti
    document.getElementById('resultModal').classList.add('show');
    if (isGreat) launchConfetti();
}

function replayGame() {
    document.getElementById('resultModal').classList.remove('show');
    if (currentGame) startGame(currentGame);
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
    let matchedCount = 0;

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
        if (el.classList.contains('matched')) return;

        if (type === 'en') {
            document.querySelectorAll('.en-item').forEach(e => e.classList.remove('selected'));
            el.classList.add('selected');
            selectedEn = el.dataset.word;
        } else if (type === 'vi' && selectedEn) {
            const isCorrect = el.dataset.word === selectedEn;
            
            if (isCorrect) {
                el.classList.add('correct', 'matched');
                document.querySelector(`.en-item[data-word="${selectedEn}"]`).classList.add('correct', 'matched');
                matchedCount++;
                gameState.currentQuestion = matchedCount;
                showFeedback(true);
                
                if (matchedCount >= words.length) {
                    setTimeout(() => endGame(), 500);
                }
            } else {
                el.classList.add('wrong');
                setTimeout(() => el.classList.remove('wrong'), 500);
                showFeedback(false);
            }
            
            document.querySelectorAll('.en-item').forEach(e => e.classList.remove('selected'));
            selectedEn = null;
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
    
    const words = getRandomWords(8);
    gameState.words = words;
    gameState.totalQuestions = words.length;
    gameState.timer = 120;
    let currentWordIndex = 0;

    function showSpellingWord(index) {
        if (index >= words.length) {
            endGame();
            return;
        }

        const word = words[index];
        const letters = word.en.toLowerCase().split('');

        container.innerHTML = `
            <div class="spelling-game">
                <div class="spelling-prompt">
                    <div class="spelling-emoji">${word.emoji}</div>
                    <div class="spelling-meaning">${word.vi}</div>
                    <div class="spelling-hint">"${word.example}"</div>
                    <button class="spelling-listen-btn" onclick="speakWord('${word.en}')">
                        🔊 Nghe phát âm
                    </button>
                </div>
                <div class="spelling-input-area" id="spellingInputArea">
                    ${letters.map((_, i) => `
                        <input type="text" class="letter-box" maxlength="1" data-index="${i}"
                            onkeyup="handleSpellingInput(event, ${i}, ${letters.length})"
                            onclick="this.select()">
                    `).join('')}
                </div>
                <div class="spelling-keyboard" id="spellingKeyboard">
                    ${'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map(l => `
                        <button class="key-btn" onclick="pressKey('${l}')">${l}</button>
                    `).join('')}
                    <button class="key-btn backspace" onclick="pressBackspace()">⌫ Xóa</button>
                </div>
            </div>
        `;

        // Focus first input
        setTimeout(() => {
            const firstInput = container.querySelector('.letter-box');
            if (firstInput) firstInput.focus();
        }, 100);

        // Speak the word
        setTimeout(() => speakWord(word.en), 500);
    }

    window.handleSpellingInput = function(e, index, total) {
        const inputs = container.querySelectorAll('.letter-box');
        const input = inputs[index];
        
        if (e.key === 'Backspace' && index > 0 && !input.value) {
            inputs[index - 1].focus();
            inputs[index - 1].select();
            return;
        }

        if (input.value && index < total - 1) {
            inputs[index + 1].focus();
        }

        // Check if all filled
        const allFilled = Array.from(inputs).every(inp => inp.value);
        if (allFilled) {
            const answer = Array.from(inputs).map(inp => inp.value.toLowerCase()).join('');
            const correct = words[currentWordIndex].en.toLowerCase();
            
            if (answer === correct) {
                inputs.forEach(inp => inp.classList.add('correct'));
                showFeedback(true);
                gameState.currentQuestion++;
                updateGameUI();
                currentWordIndex++;
                setTimeout(() => showSpellingWord(currentWordIndex), 1000);
            } else {
                inputs.forEach(inp => inp.classList.add('wrong'));
                showFeedback(false);
                setTimeout(() => {
                    inputs.forEach(inp => {
                        inp.classList.remove('wrong');
                        inp.value = '';
                    });
                    inputs[0].focus();
                    updateGameUI();
                }, 800);
            }
        }
    };

    window.pressKey = function(letter) {
        const inputs = container.querySelectorAll('.letter-box');
        const emptyInput = Array.from(inputs).find(inp => !inp.value);
        if (emptyInput) {
            emptyInput.value = letter.toLowerCase();
            const idx = parseInt(emptyInput.dataset.index);
            const event = new KeyboardEvent('keyup', { key: letter });
            handleSpellingInput(event, idx, inputs.length);
        }
    };

    window.pressBackspace = function() {
        const inputs = container.querySelectorAll('.letter-box');
        const filledInputs = Array.from(inputs).filter(inp => inp.value);
        if (filledInputs.length > 0) {
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
    
    const words = getRandomWords(8);
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
        const letters = word.en.toUpperCase().split('');
        const scrambled = shuffle(letters);
        selectedLetters = [];

        container.innerHTML = `
            <div class="scramble-game">
                <div class="scramble-prompt">
                    <div class="scramble-hint-emoji">${word.emoji}</div>
                    <div class="scramble-meaning">Gợi ý: <strong>${word.vi}</strong></div>
                </div>
                <div class="scramble-answer-area" id="scrambleAnswer">
                    ${letters.map(() => `<div class="scramble-slot"></div>`).join('')}
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

    window.selectScrambleLetter = function(btn) {
        if (btn.classList.contains('used')) return;

        btn.classList.add('used');
        selectedLetters.push({ letter: btn.dataset.letter, index: btn.dataset.index });

        // Update answer slots
        const slots = container.querySelectorAll('.scramble-slot');
        const slot = slots[selectedLetters.length - 1];
        slot.textContent = btn.dataset.letter;
        slot.classList.add('filled');
        slot.onclick = function() {
            removeScrambleLetter(selectedLetters.length - 1);
        };

        // Check if complete
        if (selectedLetters.length === words[currentWordIndex].en.length) {
            const answer = selectedLetters.map(s => s.letter).join('');
            const correct = words[currentWordIndex].en.toUpperCase();

            if (answer === correct) {
                showFeedback(true);
                gameState.currentQuestion++;
                updateGameUI();
                currentWordIndex++;
                setTimeout(() => showScrambleWord(currentWordIndex), 800);
            } else {
                showFeedback(false);
                updateGameUI();
                // Reset
                setTimeout(() => {
                    selectedLetters = [];
                    const allBtns = container.querySelectorAll('.scramble-letter');
                    allBtns.forEach(b => b.classList.remove('used'));
                    const allSlots = container.querySelectorAll('.scramble-slot');
                    allSlots.forEach(s => {
                        s.textContent = '';
                        s.classList.remove('filled');
                    });
                }, 600);
            }
        }
    };

    window.removeScrambleLetter = function(slotIndex) {
        if (slotIndex < 0 || slotIndex >= selectedLetters.length) return;
        
        const removed = selectedLetters.splice(slotIndex);
        
        // Re-enable buttons
        removed.forEach(item => {
            const btn = container.querySelector(`.scramble-letter[data-index="${item.index}"]`);
            if (btn) btn.classList.remove('used');
        });

        // Update slots
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
    
    const words = getRandomWords(10);
    gameState.words = words;
    gameState.totalQuestions = words.length;
    gameState.timer = 300; // 5 minutes
    let currentCardIndex = 0;
    let isFlipped = false;

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
                            <div class="fc-emoji">${word.emoji}</div>
                            <div class="fc-word">${word.en}</div>
                            <div class="fc-tap-hint">👆 Nhấn để lật thẻ</div>
                        </div>
                        <div class="flashcard-back">
                            <div class="fc-meaning">${word.vi}</div>
                            <div class="fc-phonetic">${word.phonetic}</div>
                            <div class="fc-example">"${word.example}"</div>
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
            </div>
        `;
    }

    window.flipCard = function() {
        const card = document.getElementById('flashcard');
        if (card) {
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
            gameState.currentQuestion++; // Still count but no score
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
    
    const questions = shuffle([...FILL_BLANK_DATA]).slice(0, 8);
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
        const options = container.querySelectorAll('.fillblank-option');
        options.forEach(o => o.style.pointerEvents = 'none');

        const blank = document.getElementById('blankSlot');
        blank.textContent = selected;
        blank.classList.add('filled');

        if (selected === correct) {
            btn.classList.add('correct');
            blank.classList.add('correct');
            showFeedback(true);
        } else {
            btn.classList.add('wrong');
            blank.classList.add('wrong');
            // Highlight correct answer
            options.forEach(o => {
                if (o.textContent.trim() === correct) o.classList.add('correct');
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
    let spawnInterval = null;
    let activeWords = [];

    function getTargetWord() {
        const allWords = [];
        Object.values(VOCABULARY).forEach(cat => allWords.push(...cat));
        return shuffle(allWords)[0];
    }

    function startCatcherGame() {
        const targetWord = getTargetWord();
        
        container.innerHTML = `
            <div class="wordcatcher-game" id="catcherArea">
                <div class="wordcatcher-prompt">
                    Bắt từ: <span class="target-word">${targetWord.emoji} ${targetWord.vi}</span>
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

            const allWords = [];
            Object.values(VOCABULARY).forEach(cat => allWords.push(...cat));
            
            // Mix correct and wrong words
            const isTarget = Math.random() < 0.3;
            const word = isTarget ? targetWord : shuffle(allWords.filter(w => w.en !== targetWord.en))[0];
            
            const fallingWord = document.createElement('div');
            fallingWord.className = 'falling-word';
            fallingWord.textContent = word.en;
            fallingWord.style.left = Math.random() * (catcherArea.clientWidth - 120) + 'px';
            fallingWord.style.setProperty('--fall-duration', (3 + Math.random() * 3) + 's');
            
            fallingWord.onclick = function() {
                if (word.en === targetWord.en) {
                    fallingWord.classList.add('correct-catch');
                    showFeedback(true);
                    caughtCount++;
                    gameState.currentQuestion = caughtCount;
                    updateGameUI();

                    if (caughtCount >= gameState.totalQuestions) {
                        clearInterval(spawnInterval);
                        setTimeout(() => endGame(), 500);
                    }
                } else {
                    fallingWord.classList.add('wrong-catch');
                    showFeedback(false);
                    updateGameUI();
                }
                setTimeout(() => fallingWord.remove(), 500);
            };

            catcherArea.appendChild(fallingWord);
            activeWords.push(fallingWord);

            // Remove word when it falls off screen
            setTimeout(() => {
                if (fallingWord.parentNode) fallingWord.remove();
            }, 6000);
        }

        spawnInterval = setInterval(spawnWord, 1200);
        spawnWord(); // Spawn first word immediately
    }

    startCatcherGame();
    startTimer();
    updateGameUI();

    // Clean up on game end
    const origEndGame = window.endGame;
    // Will be cleaned up when navigating away
}

// ===== Start Game Router =====
function startGame(gameId) {
    currentGame = gameId;
    resetGameState();
    showPage('gameplay');

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
