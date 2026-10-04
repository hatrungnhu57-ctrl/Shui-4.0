/**
 * TẠO DÂY HỤI MỚI & THÊM HỤI VIÊN TỪ DANH BẠ
 * Chọn nhiều hụi viên, nhập số chân tham gia, cảnh báo tự động người có nợ/trễ hạn
 */

import { store } from '../store.js';
import { formatMoney, showToast, formatNumberWithDots, parseNumberFromDots, readMoneyToVietnameseWords, attachMoneyInput } from '../utils.js';

export function renderCreateGroup(container) {
  const profiles = store.state.profiles.filter(p => !p.isMerged);

  container.innerHTML = `
    <div>
      <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">➕ Tạo Dây Hụi Mới</h2>
      <div style="font-size: 12.5px; color: var(--text-muted);">
        Điền thông tin thỏa thuận và chọn hụi viên trực tiếp từ danh bạ
      </div>
    </div>

    <div class="card">
      <div class="card-title">1. Thông tin quy cách dây hụi</div>

      <div class="form-group">
        <label class="form-label">Tên dây hụi (*):</label>
        <input type="text" id="create-group-name" class="form-control" placeholder="VD: Dây 2 Triệu Chợ Chiều, Dây Tháng 5 Triệu" required />
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        <div class="form-group">
          <label class="form-label">Mức góp / phần (*):</label>
          <input type="text" id="create-group-amount" class="form-control" placeholder="2.000.000" value="2.000.000" style="font-size: 16px; font-weight: 800; color: var(--primary);" required />
          <div id="create-group-amount-words" style="font-size: 11.5px; color: #166534; margin-top: 3px; font-weight: 600;">
            💡 Bằng chữ: <strong>2 triệu đồng</strong>
          </div>
          <!-- Phím chọn nhanh mức tiền -->
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
            <button type="button" class="btn btn-sm btn-outline btn-preset-amount" data-amount="500000" style="font-size: 10.5px; padding: 2px 6px;">500k</button>
            <button type="button" class="btn btn-sm btn-outline btn-preset-amount" data-amount="1000000" style="font-size: 10.5px; padding: 2px 6px;">1 tr</button>
            <button type="button" class="btn btn-sm btn-outline btn-preset-amount" data-amount="2000000" style="font-size: 10.5px; padding: 2px 6px;">2 tr</button>
            <button type="button" class="btn btn-sm btn-outline btn-preset-amount" data-amount="3000000" style="font-size: 10.5px; padding: 2px 6px;">3 tr</button>
            <button type="button" class="btn btn-sm btn-outline btn-preset-amount" data-amount="5000000" style="font-size: 10.5px; padding: 2px 6px;">5 tr</button>
            <button type="button" class="btn btn-sm btn-outline btn-preset-amount" data-amount="10000000" style="font-size: 10.5px; padding: 2px 6px;">10 tr</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Tổng số phần hụi (*):</label>
          <input type="number" id="create-group-parts" class="form-control" value="12" min="2" max="60" style="font-size: 16px; font-weight: 800;" required />
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        <div class="form-group">
          <label class="form-label">Chu kỳ khui:</label>
          <select id="create-group-period" class="form-control form-select">
            <option value="month" selected>Hàng tháng (Tháng/kỳ)</option>
            <option value="half_month">Nửa tháng (15 ngày/kỳ)</option>
            <option value="week">Hàng tuần (Tuần/kỳ)</option>
            <option value="day">Theo ngày (Hụi ngày)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Ngày bắt đầu khơi:</label>
          <input type="date" id="create-group-startdate" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Quy định ngày khui định kỳ:</label>
        <input type="text" id="create-group-rule" class="form-control" placeholder="VD: Mùng 15 Tây hàng tháng, Chiều Thứ 7 hàng tuần lúc 16:00" />
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        <div class="form-group">
          <label class="form-label">Hình thức khui hụi:</label>
          <select id="create-group-method" class="form-control form-select">
            <option value="bidding" selected>🏷️ Kêu hụi / Bỏ lãi (Đấu giá)</option>
            <option value="secret_ballot">🗳️ Bỏ thăm kín</option>
            <option value="random">🎲 Quay Random ngẫu nhiên</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Tiền thảo chủ hụi (*):</label>
          <select id="create-group-comm-type" class="form-control form-select">
            <option value="half_share" selected>Nửa phần (50% của 1 suất góp) - Chuẩn</option>
            <option value="full_share">Một phần (100% của 1 suất góp)</option>
            <option value="fixed">Số tiền cố định (VNĐ/kỳ)</option>
            <option value="percent">Theo % tùy chỉnh</option>
          </select>
        </div>
      </div>

      <div class="form-group" id="group-custom-comm-box" style="display: none;">
        <label class="form-label" id="lbl-custom-comm">Nhập số tiền hoặc số %:</label>
        <input type="text" id="create-group-custom-comm" class="form-control" placeholder="VD: 500.000" />
        <div id="create-group-custom-comm-words" style="font-size: 11.5px; color: #166534; margin-top: 3px; font-weight: 600; display: none;"></div>
      </div>

      <!-- Preview dự tính tiền thảo -->
      <div id="create-group-calc-preview" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; font-size: 12.5px; color: #166534; margin-bottom: 10px;">
        💡 <strong>Dự tính tiền thảo:</strong> Mỗi kỳ người hốt trích trả cho Chủ hụi: <strong id="preview-comm-amount" style="color: var(--primary); font-size: 14px;">1.000.000 đ</strong>
      </div>

      <div class="form-group">
        <label class="form-label">Ghi chú & Luật thỏa thuận riêng:</label>
        <textarea id="create-group-notes" class="form-control" rows="2" placeholder="VD: Hụi viên đóng trong 24h; người hốt chịu tiền thảo; trễ hạn chịu phạt..."></textarea>
      </div>
    </div>

    <!-- PHẦN 2: CHỌN HỤI VIÊN TỪ DANH BẠ -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">2. Chọn Hụi Viên & Số phần tham gia</div>
        <span class="badge badge-info" id="badge-parts-counter">Đã chọn: 0 / 12 phần</span>
      </div>

      <p style="font-size: 12.5px; color: var(--text-muted);">
        Chọn thành viên từ danh bạ dùng chung. Hệ thống sẽ tự động hiển thị <strong>cảnh báo đỏ</strong> nếu thành viên đó từng trễ hạn hoặc đang có nợ ở dây khác.
      </p>

      <div class="item-list" style="max-height: 400px; overflow-y: auto;">
        ${profiles.map(p => {
          const hasRisk = p.latePaymentCount > 0 || p.riskNote.length > 0 || p.creditRating <= 2;
          return `
            <div class="card member-select-row" data-id="${p.id}" style="padding: 10px; margin: 0; background: ${hasRisk ? '#fffaf0' : '#ffffff'}; border-color: ${hasRisk ? '#fed7aa' : 'var(--border-color)'};">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                  <input type="checkbox" class="cb-member-select" value="${p.id}" style="width: 18px; height: 18px; accent-color: var(--primary);" />
                  <div>
                    <strong style="font-size: 14px; color: var(--text-main);">${p.fullName}</strong>
                    ${p.nickname ? `<span style="font-size: 12.5px; color: var(--primary); font-weight: 600;">(${p.nickname})</span>` : ''}
                    <div style="font-size: 11.5px; color: var(--text-muted);">📞 ${p.phone}</div>
                  </div>
                </label>

                <!-- Nhập số phần tham gia -->
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; color: var(--text-muted);">Số phần:</span>
                  <input type="number" class="form-control input-shares-count" data-id="${p.id}" value="1" min="1" max="10" style="width: 55px; padding: 4px 6px; text-align: center;" disabled />
                </div>
              </div>

              <!-- Cảnh báo rủi ro nếu có -->
              ${hasRisk ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 4px 8px; font-size: 11.5px; color: #991b1b; margin-top: 6px;">
                  🚨 <strong>CẢNH BÁO:</strong> Từng trễ hạn ${p.latePaymentCount} lần. ${p.riskNote || ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Tóm tắt & Nút bấm -->
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-outline" id="btn-cancel-create" style="flex: 1;">Hủy bỏ</button>
      <button class="btn btn-primary" id="btn-submit-create-group" style="flex: 2;">🚀 Khởi Tạo Dây Hụi</button>
    </div>
  `;

  // Cập nhật số phần khi click checkbox hoặc thay đổi số phần
  const totalPartsInput = document.getElementById('create-group-parts');
  const counterBadge = document.getElementById('badge-parts-counter');
  const baseAmountInput = document.getElementById('create-group-amount');
  const baseWordsEl = document.getElementById('create-group-amount-words');
  const commTypeSelect = document.getElementById('create-group-comm-type');
  const customCommBox = document.getElementById('group-custom-comm-box');
  const customCommInput = document.getElementById('create-group-custom-comm');
  const customCommWordsEl = document.getElementById('create-group-custom-comm-words');
  const previewCommEl = document.getElementById('preview-comm-amount');

  function updateCommissionPreview() {
    const base = parseNumberFromDots(baseAmountInput.value) || 0;
    const type = commTypeSelect.value;
    let commVal = 0;

    if (type === 'half_share') {
      commVal = Math.round(base * 0.5);
      customCommBox.style.display = 'none';
    } else if (type === 'full_share') {
      commVal = base;
      customCommBox.style.display = 'none';
    } else if (type === 'fixed') {
      customCommBox.style.display = 'block';
      document.getElementById('lbl-custom-comm').innerText = 'Nhập số tiền cố định (VNĐ):';
      commVal = parseNumberFromDots(customCommInput.value) || 0;
    } else if (type === 'percent') {
      customCommBox.style.display = 'block';
      document.getElementById('lbl-custom-comm').innerText = 'Nhập tỷ lệ %:';
      const pct = Number(customCommInput.value.replace(/\D/g, '')) || 0;
      commVal = Math.round((base * pct) / 100);
    }

    if (previewCommEl) {
      previewCommEl.innerText = formatMoney(commVal);
    }
  }

  // Gắn bộ định dạng tiền tệ có dấu chấm
  attachMoneyInput(baseAmountInput, baseWordsEl, () => updateCommissionPreview());
  attachMoneyInput(customCommInput, customCommWordsEl, () => updateCommissionPreview());

  // Xử lý các nút chọn nhanh số tiền
  container.querySelectorAll('.btn-preset-amount').forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = Number(btn.getAttribute('data-amount')) || 0;
      baseAmountInput.value = formatNumberWithDots(amt);
      if (baseWordsEl) {
        baseWordsEl.innerHTML = `💡 Bằng chữ: <strong>${readMoneyToVietnameseWords(amt)}</strong>`;
      }
      updateCommissionPreview();
    });
  });

  commTypeSelect.addEventListener('change', () => {
    if (commTypeSelect.value === 'fixed' && !customCommInput.value) {
      customCommInput.value = '500.000';
    } else if (commTypeSelect.value === 'percent' && !customCommInput.value) {
      customCommInput.value = '30';
    }
    updateCommissionPreview();
  });
  updateCommissionPreview();

  function updateCounter() {
    const targetTotal = Number(totalPartsInput.value) || 0;
    let selectedParts = 0;

    container.querySelectorAll('.cb-member-select:checked').forEach(cb => {
      const id = cb.value;
      const sharesInput = container.querySelector(`.input-shares-count[data-id="${id}"]`);
      if (sharesInput) {
        selectedParts += Number(sharesInput.value) || 1;
      }
    });

    counterBadge.innerText = `Đã chọn: ${selectedParts} / ${targetTotal} phần`;
    if (selectedParts === targetTotal) {
      counterBadge.className = 'badge badge-success';
    } else if (selectedParts > targetTotal) {
      counterBadge.className = 'badge badge-danger';
      counterBadge.innerText += ' (Quá số phần!)';
    } else {
      counterBadge.className = 'badge badge-warning';
    }
  }

  totalPartsInput.addEventListener('input', updateCounter);

  container.querySelectorAll('.cb-member-select').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.value;
      const sharesInput = container.querySelector(`.input-shares-count[data-id="${id}"]`);
      if (sharesInput) {
        sharesInput.disabled = !e.target.checked;
      }
      updateCounter();
    });
  });

  container.querySelectorAll('.input-shares-count').forEach(input => {
    input.addEventListener('input', updateCounter);
  });

  // Hủy
  document.getElementById('btn-cancel-create')?.addEventListener('click', () => {
    window.location.hash = '#dashboard';
  });

  // Gửi tạo dây hụi
  document.getElementById('btn-submit-create-group')?.addEventListener('click', () => {
    const name = document.getElementById('create-group-name').value.trim();
    const baseAmount = parseNumberFromDots(document.getElementById('create-group-amount').value);
    const totalParts = Number(document.getElementById('create-group-parts').value);
    const periodType = document.getElementById('create-group-period').value;
    const startDate = document.getElementById('create-group-startdate').value;
    const openDayRule = document.getElementById('create-group-rule').value.trim();
    const drawMethod = document.getElementById('create-group-method').value;
    const commissionType = document.getElementById('create-group-comm-type').value;
    const customComm = commissionType === 'fixed'
      ? parseNumberFromDots(document.getElementById('create-group-custom-comm')?.value)
      : (Number(document.getElementById('create-group-custom-comm')?.value.replace(/\D/g, '')) || 0);
    const agreementNotes = document.getElementById('create-group-notes').value.trim();

    let commissionRate = 50;
    let commissionAmountFixed = 0;
    if (commissionType === 'half_share') commissionRate = 50;
    else if (commissionType === 'full_share') commissionRate = 100;
    else if (commissionType === 'percent') commissionRate = customComm;
    else if (commissionType === 'fixed') {
      commissionAmountFixed = customComm;
      commissionRate = 0;
    }

    if (!name || !baseAmount || !totalParts) {
      showToast('Vui lòng điền đầy đủ Tên dây, Mức góp và Tổng số phần!', 'warning');
      return;
    }

    // Lấy danh sách thành viên đã chọn
    const selectedMembers = [];
    let selectedTotalParts = 0;
    let hasRiskMembers = [];

    container.querySelectorAll('.cb-member-select:checked').forEach(cb => {
      const pid = cb.value;
      const sharesInput = container.querySelector(`.input-shares-count[data-id="${pid}"]`);
      const count = Number(sharesInput.value) || 1;
      selectedTotalParts += count;

      const prof = profiles.find(p => p.id === pid);
      if (prof && (prof.latePaymentCount > 0 || prof.riskNote.length > 0)) {
        hasRiskMembers.push(prof.fullName);
      }

      selectedMembers.push({
        memberProfileId: pid,
        sharesCount: count
      });
    });

    if (selectedMembers.length === 0) {
      showToast('Vui lòng chọn ít nhất một hụi viên tham gia!', 'warning');
      return;
    }

    if (selectedTotalParts !== totalParts) {
      if (!confirm(`Tổng số phần đã chọn (${selectedTotalParts}) chưa khớp với quy cách dây hụi (${totalParts} phần). Bạn có chắc chắn muốn tiếp tục không?`)) {
        return;
      }
    }

    if (hasRiskMembers.length > 0) {
      if (!confirm(`⚠️ CẢNH BÁO RỦI RO:\nTrong danh sách chọn có thành viên từng trễ hạn / có nợ:\n- ${hasRiskMembers.join('\n- ')}\n\nBạn có chắc chắn muốn thêm những người này vào dây mới không?`)) {
        return;
      }
    }

    try {
      const newGroup = store.createHuiGroup({
        name,
        baseAmount,
        totalParts,
        periodType,
        startDate,
        openDayRule,
        drawMethod,
        commissionType,
        commissionRate,
        commissionAmountFixed,
        agreementNotes
      }, selectedMembers);

      showToast(`Tạo thành công dây hụi "${newGroup.name}"!`, 'success');
      window.location.hash = `#group-detail/${newGroup.id}`;
    } catch (err) {
      showToast(err.message, 'danger');
    }
  });

  updateCounter();
}
