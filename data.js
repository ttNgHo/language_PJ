/* ==========================================
   🌈 FunWords - Vocabulary Data
   All game data, words, categories
   ========================================== */

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

const DAILY_WORDS = [
    { en: 'Butterfly', vi: 'Con bướm', emoji: '🦋', phonetic: '/ˈbʌtərflaɪ/', example: 'The butterfly is very beautiful.', meaning: 'Con bướm' },
    { en: 'Rainbow', vi: 'Cầu vồng', emoji: '🌈', phonetic: '/ˈreɪn.boʊ/', example: 'The rainbow has seven colors.', meaning: 'Cầu vồng' },
    { en: 'Elephant', vi: 'Con voi', emoji: '🐘', phonetic: '/ˈel.ɪ.fənt/', example: 'The elephant is the biggest animal.', meaning: 'Con voi' },
    { en: 'Pineapple', vi: 'Quả dứa', emoji: '🍍', phonetic: '/ˈpaɪnˌæp.əl/', example: 'Pineapple juice is refreshing.', meaning: 'Quả dứa' },
    { en: 'Penguin', vi: 'Chim cánh cụt', emoji: '🐧', phonetic: '/ˈpeŋ.ɡwɪn/', example: 'Penguins love the cold.', meaning: 'Chim cánh cụt' },
    { en: 'Strawberry', vi: 'Dâu tây', emoji: '🍓', phonetic: '/ˈstrɔː.bər.i/', example: 'I love strawberry cake!', meaning: 'Dâu tây' },
    { en: 'Watermelon', vi: 'Dưa hấu', emoji: '🍉', phonetic: '/ˈwɔːtərmelən/', example: 'Watermelon is my favorite fruit.', meaning: 'Dưa hấu' },
];

const FILL_BLANK_DATA = [
    { sentence: 'The ___ is red.', answer: 'apple', options: ['apple', 'banana', 'orange', 'grape'], hint: '🍎 Một loại quả màu đỏ' },
    { sentence: 'I drink ___ every morning.', answer: 'milk', options: ['milk', 'soup', 'rice', 'cake'], hint: '🥛 Thức uống màu trắng' },
    { sentence: 'The ___ is shining.', answer: 'sun', options: ['sun', 'moon', 'rain', 'cloud'], hint: '☀️ Trên bầu trời ban ngày' },
    { sentence: 'My ___ reads me stories.', answer: 'mother', options: ['mother', 'teacher', 'dog', 'book'], hint: '👩 Người yêu thương bạn nhất' },
    { sentence: 'I go to ___ by bus.', answer: 'school', options: ['school', 'garden', 'forest', 'river'], hint: '🏫 Nơi bạn đến mỗi ngày' },
    { sentence: 'The ___ can fly.', answer: 'bird', options: ['bird', 'fish', 'dog', 'cat'], hint: '🐦 Con vật có cánh' },
    { sentence: 'I write with a ___.', answer: 'pen', options: ['pen', 'ruler', 'bag', 'clock'], hint: '🖊️ Dùng để viết' },
    { sentence: 'The ___ has a long trunk.', answer: 'elephant', options: ['elephant', 'rabbit', 'frog', 'duck'], hint: '🐘 Con vật to nhất' },
    { sentence: 'Snow is ___ and white.', answer: 'cold', options: ['cold', 'hot', 'big', 'fast'], hint: '❄️ Cảm giác khi chạm tuyết' },
    { sentence: 'I ride my ___ to the park.', answer: 'bike', options: ['bike', 'boat', 'plane', 'ship'], hint: '🚲 Có hai bánh xe' },
];

