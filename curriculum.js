/* ==========================================
   🌈 FunWords - Curriculum & Teaching Engine
   Unit & Part Management, Teaching Mode, Admin CRUD
   ========================================== */

const API_BASE = window.location.origin.startsWith('http') ? '' : 'http://localhost:3000';
let UNITS_DATA = [];
let currentEditingUnitId = null;
let currentEditingPartId = null;
let currentContentPartId = null;

// ===== Load Units and Parts from Backend API =====
async function loadCurriculumData(showFeedbackToast = false) {
    try {
        const res = await fetch(`${API_BASE}/api/units`);
        if (!res.ok) throw new Error('Không thể tải dữ liệu bài học');
        const json = await res.json();
        if (json.success) {
            UNITS_DATA = json.data || [];
            renderCurriculumPage();
            renderAdminPage();
            if (showFeedbackToast) {
                showToast('✅ Đã làm mới dữ liệu bài học!', 'success');
            }
        }
    } catch (err) {
        console.error('Lỗi khi tải dữ liệu bài học (Unit & Part):', err);
        if (showFeedbackToast) {
            showToast('⚠️ Không thể kết nối với máy chủ!', 'error');
        }
    }
}

// Helper: Game type meta
const GAME_TYPES_META = {
    flashcards: { name: 'Thẻ Ghi Nhớ', icon: '🃏', color: '#F59E0B', badge: 'Học từ vựng' },
    wordmatch: { name: 'Nối Từ', icon: '🎯', color: '#FF6B6B', badge: 'Luyện trí nhớ' },
    spelling: { name: 'Đánh Vần', icon: '🐝', color: '#4ECDC4', badge: 'Luyện nghe & viết' },
    scramble: { name: 'Xếp Chữ', icon: '🧩', color: '#A78BFA', badge: 'Giải đố chữ cái' },
    fillblank: { name: 'Điền Từ', icon: '📝', color: '#EC4899', badge: 'Ngữ pháp & câu' },
    wordcatcher: { name: 'Bắt Từ', icon: '🎮', color: '#06B6D4', badge: 'Phản xạ nhanh' }
};

