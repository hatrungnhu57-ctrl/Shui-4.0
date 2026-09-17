/**
 * SỔ HỤI - BỘ ĐIỀU HƯỚNG & KHỞI CHẠY ỨNG DỤNG (MAIN APP CONTROLLER)
 */

import { store } from './store.js';
import { showToast } from './utils.js';
import { renderRoleSelector } from './views/role-selector.js';
import { renderOwnerDashboard } from './views/owner-dashboard.js';
import { renderMemberDashboard } from './views/member-dashboard.js';
import { renderMembersDirectory } from './views/members-directory.js';
import { renderCreateGroup } from './views/create-group.js';
import { renderGroupDetail } from './views/group-detail.js';
import { renderDrawScreen } from './views/draw-screen.js';
import { renderCyclePayments } from './views/cycle-payments.js';
import { renderGuideView, renderLogsView } from './views/guide-and-logs.js';

class SoHuiApp {
  constructor() {
    this.appContainer = document.getElementById('app-container');
    this.init();
  }

  init() {
    // Lắng nghe thay đổi URL Hash
    window.addEventListener('hashchange', () => this.handleRoute());

    // Đăng ký nhận thông báo thay đổi State
    store.subscribe(() => {
      this.updateHeader();
    });

    // Tạo Header, Main Content, Bottom Nav
    this.renderLayout();

    // Điều hướng ban đầu
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
          <!-- Vai trò hiện tại -->
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
        <button class="nav-item" data-route="#logs">
          <span class="icon">📜</span>
          <span>Nhật ký</span>
        </button>
      </nav>

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

    // Gán sự kiện click cho Bottom Nav
    this.appContainer.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const route = btn.getAttribute('data-route');
        window.location.hash = route;
      });
    });

    // Xử lý modal feedback
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
      const typeSelect = document.getElementById('fb-type');
      if (huiName && huiName !== 'Chung') {
        document.getElementById('fb-content').value = `Tôi xin phản hồi về dây [${huiName}] kỳ ${cycleNum}: `;
      }
    };

    this.updateHeader();
  }

  updateHeader() {
    const headerRight = document.getElementById('header-right');
    if (!headerRight) return;

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

    headerRight.innerHTML = `
      <div class="role-tag ${roleClass}" id="btn-change-role" title="Bấm để đổi vai trò">
        <span>${roleIcon}</span>
        <span>${roleText}</span>
        <span style="font-size: 10px; opacity: 0.7;">▼</span>
      </div>
      <button class="btn btn-sm btn-outline btn-circle" id="btn-reset-demo" title="Khôi phục dữ liệu mẫu">
        🔄
      </button>
    `;

    document.getElementById('btn-change-role')?.addEventListener('click', () => {
      window.location.hash = '#select-role';
    });

    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('Bạn có muốn khôi phục lại toàn bộ dữ liệu mẫu ban đầu của Sổ Hụi không?')) {
        store.resetToDemoData();
        showToast('Đã khôi phục dữ liệu mẫu thành công!', 'info');
        window.location.hash = '#dashboard';
      }
    });
  }

  handleRoute() {
    const hash = window.location.hash || '#select-role';
    const mainContent = document.getElementById('main-content');
    const navBar = document.getElementById('main-nav');
    const header = document.getElementById('main-header');

    if (!mainContent) return;

    // Cập nhật trạng thái Active trên Nav
    this.appContainer.querySelectorAll('.nav-item').forEach(item => {
      const r = item.getAttribute('data-route');
      if (hash.startsWith(r)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 1. Màn hình chọn vai trò
    if (hash === '#select-role') {
      if (navBar) navBar.style.display = 'none';
      if (header) header.style.display = 'none';
      renderRoleSelector(mainContent);
      return;
    }

    if (navBar) navBar.style.display = 'grid';
    if (header) header.style.display = 'flex';

    // 2. Dashboard theo vai trò
    if (hash === '#dashboard') {
      if (store.state.currentRole === 'owner') {
        renderOwnerDashboard(mainContent);
      } else if (store.state.currentRole === 'member') {
        renderMemberDashboard(mainContent);
      } else {
        // Hybrid: Render cả hai tab
        this.renderHybridDashboard(mainContent);
      }
      return;
    }

    // 3. Danh bạ hụi viên
    if (hash === '#members') {
      renderMembersDirectory(mainContent);
      return;
    }

    // 4. Tạo dây hụi mới
    if (hash === '#create-group') {
      renderCreateGroup(mainContent);
      return;
    }

    // 5. Danh sách dây hụi
    if (hash === '#groups') {
      if (store.state.currentRole === 'member') {
        renderMemberDashboard(mainContent);
      } else {
        renderOwnerDashboard(mainContent);
      }
      return;
    }

    // 6. Chi tiết dây hụi (#group-detail/:groupId)
    if (hash.startsWith('#group-detail/')) {
      const groupId = hash.split('/')[1];
      renderGroupDetail(mainContent, groupId);
      return;
    }

    // 7. Khui hụi & Quay random (#draw/:groupId/:cycleId)
    if (hash.startsWith('#draw/')) {
      const parts = hash.split('/');
      const groupId = parts[1];
      const cycleId = parts[2];
      renderDrawScreen(mainContent, groupId, cycleId);
      return;
    }

    // 8. Bảng đóng tiền kỳ (#cycle-payments/:cycleId)
    if (hash.startsWith('#cycle-payments/')) {
      const cycleId = hash.split('/')[1];
      renderCyclePayments(mainContent, cycleId);
      return;
    }

    // 9. Cẩm nang
    if (hash === '#guide') {
      renderGuideView(mainContent);
      return;
    }

    // 10. Nhật ký hoạt động
    if (hash === '#logs') {
      renderLogsView(mainContent);
      return;
    }

    // Mặc định fallback
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