const GAMES_LIST = [
    {
        id: 'wordmatch',
        title: 'Nối Từ',
        icon: '🎯',
        desc: 'Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng. Hãy nối thật nhanh để ghi điểm cao!',
        difficulty: 'easy',
        color: '#FF6B6B',
        gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
        players: '2.5k',
        bestScore: 0
    },
    {
        id: 'spelling',
        title: 'Đánh Vần',
        icon: '🐝',
        desc: 'Nghe phát âm và đánh vần từ tiếng Anh cho đúng. Luyện phát âm và chính tả cùng lúc!',
        difficulty: 'medium',
        color: '#4ECDC4',
        gradient: 'linear-gradient(135deg, #4ECDC4, #44B09E)',
        players: '1.8k',
        bestScore: 0
    },
    {
        id: 'scramble',
        title: 'Xếp Chữ',
        icon: '🧩',
        desc: 'Sắp xếp các chữ cái lộn xộn thành từ có nghĩa. Thử thách trí não của bạn nào!',
        difficulty: 'medium',
        color: '#A78BFA',
        gradient: 'linear-gradient(135deg, #A78BFA, #818CF8)',
        players: '2.1k',
        bestScore: 0
    },
    {
        id: 'flashcards',
        title: 'Thẻ Ghi Nhớ',
        icon: '🃏',
        desc: 'Lật thẻ để học và ghi nhớ từ vựng mới. Phương pháp học hiệu quả nhất!',
        difficulty: 'easy',
        color: '#F59E0B',
        gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
        players: '3.2k',
        bestScore: 0
    },
    {
        id: 'fillblank',
        title: 'Điền Từ',
        icon: '📝',
        desc: 'Điền từ còn thiếu vào câu cho hoàn chỉnh. Luyện ngữ pháp và từ vựng!',
        difficulty: 'hard',
        color: '#EC4899',
        gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
        players: '1.5k',
        bestScore: 0
    },
    {
        id: 'wordcatcher',
        title: 'Bắt Từ',
        icon: '🎮',
        desc: 'Bắt từ đúng rơi xuống trước khi quá muộn! Trò chơi hành động kịch tính!',
        difficulty: 'hard',
        color: '#06B6D4',
        gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
        players: '1.9k',
        bestScore: 0
    }
];

const BADGES = [
    { emoji: '🌟', name: 'Ngôi Sao Mới', desc: 'Chơi lần đầu tiên', unlocked: true },
    { emoji: '📚', name: 'Mọt Sách', desc: 'Học 50 từ vựng', unlocked: true },
    { emoji: '🎯', name: 'Bách Phát', desc: 'Đúng 10 câu liên tiếp', unlocked: true },
    { emoji: '⚡', name: 'Tia Chớp', desc: 'Hoàn thành trong 30s', unlocked: false },
    { emoji: '🔥', name: 'Siêu Nhiệt', desc: 'Chuỗi 7 ngày liên tiếp', unlocked: false },
    { emoji: '👑', name: 'Vua Từ Vựng', desc: 'Học 200 từ vựng', unlocked: false },
    { emoji: '🏆', name: 'Nhà Vô Địch', desc: 'Đạt 1000 sao', unlocked: false },
    { emoji: '🦄', name: 'Kỳ Lân', desc: 'Hoàn thành tất cả game', unlocked: false },
    { emoji: '🎨', name: 'Nghệ Sĩ', desc: 'Học hết chủ đề Màu sắc', unlocked: true },
    { emoji: '🐾', name: 'Bạn Thú Cưng', desc: 'Học hết chủ đề Động vật', unlocked: false },
    { emoji: '💎', name: 'Kim Cương', desc: 'Đạt cấp 10', unlocked: false },
    { emoji: '🌈', name: 'Cầu Vồng', desc: 'Chơi tất cả 6 trò chơi', unlocked: false },
];

const MASCOT_PHRASES = [
    "Hello! Let's learn! 🎉",
    "You're amazing! 🌟",
    "Keep going! 💪",
    "Great job today! 👏",
    "Let's play! 🎮",
    "I believe in you! ❤️",
    "Ready to learn? 📚",
    "You're so smart! 🧠",
    "Wow, fantastic! ✨",
    "Never give up! 🔥",
];

const DECORATION_EMOJIS = ['⭐', '🌟', '✨', '💫', '🎈', '🎉', '🌈', '🦋', '🌸', '🍀', '🎵', '💖', '🔮', '🎪', '🎭'];
