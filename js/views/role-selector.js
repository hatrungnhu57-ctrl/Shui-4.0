/**
 * MÀN HÌNH CHỌN VAI TRÒ ĐẦU TIÊN KHI MỞ APP
 */

import { store } from '../store.js';
import { showToast } from '../utils.js';

export function renderRoleSelector(container) {
  const currentRole = store.state.currentRole;
  const users = store.state.users;

  container.innerHTML = `
    <div style="padding: 24px 16px; display: flex; flex-direction: column; gap: 20px; align-items: center; text-align: center; min-height: 80vh; justify-content: center;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 10px 25px rgba(21, 128, 61, 0.3);">
        📜
      </div>

      <div>
        <h1 style="font-size: 26px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">SỔ HỤI</h1>
        <p style="font-size: 14px; color: var(--text-muted); max-width: 320px;">
          Giải pháp ghi chép, quản lý và lưu chứng cứ dây hụi minh bạch chuẩn tập quán miền Nam
        </p>
      </div>

      <div class="safety-disclaimer" style="text-align: left; width: 100%;">
        <span>🛡️</span>
        <div>
          <strong>Tuyên bố an toàn:</strong> Sổ Hụi chỉ là công cụ tính toán và ghi nhận chứng cứ; <em>tuyệt đối KHÔNG giữ tiền, không thu hộ, không bảo lãnh tài chính</em>.
        </div>
      </div>

      <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
        <div style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
          Xin vui lòng chọn vai trò sử dụng của bạn:
        </div>

        <!-- Lựa chọn 1: Chủ Hụi -->
        <button class="card" id="btn-role-owner" style="text-align: left; cursor: pointer; border: 2px solid ${currentRole === 'owner' ? 'var(--primary)' : 'var(--border-color)'}; background: ${currentRole === 'owner' ? 'var(--primary-bg)' : 'var(--bg-surface)'}; padding: 16px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 50px; height: 50px; border-radius: 14px; background: #dcfce7; display: flex; align-items: center; justify-content: center; font-size: 26px;">
              👩‍💼
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 16px; color: var(--primary-dark);">Tôi là Chủ Hụi (Đầu thảo)</div>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
                Tạo dây hụi, gom tiền, khui hụi, quay random, lập biên nhận và quản lý danh bạ
              </div>
            </div>
            <span style="font-size: 20px; color: var(--primary);">➔</span>
          </div>
        </button>

        <!-- Lựa chọn 2: Hụi Viên -->
        <button class="card" id="btn-role-member" style="text-align: left; cursor: pointer; border: 2px solid ${currentRole === 'member' ? 'var(--blue)' : 'var(--border-color)'}; background: ${currentRole === 'member' ? 'var(--blue-bg)' : 'var(--bg-surface)'}; padding: 16px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 50px; height: 50px; border-radius: 14px; background: #dbeafe; display: flex; align-items: center; justify-content: center; font-size: 26px;">
              👨‍🌾
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 16px; color: var(--blue);">Tôi là Hụi Viên (Tay hụi)</div>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
                Theo dõi các chân hụi đang chơi, lịch khui sắp tới, tiền cần đóng và kiểm tra biên nhận
              </div>
            </div>
            <span style="font-size: 20px; color: var(--blue);">➔</span>
          </div>
        </button>

        <!-- Lựa chọn 3: Người vừa là Chủ vừa là Hụi Viên -->
        <button class="card" id="btn-role-hybrid" style="text-align: left; cursor: pointer; border: 2px solid ${currentRole === 'hybrid' ? 'var(--purple)' : 'var(--border-color)'}; background: ${currentRole === 'hybrid' ? 'var(--purple-bg)' : 'var(--bg-surface)'}; padding: 16px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 50px; height: 50px; border-radius: 14px; background: #ede9fe; display: flex; align-items: center; justify-content: center; font-size: 26px;">
              🧕
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 16px; color: var(--purple);">Tôi vừa là Chủ vừa là Hụi Viên</div>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
                Quản lý các dây mình làm chủ đồng thời theo dõi các chân hụi mình tham gia
              </div>
            </div>
            <span style="font-size: 20px; color: var(--purple);">➔</span>
          </div>
        </button>
      </div>

      <div style="margin-top: 10px; width: 100%; border-top: 1px dashed var(--border-color); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: var(--text-muted);">Tài khoản mẫu: <strong>${store.state.currentUser.fullName}</strong></span>
        <button class="btn btn-sm btn-outline" id="btn-switch-account" style="font-size: 11.5px;">Đổi tài khoản 🔄</button>
      </div>
    </div>
  `;

  document.getElementById('btn-role-owner')?.addEventListener('click', () => {
    store.setCurrentRole('owner');
    showToast('Đã chuyển sang chế độ Chủ Hụi (Cô Bảy)', 'success');
    window.location.hash = '#dashboard';
  });

  document.getElementById('btn-role-member')?.addEventListener('click', () => {
    store.setCurrentRole('member');
    showToast('Đã chuyển sang chế độ Hụi Viên (Anh Ba Khía)', 'info');
    window.location.hash = '#dashboard';
  });

  document.getElementById('btn-role-hybrid')?.addEventListener('click', () => {
    store.setCurrentRole('hybrid');
    showToast('Đã chuyển sang chế độ Chủ kiêm Hụi Viên (Chị Út Lành)', 'info');
    window.location.hash = '#dashboard';
  });

  document.getElementById('btn-switch-account')?.addEventListener('click', () => {
    const nextIndex = (users.findIndex(u => u.id === store.state.currentUser.id) + 1) % users.length;
    store.switchUser(users[nextIndex].id);
    renderRoleSelector(container);
    showToast(`Đã đổi tài khoản sang: ${users[nextIndex].fullName}`, 'info');
  });
}
