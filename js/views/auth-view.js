/**
 * MÀN HÌNH ĐĂNG NHẬP & ĐĂNG KÝ TÀI KHOẢN (AUTHENTICATION VIEW)
 * Cho phép từng chủ hụi và hụi viên tạo tài khoản riêng biệt để quản lý sổ hụi của mình
 */

import { store } from '../store.js';
import { showToast, VIETNAMESE_BANKS } from '../utils.js';

export function renderAuthView(container, initialTab = 'login') {
  const accounts = store.getAccounts();
  const currentAcc = store.currentAccount;

  container.innerHTML = `
    <div style="padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; max-width: 440px; margin: 0 auto; min-height: 85vh; justify-content: center;">
      <!-- Logo Brand -->
      <div style="text-align: center;">
        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 8px 20px rgba(21, 128, 61, 0.25); margin-bottom: 10px;">
          📜
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px;">SỔ HỤI MIỀN NAM</h1>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-top: 2px;">
          Hệ thống Quản lý Sổ Hụi Độc lập & Bảo mật Chuẩn Thực tế
        </p>
      </div>

      <!-- Tab Switcher (Đăng nhập / Đăng ký) -->
      <div style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 12px; gap: 4px;">
        <button class="btn btn-sm ${initialTab === 'login' ? 'btn-primary' : 'btn-outline'}" id="tab-btn-login" style="flex: 1; border: none; font-weight: 700;">
          🔑 Đăng Nhập
        </button>
        <button class="btn btn-sm ${initialTab === 'register' ? 'btn-primary' : 'btn-outline'}" id="tab-btn-register" style="flex: 1; border: none; font-weight: 700;">
          ✨ Đăng Ký Tài Khoản
        </button>
      </div>

      <!-- FORM ĐĂNG NHẬP -->
      <div id="auth-login-section" style="${initialTab === 'login' ? 'display: flex;' : 'display: none;'} flex-direction: column; gap: 14px;">
        <div class="card" style="padding: 18px;">
          <div class="card-title" style="font-size: 15px; margin-bottom: 6px;">
            Đăng nhập tài khoản của bạn
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại hoặc Email:</label>
            <input type="text" id="login-identifier" class="form-control" placeholder="Ví dụ: 0918123456" />
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu:</label>
            <input type="password" id="login-password" class="form-control" placeholder="Nhập mật khẩu..." />
          </div>

          <button class="btn btn-primary btn-block" id="btn-submit-login" style="margin-top: 6px; padding: 12px; font-size: 15px;">
            🚀 Đăng Nhập Vào Sổ Hụi
          </button>
        </div>

        <!-- Danh sách tài khoản có sẵn trên máy để chọn nhanh -->
        <div class="card" style="padding: 14px; background: #f8fafc;">
          <div style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span>⚡ Tài khoản lưu trên thiết bị:</span>
            <span class="badge badge-info">${accounts.length} tài khoản</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${accounts.map(acc => `
              <div class="btn-quick-login" data-phone="${acc.phone}" data-pass="${acc.password}" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">${acc.role === 'owner' ? '👩‍💼' : (acc.role === 'member' ? '👨‍🌾' : '🧕')}</span>
                  <div>
                    <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">${acc.fullName}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted);">SĐT: ${acc.phone} ${acc.isDemo ? '• <span style="color:#b45309;">(Dữ liệu mẫu)</span>' : '• <span style="color:#15803d; font-weight:600;">(Sổ thật)</span>'}</div>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline" style="font-size: 11px; padding: 4px 8px;">Vào sổ ➔</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- FORM ĐĂNG KÝ TÀI KHOẢN MỚI -->
      <div id="auth-register-section" style="${initialTab === 'register' ? 'display: flex;' : 'display: none;'} flex-direction: column; gap: 14px;">
        <div class="card" style="padding: 18px;">
          <div class="card-title" style="font-size: 15px; margin-bottom: 6px;">
            Tạo tài khoản quản lý sổ hụi mới
          </div>

          <div class="form-group">
            <label class="form-label">Họ và tên của bạn: <span style="color:var(--accent);">*</span></label>
            <input type="text" id="reg-fullname" class="form-control" placeholder="Ví dụ: Nguyễn Văn Hai, Cô Chín..." />
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại (dùng đăng nhập): <span style="color:var(--accent);">*</span></label>
            <input type="tel" id="reg-phone" class="form-control" placeholder="Ví dụ: 0987654321" />
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu: <span style="color:var(--accent);">*</span></label>
            <input type="password" id="reg-password" class="form-control" placeholder="Tạo mật khẩu (ít nhất 3 ký tự)..." />
          </div>

          <div class="form-group">
            <label class="form-label">Vai trò chính của bạn:</label>
            <select id="reg-role" class="form-control form-select">
              <option value="owner">Chủ Hụi (Tôi tạo dây, khui và gom tiền hụi)</option>
              <option value="hybrid">Vừa làm Chủ vừa chơi Hụi</option>
              <option value="member">Hụi viên (Tôi chỉ tham gia đóng hụi)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tên Tiệm Hụi / Sổ Hụi (tùy chọn):</label>
            <input type="text" id="reg-shopname" class="form-control" placeholder="Ví dụ: Sổ Hụi Cô Chín Chợ Mới" />
          </div>

          <div class="form-group">
            <label class="form-label">Địa chỉ / Chợ (tùy chọn):</label>
            <input type="text" id="reg-address" class="form-control" placeholder="Ví dụ: Chợ Càng Long, Trà Vinh" />
          </div>

          <!-- Cấu hình tài khoản ngân hàng để tự sinh VietQR -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 4px;">
            <div style="font-weight: 700; font-size: 13px; color: var(--primary-dark); margin-bottom: 8px;">
              💳 Tài khoản ngân hàng nhận tiền (để tự sinh mã VietQR):
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label" style="font-size: 12px;">Ngân hàng:</label>
              <select id="reg-bank-code" class="form-control form-select" style="font-size: 13px;">
                ${VIETNAMESE_BANKS.map(b => `<option value="${b.code}">${b.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size: 12px;">Số tài khoản ngân hàng:</label>
              <input type="text" id="reg-bank-acc" class="form-control" placeholder="Nhập số tài khoản..." style="font-size: 13px;" />
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 13px;">
            <input type="checkbox" id="reg-seed-demo" style="width: 18px; height: 18px;" />
            <label for="reg-seed-demo" style="cursor: pointer; color: var(--text-main);">
              Nạp sẵn một số dây hụi mẫu để tôi tập sử dụng trước
            </label>
          </div>

          <button class="btn btn-primary btn-block" id="btn-submit-register" style="margin-top: 10px; padding: 12px; font-size: 15px;">
            ✨ Tạo Tài Khoản & Bắt Đầu Sổ
          </button>
        </div>
      </div>

      <!-- Tuyên bố an toàn và pháp lý -->
      <div class="safety-disclaimer">
        <span>🛡️</span>
        <div>
          <strong>Bảo mật & Quyền riêng tư:</strong> Dữ liệu sổ hụi được lưu trữ an toàn riêng biệt cho tài khoản của bạn. Ứng dụng tuân thủ Nghị định 19/2019/NĐ-CP về hụi/họ.
        </div>
      </div>
    </div>
  `;

  // Gán sự kiện chuyển Tab
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const secLogin = document.getElementById('auth-login-section');
  const secRegister = document.getElementById('auth-register-section');

  tabLogin?.addEventListener('click', () => {
    tabLogin.className = 'btn btn-sm btn-primary';
    tabRegister.className = 'btn btn-sm btn-outline';
    secLogin.style.display = 'flex';
    secRegister.style.display = 'none';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.className = 'btn btn-sm btn-primary';
    tabLogin.className = 'btn btn-sm btn-outline';
    secRegister.style.display = 'flex';
    secLogin.style.display = 'none';
  });

  // Sự kiện Đăng nhập
  document.getElementById('btn-submit-login')?.addEventListener('click', () => {
    const idVal = document.getElementById('login-identifier').value.trim();
    const passVal = document.getElementById('login-password').value;

    if (!idVal || !passVal) {
      showToast('Vui lòng nhập số điện thoại và mật khẩu!', 'warning');
      return;
    }

    try {
      const acc = store.login(idVal, passVal);
      showToast(`Đăng nhập thành công! Chào mừng ${acc.fullName}`, 'success');
      window.location.hash = '#dashboard';
    } catch (e) {
      showToast(e.message, 'danger');
    }
  });

  // Sự kiện Đăng nhập nhanh từ danh sách
  container.querySelectorAll('.btn-quick-login').forEach(item => {
    item.addEventListener('click', () => {
      const phone = item.getAttribute('data-phone');
      const pass = item.getAttribute('data-pass');
      try {
        const acc = store.login(phone, pass);
        showToast(`Đã mở sổ của: ${acc.fullName}`, 'success');
        window.location.hash = '#dashboard';
      } catch (e) {
        showToast(e.message, 'danger');
      }
    });
  });

  // Sự kiện Đăng ký
  document.getElementById('btn-submit-register')?.addEventListener('click', () => {
    const fullName = document.getElementById('reg-fullname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const shopName = document.getElementById('reg-shopname').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const bankCode = document.getElementById('reg-bank-code').value;
    const accountNumber = document.getElementById('reg-bank-acc').value.trim();
    const seedDemoData = document.getElementById('reg-seed-demo').checked;

    const selectedBank = VIETNAMESE_BANKS.find(b => b.code === bankCode);

    try {
      const newAcc = store.registerAccount({
        fullName,
        phone,
        password,
        role,
        shopName,
        address,
        bankCode,
        bankName: selectedBank ? selectedBank.name : bankCode,
        accountNumber,
        accountHolder: fullName,
        seedDemoData
      });

      showToast(`Tạo tài khoản thành công! Bắt đầu sổ của ${newAcc.fullName}`, 'success');
      window.location.hash = '#dashboard';
    } catch (e) {
      showToast(e.message, 'danger');
    }
  });
}
