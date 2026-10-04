/**
 * MÀN HÌNH CHỌN VAI TRÒ & QUẢN LÝ SỔ (ROLE SELECTOR & LANDING)
 */

import { store } from '../store.js';
import { showToast } from '../utils.js';

export function renderRoleSelector(container) {
  const currentRole = store.state.currentRole;
  const currentAcc = store.currentAccount;

  container.innerHTML = `
    <div style="padding: 24px 16px; display: flex; flex-direction: column; gap: 18px; align-items: center; text-align: center; min-height: 85vh; justify-content: center; max-width: 480px; margin: 0 auto;">
      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 10px 25px rgba(21, 128, 61, 0.3);">
        📜
      </div>

      <div>
        <h1 style="font-size: 26px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">SỔ HỤI MIỀN NAM</h1>
        <p style="font-size: 13.5px; color: var(--text-muted); max-width: 340px;">
          Hệ thống ghi chép, tính toán tiền hụi sống/hụi chết, khui hụi và lưu trữ chứng cứ minh bạch
        </p>
      </div>

      <!-- Thẻ thông tin tài khoản hiện tại -->
      <div class="card" style="width: 100%; padding: 12px 14px; background: #ffffff; text-align: left; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: #dcfce7; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            ${currentAcc.role === 'owner' ? '👩‍💼' : (currentAcc.role === 'member' ? '👨‍🌾' : '🧕')}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">${currentAcc.fullName}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">SĐT: ${currentAcc.phone} ${currentAcc.isDemo ? '• <span style="color:#b45309;">(Bản Mẫu)</span>' : '• <span style="color:#15803d; font-weight:600;">(Sổ Thật)</span>'}</div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline" id="btn-goto-auth" style="font-size: 11.5px; padding: 4px 8px;">
          Đổi Tài Khoản ➔
        </button>
      </div>

      <div class="safety-disclaimer" style="text-align: left; width: 100%;">
        <span>🛡️</span>
        <div>
          <strong>Tuyên bố an toàn:</strong> Sổ Hụi chỉ là công cụ tính toán và ghi nhận chứng cứ; <em>tuyệt đối KHÔNG giữ tiền, không thu hộ, không bảo lãnh tài chính</em>.
        </div>
      </div>

      <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
          Chọn chế độ bạn muốn làm việc ngay:
        </div>

        <!-- Lựa chọn 1: Chủ Hụi -->
        <button class="card" id="btn-role-owner" style="text-align: left; cursor: pointer; border: 2px solid ${currentRole === 'owner' ? 'var(--primary)' : 'var(--border-color)'}; background: ${currentRole === 'owner' ? 'var(--primary-bg)' : 'var(--bg-surface)'}; padding: 14px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 46px; height: 46px; border-radius: 12px; background: #dcfce7; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              👩‍💼
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 15px; color: var(--primary-dark);">Chế độ Chủ Hụi (Đầu thảo)</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Tạo dây hụi, gom tiền, khui hụi, quay random, sinh VietQR và lập biên nhận
              </div>
            </div>
            <span style="font-size: 18px; color: var(--primary);">➔</span>
          </div>
        </button>

        <!-- Lựa chọn 2: Hụi Viên -->
        <button class="card" id="btn-role-member" style="text-align: left; cursor: pointer; border: 2px solid ${currentRole === 'member' ? 'var(--blue)' : 'var(--border-color)'}; background: ${currentRole === 'member' ? 'var(--blue-bg)' : 'var(--bg-surface)'}; padding: 14px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 46px; height: 46px; border-radius: 12px; background: #dbeafe; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              👨‍🌾
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 15px; color: var(--blue);">Chế độ Hụi Viên (Tay hụi)</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Theo dõi các chân hụi đã vào, lịch khui sắp tới, tiền cần đóng và biên nhận
              </div>
            </div>
            <span style="font-size: 18px; color: var(--blue);">➔</span>
          </div>
        </button>

        <!-- Lựa chọn 3: Vừa Chủ Vừa Hụi Viên -->
        <button class="card" id="btn-role-hybrid" style="text-align: left; cursor: pointer; border: 2px solid ${currentRole === 'hybrid' ? 'var(--purple)' : 'var(--border-color)'}; background: ${currentRole === 'hybrid' ? 'var(--purple-bg)' : 'var(--bg-surface)'}; padding: 14px; transition: all 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 46px; height: 46px; border-radius: 12px; background: #ede9fe; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              🧕
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 15px; color: var(--purple);">Vừa làm Chủ vừa chơi Hụi</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Quản lý các dây mình làm chủ song song với chân hụi mình góp ở ngoài
              </div>
            </div>
            <span style="font-size: 18px; color: var(--purple);">➔</span>
          </div>
        </button>
      </div>

      <div style="display: flex; gap: 10px; width: 100%; margin-top: 4px;">
        <button class="btn btn-outline btn-sm btn-block" id="btn-goto-settings" style="padding: 10px;">
          ⚙️ Cài Đặt Sổ & Sao Lưu
        </button>
        <button class="btn btn-primary btn-sm btn-block" id="btn-goto-register-new" style="padding: 10px;">
          ✨ Tạo Tài Khoản Riêng
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-role-owner')?.addEventListener('click', () => {
    store.setCurrentRole('owner');
    showToast(`Đã vào chế độ Chủ Hụi (${currentAcc.fullName})`, 'success');
    window.location.hash = '#dashboard';
  });

  document.getElementById('btn-role-member')?.addEventListener('click', () => {
    store.setCurrentRole('member');
    showToast(`Đã vào chế độ Hụi Viên (${currentAcc.fullName})`, 'info');
    window.location.hash = '#dashboard';
  });

  document.getElementById('btn-role-hybrid')?.addEventListener('click', () => {
    store.setCurrentRole('hybrid');
    showToast(`Đã vào chế độ Chủ kiêm Hụi Viên (${currentAcc.fullName})`, 'info');
    window.location.hash = '#dashboard';
  });

  document.getElementById('btn-goto-auth')?.addEventListener('click', () => {
    window.location.hash = '#auth';
  });

  document.getElementById('btn-goto-settings')?.addEventListener('click', () => {
    window.location.hash = '#settings';
  });

  document.getElementById('btn-goto-register-new')?.addEventListener('click', () => {
    window.location.hash = '#register';
  });
}
