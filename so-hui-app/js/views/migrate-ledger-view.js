/**
 * MÀN HÌNH SANG SỔ HỤI ĐANG CHẠY TỪ SỔ GIẤY CŨ VÀO APP (MIGRATE PAPER LEDGER VIEW)
 * Giúp chủ hụi chuyển đổi nhanh các dây hụi đã chạy được 3, 5, 10 kỳ từ sổ tay vào ứng dụng
 * Tự động phân loại Hụi Chết / Hụi Sống và mở tiếp kỳ kế tiếp trơn tru.
 */

import { store } from '../store.js';
import { showToast, formatMoney, escapeHtml } from '../utils.js';

export function renderMigrateLedgerView(container) {
  const profiles = store.state.profiles.filter(p => !p.isMerged);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Header -->
      <div class="card highlight" style="border-left: 4px solid #d97706; background: #fffbeb;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">📖</span>
              <h2 style="font-size: 18px; font-weight: 800; color: #92400e;">Sang Sổ Hụi Đang Chạy (Từ Sổ Giấy)</h2>
            </div>
            <div style="font-size: 12.5px; color: #b45309; margin-top: 2px;">
              Nhập nhanh dây hụi đã khui được nhiều kỳ ngoài đời thực vào app để quản lý tiếp
            </div>
          </div>
          <button class="btn btn-sm btn-outline" id="btn-back-to-groups">← Trở về</button>
        </div>
      </div>

      <!-- BƯỚC 1: THÔNG TIN DÂY HỤI -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">1. Thông Tin Cơ Bản Dây Hụi</div>
        </div>

        <div class="form-group">
          <label class="form-label">Tên dây hụi (*):</label>
          <input type="text" id="mig-group-name" class="form-control" placeholder="Ví dụ: Hụi 2 triệu Nửa Tháng - Chợ Càng Long" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Mức tiền 1 phần (*):</label>
            <input type="number" id="mig-base-amount" class="form-control" placeholder="Ví dụ: 2000000" step="100000" required />
          </div>
          <div class="form-group">
            <label class="form-label">Tổng số phần hụi (*):</label>
            <input type="number" id="mig-total-parts" class="form-control" value="20" min="2" max="100" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Định kỳ khui:</label>
            <select id="mig-period-type" class="form-control form-select">
              <option value="half_month">Nửa tháng (15 ngày)</option>
              <option value="month">Hàng tháng</option>
              <option value="week">Hàng tuần</option>
              <option value="day">Hàng ngày</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Tiền thảo (% kỳ hốt đầu):</label>
            <input type="number" id="mig-commission" class="form-control" value="50" placeholder="Ví dụ: 50%" />
          </div>
        </div>
      </div>

      <!-- BƯỚC 2: DANH SÁCH THÀNH VIÊN TRONG DÂY -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">2. Danh Sách Hụi Viên Trong Dây</div>
          <button class="btn btn-sm btn-primary" id="btn-quick-add-member">+ Thêm người</button>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
          Tích chọn hoặc thêm các hụi viên tham gia dây này (Tổng số phần cần bằng tổng số phần ở bước 1).
        </div>

        <div id="mig-member-selection-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; padding: 4px;">
          ${profiles.map((p, idx) => `
            <div class="mig-member-item" data-id="${p.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="chk-mig-member" data-id="${p.id}" id="chk-mem-${p.id}" ${idx < 10 ? 'checked' : ''} style="width: 18px; height: 18px;" />
                <label for="chk-mem-${p.id}" style="font-size: 13px; font-weight: 700; cursor: pointer; color: var(--text-main);">
                  ${escapeHtml(p.fullName)} <span style="font-weight: normal; color: var(--text-muted); font-size: 11.5px;">(${escapeHtml(p.phone)})</span>
                </label>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span style="font-size: 12px; color: var(--text-muted);">Số phần:</span>
                <input type="number" class="mig-member-shares" data-id="${p.id}" value="1" min="1" max="10" style="width: 50px; text-align: center; padding: 4px; border-radius: 6px; border: 1px solid var(--border-color); font-size: 12px;" />
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- BƯỚC 3: GHI NHẬN CÁC KỲ ĐÃ KHUI TRONG QUÁ KHỨ (TRÊN SỔ GIẤY) -->
      <div class="card" style="border-left: 4px solid var(--accent); background: #fef2f2;">
        <div class="card-header">
          <div class="card-title" style="color: #991b1b;">3. Lịch Sử Các Kỳ ĐÃ KHUI Trên Sổ Giấy</div>
        </div>
        <div style="font-size: 12.5px; color: #7f1d1d;">
          Dây này trên sổ giấy đã khui được bao nhiêu kỳ rồi? Hệ thống sẽ ghi nhận những người này là <strong>Hụi Chết</strong> và những người còn lại là <strong>Hụi Sống</strong>.
        </div>

        <div class="form-group" style="margin-top: 10px;">
          <label class="form-label" style="font-weight: 800;">Dây này đã khui được mấy kỳ rồi? (*):</label>
          <select id="mig-past-cycles-count" class="form-control form-select" style="font-weight: 700; color: #991b1b;">
            <option value="1">Đã khui 1 kỳ</option>
            <option value="2">Đã khui 2 kỳ</option>
            <option value="3" selected>Đã khui 3 kỳ</option>
            <option value="4">Đã khui 4 kỳ</option>
            <option value="5">Đã khui 5 kỳ</option>
            <option value="6">Đã khui 6 kỳ</option>
            <option value="7">Đã khui 7 kỳ</option>
            <option value="8">Đã khui 8 kỳ</option>
            <option value="9">Đã khui 9 kỳ</option>
            <option value="10">Đã khui 10 kỳ</option>
            <option value="15">Đã khui 15 kỳ</option>
            <option value="20">Đã khui 20 kỳ</option>
          </select>
        </div>

        <!-- Bảng điền thông tin chi tiết từng kỳ quá khứ -->
        <div id="mig-past-cycles-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
          <!-- Tự động sinh ra các dòng kỳ khui -->
        </div>
      </div>

      <!-- BƯỚC 4: KỲ TIẾP THEO SẼ KHUI TRÊN APP -->
      <div class="card" style="border-left: 4px solid var(--primary); background: #f0fdf4;">
        <div class="card-header">
          <div class="card-title" style="color: var(--primary-dark);">4. Kỳ Kế Tiếp Sẽ Khui Trên Ứng Dụng</div>
        </div>
        <div class="form-group">
          <label class="form-label">Ngày khui kỳ tiếp theo (*):</label>
          <input type="date" id="mig-next-cycle-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
        </div>

        <button class="btn btn-primary btn-block" id="btn-submit-migration" style="padding: 14px; font-size: 16px; margin-top: 8px;">
          🚀 Hoàn Tất Sang Sổ & Bắt Đầu Quản Lý
        </button>
      </div>
    </div>
  `;

  // Render các dòng kỳ quá khứ
  function updatePastCyclesRows() {
    const count = Number(document.getElementById('mig-past-cycles-count')?.value) || 0;
    const containerEl = document.getElementById('mig-past-cycles-container');
    if (!containerEl) return;

    // Lấy danh sách thành viên đang được chọn
    const selectedMembers = getSelectedMembersList();

    let html = '';
    for (let i = 1; i <= count; i++) {
      html += `
        <div class="card" style="padding: 10px 12px; background: #ffffff; border: 1px solid #fecaca;">
          <div style="font-weight: 800; font-size: 13px; color: #991b1b; margin-bottom: 6px;">
            Kỳ ${i} (Đã khui):
          </div>
          <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 8px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:11.5px;">Người đã hốt kỳ ${i}:</label>
              <select class="form-control form-select mig-cycle-winner" data-cycle="${i}" style="font-size:12.5px;">
                <option value="">-- Chọn người đã hốt --</option>
                ${selectedMembers.map(m => `<option value="${m.id}">${escapeHtml(m.fullName)} (${escapeHtml(m.phone)})</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:11.5px;">Tiền thăm/lãi đã bỏ:</label>
              <input type="number" class="form-control mig-cycle-bid" data-cycle="${i}" placeholder="VD: 250000" step="10000" style="font-size:12.5px;" />
            </div>
          </div>
        </div>
      `;
    }
    containerEl.innerHTML = html;
  }

  function getSelectedMembersList() {
    const selected = [];
    container.querySelectorAll('.chk-mig-member:checked').forEach(chk => {
      const id = chk.getAttribute('data-id');
      const p = store.state.profiles.find(prof => prof.id === id);
      if (p) selected.push(p);
    });
    return selected;
  }

  // Khởi tạo dòng kỳ quá khứ
  updatePastCyclesRows();

  // Sự kiện thay đổi số kỳ quá khứ hoặc thay đổi thành viên
  document.getElementById('mig-past-cycles-count')?.addEventListener('change', () => {
    updatePastCyclesRows();
  });

  container.querySelectorAll('.chk-mig-member').forEach(chk => {
    chk.addEventListener('change', () => {
      updatePastCyclesRows();
    });
  });

  // Nút quay lại
  document.getElementById('btn-back-to-groups')?.addEventListener('click', () => {
    window.location.hash = '#groups';
  });

  // Nút thêm nhanh người vào danh bạ
  document.getElementById('btn-quick-add-member')?.addEventListener('click', () => {
    const name = prompt('Nhập họ tên hụi viên mới:');
    if (!name || !name.trim()) return;
    const phone = prompt('Nhập số điện thoại hụi viên:') || '090' + Math.floor(1000000 + Math.random() * 9000000);
    try {
      store.addMemberProfile({ fullName: name.trim(), phone: phone.trim() });
      showToast('Đã thêm hụi viên mới!', 'success');
      renderMigrateLedgerView(container);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  });

  // Xử lý nộp form sang sổ
  document.getElementById('btn-submit-migration')?.addEventListener('click', () => {
    const name = document.getElementById('mig-group-name').value.trim();
    const baseAmount = Number(document.getElementById('mig-base-amount').value);
    const totalParts = Number(document.getElementById('mig-total-parts').value);
    const periodType = document.getElementById('mig-period-type').value;
    const commissionRate = Number(document.getElementById('mig-commission').value) || 50;
    const nextCycleDate = document.getElementById('mig-next-cycle-date').value;

    if (!name || !baseAmount || !totalParts) {
      showToast('Vui lòng điền đầy đủ tên dây, số tiền và tổng số phần hụi!', 'warning');
      return;
    }

    // Thu thập danh sách thành viên
    const membersData = [];
    container.querySelectorAll('.chk-mig-member:checked').forEach(chk => {
      const id = chk.getAttribute('data-id');
      const sharesInput = container.querySelector(`.mig-member-shares[data-id="${id}"]`);
      const shares = Number(sharesInput?.value) || 1;
      membersData.push({
        memberProfileId: id,
        sharesCount: shares
      });
    });

    if (membersData.length === 0) {
      showToast('Vui lòng chọn ít nhất một hụi viên trong danh sách!', 'warning');
      return;
    }

    // Thu thập các kỳ quá khứ
    const pastCyclesCount = Number(document.getElementById('mig-past-cycles-count').value) || 0;
    const pastCyclesData = [];

    for (let i = 1; i <= pastCyclesCount; i++) {
      const winnerSelect = container.querySelector(`.mig-cycle-winner[data-cycle="${i}"]`);
      const bidInput = container.querySelector(`.mig-cycle-bid[data-cycle="${i}"]`);
      const winnerId = winnerSelect?.value;
      const bidAmount = Number(bidInput?.value) || 0;

      const prof = store.state.profiles.find(p => p.id === winnerId);

      pastCyclesData.push({
        cycleNumber: i,
        winnerMemberProfileId: winnerId || null,
        winnerName: prof ? prof.fullName : 'Hụi viên',
        winningBidAmount: bidAmount,
        openDate: new Date().toISOString().split('T')[0]
      });
    }

    try {
      const newGrp = store.migrateExistingGroup(
        {
          name,
          baseAmount,
          totalParts,
          periodType,
          commissionRate,
          nextCycleDate
        },
        membersData,
        pastCyclesData
      );

      showToast(`Sang sổ thành công dây "${newGrp.name}"! Tiếp quản từ kỳ ${pastCyclesData.length + 1}.`, 'success');
      window.location.hash = `#group-detail/${newGrp.id}`;
    } catch (e) {
      showToast('Lỗi sang sổ: ' + e.message, 'danger');
    }
  });
}
