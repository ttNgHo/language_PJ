# 🎮 English Learning App - Kids & Students (Language PJ)

Ứng dụng web học tiếng Anh tương tác thông minh dành cho trẻ em và học sinh, tích hợp hệ thống bài giảng (Units & Parts), 6 minigame giáo dục vui nhộn với **nhạc nền (BGM) đa phong cách**, bảng thành tích danh hiệu động và trang quản trị giảng dạy.

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án

### 1. Yêu cầu tiên quyết
- **Node.js** (khuyến nghị v16 trở lên)
- **MySQL Server** (đang chạy cổng 3306, user `root`, mật khẩu theo file `.env`)

### 2. Cài đặt & Khởi tạo Database
Nếu bạn mở terminal tại thư mục gốc `lang`:
```bash
# Cài đặt dependencies (nếu chưa cài)
cd language/server
npm install
cd ../..

# Khởi tạo bảng dữ liệu và 10 chủ đề từ vựng mẫu
node language/server/init-db.js
```

### 3. Khởi chạy Server
Từ thư mục gốc `lang` hoặc trong thư mục `language/server`:
```bash
node language/server/server.js
```
Truy cập trình duyệt tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**

### 4. Chạy bộ kiểm thử tự động (Test Suite)
Dự án tích hợp bộ test tự động 104 test cases bao phủ Backend MySQL, DOM, Game Logic và Âm thanh:
```bash
cd language
node test-suite.js
```

---

## 🎵 Hệ Thống Nhạc Nền Vui Nhộn (Dynamic BGM Engine)

Hệ thống nhạc nền được phát triển độc quyền bằng công nghệ **Web Audio API** (tổng hợp sóng âm thực, zero network delay, không phụ thuộc file mp3 ngoài, không lỗi bản quyền hoặc 404):

| Trò chơi | Thể loại âm nhạc | Nhịp (BPM) | Đặc trưng giai điệu & Nhạc cụ |
| :--- | :--- | :--- | :--- |
| **1. Nối Từ (Word Match)** | *Tropical Calypso Marimba* | 128 BPM | Giai điệu mộc cầm rộn ràng vùng nhiệt đới, bass nảy tươi sáng và tiếng gõ lách cách vui tai. |
| **2. Đánh Vần (Spelling Bee)** | *Whimsical Toy Music Box* | 106 BPM | Chuông hộp nhạc trong trẻo như truyện cổ tích, tiếng pizzicato tí tách giúp bé tập trung suy nghĩ. |
| **3. Xếp Chữ (Word Scramble)** | *Funky Detective Groove* | 118 BPM | Bass điện tử cao su nhún nhảy phong cách thám tử nhí phá án, tiếng sáo synth tò mò kích thích tư duy. |
| **4. Thẻ Từ (Flashcards)** | *Cozy Study Chimes* | 94 BPM | Tiếng chuông gió êm dịu, ấm áp trên nền hợp âm thư giãn, hoàn hảo để học và ghi nhớ từ mới. |
| **5. Điền Từ (Fill in Blank)** | *Kids TV Game Show Gala* | 126 BPM | Phong cách gameshow truyền hình hào hứng, dàn kèn synth vui nhộn cùng bass bước đi sôi nổi. |
| **6. Hứng Từ (Word Catcher)** | *8-Bit Retro Chiptune Runner* | 146 BPM | Nhạc game cổ điển Arcade thập niên 90 với sóng vuông lướt nhanh kịch tính, nhịp trống dồn dập. |

### Các tính năng âm thanh nâng cao:
- **Nút bật/tắt nhạc BGM trực tiếp trong game (`#gameBgmToggle`):** Giúp người chơi bật/tắt nhạc tức thì ngay trên thanh trạng thái của game mà không cần thoát ra Menu Settings.
- **Audio Ducking thông minh:** Khi hệ thống đọc phát âm từ vựng (TTS) hoặc đọc câu chúc mừng bé ("Good job!", "Awesome!"), âm lượng nhạc nền tự động giảm xuống mức 25% để bé nghe rõ phát âm tiếng Anh chuẩn, sau đó tự phục hồi âm lượng mượt mà.
- **Đồng bộ trạng thái:** Lưu trạng thái âm thanh vào `localStorage` (`app_sound`, `app_music`) để ghi nhớ tuỳ chọn của người dùng.

