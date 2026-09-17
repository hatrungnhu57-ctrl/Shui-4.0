/**
 * CHI TIẾT DÂY HỤI & QUẢN LÝ CÁC KỲ HỤI (GROUP DETAIL & CYCLES)
 */

import { store } from '../store.js';
import { formatMoney, formatDate, getPeriodLabel, getDrawMethodLabel, showToast, exportToCSV } from '../utils.js';

export function renderGroupDetail(container, groupId) {
  const group = store.state.groups.find(g => g.id === groupId);
  if (!group) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px;">
        <h3>Không tìm thấy dây hụi!</h3>
        <button class="btn btn-primary" onclick="window.location.hash='#groups'">Quay lại danh sách</button>
      </div>
    `;
    return;
  }

  const groupMembers = store.state.groupMembers.filter(gm => gm.groupId === group.id);
  const cycles = store.state.cycles.filter(c => c.groupId === group.id).sort((a, b) => a.cycleNumber - b.cycleNumber);
  const closedCycles = cycles.filter(c => c.status === 'closed');
  const currentCycle = cycles.find(c => c.status === 'open') || cycles[cycles.length - 1];

  container.innerHTML = `
    <!-- Tiêu đề & Thông tin cơ bản -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <button class="btn btn-sm btn-outline" style="margin-bottom: 6px;" onclick="window.location.hash='#groups'">
          ← Danh sách dây
        </button>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">${group.name}</h2>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Bắt đầu: ${formatDate(group.startDate)} • Quy định: ${group.openDayRule}
        </div>
      </div>
      <span class="badge ${group.status === 'active' ? 'badge-success' : 'badge-gray'}">
        ${group.status === 'active' ? 'Đang hoạt động' : 'Đã mãn dây'}
      </span>
    </div>

    <!-- Card Tổng Quan Thông Số -->
    <div class="card highlight">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 13px;">
        <div>💵 Mức góp: <strong>${formatMoney(group.baseAmount)}</strong>/phần</div>
        <div>🔢 Quy mô: <strong>${group.totalParts} phần</strong> (${cycles.length} kỳ)</div>
        <div>⏱️ Chu kỳ: <strong>${getPeriodLabel(group.periodType)}</strong></div>
        <div>🎲 Hình thức: <strong>${getDrawMethodLabel(group.drawMethod)}</strong></div>
      </div>

      <div style="padding-top: 8px; border-top: 1px dashed var(--border-color);">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span>Tiến độ dây hụi:</span>
          <strong>${closedCycles.length} / ${group.totalParts} kỳ (${Math.round((closedCycles.length / group.totalParts) * 100)}%)</strong>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${(closedCycles.length / group.totalParts) * 100}%;"></div>
        </div>
      </div>

      ${group.agreementNotes ? `
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; font-size: 12px; color: var(--text-muted); margin-top: 4px;">
          <strong>📜 Thỏa thuận riêng:</strong> ${group.agreementNotes}
        </div>
      ` : ''}

      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button class="btn btn-sm btn-outline" id="btn-export-group-excel" style="flex: 1;">
          📊 Xuất Bảng Kê Excel
        </button>
      </div>
    </div>

    <!-- Kỳ Hiện Tại Đang Khui / Thu Tiền -->
    ${currentCycle ? `
      <div class="card" style="border: 2px solid ${currentCycle.status === 'open' ? 'var(--primary)' : 'var(--border-color)'};">
        <div class="card-header">
          <div class="card-title">
            🎯 Kỳ số ${currentCycle.cycleNumber} (Kỳ hiện tại)
          </div>
          <span class="badge ${currentCycle.status === 'open' ? 'badge-warning' : 'badge-success'}">
            ${currentCycle.status === 'open' ? 'Đang mở' : 'Đã chốt sổ'}
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px;">
          <div>📅 Ngày mở: <strong>${formatDate(currentCycle.openDate)}</strong></div>
          ${currentCycle.winnerMemberProfileId ? `
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px; color: #065f46;">
              🎉 <strong>Người hốt kỳ này:</strong> ${getMemberFullName(currentCycle.winnerMemberProfileId)}<br/>
              💰 <strong>Mức tiền thăm trúng:</strong> ${formatMoney(currentCycle.winningBidAmount)}<br/>
              💵 <strong>Tổng tiền người hốt thực nhận:</strong> ${formatMoney(currentCycle.potAmount)}<br/>
              🏷️ <strong>Tiền thảo chủ hụi:</strong> ${formatMoney(currentCycle.commissionAmount)}
            </div>

            <!-- Bảng thu chi kỳ này -->
            <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-top: 4px;">
              <span>Đã thu: <strong style="color: var(--primary);">${formatMoney(currentCycle.totalCollected)}</strong></span>
              <span>Cần thu: <strong>${formatMoney(currentCycle.totalExpected)}</strong></span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 6px;">
              <button class="btn btn-primary btn-sm btn-block" onclick="window.location.hash='#cycle-payments/${currentCycle.id}'">
                💳 Danh Sách Đóng Tiền & Biên Nhận
              </button>
            </div>
          ` : `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px; color: #92400e; font-size: 12.5px;">
              ⚠️ Kỳ này chưa tiến hành khui hụi để xác định người hốt.
            </div>
            <button class="btn btn-primary btn-block" style="margin-top: 6px;" onclick="window.location.hash='#draw/${group.id}/${currentCycle.id}'">
              🎲 Tiến Hành Khui Hụi Kỳ ${currentCycle.cycleNumber}
            </button>
          `}
        </div>
      </div>
    ` : ''}

    <!-- Danh sách các hụi viên trong dây -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          👥 Danh sách Chân Hụi Trong Dây (${groupMembers.reduce((s, m) => s + m.sharesCount, 0)} phần)
        </div>
      </div>

      <div class="item-list">
        ${groupMembers.map((gm, idx) => {
          const profile = store.state.profiles.find(p => p.id === gm.memberProfileId);
          const hasHoted = gm.hotedCycles && gm.hotedCycles.length > 0;
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border-color);">
              <div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); width: 20px;">#${idx + 1}</span>
                  <strong style="font-size: 14px; color: var(--text-main);">${profile?.fullName || 'Không rõ'}</strong>
                  ${profile?.nickname ? `<span style="font-size: 12px; color: var(--primary);">(${profile.nickname})</span>` : ''}
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-left: 26px;">
                  📞 ${profile?.phone} • Tham gia: <strong>${gm.sharesCount} phần</strong>
                </div>
              </div>

              <span class="badge ${hasHoted ? 'badge-warning' : 'badge-success'}">
                ${hasHoted ? `Đã hốt kỳ ${gm.hotedCycles.join(',')}` : 'Hụi sống'}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Lịch sử tất cả các kỳ hụi -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📜 Lịch sử các kỳ khui (${cycles.length})</div>
      </div>

      <div class="item-list">
        ${cycles.map(cyc => `
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="window.location.hash='#cycle-payments/${cyc.id}'">
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <strong style="font-size: 14px;">Kỳ ${cyc.cycleNumber}</strong>
                <span style="font-size: 12px; color: var(--text-muted);">(${formatDate(cyc.openDate)})</span>
              </div>
              <div style="font-size: 12px; color: ${cyc.winnerMemberProfileId ? '#065f46' : 'var(--text-muted)'}; margin-top: 2px;">
                ${cyc.winnerMemberProfileId ? `🏆 Người hốt: <strong>${getMemberFullName(cyc.winnerMemberProfileId)}</strong> (Thăm: ${formatMoney(cyc.winningBidAmount)})` : 'Chưa khui hụi'}
              </div>
            </div>

            <div style="text-align: right;">
              <span class="badge ${cyc.status === 'closed' ? 'badge-gray' : 'badge-warning'}">
                ${cyc.status === 'closed' ? 'Đã chốt' : 'Đang mở'}
              </span>
              <div style="font-size: 11px; color: var(--primary); margin-top: 4px;">Chi tiết ➔</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Xuất Excel
  document.getElementById('btn-export-group-excel')?.addEventListener('click', () => {
    const rows = [
      ['BẢNG KÊ DÂY HỤI - ' + group.name.toUpperCase()],
      ['Mức góp:', formatMoney(group.baseAmount), 'Tổng số phần:', group.totalParts, 'Chu kỳ:', getPeriodLabel(group.periodType)],
      ['Ngày bắt đầu:', formatDate(group.startDate), 'Quy định:', group.openDayRule],
      [''],
      ['STT', 'Họ và tên', 'Biệt danh', 'Số điện thoại', 'Số phần', 'Trạng thái', 'Kỳ đã hốt']
    ];

    groupMembers.forEach((gm, idx) => {
      const p = store.state.profiles.find(prof => prof.id === gm.memberProfileId);
      rows.push([
        idx + 1,
        p?.fullName || '',
        p?.nickname || '',
        p?.phone || '',
        gm.sharesCount,
        gm.hotedCycles.length > 0 ? 'Hụi chết' : 'Hụi sống',
        gm.hotedCycles.join(', ')
      ]);
    });

    exportToCSV(`SoHui_${group.name.replace(/\s+/g, '_')}.csv`, rows);
    showToast('Đã xuất file bảng kê hụi thành công!', 'success');
  });
}

function getMemberFullName(profileId) {
  const p = store.state.profiles.find(prof => prof.id === profileId);
  return p ? `${p.fullName} (${p.nickname})` : 'Chưa xác định';
}
