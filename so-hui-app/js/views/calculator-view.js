/**
 * MÁY TÍNH TIỀN HỤI & TIỀN ĐẦU THẢO THÔNG MINH (HUI FINANCIAL CALCULATOR)
 * Tự động tính toán chi tiết: Tiền hụi sống, Tiền hụi chết, Tổng tiền gom,
 * Khấu trừ tiền đầu thảo chủ hụi và Số tiền người hốt thực nhận.
 */

import { store } from '../store.js';
import { formatMoney, escapeHtml, showToast } from '../utils.js';

export function renderCalculatorView(container) {
  const groups = store.state.groups.filter(g => g.status === 'active');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Header -->
      <div class="card highlight" style="border-left: 4px solid var(--primary); background: #f0fdf4;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">🧮</span>
              <h2 style="font-size: 18px; font-weight: 800; color: var(--primary-dark);">Máy Tính Tiền Hụi & Đầu Thảo</h2>
            </div>
            <div style="font-size: 12.5px; color: #166534; margin-top: 2px;">
              Tự động tính hụi sống, hụi chết, trừ tiền đầu thảo và tiền thực giao cho người hốt
            </div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="window.location.hash='#dashboard'">← Trở về</button>
        </div>
      </div>

      <!-- Chọn dây hụi có sẵn hoặc tính tự do -->
      ${groups.length > 0 ? `
        <div class="card" style="padding: 10px 14px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 13px; font-weight: 700; color: var(--text-main);">📋 Nạp nhanh từ Dây hụi có sẵn:</span>
            <select id="calc-select-existing-group" class="form-control form-select" style="width: auto; max-width: 250px; font-size: 12.5px; padding: 4px 8px;">
              <option value="">-- Chọn dây để nạp thông số --</option>
              ${groups.map(g => `<option value="${g.id}">${escapeHtml(g.name)} (Góp ${formatMoney(g.baseAmount)}, ${g.totalParts} phần)</option>`).join('')}
            </select>
          </div>
        </div>
      ` : ''}

      <!-- KHUNG NHẬP THÔNG SỐ TÍNH TOÁN -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">1. Thông Số Dây Hụi & Kỳ Khui</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div class="form-group">
            <label class="form-label">Mức góp / phần (*):</label>
            <input type="number" id="calc-base-amount" class="form-control" value="2000000" step="100000" />
            <div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline btn-quick-amount" data-val="1000000" style="padding: 2px 6px; font-size: 11px;">1 Tr</button>
              <button class="btn btn-sm btn-outline btn-quick-amount" data-val="2000000" style="padding: 2px 6px; font-size: 11px;">2 Tr</button>
              <button class="btn btn-sm btn-outline btn-quick-amount" data-val="5000000" style="padding: 2px 6px; font-size: 11px;">5 Tr</button>
              <button class="btn btn-sm btn-outline btn-quick-amount" data-val="10000000" style="padding: 2px 6px; font-size: 11px;">10 Tr</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tổng số phần hụi (*):</label>
            <input type="number" id="calc-total-parts" class="form-control" value="12" min="2" max="60" />
            <div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline btn-quick-parts" data-val="10" style="padding: 2px 6px; font-size: 11px;">10 phần</button>
              <button class="btn btn-sm btn-outline btn-quick-parts" data-val="12" style="padding: 2px 6px; font-size: 11px;">12 phần</button>
              <button class="btn btn-sm btn-outline btn-quick-parts" data-val="20" style="padding: 2px 6px; font-size: 11px;">20 phần</button>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div class="form-group">
            <label class="form-label">Kỳ khui hiện tại (*):</label>
            <input type="number" id="calc-cycle-num" class="form-control" value="4" min="1" max="60" />
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;" id="calc-cycle-hint">
              (Kỳ 4 / 12)
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mức tiền thăm / bỏ lãi (*):</label>
            <input type="number" id="calc-winning-bid" class="form-control" value="300000" step="10000" />
            <div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline btn-quick-bid" data-val="100000" style="padding: 2px 6px; font-size: 11px;">100k</button>
              <button class="btn btn-sm btn-outline btn-quick-bid" data-val="200000" style="padding: 2px 6px; font-size: 11px;">200k</button>
              <button class="btn btn-sm btn-outline btn-quick-bid" data-val="300000" style="padding: 2px 6px; font-size: 11px;">300k</button>
              <button class="btn btn-sm btn-outline btn-quick-bid" data-val="500000" style="padding: 2px 6px; font-size: 11px;">500k</button>
            </div>
          </div>
        </div>

        <!-- Cấu hình tiền đầu thảo -->
        <div class="form-group" style="background: #f8fafc; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
          <label class="form-label" style="font-weight: 700; color: #b45309;">🏷️ Quy định Tiền Đầu Thảo Chủ Hụi:</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer;">
              <input type="radio" name="calc-comm-type" value="half_share" checked style="accent-color: var(--primary);" />
              <span>Nửa phần (50%)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer;">
              <input type="radio" name="calc-comm-type" value="full_share" style="accent-color: var(--primary);" />
              <span>Một phần (100%)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer;">
              <input type="radio" name="calc-comm-type" value="fixed" style="accent-color: var(--primary);" />
              <span>Số tiền cố định</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 12.5px; cursor: pointer;">
              <input type="radio" name="calc-comm-type" value="percent" style="accent-color: var(--primary);" />
              <span>Tỷ lệ % khác</span>
            </label>
          </div>

          <div id="calc-custom-comm-container" style="display: none; margin-top: 8px;">
            <input type="number" id="calc-custom-comm-val" class="form-control" placeholder="Nhập số tiền hoặc số %" style="padding: 6px;" />
          </div>
        </div>
      </div>

      <!-- KẾT QUẢ TÍNH TOÁN TỰ ĐỘNG THỜI GIAN THỰC -->
      <div class="card highlight" style="border: 2px solid var(--primary); background: #ffffff; padding: 14px;" id="calc-result-box">
        <!-- Rendered dynamically -->
      </div>

      <!-- Nút chia sẻ & In -->
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-block" id="btn-calc-share-zalo" style="background: #f0fdf4; border-color: #86efac; color: #166534; font-weight: 700;">
          📲 Sao Chép Bảng Tính Gửi Zalo
        </button>
        <button class="btn btn-outline btn-block" id="btn-calc-print" style="color: var(--text-main);">
          🖨️ In Bảng Tính
        </button>
      </div>

      <!-- BẢNG DỰ TÍNH TẤT CẢ CÁC KỲ TRONG DÂY -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📜 Bảng Dự Tính Tất Cả Các Kỳ (Từ Kỳ 1 Đến Mãn Dây)</div>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
          (Giả định các kỳ có cùng mức tiền thăm đã nhập để đối chiếu dòng tiền)
        </div>
        <div style="overflow-x: auto; max-height: 300px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right;" id="calc-schedule-table">
            <!-- Render schedule table -->
          </table>
        </div>
      </div>
    </div>
  `;

  // Xử lý nạp dữ liệu từ dây hụi có sẵn
  document.getElementById('calc-select-existing-group')?.addEventListener('change', (e) => {
    const gid = e.target.value;
    if (!gid) return;
    const g = groups.find(item => item.id === gid);
    if (!g) return;

    document.getElementById('calc-base-amount').value = g.baseAmount;
    document.getElementById('calc-total-parts').value = g.totalParts;

    const cycles = store.state.cycles.filter(c => c.groupId === g.id);
    const openCycle = cycles.find(c => c.status === 'open') || cycles[cycles.length - 1];
    if (openCycle) {
      document.getElementById('calc-cycle-num').value = openCycle.cycleNumber;
      document.getElementById('calc-winningBid').value = openCycle.winningBidAmount || 0;
    }

    if (g.commissionRate === 100) {
      document.querySelector('input[name="calc-comm-type"][value="full_share"]').checked = true;
    } else {
      document.querySelector('input[name="calc-comm-type"][value="half_share"]').checked = true;
    }

    updateCalculator();
    showToast(`Đã nạp thông số từ dây "${g.name}"!`, 'info');
  });

  // Nút chọn nhanh
  container.querySelectorAll('.btn-quick-amount').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.getElementById('calc-base-amount').value = e.target.getAttribute('data-val');
      updateCalculator();
    });
  });

  container.querySelectorAll('.btn-quick-parts').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.getElementById('calc-total-parts').value = e.target.getAttribute('data-val');
      updateCalculator();
    });
  });

  container.querySelectorAll('.btn-quick-bid').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.getElementById('calc-winning-bid').value = e.target.getAttribute('data-val');
      updateCalculator();
    });
  });

  // Lắng nghe thay đổi input
  ['calc-base-amount', 'calc-total-parts', 'calc-cycle-num', 'calc-winning-bid', 'calc-custom-comm-val'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateCalculator);
  });

  container.querySelectorAll('input[name="calc-comm-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      const customBox = document.getElementById('calc-custom-comm-container');
      const customInp = document.getElementById('calc-custom-comm-val');
      if (val === 'fixed') {
        customBox.style.display = 'block';
        customInp.placeholder = 'Nhập số tiền cố định (VD: 500000)';
        customInp.value = '500000';
      } else if (val === 'percent') {
        customBox.style.display = 'block';
        customInp.placeholder = 'Nhập % tiền thảo (VD: 30)';
        customInp.value = '30';
      } else {
        customBox.style.display = 'none';
      }
      updateCalculator();
    });
  });

  let currentShareText = '';

  function updateCalculator() {
    const baseAmount = Number(document.getElementById('calc-base-amount').value) || 0;
    const totalParts = Number(document.getElementById('calc-total-parts').value) || 0;
    const cycleNum = Number(document.getElementById('calc-cycle-num').value) || 1;
    const bid = Number(document.getElementById('calc-winning-bid').value) || 0;

    const commType = document.querySelector('input[name="calc-comm-type"]:checked')?.value || 'half_share';
    const customCommVal = Number(document.getElementById('calc-custom-comm-val')?.value) || 0;

    const hint = document.getElementById('calc-cycle-hint');
    if (hint) {
      hint.innerText = `(Kỳ ${cycleNum} / ${totalParts} phần)`;
    }

    // Tính toán số phần
    const deadCount = Math.max(0, cycleNum - 1);
    const liveCount = Math.max(0, totalParts - cycleNum);

    const deadDue = baseAmount;
    const liveDue = Math.max(0, baseAmount - bid);

    const totalDead = deadCount * deadDue;
    const totalLive = liveCount * liveDue;
    const grossPot = totalDead + totalLive;

    // Tính tiền đầu thảo
    let commission = 0;
    let commLabel = 'Nửa phần (50%)';
    if (commType === 'full_share') {
      commission = baseAmount;
      commLabel = 'Một phần (100%)';
    } else if (commType === 'fixed') {
      commission = customCommVal;
      commLabel = `Cố định (${formatMoney(customCommVal)})`;
    } else if (commType === 'percent') {
      commission = Math.round((baseAmount * customCommVal) / 100);
      commLabel = `${customCommVal}%`;
    } else {
      commission = Math.round(baseAmount * 0.5);
      commLabel = 'Nửa phần (50%)';
    }

    const netPayout = Math.max(0, grossPot - commission);
    const words = store.numberToVietnameseWords(netPayout);

    const resultBox = document.getElementById('calc-result-box');
    if (resultBox) {
      resultBox.innerHTML = `
        <div style="text-align: center; border-bottom: 2px dashed #bbf7d0; padding-bottom: 10px; margin-bottom: 12px;">
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            KẾT QUẢ TÍNH TIỀN HỤI KỲ ${cycleNum} (${totalParts} PHẦN)
          </div>
          <div style="font-size: 22px; font-weight: 800; color: var(--primary); margin: 4px 0;">
            ${formatMoney(netPayout)}
          </div>
          <div style="font-size: 12.5px; font-style: italic; color: #166534;">
            (Bằng chữ: ${words})
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
          <!-- Hụi chết -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #fef2f2; padding: 8px 10px; border-radius: 6px; border-left: 3px solid var(--accent);">
            <div>
              <strong style="color: #991b1b;">🔴 Hụi Chết (${deadCount} phần):</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${deadCount} người × ${formatMoney(deadDue)} (đóng đủ gốc)</div>
            </div>
            <strong style="color: #991b1b; font-size: 14px;">${formatMoney(totalDead)}</strong>
          </div>

          <!-- Hụi sống -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; padding: 8px 10px; border-radius: 6px; border-left: 3px solid var(--primary);">
            <div>
              <strong style="color: #166534;">🟢 Hụi Sống (${liveCount} phần):</strong>
              <div style="font-size: 11px; color: var(--text-muted);">${liveCount} người × ${formatMoney(liveDue)} (đã trừ thăm ${formatMoney(bid)})</div>
            </div>
            <strong style="color: #166534; font-size: 14px;">${formatMoney(totalLive)}</strong>
          </div>

          <!-- Tổng gom -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border-radius: 6px;">
            <span>💰 Tổng tiền gom từ các hụi viên:</span>
            <strong>${formatMoney(grossPot)}</strong>
          </div>

          <!-- Tiền đầu thảo -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border-radius: 6px; color: #b45309;">
            <span>🏷️ Trừ Tiền Đầu Thảo Chủ Hụi (${commLabel}):</span>
            <strong style="color: var(--accent);">- ${formatMoney(commission)}</strong>
          </div>

          <!-- Tiền thực nhận -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #ecfdf5; border-radius: 8px; border: 1px solid #86efac; font-size: 14px;">
            <strong style="color: var(--primary-dark);">💵 TIỀN NGƯỜI HỐT THỰC LĨNH:</strong>
            <strong style="color: var(--primary); font-size: 17px;">${formatMoney(netPayout)}</strong>
          </div>
        </div>
      `;
    }

    // Chuẩn bị nội dung sao chép gửi Zalo
    currentShareText = `📢 BẢNG TÍNH TIỀN HỤI & ĐẦU THẢO KỲ ${cycleNum}\n` +
      `- Dây hụi: Góp ${formatMoney(baseAmount)}/phần (${totalParts} phần)\n` +
      `- Mức thăm khui: ${formatMoney(bid)}\n` +
      `-------------------------\n` +
      `🔴 Hụi chết (${deadCount} phần): Đóng ${formatMoney(deadDue)} = ${formatMoney(totalDead)}\n` +
      `🟢 Hụi sống (${liveCount} phần): Đóng ${formatMoney(liveDue)} = ${formatMoney(totalLive)}\n` +
      `💰 Tổng gom: ${formatMoney(grossPot)}\n` +
      `🏷️ Trừ tiền đầu thảo: -${formatMoney(commission)} (${commLabel})\n` +
      `👉 TIỀN NGƯỜI HỐT THỰC NHẬN: ${formatMoney(netPayout)}\n` +
      `📝 Bằng chữ: ${words}\n` +
      `(Ứng dụng Quản lý Sổ Hụi)`;

    // Render bảng dự tính toàn bộ chu kỳ
    renderScheduleTable(baseAmount, totalParts, bid, commission, commLabel);
  }

  function renderScheduleTable(baseAmount, totalParts, bid, commission, commLabel) {
    const table = document.getElementById('calc-schedule-table');
    if (!table) return;

    let rowsHtml = `
      <thead>
        <tr style="background: #f1f5f9; color: var(--text-main); font-weight: 700; border-bottom: 2px solid var(--border-color);">
          <th style="padding: 6px; text-align: center;">Kỳ</th>
          <th style="padding: 6px;">Hụi Chết</th>
          <th style="padding: 6px;">Hụi Sống</th>
          <th style="padding: 6px;">Tổng Gom</th>
          <th style="padding: 6px;">Tiền Thảo</th>
          <th style="padding: 6px; color: var(--primary);">Thực Nhận</th>
        </tr>
      </thead>
      <tbody>
    `;

    for (let c = 1; c <= totalParts; c++) {
      const dCount = c - 1;
      const lCount = totalParts - c;
      const dTot = dCount * baseAmount;
      const lTot = lCount * Math.max(0, baseAmount - bid);
      const gPot = dTot + lTot;
      const nPay = Math.max(0, gPot - commission);

      rowsHtml += `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 6px; text-align: center; font-weight: 700;">#${c}</td>
          <td style="padding: 6px; color: #991b1b;">${dCount}p (${formatMoney(dTot)})</td>
          <td style="padding: 6px; color: #166534;">${lCount}p (${formatMoney(lTot)})</td>
          <td style="padding: 6px;">${formatMoney(gPot)}</td>
          <td style="padding: 6px; color: var(--accent);">${formatMoney(commission)}</td>
          <td style="padding: 6px; font-weight: 800; color: var(--primary);">${formatMoney(nPay)}</td>
        </tr>
      `;
    }

    rowsHtml += '</tbody>';
    table.innerHTML = rowsHtml;
  }

  // Khởi chạy tính toán lần đầu
  updateCalculator();

  // Sao chép Zalo
  document.getElementById('btn-calc-share-zalo')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(currentShareText);
    showToast('Đã sao chép bảng tính đầy đủ để dán vào nhóm Zalo!', 'success');
  });

  // In
  document.getElementById('btn-calc-print')?.addEventListener('click', () => {
    window.print();
  });
}
