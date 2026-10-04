/**
 * QUẢN LÝ ĐÓNG TIỀN, BIÊN NHẬN, VIETQR, PHIẾU GIAO HỤI & CHỐT SỔ KỲ HỤI (PAYMENTS & SETTLEMENT)
 * Tự động tính toán chi tiết hụi sống, hụi chết, trừ tiền đầu thảo, xuất phiếu giao hụi chuẩn pháp lý
 */

import { store } from '../store.js';
import { formatMoney, formatDate, formatDateTime, showToast, exportToCSV, generateVietQRUrl, escapeHtml } from '../utils.js';

export function renderCyclePayments(container, cycleId) {
  const cycle = store.state.cycles.find(c => c.id === cycleId);
  if (!cycle) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px;">
        <h3>Không tìm thấy kỳ hụi!</h3>
        <button class="btn btn-primary" onclick="window.location.hash='#groups'">Quay lại</button>
      </div>
    `;
    return;
  }

  const group = store.state.groups.find(g => g.id === cycle.groupId);
  const payments = store.state.payments.filter(p => p.cycleId === cycle.id);
  const winnerProfile = store.state.profiles.find(p => p.id === cycle.winnerMemberProfileId);
  const acc = store.currentAccount;

  // Tính toán lại hoặc lấy thông số quyết toán
  const settlement = store.calculateCycleSettlement(group, cycle.cycleNumber, cycle.winningBidAmount, cycle.winnerMemberProfileId, cycle.commissionAmount);

  // Thống kê tổng tiền thu
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.amountDue || 0), 0);
  const remaining = totalDue - totalPaid;

  // Phân loại danh sách đóng tiền
  const deadPayments = payments.filter(p => p.isDeadHui && p.memberProfileId !== cycle.winnerMemberProfileId);
  const livePayments = payments.filter(p => !p.isDeadHui && p.memberProfileId !== cycle.winnerMemberProfileId);
  const winnerPayment = payments.find(p => p.memberProfileId === cycle.winnerMemberProfileId);

  container.innerHTML = `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <button class="btn btn-sm btn-outline" style="margin-bottom: 6px;" onclick="window.location.hash='#group-detail/${group.id}'">
          ← Dây hụi
        </button>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">
          💳 Quyết Toán & Thu Tiền Kỳ ${cycle.cycleNumber}
        </h2>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Dây: <strong>${escapeHtml(group.name)}</strong> • Mức góp: ${formatMoney(group.baseAmount)} • Ngày khui: ${formatDate(cycle.openDate)}
        </div>
      </div>
      <span class="badge ${cycle.status === 'closed' ? 'badge-gray' : 'badge-warning'}">
        ${cycle.status === 'closed' ? 'Đã chốt sổ' : 'Đang mở thu tiền'}
      </span>
    </div>

    <!-- BẢNG QUYẾT TOÁN GIAO HỤI & KHẤU TRỪ TIỀN ĐẦU THẢO -->
    ${winnerProfile ? `
      <div class="card highlight" style="border: 2px solid var(--primary); background: #ffffff; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 8px;">
          <div>
            <div style="font-size: 12px; color: var(--text-muted);">Người hốt kỳ này:</div>
            <strong style="font-size: 16px; color: var(--primary-dark);">🏆 ${escapeHtml(winnerProfile.fullName)} ${winnerProfile.nickname ? `(${escapeHtml(winnerProfile.nickname)})` : ''}</strong>
            <div style="font-size: 11.5px; color: var(--text-muted);">Mức thăm trúng: <strong>${formatMoney(cycle.winningBidAmount)}</strong></div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11.5px; color: var(--text-muted);">Tiền thực giao người hốt:</div>
            <strong style="font-size: 18px; color: var(--primary);">${formatMoney(cycle.potAmount)}</strong>
          </div>
        </div>

        <!-- Chi tiết quyết toán -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-top: 8px;">
          <div style="background: #fef2f2; padding: 6px 8px; border-radius: 6px;">
            <span style="color: #991b1b;">🔴 Hụi Chết (${settlement.deadSharesCount} phần):</span><br/>
            <strong>${formatMoney(settlement.totalDeadAmount)}</strong>
          </div>
          <div style="background: #f0fdf4; padding: 6px 8px; border-radius: 6px;">
            <span style="color: #166534;">🟢 Hụi Sống (${settlement.liveSharesCount} phần):</span><br/>
            <strong>${formatMoney(settlement.totalLiveAmount)}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-top: 8px; padding-top: 6px; border-top: 1px dashed var(--border-color);">
          <span>💰 Tổng tiền gom: <strong>${formatMoney(cycle.totalExpected)}</strong></span>
          <span style="color: #b45309;">🏷️ Tiền thảo chủ hụi: <strong style="color: var(--accent);">- ${formatMoney(cycle.commissionAmount)}</strong></span>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="btn btn-primary btn-sm btn-block" id="btn-view-payout-voucher" style="padding: 9px; font-weight: 700;">
            📄 Xuất Phiếu Bàn Giao Tiền & Trừ Thảo
          </button>
        </div>
      </div>
    ` : ''}

    <!-- Thống kê tiến độ thu tiền -->
    <div class="stats-grid">
      <div class="stat-box" style="border-left: 4px solid var(--primary);">
        <span class="stat-label">Đã thu thực tế</span>
        <span class="stat-val money">${formatMoney(totalPaid)}</span>
      </div>
      <div class="stat-box" style="border-left: 4px solid var(--accent);">
        <span class="stat-label">Còn thiếu / Chưa nộp</span>
        <span class="stat-val danger">${formatMoney(remaining)}</span>
      </div>
    </div>

    <!-- Nút Thao Tác Nhanh -->
    <div style="display: flex; gap: 8px;">
      <button class="btn btn-sm btn-outline" id="btn-export-payments-excel" style="flex: 1;">
        📊 Xuất Excel Kỳ
      </button>
      ${cycle.status === 'open' ? `
        <button class="btn btn-sm btn-primary" id="btn-close-cycle-action" style="flex: 1; background: #047857;">
          🔒 Chốt Sổ Kỳ Này
        </button>
      ` : `
        <button class="btn btn-sm btn-outline" disabled style="flex: 1;">
          ✅ Kỳ Này Đã Khóa
        </button>
      `}
    </div>

    <!-- 1. DANH SÁCH HỤI CHẾT (ĐÓNG ĐỦ GỐC) -->
    ${deadPayments.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title" style="color: #991b1b;">
            🔴 Danh Sách Hụi Chết (${deadPayments.length} người - Đóng đủ ${formatMoney(group.baseAmount)}/phần)
          </div>
        </div>
        <div class="item-list">
          ${deadPayments.map(p => renderPaymentRow(p, group, cycle, acc)).join('')}
        </div>
      </div>
    ` : ''}

    <!-- 2. DANH SÁCH HỤI SỐNG (ĐÃ TRỪ TIỀN THĂM) -->
    ${livePayments.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <div class="card-title" style="color: #166534;">
            🟢 Danh Sách Hụi Sống (${livePayments.length} người - Đóng ${formatMoney(group.baseAmount - cycle.winningBidAmount)}/phần)
          </div>
        </div>
        <div class="item-list">
          ${livePayments.map(p => renderPaymentRow(p, group, cycle, acc)).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Modal Xem & In Phiếu Giao Tiền Hốt Hụi & Quyết Toán Đầu Thảo -->
    <div id="modal-payout-voucher-view" class="modal-overlay" style="display: none;">
      <div class="modal-content" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">Phiếu Giao Tiền Hốt Hụi</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-voucher-modal">✕</button>
        </div>
        <div class="modal-body" id="payout-voucher-modal-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-print-voucher" style="flex: 1;">🖨️ In Phiếu</button>
          <button class="btn btn-primary" id="btn-share-voucher-zalo" style="flex: 1;">📲 Gửi Zalo</button>
        </div>
      </div>
    </div>

    <!-- Modal Xem Mã VietQR Chuyển Khoản Tức Thì -->
    <div id="modal-vietqr-view" class="modal-overlay" style="display: none;">
      <div class="modal-content" style="max-width: 380px; text-align: center;">
        <div class="modal-header">
          <h3 class="modal-title">📱 Mã VietQR Thanh Toán</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-vietqr-modal">✕</button>
        </div>
        <div class="modal-body" id="vietqr-modal-body"></div>
        <div class="modal-footer" style="flex-direction: column; gap: 8px;">
          <button class="btn btn-primary btn-block" id="btn-copy-vietqr-zalo">
            📲 Sao chép tin nhắn Zalo gửi hụi viên
          </button>
          <button class="btn btn-outline btn-block" id="btn-close-vietqr-btn">Đóng</button>
        </div>
      </div>
    </div>

    <!-- Modal Ghi Nhận Thu Tiền -->
    <div id="modal-record-payment" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Ghi Nhận Đóng Tiền Hụi</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-payment-modal">✕</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="form-payment-id" />

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 12px; color: var(--text-muted);">Hụi viên:</div>
            <strong style="font-size: 15px; color: var(--primary-dark);" id="modal-pay-member-name"></strong>
            <div style="font-size: 13px; margin-top: 4px;">
              Số tiền phải đóng: <strong style="color: var(--accent);" id="modal-pay-amount-due"></strong>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Số tiền thực tế đã thu (*):</label>
            <input type="number" id="form-pay-amount-paid" class="form-control" step="10000" required />
          </div>

          <div class="form-group">
            <label class="form-label">Hình thức thanh toán:</label>
            <select id="form-pay-method" class="form-control form-select">
              <option value="transfer">Chuyển khoản Ngân hàng (VietQR / Internet Banking)</option>
              <option value="cash">Tiền mặt trao tay</option>
            </select>
          </div>

          <div class="form-group" id="group-tx-ref">
            <label class="form-label">Mã giao dịch / Ngân hàng (Nếu CK):</label>
            <input type="text" id="form-pay-txref" class="form-control" placeholder="VD: VCB.2026.88123" />
          </div>

          <div class="form-group">
            <label class="form-label">Ghi chú thêm:</label>
            <input type="text" id="form-pay-note" class="form-control" placeholder="VD: Đóng trước 1 ngày, gửi tại nhà..." />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-cancel-pay-modal" style="flex: 1;">Hủy</button>
          <button class="btn btn-primary" id="btn-save-payment-modal" style="flex: 2;">💾 Lưu & Xuất Biên Nhận</button>
        </div>
      </div>
    </div>

    <!-- Modal Xem & In Biên Nhận Điện Tử -->
    <div id="modal-receipt-view" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">🧾 Biên Nhận Đóng Tiền Hụi</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-receipt-modal">✕</button>
        </div>
        <div class="modal-body" id="receipt-modal-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-print-receipt" style="flex: 1;">🖨️ In / Lưu PDF</button>
          <button class="btn btn-primary" id="btn-share-receipt-zalo" style="flex: 1;">📲 Gửi Zalo</button>
        </div>
      </div>
    </div>
  `;

  // Hàm render hàng đóng tiền
  function renderPaymentRow(p, grp, cyc, account) {
    const profile = store.state.profiles.find(prof => prof.id === p.memberProfileId);
    const isPaid = p.status === 'paid';
    const isLate = p.status === 'late';

    return `
      <div class="card" style="padding: 10px; border-left: 4px solid ${isPaid ? 'var(--primary)' : 'var(--accent)'}; margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <strong style="font-size: 14px;">${escapeHtml(profile?.fullName || 'Hụi viên')}</strong>
              ${profile?.nickname ? `<span style="font-size: 12px; color: var(--primary);">(${escapeHtml(profile.nickname)})</span>` : ''}
            </div>
            <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
              ${p.sharesCount} phần • <strong>${p.isDeadHui ? '🔴 Hụi chết' : '🟢 Hụi sống'}</strong>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 14.5px; font-weight: 800; color: ${isPaid ? 'var(--primary)' : 'var(--accent)'};">
              ${formatMoney(p.amountDue)}
            </div>
            <span class="badge ${isPaid ? 'badge-success' : (isLate ? 'badge-danger' : 'badge-warning')}">
              ${isPaid ? 'Đã nộp đủ' : (isLate ? 'Trễ hạn' : 'Chưa nộp')}
            </span>
          </div>
        </div>

        <!-- Thao tác thu tiền & VietQR -->
        <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-color); flex-wrap: wrap;">
          ${!isPaid ? `
            <button class="btn btn-sm btn-outline btn-show-vietqr-pay" data-id="${p.id}" style="color: var(--primary); border-color: #86efac; font-size: 11.5px; padding: 4px 8px;">
              📱 VietQR
            </button>
          ` : ''}

          <button class="btn btn-sm btn-primary btn-record-single" data-id="${p.id}" style="font-size: 11.5px; padding: 4px 8px;">
            ${isPaid ? '✏️ Sửa' : '💰 Thu tiền'}
          </button>

          ${isPaid ? `
            <button class="btn btn-sm btn-outline btn-view-receipt-payment" data-pay-id="${p.id}" style="font-size: 11.5px; padding: 4px 8px;">
              🧾 Biên nhận
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Sự kiện xem Phiếu Giao Tiền Hốt Hụi & Quyết Toán Đầu Thảo
  document.getElementById('btn-view-payout-voucher')?.addEventListener('click', () => {
    let voucher = (store.state.receipts || []).find(r => r.type === 'PAYOUT_VOUCHER' && r.cycleId === cycle.id);
    if (!voucher) {
      voucher = store.createWinnerPayoutReceipt(cycle.id);
    }
    if (voucher) {
      showPayoutVoucherModal(voucher);
    }
  });

  function showPayoutVoucherModal(voucher) {
    const modal = document.getElementById('modal-payout-voucher-view');
    const body = document.getElementById('payout-voucher-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="receipt-paper" id="printable-voucher">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #1e293b;">PHIẾU GIAO TIỀN HỐT HỤI & QUYẾT TOÁN ĐẦU THẢO</h3>
          <div style="font-size: 11px; color: var(--text-muted);">Mã chứng từ: <strong>${escapeHtml(voucher.receiptNumber)}</strong> • Ngày lập: ${formatDateTime(voucher.createdAt)}</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; margin-top: 8px;">
          <div>📜 <strong>Dây hụi:</strong> ${escapeHtml(voucher.groupName)} (Góp ${formatMoney(voucher.baseAmount)}/phần, ${voucher.totalParts} phần)</div>
          <div>🎯 <strong>Kỳ khui:</strong> Kỳ số ${voucher.cycleNumber}</div>
          <div>🥇 <strong>Người hốt hụi:</strong> <strong>${escapeHtml(voucher.winnerName)}</strong> ${voucher.winnerNickname ? `(${escapeHtml(voucher.winnerNickname)})` : ''} - SĐT: ${escapeHtml(voucher.winnerPhone)}</div>
          <div>🏷️ <strong>Mức tiền thăm trúng:</strong> ${formatMoney(voucher.winningBidAmount)}</div>

          <!-- Bảng kê quyết toán -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; margin-top: 4px;">
            <div style="font-weight: 700; margin-bottom: 4px; color: var(--text-main);">BẢNG KÊ QUYẾT TOÁN CHI TIẾT:</div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
              <span>• Tiền Hụi Chết (${voucher.deadSharesCount} phần × ${formatMoney(voucher.deadAmountPerShare)}):</span>
              <strong>${formatMoney(voucher.totalDeadAmount)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
              <span>• Tiền Hụi Sống (${voucher.liveSharesCount} phần × ${formatMoney(voucher.liveAmountPerShare)}):</span>
              <strong>${formatMoney(voucher.totalLiveAmount)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; padding-top: 4px; border-top: 1px dashed var(--border-color); font-weight: 700;">
              <span>Tổng cộng tiền gom từ các hụi viên:</span>
              <span>${formatMoney(voucher.grossPot)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #b45309; margin-top: 4px;">
              <span>- Khấu trừ Tiền Đầu Thảo Chủ Hụi (${escapeHtml(voucher.commissionRuleLabel)}):</span>
              <strong style="color: var(--accent);">- ${formatMoney(voucher.commissionAmount)}</strong>
            </div>
          </div>

          <!-- Số tiền thực giao -->
          <div style="background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; padding: 10px; margin-top: 4px;">
            <div style="font-size: 11.5px; color: var(--text-muted);">SỐ TIỀN THỰC BÀN GIAO CHO NGƯỜI HỐT:</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${formatMoney(voucher.netPayout)}</div>
            <div style="font-size: 11.5px; font-style: italic; color: #166534;">(Bằng chữ: ${escapeHtml(voucher.netPayoutInWords)})</div>
          </div>
        </div>

        <!-- Chữ ký 2 bên -->
        <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 11.5px; text-align: center;">
          <div style="flex: 1;">
            <strong>NGƯỜI HỐT HỤI</strong><br/>
            <span style="font-size: 10px; color: var(--text-muted);">(Đã nhận đủ tiền)</span>
            <div style="height: 35px;"></div>
            <strong>${escapeHtml(voucher.winnerName)}</strong>
          </div>
          <div style="flex: 1;">
            <strong>CHỦ HỤI GIAO TIỀN</strong><br/>
            <span style="font-size: 10px; color: var(--text-muted);">(Đã bàn giao & khấu trừ)</span>
            <div style="height: 35px;"></div>
            <strong>${escapeHtml(acc.fullName)}</strong>
          </div>
        </div>

        <div class="receipt-stamp">ĐÃ BÀN GIAO</div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  document.getElementById('btn-close-voucher-modal')?.addEventListener('click', () => {
    document.getElementById('modal-payout-voucher-view').style.display = 'none';
  });

  document.getElementById('btn-print-voucher')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-share-voucher-zalo')?.addEventListener('click', () => {
    const voucher = (store.state.receipts || []).find(r => r.type === 'PAYOUT_VOUCHER' && r.cycleId === cycle.id);
    if (!voucher) return;

    const shareText = `📄 PHIẾU BÀN GIAO TIỀN HỐT HỤI [${voucher.receiptNumber}]\n` +
      `- Dây hụi: ${voucher.groupName} (Kỳ ${voucher.cycleNumber})\n` +
      `- Người nhận tiền: ${voucher.winnerName} (${voucher.winnerNickname})\n` +
      `- Mức thăm: ${formatMoney(voucher.winningBidAmount)}\n` +
      `-------------------------\n` +
      `• Hụi chết (${voucher.deadSharesCount} phần): ${formatMoney(voucher.totalDeadAmount)}\n` +
      `• Hụi sống (${voucher.liveSharesCount} phần): ${formatMoney(voucher.totalLiveAmount)}\n` +
      `• Tổng tiền gom: ${formatMoney(voucher.grossPot)}\n` +
      `• Trừ tiền đầu thảo chủ hụi: -${formatMoney(voucher.commissionAmount)}\n` +
      `👉 THỰC LĨNH TRAO TAY: ${formatMoney(voucher.netPayout)}\n` +
      `📝 Bằng chữ: ${voucher.netPayoutInWords}\n` +
      `(Ứng dụng Quản lý Sổ Hụi)`;

    navigator.clipboard?.writeText(shareText);
    showToast('Đã sao chép nội dung phiếu giao hụi để gửi Zalo!', 'success');
  });

  // Modal VietQR
  const modalVietQR = document.getElementById('modal-vietqr-view');
  let currentShareZaloText = '';

  container.querySelectorAll('.btn-show-vietqr-pay').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pid = e.currentTarget.getAttribute('data-id');
      const p = payments.find(pay => pay.id === pid);
      const prof = store.state.profiles.find(prof => prof.id === p.memberProfileId);

      if (p && prof) {
        const memo = `${prof.fullName.split(' ').pop()} dong hui ${group.name.replace(/\s+/g, '')} ky ${cycle.cycleNumber}`;
        const qrUrl = generateVietQRUrl(acc.bankCode || 'VCB', acc.accountNumber || '', acc.accountHolder || acc.fullName, p.amountDue, memo);

        currentShareZaloText = `📢 THÔNG BÁO ĐÓNG TIỀN HỤI\n- Kính gửi: ${prof.fullName} (${prof.nickname})\n- Dây hụi: ${group.name} (Kỳ ${cycle.cycleNumber})\n- Diện hụi: ${p.isDeadHui ? 'Hụi Chết' : 'Hụi Sống'}\n- Số tiền cần nộp: ${formatMoney(p.amountDue)}\n- Tài khoản nhận: ${acc.accountNumber} (${acc.bankName || acc.bankCode}) - Chủ TK: ${acc.accountHolder || acc.fullName}\n- Cú pháp CK: ${memo}\n(Ứng dụng Sổ Hụi)`;

        document.getElementById('vietqr-modal-body').innerHTML = `
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">
            Người nộp: <strong style="color:var(--text-main);">${escapeHtml(prof.fullName)}</strong>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
            ${formatMoney(p.amountDue)}
          </div>
          <img src="${qrUrl}" alt="VietQR" style="width: 100%; max-width: 240px; border-radius: 8px; box-shadow: var(--shadow-sm);" />
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px; text-align: left; background: #f8fafc; padding: 8px; border-radius: 6px;">
            <div>🏦 Ngân hàng: <strong>${escapeHtml(acc.bankName || acc.bankCode || 'Vietcombank')}</strong></div>
            <div>💳 Số TK: <strong>${escapeHtml(acc.accountNumber || 'Chưa cấu hình')}</strong></div>
            <div>👤 Chủ TK: <strong>${escapeHtml(acc.accountHolder || acc.fullName)}</strong></div>
            <div>📝 Nội dung: <strong>${escapeHtml(memo)}</strong></div>
          </div>
        `;
        modalVietQR.style.display = 'flex';
      }
    });
  });

  document.getElementById('btn-close-vietqr-modal')?.addEventListener('click', () => modalVietQR.style.display = 'none');
  document.getElementById('btn-close-vietqr-btn')?.addEventListener('click', () => modalVietQR.style.display = 'none');
  document.getElementById('btn-copy-vietqr-zalo')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(currentShareZaloText);
    showToast('Đã sao chép nội dung nhắc tiền và thông tin VietQR để gửi Zalo!', 'success');
  });

  // Sự kiện ghi nhận đóng tiền
  const modalPay = document.getElementById('modal-record-payment');
  container.querySelectorAll('.btn-record-single').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pid = e.currentTarget.getAttribute('data-id');
      const p = payments.find(pay => pay.id === pid);
      const prof = store.state.profiles.find(prof => prof.id === p.memberProfileId);

      if (p && prof) {
        document.getElementById('form-payment-id').value = p.id;
        document.getElementById('modal-pay-member-name').innerText = `${prof.fullName} (${prof.nickname})`;
        document.getElementById('modal-pay-amount-due').innerText = formatMoney(p.amountDue);
        document.getElementById('form-pay-amount-paid').value = p.amountPaid > 0 ? p.amountPaid : p.amountDue;
        document.getElementById('form-pay-method').value = p.paymentMethod || 'transfer';
        document.getElementById('form-pay-txref').value = p.transactionRef || '';
        document.getElementById('form-pay-note').value = p.note || '';
        modalPay.style.display = 'flex';
      }
    });
  });

  document.getElementById('btn-close-payment-modal')?.addEventListener('click', () => modalPay.style.display = 'none');
  document.getElementById('btn-cancel-pay-modal')?.addEventListener('click', () => modalPay.style.display = 'none');

  document.getElementById('btn-save-payment-modal')?.addEventListener('click', () => {
    const paymentId = document.getElementById('form-payment-id').value;
    const amountPaid = Number(document.getElementById('form-pay-amount-paid').value);
    const paymentMethod = document.getElementById('form-pay-method').value;
    const transactionRef = document.getElementById('form-pay-txref').value.trim();
    const note = document.getElementById('form-pay-note').value.trim();

    if (isNaN(amountPaid) || amountPaid < 0) {
      showToast('Vui lòng nhập số tiền hợp lệ!', 'warning');
      return;
    }

    try {
      store.recordPayment(paymentId, {
        amountPaid,
        paymentMethod,
        transactionRef,
        note
      });

      showToast('Ghi nhận thanh toán thành công!', 'success');
      modalPay.style.display = 'none';
      renderCyclePayments(container, cycle.id);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  });

  // Chốt sổ kỳ hụi
  document.getElementById('btn-close-cycle-action')?.addEventListener('click', () => {
    if (remaining > 0) {
      if (!confirm(`⚠️ CẢNH BÁO:\nHiện tại vẫn còn ${formatMoney(remaining)} chưa được nộp đầy đủ.\nBạn có chắc chắn muốn chốt sổ kỳ này không? (Chủ hụi sẽ ghi nhận nợ cho các thành viên chưa đóng).`)) {
        return;
      }
    } else {
      if (!confirm(`Xác nhận chốt sổ hoàn tất Kỳ ${cycle.cycleNumber} của Dây "${group.name}"? Hệ thống sẽ chuyển sang kỳ tiếp theo.`)) {
        return;
      }
    }

    try {
      store.closeCycle(cycle.id);
      showToast(`Đã chốt sổ thành công Kỳ ${cycle.cycleNumber}!`, 'success');
      window.location.hash = `#group-detail/${group.id}`;
    } catch (err) {
      showToast(err.message, 'danger');
    }
  });

  // Xuất Excel
  document.getElementById('btn-export-payments-excel')?.addEventListener('click', () => {
    const rows = [
      ['BẢNG KÊ THU TIỀN HỤI - KỲ ' + cycle.cycleNumber + ' - ' + group.name.toUpperCase()],
      ['Ngày khui:', formatDate(cycle.openDate), 'Người hốt:', winnerProfile?.fullName || 'Chưa có', 'Mức thăm:', formatMoney(cycle.winningBidAmount)],
      ['Tổng cần thu:', formatMoney(totalDue), 'Đã thu thực tế:', formatMoney(totalPaid), 'Tiền thảo chủ hụi:', formatMoney(cycle.commissionAmount), 'Thực giao:', formatMoney(cycle.potAmount)],
      [''],
      ['STT', 'Họ và tên', 'Biệt danh', 'Diện hụi', 'Số phần', 'Số tiền phải nộp', 'Thực nộp', 'Hình thức', 'Trạng thái', 'Ghi chú']
    ];

    payments.forEach((p, idx) => {
      const prof = store.state.profiles.find(prof => prof.id === p.memberProfileId);
      rows.push([
        idx + 1,
        prof?.fullName || '',
        prof?.nickname || '',
        p.isDeadHui ? 'Hụi chết' : 'Hụi sống',
        p.sharesCount,
        formatMoney(p.amountDue),
        formatMoney(p.amountPaid),
        p.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt',
        p.status === 'paid' ? 'Đã nộp đủ' : (p.status === 'late' ? 'Trễ hạn' : 'Chưa nộp'),
        p.note || ''
      ]);
    });

    exportToCSV(`ThuTien_Ky${cycle.cycleNumber}_${group.name.replace(/\s+/g, '_')}.csv`, rows);
    showToast('Đã xuất file báo cáo thu tiền Excel!', 'success');
  });

  // Xem biên nhận
  const modalReceipt = document.getElementById('modal-receipt-view');
  container.querySelectorAll('.btn-view-receipt-payment').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const payId = e.currentTarget.getAttribute('data-pay-id');
      const rec = store.state.receipts.find(r => r.paymentId === payId);
      if (rec) {
        showReceiptModal(rec);
      } else {
        showToast('Không tìm thấy biên nhận tương ứng!', 'warning');
      }
    });
  });

  document.getElementById('btn-close-receipt-modal')?.addEventListener('click', () => modalReceipt.style.display = 'none');

  function showReceiptModal(rec) {
    const body = document.getElementById('receipt-modal-body');
    body.innerHTML = `
      <div class="receipt-paper" id="printable-receipt">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px;">
          <h3 style="font-size: 16px; font-weight: 800; letter-spacing: 0.5px;">BIÊN NHẬN ĐÓNG TIỀN HỤI</h3>
          <div style="font-size: 11.5px; color: var(--text-muted);">${rec.shopName || acc.shopName || 'Sổ Hụi Miền Nam'} • Phiếu: <strong>${escapeHtml(rec.receiptNumber)}</strong></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; margin-top: 6px;">
          <div>👤 Người nộp tiền: <strong>${escapeHtml(rec.payerName)}</strong></div>
          <div>👩‍💼 Người thu tiền: <strong>${escapeHtml(rec.receiverName)}</strong> (Chủ hụi)</div>
          <div>📜 Dây hụi: <strong>${escapeHtml(rec.huiName)}</strong></div>
          <div>🎯 Kỳ đóng: <strong>Kỳ số ${rec.cycleNumber}</strong></div>
          <div>💳 Phương thức: <strong>${escapeHtml(rec.paymentMethod)}</strong></div>
          <div>📅 Ngày giờ lập: <strong>${rec.paymentDate}</strong></div>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px; margin-top: 4px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: var(--text-muted);">Số tiền đã thu:</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${formatMoney(rec.amount)}</div>
            <div style="font-size: 11.5px; font-style: italic; color: #475569;">(Bằng chữ: ${escapeHtml(rec.amountInWords)})</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 12px; text-align: center;">
          <div>
            <strong>Người nộp tiền</strong><br/>
            <span style="font-size: 10.5px; color: var(--text-muted);">(Ký, ghi rõ họ tên)</span>
            <div style="height: 40px;"></div>
            <span>${escapeHtml(rec.payerName.split('(')[0])}</span>
          </div>
          <div>
            <strong>Người thu tiền (Chủ hụi)</strong><br/>
            <span style="font-size: 10.5px; color: var(--text-muted);">(Đã nhận đủ tiền)</span>
            <div style="height: 40px;"></div>
            <span>${escapeHtml(rec.receiverName.split('(')[0])}</span>
          </div>
        </div>

        <div class="receipt-stamp">ĐÃ THU TIỀN</div>
      </div>
    `;
    modalReceipt.style.display = 'flex';

    document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-share-receipt-zalo')?.addEventListener('click', () => {
      const shareText = `🧾 BIÊN NHẬN ĐÓNG TIỀN HỤI [${rec.receiptNumber}]\n- Đơn vị: ${rec.shopName || acc.shopName || 'Sổ Hụi'}\n- Người nộp: ${rec.payerName}\n- Dây hụi: ${rec.huiName} (Kỳ ${rec.cycleNumber})\n- Số tiền: ${formatMoney(rec.amount)} (${rec.amountInWords})\n- Phương thức: ${rec.paymentMethod}\n- Thời gian: ${rec.paymentDate}\n(Ứng dụng Quản lý Sổ Hụi)`;
      navigator.clipboard?.writeText(shareText);
      showToast('Đã sao chép nội dung biên nhận để gửi Zalo!', 'success');
    });
  }

  window.viewReceiptDetail = (recId) => {
    const rec = store.state.receipts.find(r => r.id === recId);
    if (rec) showReceiptModal(rec);
  };
}
