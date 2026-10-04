/**
 * SỔ HỤI - BỘ ĐIỀU HƯỚNG & KHỞI CHẠY ỨNG DỤNG (MAIN APP CONTROLLER)
 * Hỗ trợ Đa tài khoản, Mã PIN bảo mật, Quản lý VietQR & Sao lưu khôi phục
 */

import { store } from './store.js';
import { showToast, escapeHtml } from './utils.js';
import { cloudSync } from './cloud-sync.js';
import { renderRoleSelector } from './views/role-selector.js';
import { renderAuthView } from './views/auth-view.js';
import { renderSettingsView } from './views/settings-view.js';
import { renderOwnerDashboard } from './views/owner-dashboard.js';
import { renderMemberDashboard } from './views/member-dashboard.js';
import { renderMembersDirectory } from './views/members-directory.js';
import { renderCreateGroup } from './views/create-group.js';
import { renderGroupDetail } from './views/group-detail.js';
import { renderDrawScreen } from './views/draw-screen.js';
import { renderCyclePayments } from './views/cycle-payments.js';
import { renderGuideView, renderLogsView } from './views/guide-and-logs.js';
import { renderAdminView } from './views/admin-view.js';
import { renderMigrateLedgerView } from './views/migrate-ledger-view.js';
import { renderTransferHuiView } from './views/transfer-hui-view.js';
import { renderCalculatorView } from './views/calculator-view.js';
import { renderGroupChatView } from './views/group-chat-view.js';

class SoHuiApp {
  constructor() {
    this.appContainer = document.getElementById('app-container');
    this.isPinUnlocked = false;
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());

    store.subscribe(() => {
      this.updateHeader();
    });

    cloudSync.onSyncStatusChange(() => {
      this.updateHeader();
    });

    this.renderLayout();

