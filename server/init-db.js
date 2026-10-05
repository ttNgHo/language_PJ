const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const VOCABULARY = {
    animals: [
        { en: 'Cat', vi: 'Con mèo', emoji: '🐱', phonetic: '/kæt/', example: 'The cat is sleeping.' },
        { en: 'Dog', vi: 'Con chó', emoji: '🐶', phonetic: '/dɒɡ/', example: 'The dog is running.' },
        { en: 'Bird', vi: 'Con chim', emoji: '🐦', phonetic: '/bɜːrd/', example: 'The bird can fly.' },
        { en: 'Fish', vi: 'Con cá', emoji: '🐟', phonetic: '/fɪʃ/', example: 'The fish swims in the water.' },
        { en: 'Bear', vi: 'Con gấu', emoji: '🐻', phonetic: '/ber/', example: 'The bear is very big.' },
        { en: 'Lion', vi: 'Con sư tử', emoji: '🦁', phonetic: '/ˈlaɪ.ən/', example: 'The lion is the king.' },
        { en: 'Elephant', vi: 'Con voi', emoji: '🐘', phonetic: '/ˈel.ɪ.fənt/', example: 'The elephant has a long trunk.' },
        { en: 'Monkey', vi: 'Con khỉ', emoji: '🐒', phonetic: '/ˈmʌŋ.ki/', example: 'The monkey likes bananas.' },
        { en: 'Rabbit', vi: 'Con thỏ', emoji: '🐰', phonetic: '/ˈræb.ɪt/', example: 'The rabbit hops fast.' },
        { en: 'Duck', vi: 'Con vịt', emoji: '🦆', phonetic: '/dʌk/', example: 'The duck swims in the pond.' },
        { en: 'Frog', vi: 'Con ếch', emoji: '🐸', phonetic: '/frɒɡ/', example: 'The frog can jump.' },
        { en: 'Horse', vi: 'Con ngựa', emoji: '🐴', phonetic: '/hɔːrs/', example: 'The horse runs very fast.' },
        { en: 'Butterfly', vi: 'Con bướm', emoji: '🦋', phonetic: '/ˈbʌtərflaɪ/', example: 'The butterfly is beautiful.' },
        { en: 'Turtle', vi: 'Con rùa', emoji: '🐢', phonetic: '/ˈtɜːr.t̬əl/', example: 'The turtle walks slowly.' },
        { en: 'Penguin', vi: 'Chim cánh cụt', emoji: '🐧', phonetic: '/ˈpeŋ.ɡwɪn/', example: 'The penguin lives in cold places.' },
    ],
    fruits: [
        { en: 'Apple', vi: 'Quả táo', emoji: '🍎', phonetic: '/ˈæp.əl/', example: 'I eat an apple every day.' },
        { en: 'Banana', vi: 'Quả chuối', emoji: '🍌', phonetic: '/bəˈnæn.ə/', example: 'The banana is yellow.' },
        { en: 'Orange', vi: 'Quả cam', emoji: '🍊', phonetic: '/ˈɒr.ɪndʒ/', example: 'I like orange juice.' },
        { en: 'Grape', vi: 'Quả nho', emoji: '🍇', phonetic: '/ɡreɪp/', example: 'Grapes are sweet and purple.' },
        { en: 'Watermelon', vi: 'Dưa hấu', emoji: '🍉', phonetic: '/ˈwɔːtərmelən/', example: 'Watermelon is great in summer.' },
        { en: 'Strawberry', vi: 'Dâu tây', emoji: '🍓', phonetic: '/ˈstrɔː.bər.i/', example: 'Strawberry ice cream is yummy.' },
        { en: 'Pineapple', vi: 'Quả dứa', emoji: '🍍', phonetic: '/ˈpaɪnˌæp.əl/', example: 'Pineapple is sweet and sour.' },
        { en: 'Cherry', vi: 'Quả anh đào', emoji: '🍒', phonetic: '/ˈtʃer.i/', example: 'Cherry trees are beautiful.' },
        { en: 'Lemon', vi: 'Quả chanh', emoji: '🍋', phonetic: '/ˈlem.ən/', example: 'Lemon tastes sour.' },
        { en: 'Peach', vi: 'Quả đào', emoji: '🍑', phonetic: '/piːtʃ/', example: 'The peach is soft and sweet.' },
    ],
    colors: [
        { en: 'Red', vi: 'Màu đỏ', emoji: '🔴', phonetic: '/red/', example: 'The apple is red.' },
        { en: 'Blue', vi: 'Màu xanh dương', emoji: '🔵', phonetic: '/bluː/', example: 'The sky is blue.' },
        { en: 'Green', vi: 'Màu xanh lá', emoji: '🟢', phonetic: '/ɡriːn/', example: 'The grass is green.' },
        { en: 'Yellow', vi: 'Màu vàng', emoji: '🟡', phonetic: '/ˈjel.oʊ/', example: 'The sun is yellow.' },
        { en: 'Purple', vi: 'Màu tím', emoji: '🟣', phonetic: '/ˈpɜːr.pəl/', example: 'I like purple flowers.' },
        { en: 'Orange', vi: 'Màu cam', emoji: '🟠', phonetic: '/ˈɒr.ɪndʒ/', example: 'The orange is orange.' },
        { en: 'Pink', vi: 'Màu hồng', emoji: '💗', phonetic: '/pɪŋk/', example: 'The flower is pink.' },
        { en: 'White', vi: 'Màu trắng', emoji: '⚪', phonetic: '/waɪt/', example: 'Snow is white.' },
        { en: 'Black', vi: 'Màu đen', emoji: '⚫', phonetic: '/blæk/', example: 'The night sky is black.' },
        { en: 'Brown', vi: 'Màu nâu', emoji: '🟤', phonetic: '/braʊn/', example: 'The bear is brown.' },
    ],
    family: [
        { en: 'Mother', vi: 'Mẹ', emoji: '👩', phonetic: '/ˈmʌð.ər/', example: 'My mother is kind.' },
        { en: 'Father', vi: 'Bố', emoji: '👨', phonetic: '/ˈfɑː.ðər/', example: 'My father is strong.' },
        { en: 'Sister', vi: 'Chị/Em gái', emoji: '👧', phonetic: '/ˈsɪs.tər/', example: 'My sister is smart.' },
        { en: 'Brother', vi: 'Anh/Em trai', emoji: '👦', phonetic: '/ˈbrʌð.ər/', example: 'My brother plays football.' },
        { en: 'Baby', vi: 'Em bé', emoji: '👶', phonetic: '/ˈbeɪ.bi/', example: 'The baby is cute.' },
        { en: 'Grandma', vi: 'Bà', emoji: '👵', phonetic: '/ˈɡræn.mɑː/', example: 'Grandma tells stories.' },
        { en: 'Grandpa', vi: 'Ông', emoji: '👴', phonetic: '/ˈɡræn.pɑː/', example: 'Grandpa reads the newspaper.' },
        { en: 'Uncle', vi: 'Chú/Bác', emoji: '👨‍🦱', phonetic: '/ˈʌŋ.kəl/', example: 'Uncle plays with me.' },
    ],
    food: [
        { en: 'Rice', vi: 'Cơm', emoji: '🍚', phonetic: '/raɪs/', example: 'I eat rice for lunch.' },
        { en: 'Bread', vi: 'Bánh mì', emoji: '🍞', phonetic: '/bred/', example: 'I eat bread for breakfast.' },
        { en: 'Egg', vi: 'Quả trứng', emoji: '🥚', phonetic: '/eɡ/', example: 'I like fried eggs.' },
        { en: 'Milk', vi: 'Sữa', emoji: '🥛', phonetic: '/mɪlk/', example: 'I drink milk every day.' },
        { en: 'Cake', vi: 'Bánh ngọt', emoji: '🎂', phonetic: '/keɪk/', example: 'Birthday cake is delicious.' },
        { en: 'Pizza', vi: 'Bánh pizza', emoji: '🍕', phonetic: '/ˈpiːt.sə/', example: 'I love pizza!' },
        { en: 'Chicken', vi: 'Thịt gà', emoji: '🍗', phonetic: '/ˈtʃɪk.ɪn/', example: 'Fried chicken is yummy.' },
        { en: 'Soup', vi: 'Canh/Súp', emoji: '🍲', phonetic: '/suːp/', example: 'Hot soup is warm.' },
        { en: 'Ice cream', vi: 'Kem', emoji: '🍦', phonetic: '/aɪs kriːm/', example: 'I love ice cream in summer.' },
        { en: 'Cookie', vi: 'Bánh quy', emoji: '🍪', phonetic: '/ˈkʊk.i/', example: 'Mom makes cookies.' },
    ],
    school: [
        { en: 'Book', vi: 'Quyển sách', emoji: '📖', phonetic: '/bʊk/', example: 'I read a book.' },
        { en: 'Pen', vi: 'Cây bút', emoji: '🖊️', phonetic: '/pen/', example: 'I write with a pen.' },
        { en: 'Pencil', vi: 'Bút chì', emoji: '✏️', phonetic: '/ˈpen.səl/', example: 'I draw with a pencil.' },
        { en: 'Ruler', vi: 'Thước kẻ', emoji: '📏', phonetic: '/ˈruː.lər/', example: 'I use a ruler to draw lines.' },
        { en: 'Eraser', vi: 'Cục tẩy', emoji: '🧹', phonetic: '/ɪˈreɪ.sər/', example: 'I erase mistakes.' },
        { en: 'Bag', vi: 'Cặp sách', emoji: '🎒', phonetic: '/bæɡ/', example: 'My bag is heavy.' },
        { en: 'Teacher', vi: 'Giáo viên', emoji: '👩‍🏫', phonetic: '/ˈtiː.tʃər/', example: 'The teacher is nice.' },
        { en: 'Desk', vi: 'Bàn học', emoji: '🪑', phonetic: '/desk/', example: 'I sit at my desk.' },
        { en: 'Clock', vi: 'Đồng hồ', emoji: '🕐', phonetic: '/klɒk/', example: 'The clock shows time.' },
        { en: 'Star', vi: 'Ngôi sao', emoji: '⭐', phonetic: '/stɑːr/', example: 'I got a gold star!' },
    ],
    body: [
        { en: 'Head', vi: 'Cái đầu', emoji: '🗣️', phonetic: '/hed/', example: 'Touch your head.' },
        { en: 'Hand', vi: 'Bàn tay', emoji: '✋', phonetic: '/hænd/', example: 'Wash your hands.' },
        { en: 'Eye', vi: 'Mắt', emoji: '👁️', phonetic: '/aɪ/', example: 'I have two eyes.' },
        { en: 'Ear', vi: 'Tai', emoji: '👂', phonetic: '/ɪr/', example: 'I hear with my ears.' },
        { en: 'Nose', vi: 'Mũi', emoji: '👃', phonetic: '/noʊz/', example: 'I smell with my nose.' },
        { en: 'Mouth', vi: 'Miệng', emoji: '👄', phonetic: '/maʊθ/', example: 'I eat with my mouth.' },
        { en: 'Foot', vi: 'Bàn chân', emoji: '🦶', phonetic: '/fʊt/', example: 'I walk with my feet.' },
        { en: 'Leg', vi: 'Chân', emoji: '🦵', phonetic: '/leɡ/', example: 'I run with my legs.' },
    ],
    weather: [
        { en: 'Sun', vi: 'Mặt trời', emoji: '☀️', phonetic: '/sʌn/', example: 'The sun is shining.' },
        { en: 'Rain', vi: 'Mưa', emoji: '🌧️', phonetic: '/reɪn/', example: 'It is raining today.' },
        { en: 'Cloud', vi: 'Đám mây', emoji: '☁️', phonetic: '/klaʊd/', example: 'The clouds are white.' },
        { en: 'Snow', vi: 'Tuyết', emoji: '❄️', phonetic: '/snoʊ/', example: 'Snow is cold and white.' },
        { en: 'Wind', vi: 'Gió', emoji: '💨', phonetic: '/wɪnd/', example: 'The wind is strong today.' },
        { en: 'Rainbow', vi: 'Cầu vồng', emoji: '🌈', phonetic: '/ˈreɪn.boʊ/', example: 'The rainbow has many colors.' },
        { en: 'Star', vi: 'Ngôi sao', emoji: '⭐', phonetic: '/stɑːr/', example: 'Stars shine at night.' },
        { en: 'Moon', vi: 'Mặt trăng', emoji: '🌙', phonetic: '/muːn/', example: 'The moon is bright tonight.' },
    ],
    transport: [
        { en: 'Car', vi: 'Xe ô tô', emoji: '🚗', phonetic: '/kɑːr/', example: 'Dad drives a car.' },
        { en: 'Bus', vi: 'Xe buýt', emoji: '🚌', phonetic: '/bʌs/', example: 'I go to school by bus.' },
        { en: 'Train', vi: 'Xe lửa', emoji: '🚆', phonetic: '/treɪn/', example: 'The train is fast.' },
        { en: 'Bike', vi: 'Xe đạp', emoji: '🚲', phonetic: '/baɪk/', example: 'I ride my bike.' },
        { en: 'Boat', vi: 'Thuyền', emoji: '⛵', phonetic: '/boʊt/', example: 'The boat sails on the sea.' },
        { en: 'Plane', vi: 'Máy bay', emoji: '✈️', phonetic: '/pleɪn/', example: 'The plane flies high.' },
        { en: 'Ship', vi: 'Tàu thủy', emoji: '🚢', phonetic: '/ʃɪp/', example: 'The ship is very big.' },
        { en: 'Truck', vi: 'Xe tải', emoji: '🚚', phonetic: '/trʌk/', example: 'The truck carries goods.' },
    ],
    nature: [
        { en: 'Tree', vi: 'Cái cây', emoji: '🌳', phonetic: '/triː/', example: 'The tree is tall.' },
        { en: 'Flower', vi: 'Bông hoa', emoji: '🌸', phonetic: '/ˈflaʊ.ər/', example: 'The flower smells nice.' },
        { en: 'River', vi: 'Con sông', emoji: '🏞️', phonetic: '/ˈrɪv.ər/', example: 'Fish live in the river.' },
        { en: 'Mountain', vi: 'Ngọn núi', emoji: '⛰️', phonetic: '/ˈmaʊn.tən/', example: 'The mountain is very high.' },
        { en: 'Sea', vi: 'Biển', emoji: '🌊', phonetic: '/siː/', example: 'The sea is blue and big.' },
        { en: 'Forest', vi: 'Rừng', emoji: '🌲', phonetic: '/ˈfɒr.ɪst/', example: 'Animals live in the forest.' },
        { en: 'Garden', vi: 'Khu vườn', emoji: '🌻', phonetic: '/ˈɡɑːr.dən/', example: 'We have a beautiful garden.' },
        { en: 'Grass', vi: 'Cỏ', emoji: '🌿', phonetic: '/ɡræs/', example: 'The grass is green.' },
    ]
};

