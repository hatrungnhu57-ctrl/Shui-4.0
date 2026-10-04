/**
 * PHÒNG TRÒ CHUYỆN, ĐẤU HỤI BỎ THĂM KÍN & THEO DÕI SINH LỜI DÂY HỤI (GROUP CHAT & LIVE SECRET BALLOT)
 * Cho phép chia sẻ link mời hụi viên, chat trực tuyến, bỏ thăm kín tự động,
 * thống kê ai hốt kỳ nào, số tiền hốt và tỷ suất sinh lời / lãi lỗ chi tiết từng người.
 */

import { store } from '../store.js';
import { formatMoney, formatDate, formatDateTime, showToast, escapeHtml } from '../utils.js';

export function renderGroupChatView(container, groupId) {
  const group = store.state.groups.find(g => g.id === groupId);
  if (!group) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px;">
        <h3>Không tìm thấy phòng nhóm dây hụi!</h3>
        <button class="btn btn-primary" onclick="window.location.hash='#groups'">Quay lại</button>
      </div>
    `;
    return;
  }

  const cycles = store.state.cycles.filter(c => c.groupId === group.id).sort((a, b) => a.cycleNumber - b.cycleNumber);
  const currentOpenCycle = cycles.find(c => c.status === 'open');
  const groupMembers = store.state.groupMembers.filter(gm => gm.groupId === group.id);
  const currentAcc = store.currentAccount;
  const isOwner = currentAcc.role === 'owner' || group.createdBy === currentAcc.id;

  // Tìm profile tương ứng của tài khoản hiện tại trong danh bạ
  const currentProfile = store.state.profiles.find(p => p.phone && store.normalizePhone(p.phone) === store.normalizePhone(currentAcc.phone));
  const currentMemberSlot = currentProfile ? groupMembers.find(gm => gm.memberProfileId === currentProfile.id) : null;
  const hasHoted = currentMemberSlot && currentMemberSlot.hotedCycles && currentMemberSlot.hotedCycles.length > 0;

  const inviteLink = store.generateGroupInviteLink(group.id);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <!-- Header Phòng Nhóm -->
      <div class="card highlight" style="border-left: 4px solid #2563eb; background: #eff6ff; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <button class="btn btn-sm btn-outline" style="margin-bottom: 4px; padding: 2px 8px; font-size: 11.5px;" onclick="window.location.hash='#group-detail/${group.id}'">
              ← Chi tiết dây
            </button>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 20px;">💬</span>
              <h2 style="font-size: 17px; font-weight: 800; color: #1e40af;">
                ${escapeHtml(group.name)}
              </h2>
            </div>
            <div style="font-size: 12px; color: #3b82f6; margin-top: 2px;">
              Góp <strong>${formatMoney(group.baseAmount)}</strong>/phần • ${groupMembers.length} hụi viên (${group.totalParts} phần)
            </div>
          </div>

          <div style="display: flex; gap: 4px;">
            <button class="btn btn-sm btn-outline" id="btn-share-invite-link" style="background:#ffffff; color:#2563eb; border-color:#93c5fd; font-weight:700; font-size:11.5px; padding:6px 8px;">
              🔗 Mời Hụi Viên
            </button>
          </div>
        </div>

        <!-- 3 Tabs Điều Hướng Trong Nhóm -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px;">
          <button class="btn btn-sm btn-chat-tab btn-primary" id="btn-tab-chat-messages">
            💬 Trò Chuyện
          </button>
          <button class="btn btn-sm btn-chat-tab btn-outline" id="btn-tab-chat-profit">
            📊 Lãi / Lỗ & Lịch Sử
          </button>
          <button class="btn btn-sm btn-chat-tab btn-outline" id="btn-tab-chat-members">
            👥 Thành Viên (${groupMembers.length})
          </button>
        </div>
      </div>

      <!-- NỘI DUNG CHÍNH THEO TỪNG TAB -->
      <div id="group-tab-content-container"></div>

      <!-- MODAL CHIA SẺ LINK VÀO NHÓM & MÃ QR -->
      <div id="modal-share-invite" class="modal-overlay" style="display: none;">
        <div class="modal-content" style="max-width: 400px; text-align: center;">
          <div class="modal-header">
            <h3 class="modal-title">🔗 Link Tham Gia Nhóm Dây Hụi</h3>
            <button class="btn btn-sm btn-outline btn-circle" id="btn-close-invite-modal">✕</button>
          </div>
          <div class="modal-body">
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">
              Gửi link này cho các Hụi Viên. Khi bấm link, họ sẽ được đưa thẳng vào phòng nhóm này:
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; word-break: break-all; font-size: 12px; color: var(--primary); font-family: monospace;">
              ${escapeHtml(inviteLink)}
            </div>

            <div style="margin-top: 14px;">
              <button class="btn btn-primary btn-block" id="btn-copy-invite-link-zalo" style="padding: 10px; font-weight: 700;">
                📲 Sao Chép Link Gửi Vào Nhóm Zalo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Quản lý chuyển tab
  let activeSubTab = 'chat';

  function renderSubTab(tab) {
    const containerEl = document.getElementById('group-tab-content-container');
    if (!containerEl) return;

    if (tab === 'chat') {
      renderChatTab(containerEl);
    } else if (tab === 'profit') {
      renderProfitTab(containerEl);
    } else {
      renderMembersTab(containerEl);
    }
  }

  // --- TAB 1: TRÒ CHUYỆN & BỎ THĂM KÍN TRỰC TUYẾN ---
  function renderChatTab(target) {
    const messages = store.getGroupMessages(group.id);
    const ballots = currentOpenCycle ? store.getCycleBallots(group.id, currentOpenCycle.id) : [];

    target.innerHTML = `
      <!-- WIDGET BỎ THĂM KÍN NỔI BẬT NẾU ĐANG CÓ KỲ MỞ -->
      ${currentOpenCycle ? `
        <div class="card highlight" style="border: 2px solid #f59e0b; background: #fffbeb; padding: 12px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 20px;">🗳️</span>
              <div>
                <strong style="font-size: 14px; color: #92400e;">ĐANG KHUI HỤI: KỲ SỐ ${currentOpenCycle.cycleNumber}</strong>
                <div style="font-size: 11.5px; color: #b45309;">Ngày mở: ${formatDate(currentOpenCycle.openDate)} • Mức góp: ${formatMoney(group.baseAmount)}</div>
              </div>
            </div>
            <span class="badge badge-warning">Đang bỏ thăm kín</span>
          </div>

          <!-- Trạng thái nộp phiếu -->
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 8px; padding-top: 6px; border-top: 1px dashed #fde68a;">
            Đã có <strong>${ballots.length}</strong> hụi viên gửi phiếu thăm bí mật.
          </div>

          <!-- Khung gửi phiếu dành cho hụi viên chưa hốt -->
          ${!hasHoted && currentMemberSlot ? `
            <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; margin-top: 8px;">
              <label style="font-size: 12px; font-weight: 700; color: #9a3412;">Nhập số tiền thăm muốn bỏ (VNĐ/phần):</label>
              <div style="display: flex; gap: 6px; margin-top: 4px;">
                <input type="number" id="input-chat-bid-amount" class="form-control" placeholder="VD: 350000" step="10000" style="padding: 6px;" />
                <button class="btn btn-primary" id="btn-submit-chat-ballot" style="white-space: nowrap; padding: 6px 12px; font-size: 12.5px;">
                  🗳️ Gửi Phiếu Kín
                </button>
              </div>
              <div style="font-size: 11px; color: #78350f; margin-top: 4px;">
                🔒 Mức thăm của bạn được mã hóa bí mật, chỉ công bố khi Chủ hụi mở thăm.
              </div>
            </div>
          ` : (hasHoted ? `
            <div style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 12px; color: #475569; margin-top: 6px;">
              🔴 Bạn đã hốt hụi ở kỳ trước (Hụi Chết), kỳ này chỉ cần chuẩn bị nộp đủ ${formatMoney(group.baseAmount)}.
            </div>
          ` : '')}

          <!-- Quyền Chủ Hụi: Nút mở thăm kín & công bố người trúng -->
          ${isOwner ? `
            <div style="margin-top: 8px; display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm btn-block" id="btn-chat-reveal-ballots" style="background: #d97706; border-color: #b45309; padding: 8px; font-weight: 700;">
                🔓 Mở Thăm Kín & Trao Hụi Cho Người Bỏ Cao Nhất
              </button>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- KHUNG HỘI THOẠI TRỰC TUYẾN (MESSAGES CONTAINER) -->
      <div class="card" style="padding: 10px; display: flex; flex-direction: column; height: 380px; justify-content: space-between;">
        <div class="chat-stream" id="chat-messages-list" style="overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px; flex: 1;">
          ${messages.length === 0 ? `
            <div style="text-align: center; color: var(--text-muted); font-size: 12.5px; margin-top: 40px;">
              💬 Chưa có tin nhắn nào trong nhóm.<br/>Hãy gửi lời chào đầu tiên hoặc thông báo khui hụi!
            </div>
          ` : messages.map(msg => {
            const isMe = msg.senderId === currentAcc.id;
            const isSys = msg.type === 'system' || msg.type === 'ballot_submitted' || msg.type === 'draw_result';

            if (isSys) {
              return `
                <div style="text-align: center; margin: 4px 0;">
                  <span style="background: #f1f5f9; color: #475569; font-size: 11.5px; padding: 4px 10px; border-radius: 12px; display: inline-block; border: 1px solid var(--border-color); white-space: pre-line;">
                    ${escapeHtml(msg.text)}
                  </span>
                </div>
              `;
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
                <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 2px; padding: 0 4px;">
                  ${isMe ? 'Bạn' : `${escapeHtml(msg.senderName)} ${msg.senderRole === 'owner' ? '👑 (Chủ Hụi)' : ''}`} • ${formatDateTime(msg.createdAt)}
                </div>
                <div style="max-width: 80%; background: ${isMe ? 'var(--primary)' : '#ffffff'}; color: ${isMe ? '#ffffff' : 'var(--text-main)'}; padding: 8px 12px; border-radius: 12px; border: 1px solid ${isMe ? 'var(--primary)' : 'var(--border-color)'}; font-size: 13px; word-break: break-word; box-shadow: var(--shadow-sm);">
                  ${escapeHtml(msg.text)}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Khung Nhập Tin Nhắn -->
        <div style="display: flex; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">
          <input type="text" id="input-chat-message-text" class="form-control" placeholder="Nhập tin nhắn trao đổi trong nhóm..." style="padding: 8px 10px; font-size: 13px;" />
          <button class="btn btn-primary" id="btn-send-chat-message" style="padding: 8px 14px;">
            📨
          </button>
        </div>
      </div>
    `;

    // Cuộn xuống tin nhắn cuối
    const stream = document.getElementById('chat-messages-list');
    if (stream) stream.scrollTop = stream.scrollHeight;

    // Gửi tin nhắn
    function doSendMessage() {
      const input = document.getElementById('input-chat-message-text');
      const text = input ? input.value.trim() : '';
      if (!text) return;

      store.sendGroupMessage(group.id, text, 'text');
      input.value = '';
      renderSubTab('chat');
    }

    document.getElementById('btn-send-chat-message')?.addEventListener('click', doSendMessage);
    document.getElementById('input-chat-message-text')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSendMessage();
    });

    // Nộp phiếu thăm kín
    document.getElementById('btn-submit-chat-ballot')?.addEventListener('click', () => {
      const bidVal = document.getElementById('input-chat-bid-amount')?.value;
      if (!bidVal || Number(bidVal) <= 0) {
        showToast('Vui lòng nhập mức tiền thăm hợp lệ!', 'warning');
        return;
      }

      try {
        const memberProfId = currentProfile ? currentProfile.id : currentAcc.id;
        store.submitSecretBallot(group.id, currentOpenCycle.id, memberProfId, Number(bidVal));
        showToast('Đã gửi phiếu thăm kín thành công! Chúc bạn may mắn.', 'success');
        renderSubTab('chat');
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });

    // Mở thăm kín (Chủ hụi)
    document.getElementById('btn-chat-reveal-ballots')?.addEventListener('click', () => {
      const ballots = store.getCycleBallots(group.id, currentOpenCycle.id);
      if (ballots.length === 0) {
        showToast('Chưa có thành viên nào nộp phiếu thăm kín!', 'warning');
        return;
      }

      if (confirm(`Xác nhận mở toàn bộ ${ballots.length} phiếu thăm kín và trao hụi cho người bỏ cao nhất?`)) {
        try {
          const res = store.revealSecretBallots(group.id, currentOpenCycle.id);
          showToast(`Khui hụi thành công! Người trúng: ${res.winningBallot.memberName}`, 'success');
          renderSubTab('chat');
        } catch (err) {
          showToast(err.message, 'danger');
        }
      }
    });
  }

  // --- TAB 2: LỊCH SỬ KHUI & THEO DÕI SINH LỜI / LÃI LỖ ---
  function renderProfitTab(target) {
    const analytics = store.calculateGroupProfitLoss(group.id);

    target.innerHTML = `
      <!-- BẢNG LỊCH SỬ CÁC KỲ ĐÃ KHUI -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📜 Lịch Sử Các Kỳ Đã Khui (${cycles.length})</div>
        </div>

        <div class="item-list">
          ${cycles.map(cyc => {
            const winner = store.state.profiles.find(p => p.id === cyc.winnerMemberProfileId);
            return `
              <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="font-size: 14px;">Kỳ ${cyc.cycleNumber}</strong>
                    <span style="font-size: 11.5px; color: var(--text-muted);">(${formatDate(cyc.openDate)})</span>
                  </div>
                  <div style="font-size: 12px; margin-top: 2px;">
                    ${winner ? `🏆 Người hốt: <strong>${escapeHtml(winner.fullName)}</strong> (Thăm: <span style="color:var(--accent); font-weight:700;">${formatMoney(cyc.winningBidAmount)}</span>)` : 'Chưa khui hụi'}
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 13.5px; font-weight: 800; color: var(--primary);">
                    ${cyc.potAmount ? formatMoney(cyc.potAmount) : formatMoney(group.baseAmount * (group.totalParts - 1))}
                  </div>
                  <span class="badge ${cyc.status === 'closed' ? 'badge-gray' : 'badge-warning'}">
                    ${cyc.status === 'closed' ? 'Đã chốt' : 'Đang mở'}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- BẢNG THEO DÕI SINH LỜI / LÃI LỖ TỪNG THÀNH VIÊN -->
      <div class="card highlight" style="border: 2px solid var(--primary); background: #ffffff;">
        <div class="card-header">
          <div class="card-title" style="color: var(--primary-dark);">
            📊 Phân Tích Lợi Nhuận & Lãi / Lỗ Từng Chân Hụi
          </div>
          <button class="btn btn-sm btn-outline" id="btn-copy-profit-zalo" style="font-size: 11.5px;">
            📲 Gửi Zalo
          </button>
        </div>

        <p style="font-size: 12px; color: var(--text-muted);">
          Công thức tính chuẩn: <strong>Lợi Nhuận Ròng = Số tiền hốt về - Tổng tiền đã nộp qua các kỳ</strong>.
        </p>

        <div class="item-list" style="margin-top: 8px;">
          ${analytics.memberStats.map((ms, idx) => {
            const isProfit = ms.netProfit > 0;
            const isLoss = ms.netProfit < 0;

            return `
              <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>#${idx + 1}. ${escapeHtml(ms.fullName)}</strong> ${ms.nickname ? `(${escapeHtml(ms.nickname)})` : ''}
                    <div style="font-size: 11.5px; color: var(--text-muted);">
                      Tham gia: <strong>${ms.sharesCount} phần</strong> • ${ms.hasHoted ? `🔴 Đã hốt kỳ ${ms.hotedCycles.join(', ')}` : '🟢 Hụi sống'}
                    </div>
                  </div>

                  <div style="text-align: right;">
                    <div style="font-size: 14px; font-weight: 800; color: ${isProfit ? 'var(--primary)' : (isLoss ? 'var(--accent)' : 'var(--text-muted)')};">
                      ${ms.hasHoted ? (isProfit ? `+${formatMoney(ms.netProfit)}` : formatMoney(ms.netProfit)) : 'Đang tích lũy'}
                    </div>
                    <span class="badge ${isProfit ? 'badge-success' : (isLoss ? 'badge-danger' : 'badge-info')}">
                      ${ms.hasHoted ? (isProfit ? `Lời +${ms.profitRate}%` : `Lãi vay ${ms.profitRate}%`) : 'Hụi sống'}
                    </span>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: var(--text-muted); padding-top: 4px; border-top: 1px dashed var(--border-color);">
                  <span>Đã nộp: <strong>${formatMoney(ms.totalPaidSoFar)}</strong></span>
                  <span>Hốt về: <strong>${formatMoney(ms.totalCollected)}</strong></span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-copy-profit-zalo')?.addEventListener('click', () => {
      let text = `📊 BẢNG THEO DÕI SINH LỜI / LÃI LỖ DÂY [${group.name.toUpperCase()}]\n` +
        `- Mức góp: ${formatMoney(group.baseAmount)}/phần (${group.totalParts} phần)\n` +
        `-------------------------\n`;

      analytics.memberStats.forEach((ms, i) => {
        text += `${i + 1}. ${ms.fullName}: ${ms.hasHoted ? (ms.netProfit >= 0 ? `Lời +${formatMoney(ms.netProfit)} (+${ms.profitRate}%)` : `Chi phí vốn ${formatMoney(ms.netProfit)} (${ms.profitRate}%)`) : 'Đang nuôi hụi sống'}\n`;
      });

      text += `\n(Ứng dụng Quản lý Sổ Hụi)`;
      navigator.clipboard?.writeText(text);
      showToast('Đã sao chép bảng sinh lời để gửi vào Zalo!', 'success');
    });
  }

  // --- TAB 3: THÀNH VIÊN & LINK MỜI GIA NHẬP ---
  function renderMembersTab(target) {
    target.innerHTML = `
      <!-- LINK MỜI GIA NHẬP TRỰC TIẾP -->
      <div class="card highlight" style="border: 2px solid #3b82f6; background: #eff6ff; padding: 12px;">
        <div style="font-weight: 700; color: #1e40af; font-size: 13.5px; margin-bottom: 4px;">
          🔗 Link Mời Hụi Viên Gia Nhập Tức Thì:
        </div>
        <div style="background: #ffffff; padding: 8px; border-radius: 6px; font-size: 11.5px; color: #1d4ed8; word-break: break-all; border: 1px solid #bfdbfe; font-family: monospace;">
          ${escapeHtml(inviteLink)}
        </div>
        <div style="display: flex; gap: 6px; margin-top: 8px;">
          <button class="btn btn-primary btn-sm btn-block" id="btn-copy-link-tab" style="padding: 8px; font-weight: 700;">
            📲 Sao Chép Link Gửi Zalo
          </button>
        </div>
      </div>

      <!-- DANH SÁCH THÀNH VIÊN TRONG DÂY -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">👥 Danh Sách Hụi Viên Trong Dây (${groupMembers.length} người)</div>
        </div>

        <div class="item-list">
          ${groupMembers.map((gm, idx) => {
            const prof = store.state.profiles.find(p => p.id === gm.memberProfileId);
            const hasHoted = gm.hotedCycles && gm.hotedCycles.length > 0;

            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border-color);">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="font-size: 14px;">#${idx + 1}. ${escapeHtml(prof?.fullName || 'Hụi viên')}</strong>
                    ${prof?.nickname ? `<span style="font-size: 12px; color: var(--primary);">(${escapeHtml(prof.nickname)})</span>` : ''}
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                    📞 ${escapeHtml(prof?.phone || 'Chưa có SĐT')} • Tham gia: <strong>${gm.sharesCount} phần</strong>
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
    `;

    document.getElementById('btn-copy-link-tab')?.addEventListener('click', () => {
      const shareMsg = `📢 MỜI THAM GIA DÂY HỤI [${group.name.toUpperCase()}]\n` +
        `- Mức góp: ${formatMoney(group.baseAmount)}/phần (${group.totalParts} phần)\n` +
        `- Bấm vào link để vào thẳng phòng nhóm trò chuyện và theo dõi khui hụi:\n` +
        `${inviteLink}\n` +
        `(Ứng dụng Quản lý Sổ Hụi)`;

      navigator.clipboard?.writeText(shareMsg);
      showToast('Đã sao chép link mời và tin nhắn Zalo!', 'success');
    });
  }

  // Gán sự kiện chuyển Tab
  document.getElementById('btn-tab-chat-messages')?.addEventListener('click', () => {
    setActiveTab('btn-tab-chat-messages');
    renderSubTab('chat');
  });

  document.getElementById('btn-tab-chat-profit')?.addEventListener('click', () => {
    setActiveTab('btn-tab-chat-profit');
    renderSubTab('profit');
  });

  document.getElementById('btn-tab-chat-members')?.addEventListener('click', () => {
    setActiveTab('btn-tab-chat-members');
    renderSubTab('members');
  });

  function setActiveTab(btnId) {
    container.querySelectorAll('.btn-chat-tab').forEach(b => {
      b.className = 'btn btn-sm btn-chat-tab btn-outline';
    });
    const active = document.getElementById(btnId);
    if (active) active.className = 'btn btn-sm btn-chat-tab btn-primary';
  }

  // Modal chia sẻ link mời
  const modalInvite = document.getElementById('modal-share-invite');
  document.getElementById('btn-share-invite-link')?.addEventListener('click', () => {
    modalInvite.style.display = 'flex';
  });

  document.getElementById('btn-close-invite-modal')?.addEventListener('click', () => {
    modalInvite.style.display = 'none';
  });

  document.getElementById('btn-copy-invite-link-zalo')?.addEventListener('click', () => {
    const shareMsg = `📢 MỜI THAM GIA DÂY HỤI [${group.name.toUpperCase()}]\n` +
      `- Mức góp: ${formatMoney(group.baseAmount)}/phần (${group.totalParts} phần)\n` +
      `- Bấm vào link để vào thẳng phòng nhóm trò chuyện và theo dõi khui hụi:\n` +
      `${inviteLink}\n` +
      `(Ứng dụng Quản lý Sổ Hụi)`;

    navigator.clipboard?.writeText(shareMsg);
    showToast('Đã sao chép link mời và tin nhắn Zalo!', 'success');
  });

  // Mặc định nạp tab chat
  renderSubTab('chat');
}
