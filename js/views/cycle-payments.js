/**
 * QUẢN LÝ ĐÓNG TIỀN, BIÊN NHẬN, VIETQR & CHỐT SỔ KỲ HỤI (PAYMENTS & RECEIPTS)
 * Ghi nhận tiền mặt / chuyển khoản, tự động sinh mã VietQR chuẩn ngân hàng,
 * xem/in biên nhận điện tử, xuất PDF/Excel, chốt sổ.
 */

import { store } from '../store.js';
import { formatMoney, formatDate, showToast, exportToCSV, generateVietQRUrl } from '../utils.js';

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

  // Thống kê tổng tiền thu
  const totalPaid = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.amountDue || 0), 0);
  const remaining = totalDue - totalPaid;

  container.innerHTML = `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <button class="btn btn-sm btn-outline" style="margin-bottom: 6px;" onclick="window.location.hash='#group-detail/${group.id}'">
          ← Dây hụi
        </button>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">
          💳 Bảng Thu Tiền Kỳ ${cycle.cycleNumber}
        </h2>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Dây: <strong>${group.name}</strong> • Ngày khui: ${formatDate(cycle.openDate)}
        </div>
      </div>
      <span class="badge ${cycle.status === 'closed' ? 'badge-gray' : 'badge-warning'}">
        ${cycle.status === 'closed' ? 'Đã chốt sổ' : 'Đang mở thu tiền'}
      </span>
    </div>

    <!-- Thông tin người trúng hốt & số tiền thực nhận -->
    ${winnerProfile ? `
      <div class="card highlight" style="padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 12px; color: var(--text-muted);">Người hốt kỳ này:</div>
            <strong style="font-size: 15px; color: var(--primary-dark);">🏆 ${winnerProfile.fullName} (${winnerProfile.nickname})</strong>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11.5px; color: var(--text-muted);">Tiền hốt thực nhận:</div>
            <strong style="font-size: 16px; color: var(--primary);">${formatMoney(cycle.potAmount)}</strong>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #bbf7d0;">
          <span>Mức thăm trúng: <strong>${formatMoney(cycle.winningBidAmount)}</strong></span>
          <span>Tiền thảo chủ hụi: <strong>${formatMoney(cycle.commissionAmount)}</strong></span>
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

    <!-- Danh sách các khoản đóng của từng hụi viên -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          📋 Danh sách chi tiết đóng tiền (${payments.length})
        </div>
      </div>

      <div class="item-list">
        ${payments.map(p => {
          const profile = store.state.profiles.find(prof => prof.id === p.memberProfileId);
          const isWinner = p.memberProfileId === cycle.winnerMemberProfileId;
          const isPaid = p.status === 'paid';
          const isLate = p.status === 'late';

          return `
            <div class="card" style="padding: 12px; border-left: 4px solid ${isWinner ? 'var(--blue)' : (isPaid ? 'var(--primary)' : 'var(--accent)')};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="font-size: 14.5px;">${profile?.fullName}</strong>
                    ${profile?.nickname ? `<span style="font-size: 12px; color: var(--primary);">(${profile.nickname})</span>` : ''}
                    ${isWinner ? `<span class="badge badge-info">Người hốt</span>` : ''}
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                    ${p.sharesCount} phần • <strong>${p.isDeadHui ? 'Hụi chết (đóng đủ)' : 'Hụi sống'}</strong>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 15px; font-weight: 800; color: ${isPaid ? 'var(--primary)' : 'var(--accent)'};">
                    ${formatMoney(p.amountDue)}
                  </div>
                  <span class="badge ${isPaid ? 'badge-success' : (isLate ? 'badge-danger' : 'badge-warning')}">
                    ${isPaid ? 'Đã đóng đủ' : (isLate ? 'Trễ hạn' : 'Chưa nộp')}
                  </span>
                </div>
              </div>

              <!-- Chi tiết thanh toán -->
              <div style="font-size: 12px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>
                  Phương thức: <strong>${p.paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</strong>
                  ${p.transactionRef ? ` (${p.transactionRef})` : ''}
                </span>
                <span>${p.paidAt ? formatDate(p.paidAt) : 'Chưa thu'}</span>
              </div>

              <!-- Thao tác thu tiền & VietQR -->
              <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-color); flex-wrap: wrap;">
                ${!isWinner && !isPaid ? `
                  <button class="btn btn-sm btn-outline btn-show-vietqr-pay" data-id="${p.id}" style="color: var(--primary); border-color: #86efac;">
                    📱 Mã VietQR
                  </button>
                ` : ''}

                ${!isWinner ? `
                  <button class="btn btn-sm btn-primary btn-record-single" data-id="${p.id}">
                    ${isPaid ? '✏️ Sửa số tiền' : '💰 Thu tiền'}
                  </button>
                ` : ''}

                ${isPaid && !isWinner ? `
                  <button class="btn btn-sm btn-outline btn-view-receipt-payment" data-pay-id="${p.id}">
                    🧾 Xem biên nhận
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Modal Xem Mã VietQR Chuyển Khoản Tức Thì -->
    <div id="modal-vietqr-view" class="modal-overlay" style="display: none;">
      <div class="modal-content" style="max-width: 380px; text-align: center;">
        <div class="modal-header">
          <h3 class="modal-title">📱 Mã VietQR Thanh Toán</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-vietqr-modal">✕</button>
        </div>
        <div class="modal-body" id="vietqr-modal-body">
          <!-- QR Image inserted dynamically -->
        </div>
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
          <h3 class="modal-title">🧾 Biên Nhận Thu Tiền Hụi</h3>
          <button class="btn btn-sm btn-outline btn-circle" id="btn-close-receipt-modal">✕</button>
        </div>
        <div class="modal-body" id="receipt-modal-body">
          <!-- In nội dung biên nhận -->
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="btn-print-receipt" style="flex: 1;">🖨️ In / Lưu PDF</button>
          <button class="btn btn-primary" id="btn-share-receipt-zalo" style="flex: 1;">📲 Gửi Zalo</button>
        </div>
      </div>
    </div>
  `;

  // Xử lý Modal VietQR
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

        currentShareZaloText = `📢 THÔNG BÁO ĐÓNG TIỀN HỤI\n- Kính gửi: ${prof.fullName} (${prof.nickname})\n- Dây hụi: ${group.name} (Kỳ ${cycle.cycleNumber})\n- Số tiền cần nộp: ${formatMoney(p.amountDue)}\n- Tài khoản nhận: ${acc.accountNumber} (${acc.bankName || acc.bankCode}) - Chủ TK: ${acc.accountHolder || acc.fullName}\n- Cú pháp CK: ${memo}\n(Ứng dụng Sổ Hụi)`;

        document.getElementById('vietqr-modal-body').innerHTML = `
          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">
            Người nộp: <strong style="color:var(--text-main);">${prof.fullName}</strong>
          </div>
          <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 10px;">
            ${formatMoney(p.amountDue)}
          </div>
          <img src="${qrUrl}" alt="VietQR" style="width: 100%; max-width: 240px; border-radius: 8px; box-shadow: var(--shadow-sm);" />
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px; text-align: left; background: #f8fafc; padding: 8px; border-radius: 6px;">
            <div>🏦 Ngân hàng: <strong>${acc.bankName || acc.bankCode || 'Vietcombank'}</strong></div>
            <div>💳 Số TK: <strong>${acc.accountNumber || 'Chưa cấu hình'}</strong></div>
            <div>👤 Chủ TK: <strong>${acc.accountHolder || acc.fullName}</strong></div>
            <div>📝 Nội dung: <strong>${memo}</strong></div>
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
      ['Tổng cần thu:', formatMoney(totalDue), 'Đã thu thực tế:', formatMoney(totalPaid), 'Còn thiếu:', formatMoney(remaining)],
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
          <div style="font-size: 11.5px; color: var(--text-muted);">${rec.shopName || acc.shopName || 'Sổ Hụi Miền Nam'} • Phiếu: <strong>${rec.receiptNumber}</strong></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; margin-top: 6px;">
          <div>👤 Người nộp tiền: <strong>${rec.payerName}</strong></div>
          <div>👩‍💼 Người thu tiền: <strong>${rec.receiverName}</strong> (Chủ hụi)</div>
          <div>📜 Dây hụi: <strong>${rec.huiName}</strong></div>
          <div>🎯 Kỳ đóng: <strong>Kỳ số ${rec.cycleNumber}</strong></div>
          <div>💳 Phương thức: <strong>${rec.paymentMethod}</strong></div>
          <div>📅 Ngày giờ lập: <strong>${rec.paymentDate}</strong></div>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px; margin-top: 4px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: var(--text-muted);">Số tiền đã thu:</div>
            <div style="font-size: 18px; font-weight: 800; color: var(--primary);">${formatMoney(rec.amount)}</div>
            <div style="font-size: 11.5px; font-style: italic; color: #475569;">(Bằng chữ: ${rec.amountInWords})</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 14px; font-size: 12px; text-align: center;">
          <div>
            <strong>Người nộp tiền</strong><br/>
            <span style="font-size: 10.5px; color: var(--text-muted);">(Ký, ghi rõ họ tên)</span>
            <div style="height: 40px;"></div>
            <span>${rec.payerName.split('(')[0]}</span>
          </div>
          <div>
            <strong>Người thu tiền (Chủ hụi)</strong><br/>
            <span style="font-size: 10.5px; color: var(--text-muted);">(Đã nhận đủ tiền)</span>
            <div style="height: 40px;"></div>
            <span>${rec.receiverName.split('(')[0]}</span>
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

  // Toàn cục để member view có thể gọi
  window.viewReceiptDetail = (recId) => {
    const rec = store.state.receipts.find(r => r.id === recId);
    if (rec) showReceiptModal(rec);
  };
}
