const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });


const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Hỗ trợ body dạng JSON

// Phục vụ toàn bộ giao diện Frontend (HTML, CSS, JS, hình ảnh) từ thư mục gốc
app.use(express.static(path.join(__dirname, '..')));

// Cấu hình kết nối MySQL (Connection Pool)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'language',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// API kiểm tra kết nối
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, message: 'Kết nối database thành công!', data: rows });
  } catch (error) {
    console.error('Lỗi kết nối MySQL:', error);
    res.status(500).json({ success: false, message: 'Lỗi kết nối database', error: error.message });
  }
});

// ==========================================
// 🏆 USER STATS & ACHIEVEMENTS TABLE & APIS
// ==========================================

async function initUserStatsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) DEFAULT 'Bé Yêu',
        age INT DEFAULT 7,
        avatar VARCHAR(20) DEFAULT '🦊',
        total_stars INT DEFAULT 0,
        games_played INT DEFAULT 0,
        words_learned INT DEFAULT 0,
        streak INT DEFAULT 1,
        last_active_date DATE DEFAULT NULL,
        unlocked_badges TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
    if (rows.length === 0) {
      await pool.query(`
        INSERT INTO user_stats (id, name, age, avatar, total_stars, games_played, words_learned, streak, last_active_date, unlocked_badges)
        VALUES (1, 'Bé Yêu', 7, '🦊', 0, 0, 0, 1, CURDATE(), '[]')
      `);
      console.log('✅ Khởi tạo thành công bản ghi thành tích mặc định trong user_stats');
    }
  } catch (err) {
    console.error('Lỗi khởi tạo bảng user_stats:', err.message);
  }
}
initUserStatsTable();

