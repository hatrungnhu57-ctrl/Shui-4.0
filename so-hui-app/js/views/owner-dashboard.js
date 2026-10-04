/**
 * DASHBOARD CHỦ HỤI (OWNER DASHBOARD)
 * Tổng quan dây hụi, đôn đốc thu tiền, cảnh báo trễ hạn, nút thao tác nhanh
 */

import { store } from '../store.js';
import { formatMoney, formatDate, getPeriodLabel } from '../utils.js';

export function renderOwnerDashboard(container) {
  const groups = store.state.groups.filter(g => g.status === 'active');
  const profiles = store.state.profiles.filter(p => !p.isMerged);
  const cycles = store.state.cycles;
  const payments = store.state.payments;

  // 1. Thống kê tổng số dây hụi đang quản lý
  const totalActiveGroups = groups.length;

  // 2. Dây hụi sắp tới ngày khui (lấy kỳ đang open gần nhất)
  const openCycles = cycles.filter(c => c.status === 'open');
  const nextOpenCycle = openCycles[0];
  let nextGroup = null;
  if (nextOpenCycle) {
    nextGroup = groups.find(g => g.id === nextOpenCycle.groupId);
  }

  // 3. Số hụi viên chưa đóng kỳ hiện tại
  const currentUnpaidPayments = payments.filter(p => (p.status === 'unpaid' || p.status === 'late'));
  const totalUnpaidCount = currentUnpaidPayments.length;
  const totalUnpaidAmount = currentUnpaidPayments.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

  // 4. Danh sách người trễ hạn nhiều kỳ
  const lateProfiles = profiles.filter(p => p.latePaymentCount > 0 || p.riskNote.length > 0);

  container.innerHTML = `
    <!-- Thống kê nhanh KPIs -->
    <div class="stats-grid">
      <div class="stat-box" style="border-left: 4px solid var(--primary);">
        <span class="stat-label">Dây hụi đang chạy</span>
        <span class="stat-val">${totalActiveGroups} <span style="font-size:13px; font-weight:normal; color:var(--text-muted);">dây</span></span>
      </div>
      <div class="stat-box" style="border-left: 4px solid var(--accent);">
        <span class="stat-label">Chưa đóng kỳ này</span>
        <span class="stat-val danger">${totalUnpaidCount} <span style="font-size:13px; font-weight:normal; color:var(--text-muted);">khoản</span></span>
      </div>
      <div class="stat-box" style="border-left: 4px solid var(--secondary);">
        <span class="stat-label">Tiền hụi cần thu</span>
        <span class="stat-val money" style="font-size: 16px;">${formatMoney(totalUnpaidAmount)}</span>
      </div>
      <div class="stat-box" style="border-left: 4px solid var(--purple);">
        <span class="stat-label">Danh bạ hụi viên</span>
        <span class="stat-val">${profiles.length} <span style="font-size:13px; font-weight:normal; color:var(--text-muted);">người</span></span>
      </div>
    </div>

    <!-- Nút thao tác nhanh 4 chức năng cốt lõi -->
    <div class="card" style="padding: 12px;">
      <div class="card-title" style="font-size: 14px; margin-bottom: 4px;">
        ⚡ Thao tác nhanh chủ hụi
      </div>
      <div class="quick-actions">
        <div class="quick-action-btn" id="qa-create-group">
          <div class="quick-action-icon" style="background:#dcfce7; color:#15803d;">➕</div>
          <span class="quick-action-label">Tạo Dây Hụi</span>
        </div>
        <div class="quick-action-btn" id="qa-record-pay">
          <div class="quick-action-icon" style="background:#fef3c7; color:#b45309;">💰</div>
          <span class="quick-action-label">Thu Tiền</span>
        </div>
        <div class="quick-action-btn" id="qa-open-draw">
          <div class="quick-action-icon" style="background:#e0e7ff; color:#4338ca;">🎲</div>
          <span class="quick-action-label">Khui Hụi</span>
        </div>
        <div class="quick-action-btn" id="qa-members">
          <div class="quick-action-icon" style="background:#f3e8ff; color:#7e22ce;">👥</div>
          <span class="quick-action-label">Danh Bạ</span>
        </div>
      </div>

      <!-- 3 Nút chuyên biệt: Sang sổ, Mua bán hụi & Máy tính tiền hụi -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-color);">
        <button class="btn btn-outline btn-sm" id="btn-goto-migrate-ledger" style="background: #fffbeb; border-color: #fde68a; color: #b45309; font-weight: 700; padding: 8px 4px; font-size: 11.5px; display: flex; align-items: center; justify-content: center; gap: 3px;">
          <span>📖</span>
          <span>Sang Sổ</span>
        </button>
        <button class="btn btn-outline btn-sm" id="btn-goto-transfer-hui" style="background: #f0f9ff; border-color: #bae6fd; color: #0369a1; font-weight: 700; padding: 8px 4px; font-size: 11.5px; display: flex; align-items: center; justify-content: center; gap: 3px;">
          <span>🤝</span>
          <span>Sang Hụi</span>
        </button>
        <button class="btn btn-outline btn-sm" id="btn-goto-calculator" style="background: #f0fdf4; border-color: #bbf7d0; color: #166534; font-weight: 700; padding: 8px 4px; font-size: 11.5px; display: flex; align-items: center; justify-content: center; gap: 3px;">
          <span>🧮</span>
          <span>Máy Tính</span>
        </button>
      </div>
    </div>

    <!-- Cảnh báo khui hụi sắp tới -->
    ${nextOpenCycle && nextGroup ? `
      <div class="card highlight">
        <div class="card-header">
          <div class="card-title" style="color: var(--primary-dark);">
            📢 Dây sắp tới ngày khui: <strong>${nextGroup.name}</strong>
          </div>
          <span class="badge badge-warning">Kỳ ${nextOpenCycle.cycleNumber}/${nextGroup.totalParts}</span>
        </div>
        <div style="font-size: 13.5px; color: var(--text-main); display: flex; flex-direction: column; gap: 4px;">
          <div>📅 Ngày mở dự kiến: <strong>${formatDate(nextOpenCycle.openDate)}</strong> (${nextGroup.openDayRule})</div>
          <div>💵 Mức góp: <strong>${formatMoney(nextGroup.baseAmount)}</strong>/phần - Tổng: ${nextGroup.totalParts} phần</div>
          ${nextOpenCycle.winnerMemberProfileId ? `
            <div style="background:#ecfdf5; padding:8px 10px; border-radius:6px; margin-top:4px; color:#065f46;">
              🎉 Đã khui: Người trúng là <strong>${getMemberName(nextOpenCycle.winnerMemberProfileId)}</strong> (Thăm: ${formatMoney(nextOpenCycle.winningBidAmount)})
            </div>
          ` : `
            <div style="margin-top: 6px; display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm btn-block" id="btn-quick-draw-now" data-group-id="${nextGroup.id}" data-cycle-id="${nextOpenCycle.id}">
                🎲 Tiến hành Khui Hụi Ngay
              </button>
            </div>
          `}
        </div>
      </div>
    ` : ''}

    <!-- Danh sách dây hụi đang quản lý -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          📋 Danh sách dây hụi đang chạy (${groups.length})
        </div>
        <button class="btn btn-sm btn-outline" id="btn-view-all-groups">Xem tất cả</button>
      </div>

      <div class="item-list">
        ${groups.map(group => {
          const groupCycles = cycles.filter(c => c.groupId === group.id);
          const closedCycles = groupCycles.filter(c => c.status === 'closed');
          const progressPercent = Math.round((closedCycles.length / group.totalParts) * 100);
          const currentCycle = groupCycles.find(c => c.status === 'open') || groupCycles[groupCycles.length - 1];

          return `
            <div class="hui-card" data-group-id="${group.id}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h4 style="font-size: 15px; font-weight: 700; color: var(--text-main);">${group.name}</h4>
                  <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
                    Góp <strong>${formatMoney(group.baseAmount)}</strong> • ${group.totalParts} phần • ${getPeriodLabel(group.periodType)}
                  </div>
                </div>
                <span class="badge ${progressPercent >= 100 ? 'badge-success' : 'badge-info'}">
                  Kỳ ${closedCycles.length}/${group.totalParts}
                </span>
              </div>

              <!-- Thanh tiến độ kỳ hụi -->
              <div>
                <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">
                  <span>Tiến độ dây</span>
                  <span><strong>${progressPercent}%</strong> (${closedCycles.length}/${group.totalParts} kỳ)</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 6px; border-top: 1px dashed var(--border-color); font-size: 12.5px;">
                <span style="color: var(--text-muted);">Kỳ kế: <strong>${currentCycle ? formatDate(currentCycle.openDate) : 'Đã hoàn tất'}</strong></span>
                <span style="color: var(--primary); font-weight: 600;">Xem chi tiết ➔</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Cảnh báo người trễ hạn & rủi ro cao -->
    ${lateProfiles.length > 0 ? `
      <div class="card" style="border-color: #fecaca; background: #fffaf0;">
        <div class="card-header">
          <div class="card-title" style="color: #991b1b;">
            🚨 Cảnh báo trễ hạn & Hồ sơ rủi ro (${lateProfiles.length})
          </div>
          <span class="badge badge-danger">Cần đôn đốc</span>
        </div>
        <div class="item-list">
          ${lateProfiles.map(p => `
            <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--text-main); font-size: 14px;">${p.fullName} (${p.nickname})</strong>
                <span class="badge badge-danger">Trễ ${p.latePaymentCount} lần</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted);">📞 ${p.phone} • 📍 ${p.address}</div>
              <div style="font-size: 12px; color: #b91c1c; background: #fee2e2; padding: 4px 8px; border-radius: 4px; margin-top: 2px;">
                ⚠️ ${p.riskNote || 'Cần theo dõi sát sao khi khui hụi'}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Nhật ký hoạt động gần đây -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          📜 Nhật ký hoạt động gần đây
        </div>
        <button class="btn btn-sm btn-outline" id="btn-view-all-logs">Toàn bộ log</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${store.state.logs.slice(0, 4).map(log => `
          <div style="font-size: 12.5px; padding: 8px; background: #f8fafc; border-radius: 6px; border-left: 3px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 11px;">
              <span><strong>${log.actorName}</strong> (${log.action})</span>
              <span>${log.timestamp}</span>
            </div>
            <div style="color: var(--text-main); margin-top: 2px;">${log.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Gán sự kiện cho các nút thao tác nhanh
  document.getElementById('qa-create-group')?.addEventListener('click', () => {
    window.location.hash = '#create-group';
  });

  document.getElementById('qa-record-pay')?.addEventListener('click', () => {
    window.location.hash = '#payments';
  });

  document.getElementById('qa-open-draw')?.addEventListener('click', () => {
    if (nextGroup && nextOpenCycle) {
      window.location.hash = `#draw/${nextGroup.id}/${nextOpenCycle.id}`;
    } else {
      window.location.hash = '#groups';
    }
  });

  document.getElementById('qa-members')?.addEventListener('click', () => {
    window.location.hash = '#members';
  });

  document.getElementById('btn-goto-migrate-ledger')?.addEventListener('click', () => {
    window.location.hash = '#migrate-ledger';
  });

  document.getElementById('btn-goto-transfer-hui')?.addEventListener('click', () => {
    window.location.hash = '#transfer-hui';
  });

  document.getElementById('btn-goto-calculator')?.addEventListener('click', () => {
    window.location.hash = '#calculator';
  });

  document.getElementById('btn-view-all-groups')?.addEventListener('click', () => {
    window.location.hash = '#groups';
  });

  document.getElementById('btn-view-all-logs')?.addEventListener('click', () => {
    window.location.hash = '#logs';
  });

  document.getElementById('btn-quick-draw-now')?.addEventListener('click', (e) => {
    const gid = e.currentTarget.getAttribute('data-group-id');
    const cid = e.currentTarget.getAttribute('data-cycle-id');
    window.location.hash = `#draw/${gid}/${cid}`;
  });

  // Sự kiện click vào thẻ dây hụi để vào trang chi tiết
  container.querySelectorAll('.hui-card').forEach(card => {
    card.addEventListener('click', () => {
      const gid = card.getAttribute('data-group-id');
      window.location.hash = `#group-detail/${gid}`;
    });
  });
}

function getMemberName(profileId) {
  const p = store.state.profiles.find(prof => prof.id === profileId);
  return p ? `${p.fullName} (${p.nickname})` : 'Chưa xác định';
}