const FILL_BLANK_DATA = [
    { sentence: 'The ___ is red.', answer: 'apple', options: 'apple,banana,orange,grape', hint: '🍎 Một loại quả màu đỏ' },
    { sentence: 'I drink ___ every morning.', answer: 'milk', options: 'milk,soup,rice,cake', hint: '🥛 Thức uống màu trắng' },
    { sentence: 'The ___ is shining.', answer: 'sun', options: 'sun,moon,rain,cloud', hint: '☀️ Trên bầu trời ban ngày' },
    { sentence: 'My ___ reads me stories.', answer: 'mother', options: 'mother,teacher,dog,book', hint: '👩 Người yêu thương bạn nhất' },
    { sentence: 'I go to ___ by bus.', answer: 'school', options: 'school,garden,forest,river', hint: '🏫 Nơi bạn đến mỗi ngày' },
    { sentence: 'The ___ can fly.', answer: 'bird', options: 'bird,fish,dog,cat', hint: '🐦 Con vật có cánh' },
    { sentence: 'I write with a ___.', answer: 'pen', options: 'pen,ruler,bag,clock', hint: '🖊️ Dùng để viết' },
    { sentence: 'The ___ has a long trunk.', answer: 'elephant', options: 'elephant,rabbit,frog,duck', hint: '🐘 Con vật to nhất' },
    { sentence: 'Snow is ___ and white.', answer: 'cold', options: 'cold,hot,big,fast', hint: '❄️ Cảm giác khi chạm tuyết' },
    { sentence: 'I ride my ___ to the park.', answer: 'bike', options: 'bike,boat,plane,ship', hint: '🚲 Có hai bánh xe' },
];

