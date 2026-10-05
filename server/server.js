const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

