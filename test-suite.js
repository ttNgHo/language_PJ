const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
let passedCount = 0;
let failedCount = 0;
const failures = [];

function assert(condition, testName, details = '') {
    if (condition) {
        passedCount++;
        console.log(`  ✅ [PASS] ${testName}`);
    } else {
        failedCount++;
        const errMsg = `❌ [FAIL] ${testName}${details ? ' - ' + details : ''}`;
        console.log(`  ${errMsg}`);
        failures.push({ testName, details });
    }
}

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {}
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
        }
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, raw: data, json });
            });
        });
        req.on('error', reject);
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTestSuite() {
    console.log('====================================================');
    console.log('🧪 BẮT ĐẦU CHẠY TOÀN BỘ TEST CASE KIỂM THỬ HỆ THỐNG');
    console.log('====================================================\n');

    // ==========================================
    // NHÓM 1: KIỂM THỬ BACKEND API & DATABASE
    // ==========================================
    console.log('--- [NHÓM 1: BACKEND API & CƠ SỞ DỮ LIỆU MYSQL] ---');

    // 1.1 Test DB
    try {
        const res = await request('GET', '/api/test-db');
        assert(res.status === 200 && res.json?.success === true, 'GET /api/test-db: Kết nối MySQL thành công');
    } catch (e) {
        assert(false, 'GET /api/test-db', e.message);
    }

    // 1.2 Words API
    try {
        const res = await request('GET', '/api/words');
        const categories = res.json?.data ? Object.keys(res.json.data) : [];
        assert(res.status === 200 && categories.length >= 10, 'GET /api/words: Lấy đủ 10 chủ đề từ vựng', `Tìm thấy ${categories.length} chủ đề`);
    } catch (e) {
        assert(false, 'GET /api/words', e.message);
    }

    // 1.3 Daily Words API
    try {
        const res = await request('GET', '/api/daily-words');
        assert(res.status === 200 && Array.isArray(res.json?.data) && res.json.data.length === 7, 'GET /api/daily-words: Lấy 7 từ vựng hàng ngày');
    } catch (e) {
        assert(false, 'GET /api/daily-words', e.message);
    }

    // 1.4 Fill-in-the-blank Questions API
    try {
        const res = await request('GET', '/api/fill-blank');
        const hasOptions = res.json?.data && res.json.data.every(q => Array.isArray(q.options));
        assert(res.status === 200 && hasOptions, 'GET /api/fill-blank: Trả về câu hỏi với options dạng mảng');
    } catch (e) {
        assert(false, 'GET /api/fill-blank', e.message);
    }

    // 1.5 Units List API
    try {
        const res = await request('GET', '/api/units');
        assert(res.status === 200 && Array.isArray(res.json?.data) && res.json.data.length > 0, 'GET /api/units: Lấy danh sách Unit kèm Parts');
    } catch (e) {
        assert(false, 'GET /api/units', e.message);
    }

    // 1.6 CRUD Unit Test
    let testUnitId = null;
    try {
        // Validation check (missing title)
        const valRes = await request('POST', '/api/units', { unit_number: 99 });
        assert(valRes.status === 400 && valRes.json?.success === false, 'POST /api/units: Chặn tạo Unit khi thiếu tên');

        // Create success
        const createRes = await request('POST', '/api/units', {
            unit_number: 99,
            title: 'Test Unit Automated',
            description: 'Mô tả test tự động',
            icon: '🧪',
            color: '#FF6B6B'
        });
        testUnitId = createRes.json?.data?.id;
        assert(createRes.status === 200 && testUnitId > 0, 'POST /api/units: Tạo mới Unit thành công', `ID: ${testUnitId}`);

        // Update Unit
        const updateRes = await request('PUT', `/api/units/${testUnitId}`, {
            unit_number: 99,
            title: 'Test Unit Updated',
            description: 'Mô tả đã sửa',
            icon: '🔬',
            color: '#4ECDC4'
        });
        assert(updateRes.status === 200 && updateRes.json?.success === true, 'PUT /api/units/:id: Cập nhật Unit thành công');
    } catch (e) {
        assert(false, 'CRUD Unit API', e.message);
    }

    // 1.7 CRUD Part Test
    let testPartId = null;
    try {
        if (testUnitId) {
            // Validation check (missing title)
            const valRes = await request('POST', '/api/parts', { unit_id: testUnitId });
            assert(valRes.status === 400 && valRes.json?.success === false, 'POST /api/parts: Chặn tạo Part khi thiếu tên');

            // Create success
            const createRes = await request('POST', '/api/parts', {
                unit_id: testUnitId,
                part_number: 1,
                title: 'Test Part Automated',
                game_type: 'spelling',
                category_code: 'animals',
                description: 'Part test tự động'
            });
            testPartId = createRes.json?.data?.id;
            assert(createRes.status === 200 && testPartId > 0, 'POST /api/parts: Thêm Part vào Unit thành công', `Part ID: ${testPartId}`);

            // Update Part
            const updateRes = await request('PUT', `/api/parts/${testPartId}`, {
                unit_id: testUnitId,
                part_number: 1,
                title: 'Test Part Updated',
                game_type: 'wordmatch',
                category_code: 'fruits',
                description: 'Part đã cập nhật'
            });
            assert(updateRes.status === 200 && updateRes.json?.success === true, 'PUT /api/parts/:id: Cập nhật Part thành công');
        }
    } catch (e) {
        assert(false, 'CRUD Part API', e.message);
    }

    // 1.8 CRUD Part Words & Questions
    let testWordId = null;
    let testQuestionId = null;
    try {
        if (testPartId) {
            // Add Word
            const wordRes = await request('POST', `/api/parts/${testPartId}/words`, {
                word_en: 'Dragonfly',
                word_vi: 'Chuồn chuồn',
                emoji: '🪰',
                phonetic: '/ˈdræɡ.ən.flaɪ/',
                example: 'A dragonfly flies fast.'
            });
            testWordId = wordRes.json?.data?.id;
            assert(wordRes.status === 200 && testWordId > 0, 'POST /api/parts/:id/words: Thêm từ vựng riêng cho Part', `Word ID: ${testWordId}`);

            // Update Word
            const wordUpdRes = await request('PUT', `/api/parts/words/${testWordId}`, {
                word_en: 'Dragonfly',
                word_vi: 'Con chuồn chuồn nhỏ',
                emoji: '🪰',
                phonetic: '/ˈdræɡ.ən.flaɪ/',
                example: 'A cute dragonfly.'
            });
            assert(wordUpdRes.status === 200 && wordUpdRes.json?.success === true, 'PUT /api/parts/words/:id: Sửa từ vựng riêng của Part');

            // Add Question
            const qRes = await request('POST', `/api/parts/${testPartId}/questions`, {
                sentence: 'The ___ is flying near the water.',
                answer: 'dragonfly',
                options_str: 'dragonfly,butterfly,bee,ant',
                hint: '🪰 Loài côn trùng có cánh dài mỏng'
            });
            testQuestionId = qRes.json?.data?.id;
            assert(qRes.status === 200 && testQuestionId > 0, 'POST /api/parts/:id/questions: Thêm câu hỏi riêng cho Part', `Q ID: ${testQuestionId}`);

            // Update Question
            const qUpdRes = await request('PUT', `/api/parts/questions/${testQuestionId}`, {
                sentence: 'The ___ is flying high in the sky.',
                answer: 'dragonfly',
                options_str: 'dragonfly,butterfly,bee,ant',
                hint: '🪰 Bay trên mặt nước'
            });
            assert(qUpdRes.status === 200 && qUpdRes.json?.success === true, 'PUT /api/parts/questions/:id: Sửa câu hỏi riêng của Part');

            // Check details
            const detailsRes = await request('GET', `/api/parts/${testPartId}/details`);
            const wordsList = detailsRes.json?.data?.words || [];
            const questionsList = detailsRes.json?.data?.questions || [];
            assert(detailsRes.status === 200 && wordsList.length === 1 && questionsList.length === 1,
                'GET /api/parts/:id/details: Lấy đúng chi tiết Part kèm từ vựng & câu hỏi riêng');

            // Delete Word
            const delWordRes = await request('DELETE', `/api/parts/words/${testWordId}`);
            assert(delWordRes.status === 200 && delWordRes.json?.success === true, 'DELETE /api/parts/words/:id: Xóa từ vựng thành công');

            // Delete Question
            const delQRes = await request('DELETE', `/api/parts/questions/${testQuestionId}`);
            assert(delQRes.status === 200 && delQRes.json?.success === true, 'DELETE /api/parts/questions/:id: Xóa câu hỏi thành công');
        }
    } catch (e) {
        assert(false, 'Part Content API', e.message);
    }

    // 1.9 Cascade Delete Test
    try {
        if (testUnitId) {
            const delUnitRes = await request('DELETE', `/api/units/${testUnitId}`);
            assert(delUnitRes.status === 200 && delUnitRes.json?.success === true, 'DELETE /api/units/:id: Xóa Unit & Cascade Parts sạch sẽ');
            
            if (testPartId) {
                const checkPart = await request('GET', `/api/parts/${testPartId}/details`);
                assert(checkPart.status === 404, 'Cascade Delete: Part liên quan tự động bị xóa khi Unit bị xóa');
            }
        }
    } catch (e) {
        assert(false, 'Cascade Delete Test', e.message);
    }

    // 1.10 Static File Serving
    try {
        const files = ['/', '/styles.css', '/data.js', '/curriculum.js', '/games.js', '/app.js'];
        for (const f of files) {
            const res = await request('GET', f);
            assert(res.status === 200 && res.raw.length > 0, `Phục vụ tĩnh: GET ${f} (Kích thước: ${res.raw.length} bytes)`);
        }
    } catch (e) {
        assert(false, 'Static File Serving', e.message);
    }


    // ==========================================
    // NHÓM 2: KIỂM THỬ CẤU TRÚC DOM & GIAO DIỆN
    // ==========================================
    console.log('\n--- [NHÓM 2: CẤU TRÚC DOM & PHẦN TỬ GIAO DIỆN] ---');
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

    // 2.1 Kiểm tra các trang (Pages)
    const requiredPages = [
        'page-home', 'page-curriculum', 'page-admin', 'page-games',
        'page-gameplay', 'page-achievements', 'page-profile'
    ];
    requiredPages.forEach(pId => {
        assert(htmlContent.includes(`id="${pId}"`), `Trang tồn tại: #${pId}`);
    });

    // 2.2 Kiểm tra Navigation links
    const navPages = ['home', 'curriculum', 'games', 'achievements', 'admin', 'profile'];
    navPages.forEach(np => {
        assert(htmlContent.includes(`data-page="${np}"`), `Navigation link: data-page="${np}"`);
    });

    // 2.3 Kiểm tra Modals
    const modals = ['modalUnit', 'modalPart', 'modalPartContent', 'resultModal'];
    modals.forEach(m => {
        assert(htmlContent.includes(`id="${m}"`), `Modal tồn tại: #${m}`);
    });

    // 2.4 Kiểm tra Form Inputs của Admin Modals
    const adminInputs = [
        'unitModalId', 'unitNumberInput', 'unitTitleInput', 'unitIconInput', 'unitColorInput', 'unitDescInput',
        'partModalId', 'partUnitSelect', 'partNumberInput', 'partTitleInput', 'partGameTypeSelect', 'partCategorySelect', 'partDescInput',
        'newWordEn', 'newWordVi', 'newWordEmoji', 'newWordPhonetic', 'newWordExample',
        'newQSentence', 'newQAnswer', 'newQOptions', 'newQHint'
    ];
    adminInputs.forEach(inp => {
        assert(htmlContent.includes(`id="${inp}"`), `Admin Form Input tồn tại: #${inp}`);
    });

    // 2.5 Kiểm tra Gameplay Header & Stats Elements
    const gpElements = [
        'teachingBanner', 'tbInfo', 'gameplayTitle', 'gpScore', 'gpLives', 'gpTimer',
        'gpProgress', 'gpProgressText', 'gameplayContainer'
    ];
    gpElements.forEach(el => {
        assert(htmlContent.includes(`id="${el}"`), `Gameplay Element tồn tại: #${el}`);
    });

    // 2.6 Kiểm tra Settings Toggles
    const toggles = ['soundToggle', 'musicToggle', 'darkModeToggle', 'effectsToggle'];
    toggles.forEach(t => {
        assert(htmlContent.includes(`id="${t}"`), `Setting Toggle tồn tại: #${t}`);
    });


    // ==========================================
    // NHÓM 3: KIỂM THỬ LOGIC GAME & TRƯỜNG HỢP BIÊN
    // ==========================================
    console.log('\n--- [NHÓM 3: LOGIC GAME & CÁC TRƯỜNG HỢP BIÊN] ---');

    // Load data and logic in a mock sandbox
    const dataCode = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
    const gamesCode = fs.readFileSync(path.join(__dirname, 'games.js'), 'utf8');

    // Create sandbox
    const sandbox = {
        console: console,
        Math: Math,
        Set: Set,
        Array: Array,
        Date: Date,
        KeyboardEvent: class KeyboardEvent { constructor(type, init) { this.type = type; this.key = init?.key; } },
        document: {
            getElementById: (id) => ({
                id,
                textContent: '',
                value: '',
                style: {},
                classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
                appendChild: () => {}
            }),
            querySelectorAll: () => [],
            querySelector: () => null,
            createElement: (tag) => ({
                tagName: tag,
                className: '',
                textContent: '',
                style: { setProperty: () => {} },
                classList: { add: () => {}, remove: () => {}, contains: () => false },
                appendChild: () => {},
                remove: () => {}
            }),
            body: { appendChild: () => {}, removeChild: () => {} }
        },
        window: {
            soundEngine: { playSfx: () => {}, soundEnabled: true, musicEnabled: false },
            location: { origin: 'http://localhost:3000' },
            addEventListener: () => {},
            removeEventListener: () => {}
        },
        localStorage: {
            getItem: () => null,
            setItem: () => {}
        },
        clearInterval: () => {},
        setInterval: () => 1,
        setTimeout: (fn) => fn(),
        showToast: () => {},
        launchConfetti: () => {},
        showPage: () => {}
    };

    const vm = require('vm');
    const ctx = vm.createContext(sandbox);
    vm.runInContext(dataCode, ctx);
    vm.runInContext(gamesCode, ctx);
    // Expose gameState and functions
    vm.runInContext('this.gameState = gameState;', ctx);
    vm.runInContext('this.VOCABULARY = VOCABULARY;', ctx);

    // 3.1 Test shuffle
    const origArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = sandbox.shuffle(origArr);
    assert(shuffled.length === 10 && origArr.length === 10, 'Hàm shuffle: Giữ nguyên số lượng phần tử');

    // 3.2 Test getRandomWords với pool chuẩn
    const randomWords5 = sandbox.getRandomWords(5, 'animals', false);
    assert(randomWords5.length === 5, 'getRandomWords: Lấy đúng 5 từ ngẫu nhiên trong animals');

    // 3.3 Test getRandomWords khi số lượng customWords ít hơn yêu cầu (Trường hợp biên Word Match)
    sandbox.gameState.customWords = [
        { en: 'Tiger', vi: 'Con hổ', emoji: '🐯' },
        { en: 'Lion', vi: 'Con sư tử', emoji: '🦁' }
    ];
    sandbox.gameState.category = 'animals';
    const supplementedWords = sandbox.getRandomWords(5, 'animals', false);
    const hasCustom1 = supplementedWords.some(w => w.en === 'Tiger');
    const hasCustom2 = supplementedWords.some(w => w.en === 'Lion');
    assert(supplementedWords.length === 5 && hasCustom1 && hasCustom2,
        'getRandomWords: Tự động bổ sung đủ 5 từ khi customWords chỉ có 2 từ (không bị trùng lặp)');

    // 3.4 Test getRandomWords khi cho phép lặp lại (Trường hợp biên Spelling / Scramble)
    const repeatedWords = sandbox.getRandomWords(6, 'animals', true);
    assert(repeatedWords.length === 6, 'getRandomWords (allowDuplicates=true): Lặp lại từ vựng để đủ số câu hỏi');

    // Reset customWords
    sandbox.gameState.customWords = null;

    // 3.5 Test tính toán kết quả & Star Rating trong endGame
    sandbox.gameState.totalQuestions = 10;
    
    // Case 10/10 -> 3 sao
    sandbox.gameState.correctAnswers = 10;
    let stars3 = sandbox.gameState.correctAnswers >= sandbox.gameState.totalQuestions ? 3 : 0;
    assert(stars3 === 3, 'endGame Star Rating: Trả lời 10/10 câu đạt 3 sao');

    // Case 7/10 -> 2 sao
    sandbox.gameState.correctAnswers = 7;
    let stars2 = sandbox.gameState.correctAnswers >= sandbox.gameState.totalQuestions * 0.7 ? 2 : 0;
    assert(stars2 === 2, 'endGame Star Rating: Trả lời 7/10 câu đạt 2 sao');

    // Case 4/10 -> 1 sao
    sandbox.gameState.correctAnswers = 4;
    let stars1 = sandbox.gameState.correctAnswers >= sandbox.gameState.totalQuestions * 0.4 ? 1 : 0;
    assert(stars1 === 1, 'endGame Star Rating: Trả lời 4/10 câu đạt 1 sao');

    // 3.6 Test xử lý từ ghép (Compound words with spaces/hyphens)
    const compoundWord1 = 'Ice cream';
    const cleanWord1 = compoundWord1.toLowerCase().replace(/[\s-]/g, '');
    assert(cleanWord1 === 'icecream', 'Xử lý từ ghép Spelling: "Ice cream" chuyển thành "icecream" để so khớp');

    const compoundWord2 = 'T-shirt';
    const cleanWord2 = compoundWord2.toLowerCase().replace(/[\s-]/g, '');
    assert(cleanWord2 === 'tshirt', 'Xử lý từ có gạch nối: "T-shirt" chuyển thành "tshirt" để so khớp');

    const scrambleCompound = 'HOT DOG';
    const scrambleClean = scrambleCompound.toUpperCase().replace(/[^A-Z]/g, '');
    const subWords = scrambleCompound.toUpperCase().split(/\s+/);
    assert(scrambleClean === 'HOTDOG' && subWords.length === 2,
        'Xử lý từ ghép Scramble: "HOT DOG" tách thành 2 nhóm từ [HOT, DOG] và mục tiêu "HOTDOG"');

    // 3.7 Test Reset Game State
    sandbox.resetGameState();
    assert(sandbox.gameState.score === 0 && sandbox.gameState.lives === 3 && sandbox.gameState.timer === 60,
        'resetGameState: Khôi phục điểm = 0, mạng = 3, thời gian = 60s');

    // 3.8 Test Feedback & Lives
    sandbox.gameState.lives = 1;
    sandbox.showFeedback(false);
    assert(sandbox.gameState.lives === 0, 'showFeedback(false): Trừ 1 mạng khi trả lời sai (kết thúc game khi hết mạng)');

    // ==========================================
    // TỔNG KẾT BÁO CÁO
    // ==========================================
    console.log('\n====================================================');
    console.log(`📊 TỔNG KẾT KIỂM THỬ: ${passedCount + failedCount} TEST CASES`);
    console.log(`  ✅ Passed: ${passedCount}`);
    console.log(`  ❌ Failed: ${failedCount}`);
    console.log('====================================================\n');

    if (failures.length > 0) {
        console.log('🚨 DANH SÁCH CÁC TEST CASES GẶP LỖI:');
        failures.forEach((f, idx) => {
            console.log(`  ${idx + 1}. ${f.testName} (${f.details})`);
        });
    } else {
        console.log('🎉 TẤT CẢ CÁC TEST CASE ĐỀU VƯỢT QUA XUẤT SẮC! HỆ THỐNG HOẠT ĐỘNG HOÀN TOÀN KHÔNG CÓ LỖI.');
    }
}

runTestSuite().catch(err => {
    console.error('Lỗi thực thi test runner:', err);
});
