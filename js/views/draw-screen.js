/**
 * MÀN HÌNH KHUI HỤI (HỖ TRỢ 3 HÌNH THỨC: KÊU HỤI, BỎ THĂM KÍN, QUAY RANDOM)
 * Có lồng cầu quay số, loại trừ người nợ, lưu vết lý do nếu quay lại, chia sẻ kết quả
 */

import { store } from '../store.js';
import { formatMoney, formatDate, showToast } from '../utils.js';

export function renderDrawScreen(container, groupId, cycleId) {
  const group = store.state.groups.find(g => g.id === groupId);
  const cycle = store.state.cycles.find(c => c.id === cycleId);

  if (!group || !cycle) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px;">
        <h3>Không tìm thấy kỳ hụi hoặc dây hụi!</h3>
        <button class="btn btn-primary" onclick="window.location.hash='#groups'">Quay lại</button>
      </div>
    `;
    return;
  }

  const groupMembers = store.state.groupMembers.filter(gm => gm.groupId === group.id);

  // Lọc danh sách ứng viên đủ điều kiện (CHƯA HỐT Ở BẤT KỲ KỲ NÀO)
  const allEligibleMembers = groupMembers.filter(gm => {
    // Nếu chưa từng hốt kỳ nào
    return !gm.hotedCycles || gm.hotedCycles.length === 0;
  });

  // Tách riêng những người đang có cảnh báo nợ / trễ hạn
  const cleanEligibleMembers = [];
  const inDebtMembers = [];

  allEligibleMembers.forEach(gm => {
    const prof = store.state.profiles.find(p => p.id === gm.memberProfileId);
    if (prof && (prof.latePaymentCount > 0 || prof.riskNote.length > 0 || gm.status === 'in_debt')) {
      inDebtMembers.push({ gm, prof });
    } else if (prof) {
      cleanEligibleMembers.push({ gm, prof });
    }
  });

  container.innerHTML = `
    <!-- Tiêu đề -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <button class="btn btn-sm btn-outline" style="margin-bottom: 6px;" onclick="window.location.hash='#group-detail/${group.id}'">
          ← Quay lại dây
        </button>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">
          🎲 Khui Hụi Kỳ ${cycle.cycleNumber}
        </h2>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Dây: <strong>${group.name}</strong> • Mức góp: ${formatMoney(group.baseAmount)}
        </div>
      </div>
    </div>

    <!-- Chọn Chế Độ Khui Hụi -->
    <div class="card">
      <div class="card-title" style="font-size: 14px;">1. Chọn hình thức khui hụi</div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
        <button class="btn btn-sm btn-mode ${group.drawMethod === 'random' ? 'btn-primary' : 'btn-outline'}" id="btn-tab-random">
          🎲 Quay Random
        </button>
        <button class="btn btn-sm btn-mode ${group.drawMethod === 'bidding' ? 'btn-primary' : 'btn-outline'}" id="btn-tab-bidding">
          🏷️ Kêu Bỏ Lãi
        </button>
        <button class="btn btn-sm btn-mode ${group.drawMethod === 'secret_ballot' ? 'btn-primary' : 'btn-outline'}" id="btn-tab-ballot">
          🗳️ Bỏ Thăm Kín
        </button>
      </div>
    </div>

    <!-- KHUNG CHỨA GIAO DIỆN THEO TỪNG CHẾ ĐỘ -->
    <div id="draw-mode-content"></div>
  `;

  let currentMode = group.drawMethod || 'random';

  function renderModeUI(mode) {
    const content = document.getElementById('draw-mode-content');
    if (!content) return;

    if (mode === 'random') {
      renderRandomMode(content);
    } else if (mode === 'bidding') {
      renderBiddingMode(content);
    } else {
      renderBallotMode(content);
    }
  }

  // --- 1. CHẾ ĐỘ QUAY RANDOM (MINH BẠCH, CÓ HIỆU ỨNG LỒNG CẦU) ---
  function renderRandomMode(target) {
    target.innerHTML = `
      <div class="card">
        <div class="card-title">2. Danh sách Hụi Viên đủ điều kiện quay</div>

        <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 8px 12px; border-radius: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
            <input type="checkbox" id="cb-exclude-debt" checked style="width: 18px; height: 18px; accent-color: var(--accent);" />
            <span>Tự động loại trừ người đang có nợ / trễ hạn (${inDebtMembers.length} người)</span>
          </label>
        </div>

        <div class="item-list" style="max-height: 200px; overflow-y: auto;" id="random-candidates-list">
          <!-- Render danh sách người quay -->
        </div>
      </div>

      <!-- SÂN KHẤU LỒNG CẦU QUAY SỐ -->
      <div class="wheel-stage" id="lottery-stage">
        <div style="font-size: 15px; font-weight: 700; color: #fef08a;">LỒNG CẦU XỔ SỐ HỤI MINH BẠCH</div>
        <div class="lottery-cage" id="lottery-cage">
          <div class="lottery-ball" id="lottery-ball">🎲</div>
        </div>
        <div id="lottery-status-text" style="font-size: 13px; color: #94a3b8;">Sẵn sàng quay số ngẫu nhiên</div>

        <button class="btn btn-primary btn-block" id="btn-start-spin" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; font-size: 16px; padding: 12px;">
          🎰 BẮT ĐẦU QUAY SỐ NGAY
        </button>
      </div>

      <!-- Khung kết quả người trúng sau khi quay xong -->
      <div id="random-winner-container" style="display: none;"></div>
    `;

    const candidatesList = document.getElementById('random-candidates-list');
    const cbExcludeDebt = document.getElementById('cb-exclude-debt');

    function updateCandidatesList() {
      const excludeDebt = cbExcludeDebt.checked;
      const activeCandidates = excludeDebt ? cleanEligibleMembers : [...cleanEligibleMembers, ...inDebtMembers];

      if (activeCandidates.length === 0) {
        candidatesList.innerHTML = `<div style="color:var(--text-muted); padding:10px;">Không còn ai đủ điều kiện để quay!</div>`;
        return;
      }

      candidatesList.innerHTML = activeCandidates.map(({ gm, prof }, idx) => {
        const isDebt = inDebtMembers.some(d => d.prof.id === prof.id);
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: ${isDebt ? '#fff1f2' : '#f0fdf4'}; border-radius: 6px; font-size: 12.5px;">
            <div>
              <strong>#${idx + 1}. ${prof.fullName}</strong> (${prof.nickname})
              <div style="font-size: 11px; color: var(--text-muted);">📞 ${prof.phone} • ${gm.sharesCount} phần</div>
            </div>
            <span class="badge ${isDebt ? 'badge-danger' : 'badge-success'}">
              ${isDebt ? 'Có cảnh báo nợ' : 'Đủ chuẩn'}
            </span>
          </div>
        `;
      }).join('');
    }

    cbExcludeDebt.addEventListener('change', updateCandidatesList);
    updateCandidatesList();

    // Xử lý hiệu ứng quay số
    let isSpinning = false;
    document.getElementById('btn-start-spin')?.addEventListener('click', () => {
      if (isSpinning) return;

      const excludeDebt = cbExcludeDebt.checked;
      const pool = excludeDebt ? cleanEligibleMembers : [...cleanEligibleMembers, ...inDebtMembers];

      if (pool.length === 0) {
        showToast('Không có ai trong danh sách đủ điều kiện để quay!', 'danger');
        return;
      }

      isSpinning = true;
      const cage = document.getElementById('lottery-cage');
      const ball = document.getElementById('lottery-ball');
      const statusText = document.getElementById('lottery-status-text');
      const winnerContainer = document.getElementById('random-winner-container');

      cage.classList.add('spinning');
      statusText.innerText = 'Đang quay lồng cầu chọn ngẫu nhiên...';
      winnerContainer.style.display = 'none';

      // Nhấp nháy tên trong lúc quay
      let spinCounter = 0;
      const spinInterval = setInterval(() => {
        const randTemp = pool[Math.floor(Math.random() * pool.length)];
        ball.innerText = randTemp.prof.nickname || randTemp.prof.fullName.split(' ').pop();
        spinCounter++;
      }, 80);

      // Dừng lại sau 3.5 giây và chọn người thắng thực tế
      setTimeout(() => {
        clearInterval(spinInterval);
        cage.classList.remove('spinning');
        isSpinning = false;

        const winnerIndex = Math.floor(Math.random() * pool.length);
        const winner = pool[winnerIndex];

        ball.innerText = '🏆';
        statusText.innerText = `Chúc mừng ${winner.prof.fullName}!`;

        renderWinnerCard(winner, pool);
      }, 3500);
    });

    function renderWinnerCard(winner, pool) {
      const winnerContainer = document.getElementById('random-winner-container');
      const timestamp = new Date().toLocaleString('vi-VN');

      winnerContainer.innerHTML = `
        <div class="winner-card" id="winner-share-card">
          <div style="font-size: 32px;">🎉 🏆 🎊</div>
          <h3 style="font-size: 18px; font-weight: 800; margin-top: 4px;">KẾT QUẢ QUAY SỐ RANDOM</h3>
          <div style="font-size: 13px; margin-bottom: 8px;">DÂY HỤI: <strong>${group.name.toUpperCase()}</strong> - KỲ ${cycle.cycleNumber}</div>

          <div style="background: #ffffff; border-radius: 8px; padding: 12px; margin: 10px 0; border: 1px dashed #d97706; text-align: left;">
            <div style="font-size: 15px; font-weight: 800; color: #15803d; text-align: center;">
              🥇 NGƯỜI HỐT HỤI: ${winner.prof.fullName} (${winner.prof.nickname})
            </div>
            <div style="font-size: 12.5px; color: var(--text-muted); text-align: center; margin-top: 2px;">
              📞 SĐT: ${winner.prof.phone} • 📍 ${winner.prof.address || 'Miền Tây'}
            </div>
            <hr style="margin: 8px 0; border: none; border-top: 1px dashed #e2e8f0;" />
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span>Số người tham gia quay:</span>
              <strong>${pool.length} hụi viên</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span>Thời gian quay số:</span>
              <strong>${timestamp}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px;">
              <span>Mã xác thực:</span>
              <code>SH-RAND-${Date.now().toString().slice(-6)}</code>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-primary btn-block" id="btn-confirm-random-draw">
              ✅ Xác Nhận Kết Quả & Tạo Bảng Thu Tiền
            </button>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" id="btn-share-result" style="flex: 1;">
                📲 Chia Sẻ Kết Quả (Zalo)
              </button>
              <button class="btn btn-danger btn-sm" id="btn-redraw" style="flex: 1;">
                🔄 Quay Lại (Nếu Có Sự Cố)
              </button>
            </div>
          </div>
        </div>
      `;
      winnerContainer.style.display = 'block';

      // Xác nhận kết quả
      document.getElementById('btn-confirm-random-draw')?.addEventListener('click', () => {
        try {
          const eligibleIds = pool.map(p => p.prof.id);
          const excludedNames = inDebtMembers.map(d => `${d.prof.fullName} (${d.prof.riskNote || 'Có nợ'})`);

          store.executeCycleDraw(cycle.id, winner.prof.id, 0, 'random', {
            eligibleCandidates: eligibleIds,
            excludedCandidates: excludedNames
          });

          showToast(`Đã ghi nhận kết quả khui hụi cho ${winner.prof.fullName}!`, 'success');
          window.location.hash = `#cycle-payments/${cycle.id}`;
        } catch (err) {
          showToast(err.message, 'danger');
        }
      });

      // Chia sẻ kết quả
      document.getElementById('btn-share-result')?.addEventListener('click', () => {
        const text = `📢 KẾT QUẢ KHUI HỤI RANDOM MINH BẠCH\n- Dây hụi: ${group.name}\n- Kỳ khui: Kỳ số ${cycle.cycleNumber}\n- Người trúng: ${winner.prof.fullName} (${winner.prof.nickname})\n- Thời gian quay: ${timestamp}\n(Ứng dụng Quản lý Sổ Hụi)`;
        navigator.clipboard?.writeText(text);
        showToast('Đã sao chép nội dung kết quả! Bạn có thể dán gửi vào Zalo/Messenger.', 'success');
      });

      // Quay lại có ghi chú lý do bắt buộc
      document.getElementById('btn-redraw')?.addEventListener('click', () => {
        const reason = prompt('Vui lòng nhập lý do quay lại (Bắt buộc để lưu nhật ký kiểm toán):');
        if (!reason || reason.trim().length === 0) {
          showToast('Bắt buộc phải nhập lý do khi quay lại!', 'warning');
          return;
        }

        store.logAction('RANDOM_DRAW', 'HuiCycle', cycle.id, `Quay lại Random Kỳ ${cycle.cycleNumber} Dây "${group.name}". Lý do: ${reason}`);
        showToast('Đã lưu lý do quay lại vào nhật ký!', 'info');
        renderModeUI('random');
      });
    }
  }

  // --- 2. CHẾ ĐỘ KÊU HỤI / BỎ LÃI TRỰC TIẾP ---
  function renderBiddingMode(target) {
    target.innerHTML = `
      <div class="card">
        <div class="card-title">2. Nhập Mức Kêu Hụi / Bỏ Lãi Công Khai</div>
        <p style="font-size:12.5px; color:var(--text-muted);">
          Ai chịu bỏ mức thăm cao nhất thì người đó trúng hụi kỳ này. Hụi sống sẽ được trừ đúng số tiền thăm đó.
        </p>

        <div class="form-group">
          <label class="form-label">Chọn người trúng hụi (Kêu giá cao nhất):</label>
          <select id="select-bidding-winner" class="form-control form-select">
            ${allEligibleMembers.map(gm => {
              const p = store.state.profiles.find(prof => prof.id === gm.memberProfileId);
              return `<option value="${p.id}">${p.fullName} (${p.nickname}) - ${gm.sharesCount} phần</option>`;
            }).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Số tiền thăm kêu trúng (VNĐ/phần) (*):</label>
          <input type="number" id="input-bidding-amount" class="form-control" placeholder="VD: 300000" step="10000" required />
          <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">
            Ví dụ bỏ thăm 300.000đ: Hụi viên hụi sống chỉ phải nộp: <strong>${formatMoney(group.baseAmount - 300000)}</strong>
          </div>
        </div>

        <button class="btn btn-primary btn-block" id="btn-confirm-bidding">
          🏷️ Xác Nhận Khui Hụi Kêu Lãi
        </button>
      </div>
    `;

    document.getElementById('btn-confirm-bidding')?.addEventListener('click', () => {
      const winnerId = document.getElementById('select-bidding-winner').value;
      const bid = Number(document.getElementById('input-bidding-amount').value);

      if (isNaN(bid) || bid < 0) {
        showToast('Vui lòng nhập mức tiền thăm hợp lệ!', 'warning');
        return;
      }

      try {
        store.executeCycleDraw(cycle.id, winnerId, bid, 'bidding');
        showToast('Khui hụi thành công!', 'success');
        window.location.hash = `#cycle-payments/${cycle.id}`;
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  }

  // --- 3. CHẾ ĐỘ BỎ THĂM KÍN ---
  function renderBallotMode(target) {
    target.innerHTML = `
      <div class="card">
        <div class="card-title">2. Nhập Phiếu Thăm Kín Của Các Hụi Viên</div>
        <p style="font-size:12.5px; color:var(--text-muted);">
          Nhập số tiền ghi trong phiếu kín của từng người. Ứng dụng sẽ tự động tìm ra người bỏ cao nhất để trao hụi.
        </p>

        <div class="item-list">
          ${allEligibleMembers.map(gm => {
            const p = store.state.profiles.find(prof => prof.id === gm.memberProfileId);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #f8fafc; border-radius: 6px;">
                <div>
                  <strong style="font-size: 13.5px;">${p.fullName}</strong>
                  <div style="font-size: 11px; color: var(--text-muted);">${p.nickname}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; color: var(--text-muted);">Mức thăm:</span>
                  <input type="number" class="form-control input-ballot-val" data-id="${p.id}" placeholder="0" step="10000" style="width: 110px; padding: 6px;" />
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <button class="btn btn-primary btn-block" id="btn-open-ballots" style="margin-top: 10px;">
          🗳️ Mở Phiếu Thăm & Tìm Người Trúng
        </button>
      </div>
    `;

    document.getElementById('btn-open-ballots')?.addEventListener('click', () => {
      let maxBid = -1;
      let winnerId = null;

      container.querySelectorAll('.input-ballot-val').forEach(inp => {
        const val = Number(inp.value) || 0;
        if (val > maxBid) {
          maxBid = val;
          winnerId = inp.getAttribute('data-id');
        }
      });

      if (!winnerId || maxBid < 0) {
        showToast('Vui lòng nhập ít nhất một mức thăm hợp lệ!', 'warning');
        return;
      }

      const winnerProf = store.state.profiles.find(p => p.id === winnerId);
      if (confirm(`Kết quả mở thăm kín:\nNgười bỏ cao nhất là ${winnerProf.fullName} với mức thăm: ${formatMoney(maxBid)}.\nBạn có xác nhận người này trúng hụi không?`)) {
        try {
          store.executeCycleDraw(cycle.id, winnerId, maxBid, 'secret_ballot');
          showToast(`Khui hụi thành công cho ${winnerProf.fullName}!`, 'success');
          window.location.hash = `#cycle-payments/${cycle.id}`;
        } catch (err) {
          showToast(err.message, 'danger');
        }
      }
    });
  }

  // Gán tab chuyển chế độ
  document.getElementById('btn-tab-random')?.addEventListener('click', () => {
    currentMode = 'random';
    setActiveTab('btn-tab-random');
    renderModeUI('random');
  });

  document.getElementById('btn-tab-bidding')?.addEventListener('click', () => {
    currentMode = 'bidding';
    setActiveTab('btn-tab-bidding');
    renderModeUI('bidding');
  });

  document.getElementById('btn-tab-ballot')?.addEventListener('click', () => {
    currentMode = 'secret_ballot';
    setActiveTab('btn-tab-ballot');
    renderModeUI('secret_ballot');
  });

  function setActiveTab(btnId) {
    container.querySelectorAll('.btn-mode').forEach(b => {
      b.className = 'btn btn-sm btn-mode btn-outline';
    });
    const active = document.getElementById(btnId);
    if (active) active.className = 'btn btn-sm btn-mode btn-primary';
  }

  renderModeUI(currentMode);
}
