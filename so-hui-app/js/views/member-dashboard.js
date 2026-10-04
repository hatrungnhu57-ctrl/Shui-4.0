/**
 * DASHBOARD HỤI VIÊN & GIAO DIỆN HYBRID (MEMBER & HYBRID VIEW)
 */

import { store } from '../store.js';
import { formatMoney, formatDate, getPeriodLabel, showToast } from '../utils.js';

export function renderMemberDashboard(container) {
  const currentProfile = store.state.profiles.find(p => p.phone === store.state.currentUser.phone) || store.state.profiles[1]; // Mặc định Anh Ba Khía
  const groupMembers = store.state.groupMembers.filter(gm => gm.memberProfileId === currentProfile.id);
  const myGroupIds = groupMembers.map(gm => gm.groupId);
  const myGroups = store.state.groups.filter(g => myGroupIds.includes(g.id));

  // Lọc các khoản cần đóng của hụi viên này
  const myPayments = store.state.payments.filter(p => p.memberProfileId === currentProfile.id);
  const unpaidPayments = myPayments.filter(p => p.status === 'unpaid' || p.status === 'late');
  const totalDueAmount = unpaidPayments.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

  // Lọc biên nhận của hụi viên này
  const myReceipts = store.state.receipts.filter(r => r.payerName.includes(currentProfile.fullName) || r.payerName.includes(currentProfile.nickname));

  container.innerHTML = `
    <!-- Thẻ chào mừng Hụi Viên -->
    <div class="card" style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: #ffffff; border: none;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 24px;">
          👨‍🌾
        </div>
        <div>
          <h2 style="font-size: 17px; font-weight: 700;">Chào ${currentProfile.fullName}</h2>
          <div style="font-size: 12.5px; opacity: 0.9;">${currentProfile.nickname} • 📞 ${currentProfile.phone}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2);">
        <div>
          <span style="font-size: 11.5px; opacity: 0.8;">Dây đang chơi</span>
          <div style="font-size: 18px; font-weight: 800;">${myGroups.length} dây</div>
        </div>
        <div>
          <span style="font-size: 11.5px; opacity: 0.8;">Tiền cần đóng kỳ này</span>
          <div style="font-size: 18px; font-weight: 800; color: #fef08a;">${formatMoney(totalDueAmount)}</div>
        </div>
      </div>
    </div>

    <!-- Thông báo khoản cần đóng gấp nếu có -->
    ${unpaidPayments.length > 0 ? `
      <div class="card" style="border-color: #fca5a5; background: #fff5f5;">
        <div class="card-header">
          <div class="card-title" style="color: #b91c1c; font-size: 15px;">
            ⚠️ Kỳ hụi cần đóng tiền (${unpaidPayments.length})
          </div>
          <span class="badge badge-danger">Chưa nộp</span>
        </div>
        <div class="item-list">
          ${unpaidPayments.map(p => {
            const grp = store.state.groups.find(g => g.id === p.groupId);
            const cyc = store.state.cycles.find(c => c.id === p.cycleId);
            return `
              <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <strong style="font-size: 14.5px;">${grp?.name}</strong>
                  <span class="badge badge-warning">Kỳ ${cyc?.cycleNumber}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-muted);">
                  Diện: <strong>${p.isDeadHui ? 'Hụi chết (đóng đủ)' : 'Hụi sống (đã trừ thăm)'}</strong> • Số chân: ${p.sharesCount}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border-color);">
                  <span style="color: var(--text-muted); font-size: 12.5px;">Số tiền:</span>
                  <span style="font-size: 16px; font-weight: 800; color: var(--accent);">${formatMoney(p.amountDue)}</span>
                </div>
                <button class="btn btn-sm btn-outline btn-block" style="margin-top: 4px;" onclick="window.showFeedbackModal('${grp?.name}', '${cyc?.cycleNumber}')">
                  💬 Báo sai số tiền / Nhắn chủ hụi
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : `
      <div class="card" style="background: #f0fdf4; border-color: #86efac; text-align: center; padding: 14px;">
        <div style="font-size: 24px;">🎉</div>
        <strong style="color: #166534; font-size: 14.5px; margin-top: 4px;">Tuyệt vời! Bạn không còn nợ khoản hụi nào</strong>
        <p style="font-size: 12px; color: #15803d; margin-top: 2px;">Tất cả các kỳ hụi hiện tại đã được thanh toán đầy đủ.</p>
      </div>
    `}

    <!-- Danh sách các dây hụi bạn đang tham gia -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          📋 Dây hụi bạn đang tham gia (${myGroups.length})
        </div>
      </div>
      <div class="item-list">
        ${myGroups.map(grp => {
          const gm = groupMembers.find(m => m.groupId === grp.id);
          const grpCycles = store.state.cycles.filter(c => c.groupId === grp.id);
          const closedCycles = grpCycles.filter(c => c.status === 'closed');
          const owner = store.state.profiles.find(p => p.id === grp.createdBy) || { fullName: 'Cô Bảy', phone: '0918123456' };
          const hasHoted = gm?.hotedCycles && gm.hotedCycles.length > 0;

          return `
            <div class="hui-card" data-group-id="${grp.id}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">${grp.name}</h4>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                    Chủ hụi: <strong>${owner.fullName}</strong> (${owner.phone})
                  </div>
                </div>
                <span class="badge ${hasHoted ? 'badge-warning' : 'badge-success'}">
                  ${hasHoted ? `Đã hốt kỳ ${gm.hotedCycles.join(', ')}` : 'Hụi sống (Chưa hốt)'}
                </span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; font-size: 12.5px; background: #f8fafc; padding: 8px; border-radius: 6px;">
                <div>Góp định kỳ: <strong>${formatMoney(grp.baseAmount)}</strong></div>
                <div>Số chân tham gia: <strong>${gm?.sharesCount || 1} phần</strong></div>
                <div>Tiến độ: <strong>${closedCycles.length}/${grp.totalParts} kỳ</strong></div>
                <div>Chu kỳ: <strong>${getPeriodLabel(grp.periodType)}</strong></div>
              </div>

              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <button class="btn btn-sm btn-primary" style="flex: 1; background: #2563eb; border-color: #1d4ed8; font-size: 11.5px; padding: 6px;" onclick="event.stopPropagation(); window.location.hash='#group-chat/${grp.id}';">
                  💬 Vào Nhóm & Bỏ Thăm Kín
                </button>
                <button class="btn btn-sm btn-outline" style="flex: 1; font-size: 11.5px; padding: 6px;" onclick="event.stopPropagation(); window.location.hash='#group-detail/${grp.id}';">
                  📋 Xem Chi Tiết
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Biên nhận & Chứng từ gần đây của Hụi Viên -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          🧾 Biên nhận đóng tiền của bạn (${myReceipts.length})
        </div>
      </div>
      ${myReceipts.length > 0 ? `
        <div class="item-list">
          ${myReceipts.map(rec => `
            <div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--primary);">${rec.receiptNumber}</strong>
                <div style="font-size: 12px; color: var(--text-muted);">${rec.huiName} - Kỳ ${rec.cycleNumber}</div>
                <div style="font-size: 11px; color: #64748b;">📅 ${rec.paymentDate}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 800; color: var(--text-main);">${formatMoney(rec.amount)}</div>
                <button class="btn btn-sm btn-outline" style="font-size: 11px; margin-top: 4px;" onclick="window.viewReceiptDetail('${rec.id}')">
                  Xem phiếu 👁️
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 12px;">
          Chưa có biên nhận điện tử nào được lưu.
        </div>
      `}
    </div>

    <!-- Nút phản hồi nhanh cho Chủ Hụi -->
    <div class="card" style="background: #eff6ff; border-color: #bfdbfe;">
      <div class="card-title" style="color: #1d4ed8; font-size: 14.5px;">
        💬 Phản hồi & Trợ giúp từ Chủ Hụi
      </div>
      <p style="font-size: 12.5px; color: #1e40af;">
        Nếu bạn phát hiện sai sót về số tiền, chưa nhận được tiền hốt hụi hoặc cần đổi lịch đóng, hãy gửi phản hồi ngay.
      </p>
      <button class="btn btn-primary btn-sm btn-block" id="btn-open-feedback-general">
        Gửi yêu cầu kiểm tra / Nhắn chủ hụi
      </button>
    </div>
  `;

  // Gán sự kiện click chi tiết dây hụi
  container.querySelectorAll('.hui-card').forEach(card => {
    card.addEventListener('click', () => {
      const gid = card.getAttribute('data-group-id');
      window.location.hash = `#group-detail/${gid}`;
    });
  });

  document.getElementById('btn-open-feedback-general')?.addEventListener('click', () => {
    window.showFeedbackModal('Chung', '');
  });
}