// Lấy thông tin thành tích & hồ sơ người dùng
app.get('/api/user-stats', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
    if (rows.length === 0) {
      await initUserStatsTable();
      const [newRows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
      return res.json({ success: true, data: newRows[0] });
    }
    
    const user = rows[0];
    
    // Kiểm tra tính liên tục của chuỗi ngày học (streak)
    if (user.last_active_date) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const lastDate = new Date(user.last_active_date);
      const today = new Date(todayStr);
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        user.streak = 1;
        await pool.query('UPDATE user_stats SET streak = 1 WHERE id = 1');
      }
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Lỗi khi lấy user_stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ghi nhận thành tích sau mỗi ván chơi game (Cộng dồn vào MySQL)
app.post('/api/user-stats/record-game', async (req, res) => {
  try {
    const score = Math.max(0, parseInt(req.body.score) || 0);
    const wordsCount = Math.max(0, parseInt(req.body.wordsCount) || 0);

    const [rows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
    let user = rows[0];
    if (!user) {
      await initUserStatsTable();
      const [fresh] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
      user = fresh[0];
    }

    let newStreak = user.streak || 1;
    const todayStr = new Date().toISOString().slice(0, 10);
    if (user.last_active_date) {
      const lastDate = new Date(user.last_active_date);
      const today = new Date(todayStr);
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const newStars = (user.total_stars || 0) + score;
    const newGames = (user.games_played || 0) + 1;
    const newWords = (user.words_learned || 0) + wordsCount;

    await pool.query(`
      UPDATE user_stats 
      SET total_stars = ?, games_played = ?, words_learned = ?, streak = ?, last_active_date = CURDATE()
      WHERE id = 1
    `, [newStars, newGames, newWords, newStreak]);

    const [updatedRows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
    res.json({
      success: true,
      message: 'Đã lưu thành tích vào cơ sở dữ liệu MySQL thành công!',
      data: updatedRows[0]
    });
  } catch (error) {
    console.error('Lỗi khi lưu thành tích game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cập nhật hồ sơ người dùng (Tên, tuổi, avatar)
app.put('/api/user-stats/profile', async (req, res) => {
  try {
    const { name, age, avatar } = req.body;
    await pool.query(`
      UPDATE user_stats
      SET name = COALESCE(?, name),
          age = COALESCE(?, age),
          avatar = COALESCE(?, avatar)
      WHERE id = 1
    `, [name ? name.trim() : null, age ? parseInt(age) : null, avatar ? avatar.trim() : null]);

    const [updatedRows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
    res.json({
      success: true,
      message: 'Đã lưu hồ sơ vào cơ sở dữ liệu MySQL thành công!',
      data: updatedRows[0]
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Đặt lại thành tích (Reset)
app.post('/api/user-stats/reset', async (req, res) => {
  try {
    await pool.query(`
      UPDATE user_stats
      SET total_stars = 0, games_played = 0, words_learned = 0, streak = 1, last_active_date = CURDATE()
      WHERE id = 1
    `);
    const [updatedRows] = await pool.query('SELECT * FROM user_stats WHERE id = 1');
    res.json({
      success: true,
      message: 'Đã đặt lại thành tích về 0 trong cơ sở dữ liệu!',
      data: updatedRows[0]
    });
  } catch (error) {
    console.error('Lỗi reset user_stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 🤖 GEMINI AI & PHONETICS ASSISTANT APIS
// ==========================================

// Thuật toán tính khoảng cách chỉnh sửa Levenshtein để phát hiện gõ sai chính tả
function getLevenshteinDistance(a, b) {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Bộ quy tắc sinh ký hiệu phiên âm quốc tế IPA gần đúng cho các từ tiếng Anh
function generateEnglishIpa(word) {
  let w = word.toLowerCase().trim();
  // Quy tắc thay thế các cặp chữ cái đặc biệt thành ký hiệu IPA
  const rules = [
    { pattern: /tion\b/g, ipa: 'ʃən' },
    { pattern: /sion\b/g, ipa: 'ʒən' },
    { pattern: /ture\b/g, ipa: 'tʃər' },
    { pattern: /ough\b/g, ipa: 'ɔː' },
    { pattern: /ight\b/g, ipa: 'aɪt' },
    { pattern: /ould\b/g, ipa: 'ʊd' },
    { pattern: /ph/g, ipa: 'f' },
    { pattern: /sh/g, ipa: 'ʃ' },
    { pattern: /ch/g, ipa: 'tʃ' },
    { pattern: /th/g, ipa: 'θ' },
    { pattern: /ck/g, ipa: 'k' },
    { pattern: /ng\b/g, ipa: 'ŋ' },
    { pattern: /qu/g, ipa: 'kw' },
    { pattern: /ee/g, ipa: 'iː' },
    { pattern: /ea/g, ipa: 'iː' },
    { pattern: /oo/g, ipa: 'uː' },
    { pattern: /ou/g, ipa: 'aʊ' },
    { pattern: /ow/g, ipa: 'aʊ' },
    { pattern: /oi/g, ipa: 'ɔɪ' },
    { pattern: /oy/g, ipa: 'ɔɪ' },
    { pattern: /ai/g, ipa: 'eɪ' },
    { pattern: /ay/g, ipa: 'eɪ' },
    { pattern: /ar/g, ipa: 'ɑːr' },
    { pattern: /er/g, ipa: 'ər' },
    { pattern: /ir/g, ipa: 'ɜːr' },
    { pattern: /or/g, ipa: 'ɔːr' },
    { pattern: /ur/g, ipa: 'ɜːr' }
  ];

  for (const r of rules) {
    w = w.replace(r.pattern, r.ipa);
  }

  // Chuyển đổi các nguyên âm đơn
  w = w.replace(/a/g, 'æ')
       .replace(/e/g, 'e')
       .replace(/i/g, 'ɪ')
       .replace(/o/g, 'ɒ')
       .replace(/u/g, 'ʌ')
       .replace(/y\b/g, 'i');

  return `/${w.length > 3 ? 'ˈ' : ''}${w}/`;
}

// Phân tích từ vựng bằng từ điển và bộ lọc chính tả
async function analyzeWordLocally(rawWord) {
  const word = rawWord.trim();
  const lower = word.toLowerCase();

  // 1. Kiểm tra chính xác trong bảng words của MySQL
  const [exactMatch] = await pool.query(
    'SELECT word_en, word_vi, emoji, phonetic, example FROM words WHERE LOWER(word_en) = ? LIMIT 1',
    [lower]
  );

  if (exactMatch.length > 0) {
    const row = exactMatch[0];
    return {
      isCorrect: true,
      word: row.word_en,
      correctedWord: row.word_en,
      phonetic: row.phonetic,
      meaningVi: row.word_vi,
      example: row.example,
      emoji: row.emoji,
      message: 'Từ vựng chuẩn xác có trong từ điển hệ thống!'
    };
  }

  // 2. Tìm từ có khoảng cách sai khác nhỏ nhất trong kho từ vựng hiện có
  const [allWords] = await pool.query('SELECT word_en, word_vi, emoji, phonetic, example FROM words');
  let closestWord = null;
  let minDistance = 999;

  for (const w of allWords) {
    const dist = getLevenshteinDistance(lower, w.word_en.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      closestWord = w;
    }
  }

  // Nếu sai 1 hoặc 2 ký tự (ví dụ: aple -> Apple, elefant -> Elephant, buterfly -> Butterfly)
  if (closestWord && minDistance <= 2 && lower.length >= 3) {
    return {
      isCorrect: false,
      word: word,
      correctedWord: closestWord.word_en,
      phonetic: closestWord.phonetic,
      meaningVi: closestWord.word_vi,
      example: closestWord.example,
      emoji: closestWord.emoji,
      message: `Có thể bạn viết sai chính tả! Gợi ý đúng: "${closestWord.word_en}"`
    };
  }

  // 3. Nếu là từ mới không có trong DB nhưng hợp lệ các chữ cái tiếng Anh
  const isValidEnglishLetters = /^[a-zA-Z\s\-']+$/.test(word);
  if (!isValidEnglishLetters) {
    return {
      isCorrect: false,
      word: word,
      correctedWord: word.replace(/[^a-zA-Z\s\-']/g, ''),
      phonetic: generateEnglishIpa(word.replace(/[^a-zA-Z\s\-']/g, '')),
      meaningVi: '',
      example: '',
      emoji: '⭐',
      message: 'Từ chứa ký tự không hợp lệ trong bảng chữ cái tiếng Anh!'
    };
  }

  // Sinh phiên âm IPA tự động
  const generatedPhonetic = generateEnglishIpa(word);
  return {
    isCorrect: true,
    word: word,
    correctedWord: word,
    phonetic: generatedPhonetic,
    meaningVi: '',
    example: `This is a ${word.toLowerCase()}.`,
    emoji: '⭐',
    message: 'Từ vựng tiếng Anh hợp lệ! Đã tự động tạo ký hiệu phiên âm IPA.'
  };
}

// API kiểm tra trạng thái cấu hình Gemini API
app.get('/api/ai/config', (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  res.json({
    success: true,
    hasGeminiKey: hasKey
  });
});

// API lưu khóa GEMINI_API_KEY vào .env
app.post('/api/ai/set-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp Gemini API Key hợp lệ!' });
    }

    const trimmedKey = apiKey.trim();
    process.env.GEMINI_API_KEY = trimmedKey;

    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    const fs = require('fs');
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${trimmedKey}`);
    } else {
      envContent += `\nGEMINI_API_KEY=${trimmedKey}\n`;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    res.json({ success: true, message: 'Đã lưu cấu hình Gemini API Key thành công!' });
  } catch (err) {
    console.error('Lỗi set-key:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API kiểm tra chính tả từ vựng và tự động tạo ký hiệu phiên âm (Gemini AI + Fallback)
app.post('/api/ai/check-word', async (req, res) => {
  try {
    const word = (req.body.word || '').trim();
    if (!word) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập từ tiếng Anh cần kiểm tra!' });
    }

    const apiKey = (req.body.apiKey || process.env.GEMINI_API_KEY || '').trim();

    // 1. Nếu có cấu hình Gemini API Key: Gọi trực tiếp Google Gemini AI
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const prompt = `You are an expert English linguist and teacher for elementary kids.
Analyze the following English input: "${word}".
Determine if it is spelled correctly in standard English.
Respond ONLY with a valid JSON object without any markdown wrapping (no \`\`\`json):
{
  "isCorrect": true or false,
  "word": "${word}",
  "correctedWord": "${word} if correct or the correctly spelled word",
  "phonetic": "standard IPA phonetic transcription with slashes e.g. /ˈkɪt.ən/",
  "meaningVi": "concise Vietnamese meaning for kids",
  "example": "one simple child-friendly English sentence",
  "emoji": "one single most relevant emoji",
  "message": "short explanation in Vietnamese"
}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawText);
          return res.json({
            success: true,
            source: 'gemini',
            data: parsed
          });
        } else {
          console.warn('Google Gemini API phản hồi status:', geminiRes.status);
        }
      } catch (geminiErr) {
        console.warn('Lỗi kết nối Gemini API, chuyển sang bộ xử lý thông minh cục bộ:', geminiErr.message);
      }
    }

    // 2. Chạy bộ phân tích từ điển và ngữ âm thông minh (offline / fallback)
    const localResult = await analyzeWordLocally(word);
    res.json({
      success: true,
      source: 'dictionary',
      data: localResult
    });

  } catch (err) {
    console.error('Lỗi khi kiểm tra từ vựng:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API lấy dữ liệu từ vựng (gộp theo danh mục)
app.get('/api/words', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    const [words] = await pool.query('SELECT * FROM words');
    
    const vocabulary = {};
    for (const cat of categories) {
      vocabulary[cat.code] = words
        .filter(w => w.category_id === cat.id)
        .map(w => ({
          en: w.word_en,
          vi: w.word_vi,
          emoji: w.emoji,
          phonetic: w.phonetic,
          example: w.example
        }));
    }
    
    res.json({ success: true, data: vocabulary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API lấy từ vựng ngẫu nhiên hàng ngày (7 từ)
app.get('/api/daily-words', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT word_en as en, word_vi as vi, emoji, phonetic, example, word_vi as meaning FROM words ORDER BY RAND() LIMIT 7');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API lấy dữ liệu trò chơi điền từ
app.get('/api/fill-blank', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT sentence, answer, options_str as options, hint FROM fill_blank_questions');
    // Phân tách options từ chuỗi thành mảng
    const data = rows.map(r => ({
      ...r,
      options: r.options.split(',')
    }));
    res.json({ success: true, data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 📚 UNIT & PART MANAGEMENT APIS (GIẢNG DẠY)
// ==========================================

// 1. Lấy toàn bộ danh sách Units cùng các Parts bên trong
app.get('/api/units', async (req, res) => {
  try {
    const [units] = await pool.query('SELECT * FROM units ORDER BY unit_number ASC, id ASC');
    const [parts] = await pool.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM part_words WHERE part_id = p.id) AS custom_words_count,
        (SELECT COUNT(*) FROM part_questions WHERE part_id = p.id) AS custom_questions_count
      FROM parts p 
      ORDER BY p.part_number ASC, p.id ASC
    `);
    
    // Ghép parts vào từng unit
    const data = units.map(u => ({
      ...u,
      parts: parts.filter(p => p.unit_id === u.id)
    }));

    res.json({ success: true, data });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Units:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Thêm mới một Unit
app.post('/api/units', async (req, res) => {
  try {
    const { unit_number, title, description, icon, color } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên Unit!' });
    }
    const [result] = await pool.query(
      'INSERT INTO units (unit_number, title, description, icon, color) VALUES (?, ?, ?, ?, ?)',
      [unit_number || 1, title, description || '', icon || '📘', color || '#6C63FF']
    );
    res.json({
      success: true,
      message: 'Tạo Unit thành công!',
      data: { id: result.insertId, unit_number: unit_number || 1, title, description, icon, color, parts: [] }
    });
  } catch (error) {
    console.error('Lỗi khi tạo Unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Cập nhật một Unit
app.put('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_number, title, description, icon, color } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM units WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Unit không tồn tại!' });
    }
    await pool.query(
      'UPDATE units SET unit_number = ?, title = ?, description = ?, icon = ?, color = ? WHERE id = ?',
      [
        unit_number ?? existing.unit_number,
        title || existing.title,
        description ?? existing.description,
        icon || existing.icon,
        color || existing.color,
        id
      ]
    );
    res.json({ success: true, message: 'Cập nhật Unit thành công!' });
  } catch (error) {
    console.error('Lỗi khi cập nhật Unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Xóa một Unit
app.delete('/api/units/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM units WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa Unit thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa Unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Thêm mới một Part vào Unit
app.post('/api/parts', async (req, res) => {
  try {
    const { unit_id, part_number, title, game_type, category_code, description } = req.body;
    if (!unit_id || !title) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin Unit hoặc Tên Part!' });
    }
    const [result] = await pool.query(
      'INSERT INTO parts (unit_id, part_number, title, game_type, category_code, description) VALUES (?, ?, ?, ?, ?, ?)',
      [unit_id, part_number || 1, title, game_type || 'flashcards', category_code || 'animals', description || '']
    );
    res.json({
      success: true,
      message: 'Thêm Part bài học thành công!',
      data: {
        id: result.insertId,
        unit_id,
        part_number: part_number || 1,
        title,
        game_type: game_type || 'flashcards',
        category_code: category_code || 'animals',
        description: description || '',
        custom_words_count: 0,
        custom_questions_count: 0
      }
    });
  } catch (error) {
    console.error('Lỗi khi tạo Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Cập nhật một Part
app.put('/api/parts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_id, part_number, title, game_type, category_code, description } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM parts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Part không tồn tại!' });
    }
    await pool.query(
      'UPDATE parts SET unit_id = ?, part_number = ?, title = ?, game_type = ?, category_code = ?, description = ? WHERE id = ?',
      [
        unit_id ?? existing.unit_id,
        part_number ?? existing.part_number,
        title || existing.title,
        game_type || existing.game_type,
        category_code || existing.category_code,
        description ?? existing.description,
        id
      ]
    );
    res.json({ success: true, message: 'Cập nhật Part thành công!' });
  } catch (error) {
    console.error('Lỗi khi cập nhật Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Xóa một Part
app.delete('/api/parts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM parts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa Part thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Lấy chi tiết một Part kèm từ vựng & câu hỏi riêng của Part
app.get('/api/parts/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    const [[part]] = await pool.query('SELECT * FROM parts WHERE id = ?', [id]);
    if (!part) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Part!' });
    }
    const [words] = await pool.query('SELECT * FROM part_words WHERE part_id = ? ORDER BY id ASC', [id]);
    const [questions] = await pool.query('SELECT * FROM part_questions WHERE part_id = ? ORDER BY id ASC', [id]);

    res.json({
      success: true,
      data: {
        ...part,
        words: words.map(w => ({
          id: w.id,
          en: w.word_en,
          vi: w.word_vi,
          emoji: w.emoji,
          phonetic: w.phonetic,
          example: w.example
        })),
        questions: questions.map(q => ({
          id: q.id,
          sentence: q.sentence,
          answer: q.answer,
          options: q.options_str.split(','),
          options_str: q.options_str,
          hint: q.hint
        }))
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Thêm từ vựng riêng cho Part
app.post('/api/parts/:id/words', async (req, res) => {
  try {
    const { id } = req.params;
    const { word_en, word_vi, emoji, phonetic, example } = req.body;
    if (!word_en || !word_vi) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập từ tiếng Anh và nghĩa tiếng Việt!' });
    }
    const [result] = await pool.query(
      'INSERT INTO part_words (part_id, word_en, word_vi, emoji, phonetic, example) VALUES (?, ?, ?, ?, ?, ?)',
      [id, word_en, word_vi, emoji || '⭐', phonetic || '', example || '']
    );
    res.json({
      success: true,
      message: 'Thêm từ vựng vào Part thành công!',
      data: { id: result.insertId, word_en, word_vi, emoji, phonetic, example }
    });
  } catch (error) {
    console.error('Lỗi khi thêm từ vào Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Xóa từ vựng khỏi Part
app.delete('/api/parts/words/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params;
    await pool.query('DELETE FROM part_words WHERE id = ?', [wordId]);
    res.json({ success: true, message: 'Đã xóa từ vựng thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa từ khỏi Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10b. Cập nhật từ vựng trong Part
app.put('/api/parts/words/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params;
    const { word_en, word_vi, emoji, phonetic, example } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM part_words WHERE id = ?', [wordId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy từ vựng!' });
    }
    await pool.query(
      'UPDATE part_words SET word_en = ?, word_vi = ?, emoji = ?, phonetic = ?, example = ? WHERE id = ?',
      [
        word_en || existing.word_en,
        word_vi || existing.word_vi,
        emoji ?? existing.emoji,
        phonetic ?? existing.phonetic,
        example ?? existing.example,
        wordId
      ]
    );
    res.json({ success: true, message: 'Cập nhật từ vựng thành công!' });
  } catch (error) {
    console.error('Lỗi khi cập nhật từ vựng:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. Thêm câu hỏi điền từ riêng cho Part
app.post('/api/parts/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const { sentence, answer, options_str, hint } = req.body;
    if (!sentence || !answer || !options_str) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ câu hỏi, đáp án và danh sách lựa chọn!' });
    }
    const [result] = await pool.query(
      'INSERT INTO part_questions (part_id, sentence, answer, options_str, hint) VALUES (?, ?, ?, ?, ?)',
      [id, sentence, answer, options_str, hint || '']
    );
    res.json({
      success: true,
      message: 'Thêm câu hỏi vào Part thành công!',
      data: { id: result.insertId, sentence, answer, options_str, hint }
    });
  } catch (error) {
    console.error('Lỗi khi thêm câu hỏi vào Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. Xóa câu hỏi khỏi Part
app.delete('/api/parts/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    await pool.query('DELETE FROM part_questions WHERE id = ?', [questionId]);
    res.json({ success: true, message: 'Đã xóa câu hỏi thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa câu hỏi khỏi Part:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12b. Cập nhật câu hỏi trong Part
app.put('/api/parts/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { sentence, answer, options_str, hint } = req.body;
    const [[existing]] = await pool.query('SELECT * FROM part_questions WHERE id = ?', [questionId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi!' });
    }
    await pool.query(
      'UPDATE part_questions SET sentence = ?, answer = ?, options_str = ?, hint = ? WHERE id = ?',
      [
        sentence || existing.sentence,
        answer || existing.answer,
        options_str || existing.options_str,
        hint ?? existing.hint,
        questionId
      ]
    );
    res.json({ success: true, message: 'Cập nhật câu hỏi thành công!' });
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. Route mặc định: Trả về index.html cho mọi yêu cầu trang web
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Kiểm tra kết nối MySQL khi khởi động
pool.getConnection()
  .then(conn => {
    console.log("✅ Kết nối cơ sở dữ liệu MySQL 'language' thành công!");
    conn.release();
  })
  .catch(err => {
    console.warn("⚠️ Cảnh báo kết nối MySQL:", err.message);
    console.warn("👉 Hãy đảm bảo dịch vụ MySQL đang chạy (trong MySQL Workbench hoặc XAMPP) và file .env đúng thông tin.");
  });

// Chạy server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
  console.log(`Website có thể truy cập trực tiếp tại: http://localhost:${port}`);
});

