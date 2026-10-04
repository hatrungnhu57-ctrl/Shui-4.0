/**
 * DANH BẠ HỤI VIÊN DÙNG CHUNG (MEMBER DIRECTORY)
 * Chống trùng SĐT, Cảnh báo rủi ro nội bộ, Đánh giá uy tín, Gộp hồ sơ trùng
 */

import { store } from '../store.js';
import { getCreditBadge, showToast, escapeHtml } from '../utils.js';

export function renderMembersDirectory(container) {
  const profiles = store.state.profiles.filter(p => !p.isMerged);

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">👥 Danh Bạ Hụi Viên</h2>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Kho dữ liệu dùng chung - Tự động liên kết khi mở dây mới
        </div>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-open-add-member">
        ➕ Thêm Người Mới
      </button>
    </div>

    <!-- Thanh tìm kiếm & lọc nhanh -->
    <div style="display: flex; gap: 8px;">
      <input type="text" id="member-search-input" class="form-control" placeholder="🔍 Tìm tên, biệt danh hoặc số điện thoại..." />
    </div>

    <!-- Danh sách thành viên -->
    <div class="item-list" id="member-list-container">
      ${renderMemberListHTML(profiles)}
    </div>

    <!-- Modal Thêm / Sửa Hụi Viên -->
    <div id="modal-member-form" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-member-title">Thêm Hụi Viên Mới Vào Danh Bạ</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-member-modal">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="form-member-id" />

          <div class="form-group">
            <label class="form-label">Họ và tên đầy đủ (*):</label>
            <input type="text" id="form-member-fullname" class="form-control" placeholder="VD: Nguyễn Văn Ba" required />
          </div>

          <div class="form-group">
            <label class="form-label">Tên thường gọi / Biệt danh miền Nam:</label>
            <input type="text" id="form-member-nickname" class="form-control" placeholder="VD: Anh Ba Khía, Bảy May Mặc" />
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại (*) <span style="font-size:11px; color:var(--text-muted);">(Không tạo trùng):</span></label>
            <input type="tel" id="form-member-phone" class="form-control" placeholder="VD: 0909888999" required />
          </div>

          <div class="form-group">
            <label class="form-label">Địa chỉ / Khu vực cư trú:</label>
            <input type="text" id="form-member-address" class="form-control" placeholder="VD: Xã Tam Bình, Huyện Cai Lậy, Tiền Giang" />
          </div>

          <div class="form-group">
            <label class="form-label">Mức độ uy tín nội bộ:</label>
            <select id="form-member-rating" class="form-control form-select">
              <option value="5">⭐⭐⭐⭐⭐ 5/5 - Rất uy tín (Luôn đóng sớm/đúng giờ)</option>
              <option value="4">⭐⭐⭐⭐ 4/5 - Tốt (Đóng đủ, đôi khi nhắc nhẹ)</option>
              <option value="3">⭐⭐⭐ 3/5 - Trung bình (Thỉnh thoảng chậm 1-2 ngày)</option>
              <option value="2">⭐⭐ 2/5 - Rủi ro (Từng trễ nhiều kỳ, cần bảo đảm)</option>
              <option value="1">⭐ 1/5 - Rất rủi ro / Đang có nợ xấu</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Ghi chú rủi ro / Lịch sử nợ (Chỉ Chủ Hụi thấy):</label>
            <textarea id="form-member-risknote" class="form-control" rows="2" placeholder="VD: Từng trễ 2 kỳ ở dây cũ; chỉ nên cho chơi tối đa 1 phần..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Ghi chú thêm:</label>
            <textarea id="form-member-notes" class="form-control" rows="2" placeholder="Ghi chú nghề nghiệp, tài sản, người bảo lãnh..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-cancel-member-form" style="flex:1;">Hủy</button>
          <button class="btn btn-primary" id="btn-save-member-form" style="flex:2;">💾 Lưu Vào Danh Bạ</button>
        </div>
      </div>
    </div>

    <!-- Modal Gộp Hồ Sơ Trùng (Merge Duplicate Profiles) -->
    <div id="modal-merge-profiles" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Gộp Hồ Sơ Hụi Viên Trùng Lặp</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-merge-modal">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:13px; color:var(--text-muted);">
            Tính năng này giúp bạn hợp nhất hai hồ sơ bị nhập trùng tên hoặc số điện thoại. Toàn bộ lịch sử đóng tiền, chân hụi và nợ của hồ sơ phụ sẽ được chuyển sang hồ sơ chính.
          </p>

          <div class="form-group">
            <label class="form-label">1. Chọn Hồ sơ GỐC (Giữ lại):</label>
            <select id="select-primary-profile" class="form-control form-select">
              ${profiles.map(p => `<option value="${p.id}">${p.fullName} (${p.nickname}) - ${p.phone}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">2. Chọn Hồ sơ PHỤ TRÙNG (Sẽ bị gộp và ẩn đi):</label>
            <select id="select-duplicate-profile" class="form-control form-select">
              ${profiles.map(p => `<option value="${p.id}">${p.fullName} (${p.nickname}) - ${p.phone}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-cancel-merge" style="flex:1;">Hủy</button>
          <button class="btn btn-danger" id="btn-confirm-merge" style="flex:2;">🔗 Xác Nhận Gộp Hồ Sơ</button>
        </div>
      </div>
    </div>
  `;

  // Render danh sách thẻ
  function renderMemberListHTML(list) {
    if (list.length === 0) {
      return `<div style="text-align:center; padding:30px; color:var(--text-muted);">Không tìm thấy hụi viên nào.</div>`;
    }

    return list.map(p => `
      <div class="card" style="border-left: 4px solid ${p.latePaymentCount > 0 || p.creditRating <= 2 ? 'var(--accent)' : 'var(--primary)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h4 style="font-size: 15.5px; font-weight: 700; color: var(--text-main);">${escapeHtml(p.fullName)}</h4>
              ${p.nickname ? `<span style="font-size: 13px; color: var(--primary); font-weight: 600;">(${escapeHtml(p.nickname)})</span>` : ''}
            </div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
              📞 <strong>${escapeHtml(p.phone)}</strong> • 📍 ${escapeHtml(p.address) || 'Chưa có địa chỉ'}
            </div>
          </div>
          <div>${getCreditBadge(p.creditRating)}</div>
        </div>

        <!-- Thống kê hụi của thành viên này -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: #f8fafc; padding: 8px; border-radius: 8px; font-size: 12px; text-align: center;">
          <div>
            <span style="color: var(--text-muted);">Đang chơi:</span>
            <div style="font-weight: 700; color: var(--primary);">${p.activeHuiCount || 0} dây</div>
          </div>
          <div>
            <span style="color: var(--text-muted);">Đã hốt:</span>
            <div style="font-weight: 700; color: #b45309;">${p.hotedCount || 0} lần</div>
          </div>
          <div>
            <span style="color: var(--text-muted);">Trễ hạn:</span>
            <div style="font-weight: 700; color: ${p.latePaymentCount > 0 ? 'var(--accent)' : 'var(--text-main)'};">${p.latePaymentCount || 0} lần</div>
          </div>
        </div>

        ${p.riskNote ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 6px 10px; font-size: 12px; color: #991b1b;">
            <strong>⚠️ Lưu ý rủi ro:</strong> ${escapeHtml(p.riskNote)}
          </div>
        ` : ''}

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; padding-top: 8px; border-top: 1px dashed var(--border-color);">
          <button class="btn btn-sm btn-outline btn-edit-profile" data-id="${escapeHtml(p.id)}">
            ✏️ Sửa
          </button>
          <button class="btn btn-sm btn-outline btn-merge-profile" data-id="${escapeHtml(p.id)}">
            🔗 Gộp hồ sơ
          </button>
        </div>
      </div>
    `).join('');
  }

  // Tìm kiếm tức thì
  const searchInput = document.getElementById('member-search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = profiles.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      (p.nickname && p.nickname.toLowerCase().includes(q)) ||
      p.phone.includes(q)
    );
    const listContainer = document.getElementById('member-list-container');
    if (listContainer) listContainer.innerHTML = renderMemberListHTML(filtered);
    attachListButtons();
  });

  // Sự kiện mở modal thêm mới
  const modalMember = document.getElementById('modal-member-form');
  document.getElementById('btn-open-add-member')?.addEventListener('click', () => {
    document.getElementById('modal-member-title').innerText = 'Thêm Hụi Viên Mới Vào Danh Bạ';
    document.getElementById('form-member-id').value = '';
    document.getElementById('form-member-fullname').value = '';
    document.getElementById('form-member-nickname').value = '';
    document.getElementById('form-member-phone').value = '';
    document.getElementById('form-member-address').value = '';
    document.getElementById('form-member-rating').value = '5';
    document.getElementById('form-member-risknote').value = '';
    document.getElementById('form-member-notes').value = '';
    modalMember.style.display = 'flex';
  });

  document.getElementById('btn-close-member-modal')?.addEventListener('click', () => modalMember.style.display = 'none');
  document.getElementById('btn-cancel-member-form')?.addEventListener('click', () => modalMember.style.display = 'none');

  // Lưu hồ sơ
  document.getElementById('btn-save-member-form')?.addEventListener('click', () => {
    const id = document.getElementById('form-member-id').value;
    const fullName = document.getElementById('form-member-fullname').value.trim();
    const nickname = document.getElementById('form-member-nickname').value.trim();
    const phone = document.getElementById('form-member-phone').value.trim();
    const address = document.getElementById('form-member-address').value.trim();
    const creditRating = document.getElementById('form-member-rating').value;
    const riskNote = document.getElementById('form-member-risknote').value.trim();
    const notes = document.getElementById('form-member-notes').value.trim();

    if (!fullName || !phone) {
      showToast('Vui lòng nhập họ tên và số điện thoại!', 'warning');
      return;
    }

    try {
      if (id) {
        store.updateMemberProfile(id, { fullName, nickname, phone, address, creditRating, riskNote, notes });
        showToast('Cập nhật thông tin hụi viên thành công!', 'success');
      } else {
        store.addMemberProfile({ fullName, nickname, phone, address, creditRating, riskNote, notes });
        showToast('Đã thêm hụi viên mới vào danh bạ!', 'success');
      }
      modalMember.style.display = 'none';
      renderMembersDirectory(container);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  });

  // Modal Gộp hồ sơ
  const modalMerge = document.getElementById('modal-merge-profiles');
  document.getElementById('btn-close-merge-modal')?.addEventListener('click', () => modalMerge.style.display = 'none');
  document.getElementById('btn-cancel-merge')?.addEventListener('click', () => modalMerge.style.display = 'none');

  document.getElementById('btn-confirm-merge')?.addEventListener('click', () => {
    const primaryId = document.getElementById('select-primary-profile').value;
    const duplicateId = document.getElementById('select-duplicate-profile').value;

    if (primaryId === duplicateId) {
      showToast('Vui lòng chọn 2 hồ sơ khác nhau để gộp!', 'warning');
      return;
    }

    if (confirm('Bạn có chắc chắn muốn gộp toàn bộ lịch sử của hồ sơ phụ vào hồ sơ gốc không? Thao tác này sẽ lưu vết kiểm toán vĩnh viễn.')) {
      try {
        store.mergeProfiles(primaryId, duplicateId);
        showToast('Đã gộp hồ sơ hụi viên thành công!', 'success');
        modalMerge.style.display = 'none';
        renderMembersDirectory(container);
      } catch (err) {
        showToast(err.message, 'danger');
      }
    }
  });

  function attachListButtons() {
    container.querySelectorAll('.btn-edit-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const p = store.state.profiles.find(prof => prof.id === id);
        if (p) {
          document.getElementById('modal-member-title').innerText = 'Chỉnh Sửa Hồ Sơ Hụi Viên';
          document.getElementById('form-member-id').value = p.id;
          document.getElementById('form-member-fullname').value = p.fullName;
          document.getElementById('form-member-nickname').value = p.nickname || '';
          document.getElementById('form-member-phone').value = p.phone;
          document.getElementById('form-member-address').value = p.address || '';
          document.getElementById('form-member-rating').value = p.creditRating || 5;
          document.getElementById('form-member-risknote').value = p.riskNote || '';
          document.getElementById('form-member-notes').value = p.notes || '';
          modalMember.style.display = 'flex';
        }
      });
    });

    container.querySelectorAll('.btn-merge-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        document.getElementById('select-primary-profile').value = id;
        modalMerge.style.display = 'flex';
      });
    });
  }

  attachListButtons();
}