---

## 🛠️ Danh Sách Các Lỗi Logic & Chức Năng Đã Được Rà Soát & Khắc Phục

1. **Khắc phục lỗi khởi động Server:**
   - Cấu hình tường minh đường dẫn `.env` trong cả `server.js` và `init-db.js`, giúp khởi chạy server từ bất kỳ thư mục nào mà không bị lỗi mất kết nối MySQL.
   - Bổ sung `package.json` gốc với các script khởi động tiện lợi.

2. **Sửa lỗi Trò chơi Hứng Từ (Word Catcher):**
   - *Lỗi cũ:* Từ mục tiêu bị cố định lặp lại 10 lần một từ duy nhất do không cập nhật mục tiêu mới sau mỗi lần hứng trúng.
   - *Đã sửa:* Mỗi lần hứng đúng, hệ thống tự động đổi sang một từ vựng mục tiêu mới kèm hiệu ứng chuyển chữ sinh động.
   - *Sửa toạ độ:* Sửa lỗi chữ rơi bị tràn ra ngoài màn hình bên phải trên thiết bị di động bằng phép tính `Math.max(10, Math.min(boardWidth - 110, ...))`.
   - *Sửa điểm cộng dồn ảo:* Thêm cờ chặn `clicked` để ngăn việc người chơi click liên tiếp nhiều lần vào một chữ đang rơi để gian lận điểm.

3. **Sửa lỗi Trò chơi Đánh Vần (Spelling Bee):**
   - *Lỗi cũ:* Khi gặp từ có dấu gạch nối hoặc nháy đơn (ví dụ: `T-shirt`, `o'clock`), bàn phím A-Z không có nút bấm tương ứng làm game bị kẹt không thể hoàn thành.
   - *Đã sửa:* Tự động hiển thị cố định các ký tự đặc biệt, người chơi chỉ cần gõ các chữ cái alphabet.
   - *Khóa bàn phím:* Vô hiệu hóa bàn phím ngay khi từ vựng hoàn thành để tránh click nhầm trong lúc chờ chuyển câu.

4. **Sửa lỗi Trò chơi Nối Từ (Word Match):**
   - *Lỗi cũ:* Tìm kiếm DOM bằng giá trị từ vựng `[data-val="${val}"]` dễ bị lỗi crash DOM query nếu từ vựng chứa dấu nháy đơn hoặc ký tự đặc biệt.
   - *Đã sửa:* Chuyển sang định danh duy nhất bằng chỉ số `data-index`. Thêm khóa `isEvaluating` để tránh người chơi click liên tục làm sai lệch logic so khớp cặp từ.

5. **Sửa lỗi Trò chơi Xếp Chữ (Word Scramble):**
   - Bổ sung cờ `isScrambleLocked` ngăn chặn người chơi nhấn tiếp vào các ô chữ khi đang hiển thị hiệu ứng chiến thắng hoặc đang trong thời gian đếm ngược.

6. **Sửa lỗi Trò chơi Điền Vào Chỗ Trống (Fill in Blank):**
   - Thêm cơ chế dự phòng tự sinh câu hỏi nếu danh sách câu hỏi trống. So sánh đáp án không phân biệt chữ hoa/thường và đã loại bỏ khoảng trắng thừa (`trim().toLowerCase()`).

7. **Sửa lỗi Thẻ Từ (Flashcards):**
   - Loại bỏ việc tăng tiến độ 2 lần gây nhảy số câu hỏi sai lệch trong `flashcardAnswer`.

8. **Sửa lỗi Trang Thành Tích (Achievements) & Hồ Sơ (Profile):**
   - *Đã sửa:* Tính toán huy hiệu động dựa trên các chỉ số thực tế của người chơi (`wordsLearned`, `gamesPlayed`, `streak`, `stars`).
   - Khôi phục đúng tuổi (`profileAge`) từ bộ nhớ máy khi tải trang.
   - Tự động cộng dồn số từ đã học và số trận đã chơi vào tài khoản sau mỗi màn game.

9. **Sửa lỗi Trang Quản Trị Bài Giảng (Admin Curriculum):**
   - Bổ sung hộp thoại xác nhận an toàn (`confirm`) và thông báo Toast khi xoá từ vựng hoặc câu hỏi riêng của Part.