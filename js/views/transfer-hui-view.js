/**
 * MÀN HÌNH MUA BÁN & CHUYỂN NHƯỢNG CHÂN HỤI (HUI SLOT TRANSFER VIEW)
 * Cho phép Hụi viên sang chân Hụi Sống hoặc Hụi Chết cho người khác hoặc cho Chủ Hụi
 * Tự động cập nhật danh sách thành viên và xuất Giấy Thỏa Thuận Chuyển Nhượng chuẩn pháp lý.
 */

import { store } from '../store.js';
import { showToast, formatMoney, formatDateTime, escapeHtml } from '../utils.js';

export function renderTransferHuiView(container, targetGroupId = null) {
  const groups = store.state.groups.filter(g => g.status === 'active');
  const profiles = store.state.profiles.filter(p => !p.isMerged);

  const selectedGroupId = targetGroupId || (groups[0] ? groups[0].id : null);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const groupMembers = selectedGroup
    ? store.state.groupMembers.filter(gm => gm.groupId === selectedGroup.id)
    : [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Header -->
      <div class="card highlight" style="border-left: 4px solid #0284c7; background: #f0f9ff;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">🤝</span>
              <h2 style="font-size: 18px; font-weight: 800; color: #0369a1;">Mua Bán & Sang Nhượng Chân Hụi</h2>
            </div>
            <div style="font-size: 12.5px; color: #0c4a6e; margin-top: 2px;">
              Sang tên chân Hụi Sống (chưa hốt) hoặc Hụi Chết (đã hốt) minh bạch và an toàn
            </div>
          </div>
          <button class="btn btn-sm btn-outline" id="btn-back-transfer">← Trở về</button>
        </div>
      </div>

      <!-- FORM CHUYỂN NHƯỢNG -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">1. Chọn Dây Hụi & Chân Hụi Cần Sang Nhượng</div>
        </div>

        <div class="form-group">
          <label class="form-label">Chọn Dây Hụi (*):</label>
          <select id="transfer-select-group" class="form-control form-select">
            ${groups.map(g => `<option value="${g.id}" ${g.id === selectedGroupId ? 'selected' : ''}>${escapeHtml(g.name)} - Góp ${formatMoney(g.baseAmount)}/kỳ (${g.totalParts} phần)</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Chọn Người Bán / Chuyển Nhượng (Hụi viên hiện tại) (*):</label>
          <select id="transfer-select-old-member" class="form-control form-select">
            <option value="">-- Chọn chân hụi cần sang --</option>
            ${groupMembers.map(gm => {
              const prof = profiles.find(p => p.id === gm.memberProfileId);
              const isHoted = gm.hotedCycles && gm.hotedCycles.length > 0;
              const huiTypeLabel = isHoted ? '🔴 Hụi Chết (Đã hốt)' : '🟢 Hụi Sống (Chưa hốt)';
              return `
                <option value="${gm.memberProfileId}" data-hoted="${isHoted ? '1' : '0'}">
                  ${prof ? escapeHtml(prof.fullName) : 'Hụi viên'} (${prof ? escapeHtml(prof.phone) : ''}) - [${huiTypeLabel}]
                </option>
              `;
            }).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Chọn Người Mua / Tiếp Nhận Chân Hụi (*):</label>
          <select id="transfer-select-new-member" class="form-control form-select">
            <option value="">-- Chọn người mua lại --</option>
            ${profiles.map(p => `
              <option value="${p.id}">${escapeHtml(p.fullName)} (${escapeHtml(p.phone)}) ${p.address ? ' - ' + escapeHtml(p.address) : ''}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- ĐIỀU KHOẢN & GIÁ THỎA THUẬN -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">2. Giá Mua Bán & Loại Chuyển Nhượng</div>
        </div>

        <div class="form-group">
          <label class="form-label">Loại chân hụi chuyển nhượng:</label>
          <select id="transfer-type" class="form-control form-select">
            <option value="live">🟢 Sang Hụi Sống (Chưa hốt - Người mới tiếp tục nuôi & chờ hốt)</option>
            <option value="dead">🔴 Sang Hụi Chết (Đã hốt rồi - Người mới gánh nghĩa vụ nộp hụi chết)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Số tiền mua bán / sang nhượng thỏa thuận (VNĐ):</label>
          <input type="number" id="transfer-price" class="form-control" placeholder="Ví dụ: 5000000" step="100000" />
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">
            Số tiền người mua trả trực tiếp cho người bán để nhận lại chân hụi này.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ghi chú & Cam kết giữa hai bên:</label>
          <textarea id="transfer-agreement-notes" class="form-control" rows="2" placeholder="Ví dụ: Bên B nhận sang nhượng và chịu trách nhiệm đóng đầy đủ các kỳ tiếp theo kể từ kỳ 5..."></textarea>
        </div>

        <button class="btn btn-primary btn-block" id="btn-submit-transfer" style="padding: 12px; font-size: 15px; margin-top: 6px;">
          ✍️ Xác Nhận Chuyển Nhượng & In Giấy Cam Kết
        </button>
      </div>

      <!-- MODAL XUẤT GIẤY THỎA THUẬN CHUYỂN NHƯỢNG CHÂN HỤI -->
      <div id="modal-transfer-receipt" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h3 class="modal-title">Giấy Chuyển Nhượng Chân Hụi</h3>
            <button class="btn btn-sm btn-outline btn-circle" id="btn-close-transfer-receipt">✕</button>
          </div>
          <div class="modal-body" id="transfer-receipt-print-area">
            <!-- Nội dung giấy chuyển nhượng in được -->
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="btn-close-receipt-modal" style="flex: 1;">Đóng</button>
            <button class="btn btn-primary" id="btn-print-transfer-doc" style="flex: 2;">🖨️ In / Chụp Gửi Zalo</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Thay đổi dây hụi
  document.getElementById('transfer-select-group')?.addEventListener('change', (e) => {
    const newGid = e.target.value;
    renderTransferHuiView(container, newGid);
  });

  // Tự động nhận diện Hụi Sống / Hụi Chết khi chọn người bán
  document.getElementById('transfer-select-old-member')?.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const isHoted = selectedOption?.getAttribute('data-hoted') === '1';
    const typeSelect = document.getElementById('transfer-type');
    if (typeSelect) {
      typeSelect.value = isHoted ? 'dead' : 'live';
    }
  });

  // Nút quay lại
  document.getElementById('btn-back-transfer')?.addEventListener('click', () => {
    window.location.hash = '#groups';
  });

  // Xác nhận chuyển nhượng
  document.getElementById('btn-submit-transfer')?.addEventListener('click', () => {
    const groupId = document.getElementById('transfer-select-group').value;
    const oldMemberId = document.getElementById('transfer-select-old-member').value;
    const newMemberId = document.getElementById('transfer-select-new-member').value;
    const transferType = document.getElementById('transfer-type').value;
    const transferPrice = Number(document.getElementById('transfer-price').value) || 0;
    const notes = document.getElementById('transfer-agreement-notes').value.trim();

    if (!groupId || !oldMemberId || !newMemberId) {
      showToast('Vui lòng chọn đầy đủ Dây hụi, Người bán và Người mua!', 'warning');
      return;
    }

    if (oldMemberId === newMemberId) {
      showToast('Người bán và Người mua không được trùng nhau!', 'warning');
      return;
    }

    const oldProf = profiles.find(p => p.id === oldMemberId);
    const newProf = profiles.find(p => p.id === newMemberId);

    if (confirm(`Bạn có chắc chắn muốn chuyển nhượng chân hụi của "${oldProf.fullName}" sang cho "${newProf.fullName}" với giá ${formatMoney(transferPrice)} không?`)) {
      try {
        const receipt = store.transferHuiSlot(groupId, oldMemberId, newMemberId, transferType, transferPrice, notes);
        showToast('Chuyển nhượng chân hụi thành công!', 'success');
        showTransferReceiptModal(receipt);
      } catch (err) {
        showToast(err.message, 'danger');
      }
    }
  });

  function showTransferReceiptModal(receipt) {
    const modal = document.getElementById('modal-transfer-receipt');
    const area = document.getElementById('transfer-receipt-print-area');
    if (!modal || !area) return;

    area.innerHTML = `
      <div style="background: #ffffff; border: 2px solid var(--border-color); border-radius: 12px; padding: 18px; font-family: sans-serif; position: relative;">
        <!-- Header Giấy -->
        <div style="text-align: center; border-bottom: 2px dashed var(--border-color); padding-bottom: 12px; margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Độc lập - Tự do - Hạnh phúc</div>
          <h2 style="font-size: 16px; font-weight: 800; color: var(--primary-dark); margin: 6px 0;">GIẤY THỎA THUẬN CHUYỂN NHƯỢNG CHÂN HỤI</h2>
          <div style="font-size: 11px; color: var(--text-muted);">Mã chứng từ: <strong>${escapeHtml(receipt.receiptNumber)}</strong> • Ngày: ${formatDateTime(receipt.createdAt)}</div>
        </div>

        <!-- Thông tin chuyển nhượng -->
        <div style="font-size: 13px; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
          <div><strong>Dây hụi:</strong> ${escapeHtml(receipt.groupName)} (Góp ${formatMoney(receipt.baseAmount)}/kỳ)</div>
          <div><strong>Loại chuyển nhượng:</strong> <span style="color:var(--primary); font-weight:700;">${escapeHtml(receipt.transferType)}</span></div>

          <div style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); margin-top: 4px;">
            <div><strong>Bên Chuyển Nhượng (Bên A - Người bán):</strong></div>
            <div style="margin-left: 10px; color: var(--text-main);">
              • Họ tên: <strong>${escapeHtml(receipt.oldMemberName)}</strong><br />
              • Số điện thoại: <strong>${escapeHtml(receipt.oldMemberPhone)}</strong>
            </div>
            <div style="margin-top: 6px;"><strong>Bên Nhận Chuyển Nhượng (Bên B - Người mua):</strong></div>
            <div style="margin-left: 10px; color: var(--text-main);">
              • Họ tên: <strong>${escapeHtml(receipt.newMemberName)}</strong><br />
              • Số điện thoại: <strong>${escapeHtml(receipt.newMemberPhone)}</strong>
            </div>
          </div>

          <div style="font-size: 14px; margin-top: 4px;">
            <strong>Số tiền chuyển nhượng:</strong> <span style="color: var(--accent); font-weight: 800; font-size: 16px;">${formatMoney(receipt.transferPrice)}</span>
          </div>

          <div style="font-size: 12px; color: var(--text-muted); background: #fffbeb; padding: 8px; border-radius: 6px; border: 1px solid #fde68a;">
            <strong>Cam kết:</strong> ${escapeHtml(receipt.agreementNotes)}
          </div>
        </div>

        <!-- Chữ ký 3 bên -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 11px;">
          <div>
            <strong>BÊN BÁN</strong><br />
            <span style="font-size:10px; color:var(--text-muted);">(Ký, ghi rõ họ tên)</span>
            <div style="height: 40px;"></div>
            <strong>${escapeHtml(receipt.oldMemberName)}</strong>
          </div>
          <div>
            <strong>BÊN MUA</strong><br />
            <span style="font-size:10px; color:var(--text-muted);">(Ký, ghi rõ họ tên)</span>
            <div style="height: 40px;"></div>
            <strong>${escapeHtml(receipt.newMemberName)}</strong>
          </div>
          <div>
            <strong>CHỦ HỤI LÀM CHỨNG</strong><br />
            <span style="font-size:10px; color:var(--text-muted);">(Đã xác nhận)</span>
            <div style="height: 40px; display:flex; align-items:center; justify-content:center; color:#dc2626; font-weight:800; font-size:13px;">
              [ĐÃ CHỨNG]
            </div>
            <strong>${escapeHtml(store.currentAccount.fullName)}</strong>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  document.getElementById('btn-close-transfer-receipt')?.addEventListener('click', () => {
    document.getElementById('modal-transfer-receipt').style.display = 'none';
  });
  document.getElementById('btn-close-receipt-modal')?.addEventListener('click', () => {
    document.getElementById('modal-transfer-receipt').style.display = 'none';
  });

  document.getElementById('btn-print-transfer-doc')?.addEventListener('click', () => {
    window.print();
  });
}