    if (!window.location.hash) {
      window.location.hash = '#select-role';
    } else {
      this.handleRoute();
    }
  }

  renderLayout() {
    this.appContainer.innerHTML = `
      <!-- Header -->
      <header class="app-header" id="main-header">
        <div class="brand-badge" id="btn-home-logo" style="cursor: pointer;">
          <div class="brand-icon">📜</div>
          <span>SỔ HỤI</span>
        </div>
        <div id="header-right" style="display: flex; align-items: center; gap: 8px;">
          <!-- Vai trò & Tài khoản hiện tại -->
        </div>
      </header>

      <!-- Main Content -->
      <main class="app-main" id="main-content"></main>

      <!-- Bottom Nav Bar -->
      <nav class="app-nav" id="main-nav">
        <button class="nav-item" data-route="#dashboard">
          <span class="icon">🏠</span>
          <span>Tổng quan</span>
        </button>
        <button class="nav-item" data-route="#groups">
          <span class="icon">📋</span>
          <span>Dây hụi</span>
        </button>
        <button class="nav-item" data-route="#members">
          <span class="icon">👥</span>
          <span>Danh bạ</span>
        </button>
        <button class="nav-item" data-route="#guide">
          <span class="icon">📚</span>
          <span>Cẩm nang</span>
        </button>
        <button class="nav-item" data-route="#settings">
          <span class="icon">⚙️</span>
          <span>Cài đặt</span>
        </button>
      </nav>

      <!-- Overlay Khóa Mã PIN (App Lock) -->
      <div id="pin-lock-overlay" class="modal-overlay" style="display: none; background: #0f172a; z-index: 200;">
        <div style="text-align: center; color: #fff; max-width: 320px; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <div style="font-size: 44px;">🔒</div>
          <div>
            <h3 style="font-size: 18px; font-weight: 800; color: #fff;">Sổ Hụi Đang Khóa</h3>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Vui lòng nhập mã PIN để mở khóa</p>
          </div>
          <input type="password" id="input-pin-code" maxlength="6" style="width: 180px; text-align: center; font-size: 24px; letter-spacing: 8px; padding: 10px; border-radius: 8px; border: 2px solid #22c55e; background: #1e293b; color: #fff;" />
          <div style="display: flex; gap: 8px; width: 100%;">
            <button class="btn btn-outline btn-block" id="btn-pin-logout" style="color: #94a3b8; border-color: #334155;">Đổi TK</button>
            <button class="btn btn-primary btn-block" id="btn-pin-unlock">Mở Khóa 🔓</button>
          </div>
        </div>
      </div>

      <!-- Modal Phản Hồi của Hụi Viên -->
      <div id="modal-feedback" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Gửi Phản Hồi Cho Chủ Hụi</h3>
            <button class="btn btn-sm btn-outline btn-circle" id="btn-close-fb-modal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Loại phản hồi:</label>
              <select id="fb-type" class="form-control form-select">
                <option value="amount">Báo sai lệch số tiền cần đóng</option>
                <option value="receipt">Chưa nhận được biên nhận / hình ảnh</option>
                <option value="schedule">Xin gia hạn thời gian nộp tiền</option>
                <option value="other">Góp ý / Yêu cầu khác</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Nội dung chi tiết:</label>
              <textarea id="fb-content" class="form-control" rows="3" placeholder="Nhập nội dung cần trao đổi với chủ hụi..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-fb" style="flex:1;">Hủy</button>
            <button class="btn btn-primary" id="btn-send-fb" style="flex:2;">📨 Gửi Phản Hồi</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-home-logo')?.addEventListener('click', () => {
      window.location.hash = '#dashboard';
    });

    this.appContainer.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        window.location.hash = route;
      });
    });

    // Xử lý mã PIN khóa app
    const pinOverlay = document.getElementById('pin-lock-overlay');
    document.getElementById('btn-pin-unlock')?.addEventListener('click', () => {
      const pinVal = document.getElementById('input-pin-code').value;
      if (store.verifyPinCode(pinVal)) {
        this.isPinUnlocked = true;
        pinOverlay.style.display = 'none';
        showToast('Mở khóa sổ thành công!', 'success');
      } else {
        showToast('Mã PIN không đúng, vui lòng thử lại!', 'danger');
        document.getElementById('input-pin-code').value = '';
      }
    });

    document.getElementById('input-pin-code')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-pin-unlock')?.click();
      }
    });

    document.getElementById('btn-pin-logout')?.addEventListener('click', () => {
      pinOverlay.style.display = 'none';
      this.isPinUnlocked = true;
      window.location.hash = '#auth';
    });

    // Feedback modal
    const modalFb = document.getElementById('modal-feedback');
    document.getElementById('btn-close-fb-modal')?.addEventListener('click', () => modalFb.style.display = 'none');
    document.getElementById('btn-cancel-fb')?.addEventListener('click', () => modalFb.style.display = 'none');
    document.getElementById('btn-send-fb')?.addEventListener('click', () => {
      const type = document.getElementById('fb-type').value;
      const content = document.getElementById('fb-content').value.trim();
      if (!content) {
        showToast('Vui lòng nhập nội dung phản hồi!', 'warning');
        return;
      }

      store.logAction('RECORD_PAYMENT', 'Payment', 'feedback', `Hụi viên gửi phản hồi (${type}): ${content}`);
      showToast('Đã gửi phản hồi đến Chủ Hụi thành công!', 'success');
      modalFb.style.display = 'none';
      document.getElementById('fb-content').value = '';
    });

    window.showFeedbackModal = (huiName, cycleNum) => {
      modalFb.style.display = 'flex';
      if (huiName && huiName !== 'Chung') {
        document.getElementById('fb-content').value = `Tôi xin phản hồi về dây [${huiName}] kỳ ${cycleNum}: `;
      }
    };

    this.updateHeader();
  }

  checkPinLock() {
    if (store.currentAccount.pinCode && !this.isPinUnlocked) {
      const pinOverlay = document.getElementById('pin-lock-overlay');
      if (pinOverlay) {
        pinOverlay.style.display = 'flex';
        setTimeout(() => document.getElementById('input-pin-code')?.focus(), 200);
      }
    }
  }

  updateHeader() {
    const headerRight = document.getElementById('header-right');
    if (!headerRight) return;

    const acc = store.currentAccount;
    const role = store.state.currentRole;
    let roleText = 'Chủ Hụi';
    let roleClass = 'owner';
    let roleIcon = '👩‍💼';

    if (role === 'member') {
      roleText = 'Hụi Viên';
      roleClass = 'member';
      roleIcon = '👨‍🌾';
    } else if (role === 'hybrid') {
      roleText = 'Chủ & Hụi Viên';
      roleClass = 'hybrid';
      roleIcon = '🧕';
    }

    const isOnline = cloudSync.isOnline;
    const isSyncing = cloudSync.syncStatus === 'syncing';
    let cloudIcon = isOnline ? '🟢' : '🟡';
    let cloudTooltip = isOnline ? 'Đám mây kết nối trực tuyến' : 'Đang ngoại tuyến (Offline)';
    if (isSyncing) {
      cloudIcon = '🔄';
      cloudTooltip = 'Đang đồng bộ Đám mây...';
    }

    headerRight.innerHTML = `
      <div id="btn-cloud-status-header" title="${cloudTooltip}" style="cursor: pointer; font-size: 11px; background: rgba(0,0,0,0.04); padding: 4px 6px; border-radius: 12px; display: flex; align-items: center; gap: 4px;">
        <span style="${isSyncing ? 'animation: spin 1s linear infinite;' : ''}">${cloudIcon}</span>
        <span style="font-weight: 600; color: var(--text-muted); font-size: 11px;">Cloud</span>
      </div>
      <div class="role-tag ${roleClass}" id="btn-change-role" title="Bấm để đổi vai trò">
        <span>${roleIcon}</span>
        <span>${escapeHtml(acc.fullName.split(' ')[0])} (${roleText})</span>
        <span style="font-size: 10px; opacity: 0.7;">▼</span>
      </div>
      <button class="btn btn-sm btn-outline btn-circle" id="btn-goto-settings-header" title="Cài đặt & Sao lưu">
        ⚙️
      </button>
    `;

    document.getElementById('btn-cloud-status-header')?.addEventListener('click', () => {
      window.location.hash = '#settings';
    });

    document.getElementById('btn-change-role')?.addEventListener('click', () => {
      window.location.hash = '#select-role';
    });

    document.getElementById('btn-goto-settings-header')?.addEventListener('click', () => {
      window.location.hash = '#settings';
    });
  }

  handleRoute() {
    const hash = window.location.hash || '#select-role';
    const mainContent = document.getElementById('main-content');
    const navBar = document.getElementById('main-nav');
    const header = document.getElementById('main-header');

    if (!mainContent) return;

    // Cập nhật Nav
    this.appContainer.querySelectorAll('.nav-item').forEach(item => {
      const r = item.getAttribute('data-route');
      if (hash.startsWith(r)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 0. Màn hình Xác thực Đăng ký / Đăng nhập (#auth, #login, #register)
    if (hash === '#auth' || hash === '#login') {
      if (navBar) navBar.style.display = 'none';
      if (header) header.style.display = 'none';
      renderAuthView(mainContent, 'login');
      return;
    }

    if (hash === '#register') {
      if (navBar) navBar.style.display = 'none';
      if (header) header.style.display = 'none';
      renderAuthView(mainContent, 'register');
      return;
    }

    // 1. Màn hình chọn vai trò
    if (hash === '#select-role') {
      if (navBar) navBar.style.display = 'none';
      if (header) header.style.display = 'none';
      renderRoleSelector(mainContent);
      return;
    }

    // Kiểm tra khóa PIN đối với các trang bên trong
    this.checkPinLock();

    if (navBar) navBar.style.display = 'grid';
    if (header) header.style.display = 'flex';

    // 2. Dashboard theo vai trò
    if (hash === '#dashboard') {
      if (store.state.currentRole === 'owner') {
        renderOwnerDashboard(mainContent);
      } else if (store.state.currentRole === 'member') {
        renderMemberDashboard(mainContent);
      } else {
        this.renderHybridDashboard(mainContent);
      }
      return;
    }

    // 3. Cài đặt & Sao lưu (#settings)
    if (hash === '#settings') {
      renderSettingsView(mainContent);
      return;
    }

    // 4. Danh bạ hụi viên
    if (hash === '#members') {
      renderMembersDirectory(mainContent);
      return;
    }

    // 5. Tạo dây hụi mới & Sang sổ từ sổ giấy cũ
    if (hash === '#create-group') {
      renderCreateGroup(mainContent);
      return;
    }

    if (hash === '#migrate-ledger') {
      renderMigrateLedgerView(mainContent);
      return;
    }

    // 5b. Mua bán & Sang nhượng chân hụi (#transfer-hui, #transfer-hui/:groupId)
    if (hash === '#transfer-hui' || hash.startsWith('#transfer-hui/')) {
      const groupId = hash.includes('/') ? hash.split('/')[1] : null;
      renderTransferHuiView(mainContent, groupId);
      return;
    }

    // 5c. Máy tính tiền hụi & Tiền đầu thảo thông minh (#calculator)
    if (hash === '#calculator') {
      renderCalculatorView(mainContent);
      return;
    }

    // 5d. Phòng trò chuyện & Đấu hụi bỏ thăm kín (#group-chat/:groupId)
    if (hash.startsWith('#group-chat/')) {
      const groupId = hash.split('/')[1];
      renderGroupChatView(mainContent, groupId);
      return;
    }

    // 5e. Link tham gia dây hụi trực tiếp (#join-group/:groupId)
    if (hash.startsWith('#join-group/')) {
      const groupId = hash.split('/')[1];
      try {
        const res = store.joinGroupByInvite(groupId);
        showToast(`Bạn đã gia nhập thành công Dây hụi "${res.group.name}"!`, 'success');
        window.location.hash = `#group-chat/${groupId}`;
      } catch (err) {
        showToast(err.message, 'danger');
        window.location.hash = '#dashboard';
      }
      return;
    }

    // 6. Danh sách dây hụi
    if (hash === '#groups') {
      if (store.state.currentRole === 'member') {
        renderMemberDashboard(mainContent);
      } else {
        renderOwnerDashboard(mainContent);
      }
      return;
    }

    // 7. Chi tiết dây hụi (#group-detail/:groupId)
    if (hash.startsWith('#group-detail/')) {
      const groupId = hash.split('/')[1];
      renderGroupDetail(mainContent, groupId);
      return;
    }

    // 8. Khui hụi & Quay random (#draw/:groupId/:cycleId)
    if (hash.startsWith('#draw/')) {
      const parts = hash.split('/');
      const groupId = parts[1];
      const cycleId = parts[2];
      renderDrawScreen(mainContent, groupId, cycleId);
      return;
    }

    // 9. Bảng đóng tiền kỳ (#cycle-payments/:cycleId)
    if (hash.startsWith('#cycle-payments/')) {
      const cycleId = hash.split('/')[1];
      renderCyclePayments(mainContent, cycleId);
      return;
    }

    // 10. Cẩm nang
    if (hash === '#guide') {
      renderGuideView(mainContent);
      return;
    }

    // 11. Nhật ký hoạt động
    if (hash === '#logs') {
      renderLogsView(mainContent);
      return;
    }

    // 12. Quản trị hệ thống & Quản lý người dùng
    if (hash === '#admin') {
      renderAdminView(mainContent);
      return;
    }

    // Fallback
    renderOwnerDashboard(mainContent);
  }

  renderHybridDashboard(container) {
    container.innerHTML = `
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <button class="btn btn-sm btn-primary" id="btn-tab-hybrid-owner" style="flex: 1;">
          👩‍💼 Dây Tôi Làm Chủ (${store.state.groups.length})
        </button>
        <button class="btn btn-sm btn-outline" id="btn-tab-hybrid-member" style="flex: 1;">
          👨‍🌾 Chân Hụi Tôi Chơi
        </button>
      </div>
      <div id="hybrid-content-container"></div>
    `;

    const subContainer = document.getElementById('hybrid-content-container');
    renderOwnerDashboard(subContainer);

    document.getElementById('btn-tab-hybrid-owner')?.addEventListener('click', (e) => {
      e.currentTarget.className = 'btn btn-sm btn-primary';
      document.getElementById('btn-tab-hybrid-member').className = 'btn btn-sm btn-outline';
      renderOwnerDashboard(subContainer);
    });

    document.getElementById('btn-tab-hybrid-member')?.addEventListener('click', (e) => {
      e.currentTarget.className = 'btn btn-sm btn-primary';
      document.getElementById('btn-tab-hybrid-owner').className = 'btn btn-sm btn-outline';
      renderMemberDashboard(subContainer);
    });
  }
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SoHuiApp();
});