async function initDB() {
    // Đầu tiên kết nối không cần tên database để tạo DB nếu chưa có
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    };
    
    let connection;
    try {
        console.log("Đang kết nối đến MySQL...");
        connection = await mysql.createConnection(dbConfig);
        
        const dbName = process.env.DB_NAME || 'language';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Đã tạo/kiểm tra database: ${dbName}`);
        
        await connection.query(`USE \`${dbName}\``);
        
        // 1. Bảng categories
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                name_vi VARCHAR(100) NOT NULL,
                emoji VARCHAR(10) NOT NULL
            )
        `);
        console.log("Đã tạo bảng: categories");

        // 2. Bảng words
        await connection.query(`
            CREATE TABLE IF NOT EXISTS words (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT,
                word_en VARCHAR(100) NOT NULL,
                word_vi VARCHAR(100) NOT NULL,
                emoji VARCHAR(10),
                phonetic VARCHAR(100),
                example TEXT,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )
        `);
        console.log("Đã tạo bảng: words");

        // 3. Bảng fill_blank_questions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fill_blank_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sentence TEXT NOT NULL,
                answer VARCHAR(100) NOT NULL,
                options_str TEXT NOT NULL,
                hint TEXT
            )
        `);
        console.log("Đã tạo bảng: fill_blank_questions");

        // 4. Bảng units (Bài học / Chương học)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS units (
                id INT AUTO_INCREMENT PRIMARY KEY,
                unit_number INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                icon VARCHAR(20) DEFAULT '📘',
                color VARCHAR(50) DEFAULT '#6C63FF',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Đã tạo bảng: units");

        // 5. Bảng parts (Các phần / Trò chơi theo từng Unit)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS parts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                unit_id INT NOT NULL,
                part_number INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                game_type VARCHAR(50) NOT NULL,
                category_code VARCHAR(50) DEFAULT 'animals',
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
            )
        `);
        console.log("Đã tạo bảng: parts");

        // 6. Bảng part_words (Từ vựng tùy chọn cho từng Part)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS part_words (
                id INT AUTO_INCREMENT PRIMARY KEY,
                part_id INT NOT NULL,
                word_en VARCHAR(100) NOT NULL,
                word_vi VARCHAR(100) NOT NULL,
                emoji VARCHAR(20),
                phonetic VARCHAR(100),
                example TEXT,
                FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
            )
        `);
        console.log("Đã tạo bảng: part_words");

        // 7. Bảng part_questions (Câu hỏi điền từ riêng cho Part)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS part_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                part_id INT NOT NULL,
                sentence TEXT NOT NULL,
                answer VARCHAR(100) NOT NULL,
                options_str TEXT NOT NULL,
                hint TEXT,
                FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
            )
        `);
        console.log("Đã tạo bảng: part_questions");

        // 8. Bảng user_stats (Lưu trữ thành tích & tiến độ học tập của người dùng)
        await connection.query(`
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
        console.log("Đã tạo bảng: user_stats");

        // Khởi tạo bản ghi mặc định cho người dùng nếu chưa có (không truncate để giữ thành tích)
        const [existingStats] = await connection.query('SELECT * FROM user_stats WHERE id = 1');
        if (existingStats.length === 0) {
            await connection.query(`
                INSERT INTO user_stats (id, name, age, avatar, total_stars, games_played, words_learned, streak, last_active_date, unlocked_badges)
                VALUES (1, 'Bé Yêu', 7, '🦊', 0, 0, 0, 1, CURDATE(), '[]')
            `);
            console.log("Đã tạo bản ghi mặc định trong bảng user_stats");
        }
        
        // --- CHÈN DỮ LIỆU ---
        
        // Xóa dữ liệu cũ để tránh trùng lặp nếu chạy lại
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE part_questions');
        await connection.query('TRUNCATE TABLE part_words');
        await connection.query('TRUNCATE TABLE parts');
        await connection.query('TRUNCATE TABLE units');
        await connection.query('TRUNCATE TABLE words');
        await connection.query('TRUNCATE TABLE categories');
        await connection.query('TRUNCATE TABLE fill_blank_questions');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        
        const catMap = {
            animals: { vi: 'Động vật', emoji: '🐾' },
            fruits: { vi: 'Trái cây', emoji: '🍎' },
            colors: { vi: 'Màu sắc', emoji: '🎨' },
            family: { vi: 'Gia đình', emoji: '👨‍👩‍👧‍👦' },
            food: { vi: 'Đồ ăn', emoji: '🍕' },
            school: { vi: 'Trường học', emoji: '🏫' },
            body: { vi: 'Cơ thể', emoji: '🧍' },
            weather: { vi: 'Thời tiết', emoji: '🌤️' },
            transport: { vi: 'Phương tiện', emoji: '🚗' },
            nature: { vi: 'Thiên nhiên', emoji: '🌿' }
        };

        for (const [code, meta] of Object.entries(catMap)) {
            const [catResult] = await connection.query(
                'INSERT INTO categories (code, name_vi, emoji) VALUES (?, ?, ?)',
                [code, meta.vi, meta.emoji]
            );
            const catId = catResult.insertId;
            
            const wordsList = VOCABULARY[code];
            if (wordsList) {
                for (const w of wordsList) {
                    await connection.query(
                        'INSERT INTO words (category_id, word_en, word_vi, emoji, phonetic, example) VALUES (?, ?, ?, ?, ?, ?)',
                        [catId, w.en, w.vi, w.emoji, w.phonetic, w.example]
                    );
                }
            }
        }
        console.log("Đã chèn dữ liệu vào bảng categories và words.");

        for (const q of FILL_BLANK_DATA) {
            await connection.query(
                'INSERT INTO fill_blank_questions (sentence, answer, options_str, hint) VALUES (?, ?, ?, ?)',
                [q.sentence, q.answer, q.options, q.hint]
            );
        }
        console.log("Đã chèn dữ liệu vào bảng fill_blank_questions.");

        // --- KHỞI TẠO CÁC UNIT VÀ PART MẪU CHO GIẢNG DẠY ---
        const sampleUnits = [
            {
                unit_number: 1,
                title: 'Unit 1: Động Vật Quanh Em (Animals & Pets)',
                description: 'Làm quen với các loài thú cưng và động vật đáng yêu.',
                icon: '🐾',
                color: '#FF6B6B',
                parts: [
                    {
                        part_number: 1,
                        title: 'Part 1: Thẻ Từ Vựng Thú Cưng Thân Quen',
                        game_type: 'flashcards',
                        category_code: 'animals',
                        description: 'Lật thẻ nghe phát âm chuẩn và ghi nhớ từ vựng các loài thú cưng.',
                        custom_words: [
                            { en: 'Cat', vi: 'Con mèo', emoji: '🐱', phonetic: '/kæt/', example: 'The cat is sleeping.' },
                            { en: 'Dog', vi: 'Con chó', emoji: '🐶', phonetic: '/dɒɡ/', example: 'The dog is running.' },
                            { en: 'Rabbit', vi: 'Con thỏ', emoji: '🐰', phonetic: '/ˈræb.ɪt/', example: 'The rabbit hops fast.' },
                            { en: 'Bird', vi: 'Con chim', emoji: '🐦', phonetic: '/bɜːrd/', example: 'The bird can fly.' },
                            { en: 'Fish', vi: 'Con cá', emoji: '🐟', phonetic: '/fɪʃ/', example: 'The fish swims in the water.' }
                        ]
                    },
                    {
                        part_number: 2,
                        title: 'Part 2: Trò Chơi Nối Từ Nhanh Tay',
                        game_type: 'wordmatch',
                        category_code: 'animals',
                        description: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng thật chuẩn xác.'
                    },
                    {
                        part_number: 3,
                        title: 'Part 3: Thử Thách Đánh Vần Tên Loài Vật',
                        game_type: 'spelling',
                        category_code: 'animals',
                        description: 'Lắng nghe phát âm và gõ lại đúng từng chữ cái tiếng Anh.'
                    },
                    {
                        part_number: 4,
                        title: 'Part 4: Thử Tài Điền Từ Vào Câu',
                        game_type: 'fillblank',
                        category_code: 'animals',
                        description: 'Đọc câu mô tả đặc điểm và chọn từ đúng điền vào chỗ trống.',
                        custom_questions: [
                            { sentence: 'The ___ can fly in the sky.', answer: 'bird', options_str: 'bird,fish,dog,cat', hint: '🐦 Con vật có cánh bay lượn' },
                            { sentence: 'The ___ has a very long trunk.', answer: 'elephant', options_str: 'elephant,rabbit,frog,duck', hint: '🐘 Con vật to lớn có vòi dài' },
                            { sentence: 'The ___ loves bananas and climbs trees.', answer: 'monkey', options_str: 'monkey,lion,bear,turtle', hint: '🐒 Thích ăn chuối và leo trèo' },
                            { sentence: 'The ___ swims quickly in water.', answer: 'fish', options_str: 'fish,dog,cat,horse', hint: '🐟 Sống dưới nước' }
                        ]
                    },
                    {
                        part_number: 5,
                        title: 'Part 5: Bắt Từ Động Vật Rơi Nhanh',
                        game_type: 'wordcatcher',
                        category_code: 'animals',
                        description: 'Trò chơi hứng từ tiếng Anh đúng rơi xuống để ghi điểm cao!'
                    }
                ]
            },
            {
                unit_number: 2,
                title: 'Unit 2: Sắc Màu & Hoa Quả (Colors & Fruits)',
                description: 'Khám phá hoa quả ngọt ngào và các màu sắc rực rỡ.',
                icon: '🍎',
                color: '#4ECDC4',
                parts: [
                    {
                        part_number: 1,
                        title: 'Part 1: Thẻ Từ Vựng Trái Cây Tươi',
                        game_type: 'flashcards',
                        category_code: 'fruits',
                        description: 'Học phát âm các loại hoa quả yêu thích.'
                    },
                    {
                        part_number: 2,
                        title: 'Part 2: Xếp Chữ Màu Sắc Rực Rỡ',
                        game_type: 'scramble',
                        category_code: 'colors',
                        description: 'Sắp xếp lại các chữ cái đảo lộn thành tên màu sắc đúng.'
                    },
                    {
                        part_number: 3,
                        title: 'Part 3: Nối Tên Hoa Quả',
                        game_type: 'wordmatch',
                        category_code: 'fruits',
                        description: 'Nhanh mắt nối các loại trái cây quen thuộc.'
                    },
                    {
                        part_number: 4,
                        title: 'Part 4: Thử Thách Đánh Vần Sắc Màu',
                        game_type: 'spelling',
                        category_code: 'colors',
                        description: 'Luyện tai nghe và đánh vần chính xác tên màu sắc.'
                    }
                ]
            },
            {
                unit_number: 3,
                title: 'Unit 3: Trường Học & Bạn Bè (My School & Friends)',
                description: 'Học từ vựng về lớp học, đồ dùng học tập và thầy cô, bạn bè.',
                icon: '🏫',
                color: '#F59E0B',
                parts: [
                    {
                        part_number: 1,
                        title: 'Part 1: Thẻ Từ Vựng Đồ Dùng Học Tập',
                        game_type: 'flashcards',
                        category_code: 'school',
                        description: 'Nhận biết cặp sách, bút viết, thước kẻ, tẩy chì...'
                    },
                    {
                        part_number: 2,
                        title: 'Part 2: Đánh Vần Dụng Cụ Học Sinh',
                        game_type: 'spelling',
                        category_code: 'school',
                        description: 'Luyện nghe và viết chuẩn tên từng món đồ dùng học sinh.'
                    },
                    {
                        part_number: 3,
                        title: 'Part 3: Xếp Chữ Lớp Học Nhanh Trí',
                        game_type: 'scramble',
                        category_code: 'school',
                        description: 'Giải mã các từ vựng học tập bị xáo trộn.'
                    },
                    {
                        part_number: 4,
                        title: 'Part 4: Trò Chơi Bắt Từ Sân Trường',
                        game_type: 'wordcatcher',
                        category_code: 'school',
                        description: 'Hứng đúng từ vựng học đường trước khi rơi xuống đất!'
                    }
                ]
            }
        ];

        for (const u of sampleUnits) {
            const [unitResult] = await connection.query(
                'INSERT INTO units (unit_number, title, description, icon, color) VALUES (?, ?, ?, ?, ?)',
                [u.unit_number, u.title, u.description, u.icon, u.color]
            );
            const unitId = unitResult.insertId;

            for (const p of u.parts) {
                const [partResult] = await connection.query(
                    'INSERT INTO parts (unit_id, part_number, title, game_type, category_code, description) VALUES (?, ?, ?, ?, ?, ?)',
                    [unitId, p.part_number, p.title, p.game_type, p.category_code, p.description]
                );
                const partId = partResult.insertId;

                // Nếu có custom words
                if (p.custom_words && p.custom_words.length > 0) {
                    for (const cw of p.custom_words) {
                        await connection.query(
                            'INSERT INTO part_words (part_id, word_en, word_vi, emoji, phonetic, example) VALUES (?, ?, ?, ?, ?, ?)',
                            [partId, cw.en, cw.vi, cw.emoji, cw.phonetic, cw.example]
                        );
                    }
                }

                // Nếu có custom questions
                if (p.custom_questions && p.custom_questions.length > 0) {
                    for (const cq of p.custom_questions) {
                        await connection.query(
                            'INSERT INTO part_questions (part_id, sentence, answer, options_str, hint) VALUES (?, ?, ?, ?, ?)',
                            [partId, cq.sentence, cq.answer, cq.options_str, cq.hint]
                        );
                    }
                }
            }
        }
        console.log("Đã khởi tạo các Unit và Part bài học mẫu cho giáo viên!");

        console.log("✅ HOÀN TẤT: Đã khởi tạo database và dữ liệu thành công!");
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        if (connection) await connection.end();
    }
}

initDB();