// ==========================================
// 📖 RENDER CURRICULUM PAGE (HỌC & GIẢNG DẠY)
// ==========================================
function renderCurriculumPage() {
    const container = document.getElementById('curriculumUnitsList');
    if (!container) return;

    if (!UNITS_DATA || UNITS_DATA.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📘</div>
                <h3>Chưa có Unit bài học nào</h3>
                <p>Hãy mở trang Quản Lý để tạo Unit và các bài học đầu tiên nhé!</p>
                <button class="btn btn-primary" onclick="showPage('admin')">
                    <span>➕ Tạo Unit Mới</span>
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = UNITS_DATA.map((unit) => {
        const parts = unit.parts || [];
        const unitColor = unit.color || '#6C63FF';
        
        return `
            <div class="curriculum-unit-card" style="--unit-theme: ${unitColor};">
                <div class="curriculum-unit-header">
                    <div class="unit-icon-box" style="background: ${unitColor}20; color: ${unitColor};">
                        <span>${unit.icon || '📘'}</span>
                    </div>
                    <div class="unit-info-box">
                        <div class="unit-meta-top">
                            <span class="unit-number-pill" style="background: ${unitColor}; color: white;">
                                Unit ${unit.unit_number}
                            </span>
                            <span class="unit-parts-count">
                                📚 ${parts.length} Phần bài học / Mini-game
                            </span>
                        </div>
                        <h2 class="unit-title">${unit.title}</h2>
                        <p class="unit-desc">${unit.description || 'Chương trình rèn luyện tiếng Anh tích hợp trò chơi.'}</p>
                    </div>
                    <div class="unit-quick-admin">
                        <button class="btn btn-sm btn-ghost" onclick="openAddPartModal(${unit.id})" title="Thêm Part mới vào Unit này">
                            <span>➕ Thêm Part</span>
                        </button>
                    </div>
                </div>

                <div class="curriculum-parts-container">
                    ${parts.length === 0 ? `
                        <div class="empty-parts-hint">
                            <span>Chưa có phần bài học nào trong Unit này. </span>
                            <button class="btn btn-sm btn-outline" onclick="openAddPartModal(${unit.id})">
                                ➕ Thêm Part bài học / Mini-game ngay
                            </button>
                        </div>
                    ` : `
                        <div class="parts-grid">
                            ${parts.map((part) => {
                                const gameMeta = GAME_TYPES_META[part.game_type] || { name: part.game_type, icon: '🎮', color: '#6C63FF' };
                                const hasCustomWords = part.custom_words_count > 0;
                                const hasCustomQuestions = part.custom_questions_count > 0;
                                const wordInfoText = hasCustomWords ? `⭐ ${part.custom_words_count} từ vựng riêng` :
                                                    hasCustomQuestions ? `❓ ${part.custom_questions_count} câu hỏi riêng` :
                                                    `Chủ đề: ${getCategoryName(part.category_code)}`;

                                return `
                                    <div class="curriculum-part-card" style="--part-color: ${gameMeta.color};">
                                        <div class="part-top-row">
                                            <span class="part-badge">Part ${part.part_number}</span>
                                            <span class="part-gametype-chip" style="background: ${gameMeta.color}18; color: ${gameMeta.color};">
                                                ${gameMeta.icon} ${gameMeta.name}
                                            </span>
                                        </div>
                                        <h4 class="part-card-title">${part.title}</h4>
                                        <p class="part-card-desc">${part.description || 'Tham gia học từ vựng và chơi trò chơi tương tác.'}</p>
                                        
                                        <div class="part-card-footer">
                                            <span class="part-source-tag">
                                                ${wordInfoText}
                                            </span>
                                            <div class="part-btn-group">
                                                <button class="btn btn-sm btn-primary pulse-hover" onclick="launchPartGame(${unit.id}, ${part.id})">
                                                    <span>🚀 Dạy / Chơi</span>
                                                </button>
                                                <button class="btn btn-sm btn-icon-only" onclick="openPartContentModal(${part.id})" title="Soạn từ vựng / câu hỏi cho Part này">
                                                    <span>📝</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// ⚙️ RENDER ADMIN MANAGEMENT PAGE (QUẢN LÝ)
// ==========================================
function renderAdminPage() {
    const listEl = document.getElementById('adminUnitsList');
    if (!listEl) return;

    // Tính toán thống kê
    let totalParts = 0;
    let totalCustomWords = 0;
    let totalCustomQuestions = 0;

    UNITS_DATA.forEach(u => {
        if (u.parts) {
            totalParts += u.parts.length;
            u.parts.forEach(p => {
                totalCustomWords += parseInt(p.custom_words_count || 0);
                totalCustomQuestions += parseInt(p.custom_questions_count || 0);
            });
        }
    });

    const elUnits = document.getElementById('adminTotalUnits');
    const elParts = document.getElementById('adminTotalParts');
    const elWords = document.getElementById('adminTotalCustomWords');
    const elQuestions = document.getElementById('adminTotalCustomQuestions');

    if (elUnits) elUnits.textContent = UNITS_DATA.length;
    if (elParts) elParts.textContent = totalParts;
    if (elWords) elWords.textContent = totalCustomWords;
    if (elQuestions) elQuestions.textContent = totalCustomQuestions;

    if (UNITS_DATA.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>Chưa có bài học nào được tạo</h3>
                <p>Nhấn vào nút "Thêm Unit Mới" để bắt đầu soạn giáo trình giảng dạy!</p>
                <button class="btn btn-primary" onclick="openAddUnitModal()">
                    <span>➕ Thêm Unit Đầu Tiên</span>
                </button>
            </div>
        `;
        return;
    }

    listEl.innerHTML = UNITS_DATA.map((unit) => {
        const parts = unit.parts || [];
        const unitColor = unit.color || '#6C63FF';

        return `
            <div class="admin-unit-box" id="adminUnit-${unit.id}" style="--unit-accent: ${unitColor};">
                <div class="admin-unit-top">
                    <div class="admin-unit-meta">
                        <span class="admin-unit-icon" style="background: ${unitColor}25;">${unit.icon || '📘'}</span>
                        <div>
                            <div class="admin-unit-tag-row">
                                <span class="admin-tag unit-badge-num" style="background: ${unitColor}; color: white;">
                                    Unit ${unit.unit_number}
                                </span>
                                <span class="admin-tag parts-counter">
                                    ${parts.length} phần bài học / trò chơi
                                </span>
                            </div>
                            <h3 class="admin-unit-heading">${unit.title}</h3>
                            <p class="admin-unit-subtext">${unit.description || 'Không có mô tả'}</p>
                        </div>
                    </div>
                    <div class="admin-unit-actions">
                        <button class="btn btn-sm btn-primary" onclick="openAddPartModal(${unit.id})">
                            <span>➕ Thêm Part</span>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="openEditUnitModal(${unit.id})">
                            <span>✏️ Sửa</span>
                        </button>
                        <button class="btn btn-sm btn-danger-soft" onclick="deleteUnit(${unit.id})">
                            <span>🗑️ Xóa</span>
                        </button>
                    </div>
                </div>

                <div class="admin-unit-parts-section">
                    <div class="admin-parts-header">
                        <h4>Danh Sách Part & Mini-Game Trong Unit:</h4>
                    </div>

                    ${parts.length === 0 ? `
                        <div class="admin-no-parts">
                            Unit này chưa có Part nào. Hãy nhấn <strong>"➕ Thêm Part"</strong> để tạo bài học nhé!
                        </div>
                    ` : `
                        <div class="admin-parts-table-wrap">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th style="width: 70px;">Part</th>
                                        <th>Tên Bài Học / Hoạt Động</th>
                                        <th>Trò Chơi</th>
                                        <th>Nội Dung / Từ Vựng</th>
                                        <th style="text-align: right; width: 330px;">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${parts.map((p) => {
                                        const gMeta = GAME_TYPES_META[p.game_type] || { name: p.game_type, icon: '🎮', color: '#6C63FF' };
                                        const customCount = (p.custom_words_count || 0) + (p.custom_questions_count || 0);

                                        return `
                                            <tr>
                                                <td><span class="part-number-chip">#${p.part_number}</span></td>
                                                <td>
                                                    <strong>${p.title}</strong>
                                                    ${p.description ? `<div class="sub-desc">${p.description}</div>` : ''}
                                                </td>
                                                <td>
                                                    <span class="game-tag-badge" style="background: ${gMeta.color}15; color: ${gMeta.color}; border: 1px solid ${gMeta.color}40;">
                                                        ${gMeta.icon} ${gMeta.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    ${customCount > 0 ? `
                                                        <span class="badge-custom-active">
                                                            ⭐ ${p.custom_words_count || 0} từ / ${p.custom_questions_count || 0} câu hỏi
                                                        </span>
                                                    ` : `
                                                        <span class="badge-category-default">
                                                            Chủ đề: ${getCategoryName(p.category_code)}
                                                        </span>
                                                    `}
                                                </td>
                                                <td style="text-align: right;">
                                                    <div class="table-btn-group">
                                                        <button class="btn btn-xs btn-primary" onclick="launchPartGame(${unit.id}, ${p.id})" title="Chạy thử nghiệm / Giảng dạy bài học này">
                                                            <span>🚀 Dạy ngay</span>
                                                        </button>
                                                        <button class="btn btn-xs btn-outline" onclick="openPartContentModal(${p.id})" title="Soạn từ vựng và câu hỏi cho Part này">
                                                            <span>📝 Soạn từ</span>
                                                        </button>
                                                        <button class="btn btn-xs btn-secondary" onclick="openEditPartModal(${p.id})" title="Sửa thông tin Part">
                                                            <span>✏️</span>
                                                        </button>
                                                        <button class="btn btn-xs btn-danger-soft" onclick="deletePart(${p.id})" title="Xóa Part này">
                                                            <span>🗑️</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// ===== Admin Filter / Search =====
function filterAdminUnits() {
    const query = (document.getElementById('adminSearchInput')?.value || '').toLowerCase().trim();
    const boxes = document.querySelectorAll('.admin-unit-box');
    boxes.forEach(box => {
        const text = box.innerText.toLowerCase();
        box.style.display = text.includes(query) ? '' : 'none';
    });
}

// ==========================================
// 🚀 LAUNCH PART GAME (CHẾ ĐỘ GIẢNG DẠY)
// ==========================================
async function launchPartGame(unitId, partId) {
    try {
        showToast('⏳ Đang tải nội dung bài học...', 'info');
        const res = await fetch(`${API_BASE}/api/parts/${partId}/details`);
        if (!res.ok) throw new Error('Không thể tải chi tiết Part');
        const json = await res.json();
        
        if (!json.success || !json.data) {
            showToast('Không tìm thấy thông tin bài học!', 'error');
            return;
        }

        const part = json.data;
        const unit = UNITS_DATA.find(u => u.id === unitId) || { title: `Unit ${part.unit_id}` };

        // Lưu thông tin vào gameState
        gameState.currentUnitId = unitId;
        gameState.currentPartId = partId;
        gameState.currentPart = part;
        gameState.isTeachingMode = true;

        // Gán từ vựng và câu hỏi riêng nếu có
        gameState.customWords = (part.words && part.words.length > 0) ? part.words : null;
        gameState.customQuestions = (part.questions && part.questions.length > 0) ? part.questions : null;
        gameState.category = part.category_code || 'animals';

        // Cập nhật banner giảng dạy
        const banner = document.getElementById('teachingBanner');
        const info = document.getElementById('tbInfo');
        if (banner && info) {
            info.innerHTML = `<strong>${unit.title}</strong> ➔ <span style="color: #FFD93D;">${part.title}</span>`;
            banner.style.display = 'flex';
        }

        // Bắt đầu game
        startGame(part.game_type);

        const wordCount = gameState.customWords ? gameState.customWords.length : 0;
        showToast(`🎓 Đang giảng dạy: ${part.title} ${wordCount ? `(${wordCount} từ riêng)` : ''}`, 'success');
    } catch (err) {
        console.error('Lỗi khi mở bài học:', err);
        showToast('Lỗi khi khởi chạy bài học!', 'error');
    }
}

// Thoát chế độ giảng dạy
function exitTeachingMode() {
    stopTimer();
    gameState.isTeachingMode = false;
    gameState.customWords = null;
    gameState.customQuestions = null;
    
    const banner = document.getElementById('teachingBanner');
    if (banner) banner.style.display = 'none';

    showPage('curriculum');
}

function handleGameplayBack() {
    if (gameState.isTeachingMode) {
        exitTeachingMode();
    } else {
        showPage('games');
    }
}

// ==========================================
// 📘 MODAL UNIT (THÊM / SỬA UNIT)
// ==========================================
function openAddUnitModal() {
    currentEditingUnitId = null;
    document.getElementById('modalUnitTitle').textContent = '➕ Thêm Unit Mới';
    document.getElementById('unitModalId').value = '';
    
    // Tự động gợi ý số Unit tiếp theo
    const nextNum = UNITS_DATA.length > 0 ? Math.max(...UNITS_DATA.map(u => u.unit_number || 0)) + 1 : 1;
    document.getElementById('unitNumberInput').value = nextNum;
    document.getElementById('unitTitleInput').value = `Unit ${nextNum}: `;
    document.getElementById('unitIconInput').value = '📘';
    document.getElementById('unitColorInput').value = '#6C63FF';
    document.getElementById('unitDescInput').value = '';

    document.getElementById('modalUnit').classList.add('show');
}

function openEditUnitModal(unitId) {
    const unit = UNITS_DATA.find(u => u.id === unitId);
    if (!unit) return;

    currentEditingUnitId = unitId;
    document.getElementById('modalUnitTitle').textContent = '✏️ Chỉnh Sửa Unit';
    document.getElementById('unitModalId').value = unit.id;
    document.getElementById('unitNumberInput').value = unit.unit_number;
    document.getElementById('unitTitleInput').value = unit.title;
    document.getElementById('unitIconInput').value = unit.icon || '📘';
    document.getElementById('unitColorInput').value = unit.color || '#6C63FF';
    document.getElementById('unitDescInput').value = unit.description || '';

    document.getElementById('modalUnit').classList.add('show');
}

function closeUnitModal() {
    document.getElementById('modalUnit').classList.remove('show');
}

function pickUnitEmoji(emoji) {
    document.getElementById('unitIconInput').value = emoji;
}

function pickUnitColor(color) {
    document.getElementById('unitColorInput').value = color;
}

async function saveUnitForm(event) {
    event.preventDefault();
    const id = document.getElementById('unitModalId').value;
    const unit_number = parseInt(document.getElementById('unitNumberInput').value) || 1;
    const title = document.getElementById('unitTitleInput').value.trim();
    const icon = document.getElementById('unitIconInput').value.trim() || '📘';
    const color = document.getElementById('unitColorInput').value.trim() || '#6C63FF';
    const description = document.getElementById('unitDescInput').value.trim();

    if (!title) {
        showToast('Vui lòng nhập tên Unit!', 'warning');
        return;
    }

    try {
        const url = id ? `${API_BASE}/api/units/${id}` : `${API_BASE}/api/units`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit_number, title, icon, color, description })
        });

        const json = await res.json();
        if (json.success) {
            closeUnitModal();
            showToast(id ? '✅ Đã cập nhật Unit!' : '🎉 Đã tạo Unit mới thành công!', 'success');
            await loadCurriculumData();
        } else {
            showToast(json.message || 'Lỗi khi lưu Unit!', 'error');
        }
    } catch (err) {
        console.error('Lỗi saveUnitForm:', err);
        showToast('Lỗi máy chủ khi lưu Unit!', 'error');
    }
}

async function deleteUnit(unitId) {
    const unit = UNITS_DATA.find(u => u.id === unitId);
    const unitTitle = unit ? unit.title : `Unit #${unitId}`;
    
    if (!confirm(`Bạn có chắc chắn muốn xóa "${unitTitle}" không?\nTất cả các Part và từ vựng trong Unit này cũng sẽ bị xóa!`)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/units/${unitId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('🗑️ Đã xóa Unit thành công!', 'info');
            await loadCurriculumData();
        } else {
            showToast(json.message || 'Không thể xóa Unit!', 'error');
        }
    } catch (err) {
        console.error('Lỗi deleteUnit:', err);
        showToast('Lỗi máy chủ khi xóa Unit!', 'error');
    }
}

// ==========================================
// 🎯 MODAL PART (THÊM / SỬA PART)
// ==========================================
function openAddPartModal(preselectedUnitId = null) {
    currentEditingPartId = null;
    document.getElementById('modalPartTitle').textContent = '➕ Thêm Part Mới Cho Unit';
    document.getElementById('partModalId').value = '';

    // Populate units dropdown
    const unitSelect = document.getElementById('partUnitSelect');
    unitSelect.innerHTML = UNITS_DATA.map(u => `
        <option value="${u.id}" ${u.id === preselectedUnitId ? 'selected' : ''}>
            Unit ${u.unit_number}: ${u.title}
        </option>
    `).join('');

    // Tính số Part kế tiếp
    let nextPartNum = 1;
    if (preselectedUnitId) {
        const unit = UNITS_DATA.find(u => u.id === preselectedUnitId);
        if (unit && unit.parts && unit.parts.length > 0) {
            nextPartNum = Math.max(...unit.parts.map(p => p.part_number || 0)) + 1;
        }
    }

    document.getElementById('partNumberInput').value = nextPartNum;
    document.getElementById('partTitleInput').value = `Part ${nextPartNum}: `;
    document.getElementById('partGameTypeSelect').value = 'flashcards';
    document.getElementById('partCategorySelect').value = 'animals';
    document.getElementById('partDescInput').value = '';

    document.getElementById('modalPart').classList.add('show');
}

function openEditPartModal(partId) {
    let targetPart = null;
    let targetUnit = null;

    for (const u of UNITS_DATA) {
        const p = (u.parts || []).find(item => item.id === partId);
        if (p) {
            targetPart = p;
            targetUnit = u;
            break;
        }
    }

    if (!targetPart) return;

    currentEditingPartId = partId;
    document.getElementById('modalPartTitle').textContent = '✏️ Chỉnh Sửa Part Bài Học';
    document.getElementById('partModalId').value = targetPart.id;

    // Populate units dropdown
    const unitSelect = document.getElementById('partUnitSelect');
    unitSelect.innerHTML = UNITS_DATA.map(u => `
        <option value="${u.id}" ${u.id === targetPart.unit_id ? 'selected' : ''}>
            Unit ${u.unit_number}: ${u.title}
        </option>
    `).join('');

    document.getElementById('partNumberInput').value = targetPart.part_number;
    document.getElementById('partTitleInput').value = targetPart.title;
    document.getElementById('partGameTypeSelect').value = targetPart.game_type || 'flashcards';
    document.getElementById('partCategorySelect').value = targetPart.category_code || 'animals';
    document.getElementById('partDescInput').value = targetPart.description || '';

    document.getElementById('modalPart').classList.add('show');
}

function closePartModal() {
    document.getElementById('modalPart').classList.remove('show');
}

async function savePartForm(event) {
    event.preventDefault();
    const id = document.getElementById('partModalId').value;
    const unit_id = parseInt(document.getElementById('partUnitSelect').value);
    const part_number = parseInt(document.getElementById('partNumberInput').value) || 1;
    const title = document.getElementById('partTitleInput').value.trim();
    const game_type = document.getElementById('partGameTypeSelect').value;
    const category_code = document.getElementById('partCategorySelect').value;
    const description = document.getElementById('partDescInput').value.trim();

    if (!title) {
        showToast('Vui lòng nhập tên Part!', 'warning');
        return;
    }

    try {
        const url = id ? `${API_BASE}/api/parts/${id}` : `${API_BASE}/api/parts`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unit_id, part_number, title, game_type, category_code, description })
        });

        const json = await res.json();
        if (json.success) {
            closePartModal();
            showToast(id ? '✅ Đã cập nhật Part!' : '🎉 Đã thêm Part mới thành công!', 'success');
            await loadCurriculumData();
        } else {
            showToast(json.message || 'Lỗi khi lưu Part!', 'error');
        }
    } catch (err) {
        console.error('Lỗi savePartForm:', err);
        showToast('Lỗi máy chủ khi lưu Part!', 'error');
    }
}

async function deletePart(partId) {
    if (!confirm('Bạn có chắc muốn xóa Part bài học này không?')) return;

    try {
        const res = await fetch(`${API_BASE}/api/parts/${partId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('🗑️ Đã xóa Part!', 'info');
            await loadCurriculumData();
        } else {
            showToast(json.message || 'Không thể xóa Part!', 'error');
        }
    } catch (err) {
        console.error('Lỗi deletePart:', err);
        showToast('Lỗi máy chủ khi xóa Part!', 'error');
    }
}

// ==========================================
// 📝 MODAL SOẠN TỪ VỰNG & CÂU HỎI CHO PART
// ==========================================
async function openPartContentModal(partId) {
    currentContentPartId = partId;
    document.getElementById('modalPartContent').classList.add('show');
    await loadPartContentDetails(partId);
}

function closePartContentModal() {
    document.getElementById('modalPartContent').classList.remove('show');
    currentContentPartId = null;
}

function switchContentTab(tabName) {
    document.querySelectorAll('.content-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.getElementById('contentWordsPane').style.display = tabName === 'words' ? 'block' : 'none';
    document.getElementById('contentQuestionsPane').style.display = tabName === 'questions' ? 'block' : 'none';
}

async function loadPartContentDetails(partId) {
    try {
        const res = await fetch(`${API_BASE}/api/parts/${partId}/details`);
        if (!res.ok) throw new Error('Không thể tải chi tiết Part');
        const json = await res.json();
        if (!json.success || !json.data) return;

        const part = json.data;
        document.getElementById('mpcPartTitle').textContent = `${part.title} (${GAME_TYPES_META[part.game_type]?.name || part.game_type})`;
        
        const words = part.words || [];
        const questions = part.questions || [];

        document.getElementById('mpcWordCount').textContent = words.length;
        document.getElementById('mpcQuestionCount').textContent = questions.length;

        // Render Words Table
        const wordsListEl = document.getElementById('mpcWordsList');
        if (words.length === 0) {
            wordsListEl.innerHTML = `
                <div class="empty-content-box">
                    <p>Chưa có từ vựng riêng nào. Hiện tại Part này đang dùng từ vựng theo chủ đề mặc định: <strong>${getCategoryName(part.category_code)}</strong>.</p>
                    <p class="hint">Thêm các từ dưới đây nếu bạn muốn học sinh học đúng các từ do bạn chỉ định!</p>
                </div>
            `;
        } else {
            wordsListEl.innerHTML = `
                <table class="content-table">
                    <thead>
                        <tr>
                            <th>Emoji</th>
                            <th>Từ Tiếng Anh</th>
                            <th>Nghĩa Tiếng Việt</th>
                            <th>Phiên Âm</th>
                            <th>Ví Dụ</th>
                            <th style="width: 85px; text-align: center;">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${words.map(w => `
                            <tr>
                                <td style="font-size: 1.4rem;">${w.emoji || '⭐'}</td>
                                <td><strong>${w.en}</strong></td>
                                <td>${w.vi}</td>
                                <td><code>${w.phonetic || ''}</code></td>
                                <td style="font-style: italic; color: var(--text-secondary);">${w.example || ''}</td>
                                <td>
                                    <div style="display: flex; gap: 6px; justify-content: center;">
                                        <button class="btn-xs btn-outline" onclick="speakWord('${w.en}')" title="Nghe phát âm">🔊</button>
                                        <button class="btn-table-delete" onclick="deleteWordFromPart(${w.id})" title="Xóa từ này">❌</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        // Render Questions Table
        const questionsListEl = document.getElementById('mpcQuestionsList');
        if (questions.length === 0) {
            questionsListEl.innerHTML = `
                <div class="empty-content-box">
                    <p>Chưa có câu hỏi điền từ riêng. Part đang dùng kho câu hỏi mẫu của hệ thống.</p>
                </div>
            `;
        } else {
            questionsListEl.innerHTML = `
                <table class="content-table">
                    <thead>
                        <tr>
                            <th>Câu Hỏi (Chứa ___)</th>
                            <th>Đáp Án</th>
                            <th>Các Lựa Chọn</th>
                            <th>Gợi Ý</th>
                            <th style="width: 50px;">Xóa</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${questions.map(q => `
                            <tr>
                                <td><strong>${q.sentence}</strong></td>
                                <td><span class="badge-answer">${q.answer}</span></td>
                                <td><code>${q.options_str || (q.options ? q.options.join(',') : '')}</code></td>
                                <td>${q.hint || ''}</td>
                                <td>
                                    <button class="btn-table-delete" onclick="deleteQuestionFromPart(${q.id})">❌</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (err) {
        console.error('Lỗi khi tải chi tiết nội dung part:', err);
    }
}

async function addWordToPart(event) {
    event.preventDefault();
    if (!currentContentPartId) return;

    const word_en = document.getElementById('newWordEn').value.trim();
    const word_vi = document.getElementById('newWordVi').value.trim();
    const emoji = document.getElementById('newWordEmoji').value.trim() || '⭐';
    const phonetic = document.getElementById('newWordPhonetic').value.trim();
    const example = document.getElementById('newWordExample').value.trim();

    if (!word_en || !word_vi) {
        showToast('Vui lòng nhập Từ Tiếng Anh và Nghĩa Tiếng Việt!', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/parts/${currentContentPartId}/words`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word_en, word_vi, emoji, phonetic, example })
        });
        const json = await res.json();
        if (json.success) {
            showToast('✅ Đã thêm từ vựng vào Part!', 'success');
            // Reset form
            document.getElementById('newWordEn').value = '';
            document.getElementById('newWordVi').value = '';
            document.getElementById('newWordEmoji').value = '⭐';
            document.getElementById('newWordPhonetic').value = '';
            document.getElementById('newWordExample').value = '';
            await loadPartContentDetails(currentContentPartId);
            await loadCurriculumData();
        }
    } catch (err) {
        console.error('Lỗi addWordToPart:', err);
        showToast('Lỗi máy chủ khi thêm từ!', 'error');
    }
}

async function deleteWordFromPart(wordId) {
    try {
        const res = await fetch(`${API_BASE}/api/parts/words/${wordId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('Đã xóa từ vựng', 'info');
            await loadPartContentDetails(currentContentPartId);
            await loadCurriculumData();
        }
    } catch (err) {
        console.error('Lỗi deleteWordFromPart:', err);
    }
}

async function addQuestionToPart(event) {
    event.preventDefault();
    if (!currentContentPartId) return;

    const sentence = document.getElementById('newQSentence').value.trim();
    const answer = document.getElementById('newQAnswer').value.trim();
    const options_str = document.getElementById('newQOptions').value.trim();
    const hint = document.getElementById('newQHint').value.trim();

    if (!sentence || !answer || !options_str) {
        showToast('Vui lòng điền đủ câu hỏi, đáp án và các lựa chọn!', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/parts/${currentContentPartId}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentence, answer, options_str, hint })
        });
        const json = await res.json();
        if (json.success) {
            showToast('✅ Đã thêm câu hỏi vào Part!', 'success');
            document.getElementById('newQSentence').value = '';
            document.getElementById('newQAnswer').value = '';
            document.getElementById('newQOptions').value = '';
            document.getElementById('newQHint').value = '';
            await loadPartContentDetails(currentContentPartId);
            await loadCurriculumData();
        }
    } catch (err) {
        console.error('Lỗi addQuestionToPart:', err);
        showToast('Lỗi máy chủ khi thêm câu hỏi!', 'error');
    }
}

async function deleteQuestionFromPart(questionId) {
    try {
        const res = await fetch(`${API_BASE}/api/parts/questions/${questionId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
            showToast('Đã xóa câu hỏi', 'info');
            await loadPartContentDetails(currentContentPartId);
            await loadCurriculumData();
        }
    } catch (err) {
        console.error('Lỗi deleteQuestionFromPart:', err);
    }
}
