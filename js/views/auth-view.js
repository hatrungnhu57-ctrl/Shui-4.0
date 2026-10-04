/**
 * MÀN HÌNH ĐĂNG NHẬP & ĐĂNG KÝ TÀI KHOẢN TRỰC TUYẾN (CLOUD AUTH VIEW)
 * Hỗ trợ Đăng nhập xuyên thiết bị, Đăng ký Đám mây, Hiện/Ẩn mật khẩu,
 * Quên mật khẩu & Khôi phục tài khoản nhanh qua Số điện thoại.
 */

import { store } from '../store.js';
import { showToast, VIETNAMESE_BANKS, escapeHtml } from '../utils.js';
import { cloudSync } from '../cloud-sync.js';

export function renderAuthView(container, initialTab = 'login') {
  const accounts = store.getAccounts();

  container.innerHTML = `
    <div style="padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; max-width: 440px; margin: 0 auto; min-height: 85vh; justify-content: center;">
      <!-- Logo Brand & Cloud Status -->
      <div style="text-align: center;">
        <div style="width: 72px; height: 72px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 8px 20px rgba(21, 128, 61, 0.25); margin-bottom: 10px;">
          📜
        </div>
        <h1 style="font-size: 24px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px;">SỔ HỤI MIỀN NAM</h1>
        <div style="display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 4px 10px; border-radius: 20px; font-size: 12px; color: #166534; margin-top: 6px; font-weight: 600;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;"></span>
          Đồng bộ Đám mây Online (Đăng nhập mọi thiết bị)
        </div>
      </div>

      <!-- Tab Switcher (Đăng nhập / Đăng ký) -->
      <div style="display: flex; background: #e2e8f0; padding: 4px; border-radius: 12px; gap: 4px;">
        <button class="btn btn-sm ${initialTab === 'login' ? 'btn-primary' : 'btn-outline'}" id="tab-btn-login" style="flex: 1; border: none; font-weight: 700;">
          🔑 Đăng Nhập
        </button>
        <button class="btn btn-sm ${initialTab === 'register' ? 'btn-primary' : 'btn-outline'}" id="tab-btn-register" style="flex: 1; border: none; font-weight: 700;">
          ✨ Đăng Ký Mới
        </button>
      </div>

      <!-- FORM ĐĂNG NHẬP -->
      <div id="auth-login-section" style="${initialTab === 'login' ? 'display: flex;' : 'display: none;'} flex-direction: column; gap: 14px;">
        <div class="card" style="padding: 18px;">
          <div class="card-title" style="font-size: 15px; margin-bottom: 6px;">
            Đăng nhập vào sổ hụi
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại của bạn:</label>
            <input type="tel" id="login-identifier" class="form-control" placeholder="Ví dụ: 0918123456" />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label" style="margin-bottom:0;">Mật khẩu:</label>
              <button type="button" id="btn-forgot-password-link" style="background:none; border:none; color:var(--primary); font-size:12px; cursor:pointer; font-weight:600; padding:0;">
                ❓ Quên mật khẩu?
              </button>
            </div>
            <div style="position: relative; margin-top: 4px;">
              <input type="password" id="login-password" class="form-control" placeholder="Nhập mật khẩu..." style="padding-right: 42px;" />
              <button type="button" id="btn-toggle-login-pwd" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;">
                👁️
              </button>
            </div>
          </div>

          <button class="btn btn-primary btn-block" id="btn-submit-login" style="margin-top: 8px; padding: 12px; font-size: 15px;">
            🚀 Đăng Nhập Vào Sổ Hụi
          </button>
        </div>

        <!-- Danh sách tài khoản đã lưu trên máy này -->
        ${accounts.length > 0 ? `
          <div class="card" style="padding: 14px; background: #f8fafc;">
            <div style="font-size: 12.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <span>⚡ Tài khoản đã lưu trên máy này:</span>
              <span class="badge badge-info">${accounts.length} tài khoản</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${accounts.map(acc => `
                <div class="btn-quick-login" data-phone="${escapeHtml(acc.phone)}" data-pass="${escapeHtml(acc.password)}" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">${acc.role === 'owner' ? '👩‍💼' : (acc.role === 'member' ? '👨‍🌾' : '🧕')}</span>
                    <div>
                      <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">${escapeHtml(acc.fullName)}</div>
                      <div style="font-size: 11.5px; color: var(--text-muted);">SĐT: ${escapeHtml(acc.phone)} ${acc.isDemo ? '• <span style="color:#b45309;">(Dữ liệu mẫu)</span>' : '• <span style="color:#15803d; font-weight:600;">(Sổ thật)</span>'}</div>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-outline" style="font-size: 11px; padding: 4px 8px;">Vào sổ ➔</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- FORM ĐĂNG KÝ TÀI KHOẢN MỚI -->
      <div id="auth-register-section" style="${initialTab === 'register' ? 'display: flex;' : 'display: none;'} flex-direction: column; gap: 14px;">
        <div class="card" style="padding: 18px;">
          <div class="card-title" style="font-size: 15px; margin-bottom: 6px;">
            Đăng ký tài khoản Quản lý Sổ Hụi
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
            <label class="form-label">Tạo mật khẩu: <span style="color:var(--accent);">*</span></label>
            <div style="position: relative;">
              <input type="password" id="reg-password" class="form-control" placeholder="Mật khẩu (ít nhất 3 ký tự)..." style="padding-right: 42px;" />
              <button type="button" id="btn-toggle-reg-pwd" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;">
                👁️
              </button>
            </div>
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
            <label class="form-label">Địa chỉ / Khu vực hoạt động (tùy chọn):</label>
            <input type="text" id="reg-address" class="form-control" placeholder="Ví dụ: Chợ Càng Long, Trà Vinh" />
          </div>

          <!-- Cấu hình tài khoản ngân hàng để tự sinh VietQR -->
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 4px;">
            <div style="font-weight: 700; font-size: 13px; color: var(--primary-dark); margin-bottom: 8px;">
              💳 Tài khoản ngân hàng nhận tiền (tự sinh mã VietQR):
            </div>
            <div class="form-group" style="margin-bottom: 8px;">
              <label class="form-label" style="font-size: 12px;">Ngân hàng:</label>
              <select id="reg-bank-code" class="form-control form-select" style="font-size: 13px;">
                ${VIETNAMESE_BANKS.map(b => `<option value="${escapeHtml(b.code)}">${escapeHtml(b.name)}</option>`).join('')}
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
            ✨ Tạo Tài Khoản Đám Mây & Mở Sổ
          </button>
        </div>
      </div>

      <!-- MODAL QUÊN MẬT KHẨU / ĐẶT LẠI MẬT KHẨU -->
      <div id="modal-forgot-password" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Khôi Phục & Đặt Lại Mật Khẩu</h3>
            <button class="btn btn-sm btn-outline btn-circle" id="btn-close-forgot-modal">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 13px; color: var(--text-muted);">
              Nhập số điện thoại đã đăng ký để đặt lại mật khẩu mới cho tài khoản của bạn.
            </p>

            <div class="form-group">
              <label class="form-label">Số điện thoại đăng ký (*):</label>
              <input type="tel" id="forgot-phone" class="form-control" placeholder="Ví dụ: 0918123456" />
            </div>

            <div class="form-group">
              <label class="form-label">Mật khẩu mới muốn đặt (*):</label>
              <input type="password" id="forgot-new-password" class="form-control" placeholder="Nhập mật khẩu mới..." />
            </div>

            <div class="form-group">
              <label class="form-label">Nhập lại mật khẩu mới (*):</label>
              <input type="password" id="forgot-confirm-password" class="form-control" placeholder="Nhập lại mật khẩu mới..." />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-forgot" style="flex:1;">Hủy</button>
            <button class="btn btn-primary" id="btn-submit-reset-password" style="flex:2;">💾 Cập Nhật Mật Khẩu</button>
          </div>
        </div>
      </div>

      <!-- Tuyên bố an toàn và pháp lý -->
      <div class="safety-disclaimer">
        <span>🛡️</span>
        <div>
          <strong>Bảo mật & Độc lập:</strong> Dữ liệu sổ hụi được mã hóa và lưu trữ an toàn riêng biệt. Bạn có thể sử dụng trơn tru trên mọi thiết bị và tải bản sao lưu về máy bất kỳ lúc nào.
        </div>
      </div>
    </div>
  `;

  // Chuyển Tab
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

  // Bật/Tắt hiện mật khẩu Đăng nhập
  const btnToggleLogin = document.getElementById('btn-toggle-login-pwd');
  const inputLoginPass = document.getElementById('login-password');
  btnToggleLogin?.addEventListener('click', () => {
    if (inputLoginPass.type === 'password') {
      inputLoginPass.type = 'text';
      btnToggleLogin.innerText = '🙈';
    } else {
      inputLoginPass.type = 'password';
      btnToggleLogin.innerText = '👁️';
    }
  });

  // Bật/Tắt hiện mật khẩu Đăng ký
  const btnToggleReg = document.getElementById('btn-toggle-reg-pwd');
  const inputRegPass = document.getElementById('reg-password');
  btnToggleReg?.addEventListener('click', () => {
    if (inputRegPass.type === 'password') {
      inputRegPass.type = 'text';
      btnToggleReg.innerText = '🙈';
    } else {
      inputRegPass.type = 'password';
      btnToggleReg.innerText = '👁️';
    }
  });

  // Sự kiện Đăng nhập (Hỗ trợ Async Cloud & Local)
  const btnSubmitLogin = document.getElementById('btn-submit-login');
  btnSubmitLogin?.addEventListener('click', async () => {
    const idVal = document.getElementById('login-identifier').value.trim();
    const passVal = document.getElementById('login-password').value;

    if (!idVal || !passVal) {
      showToast('Vui lòng nhập số điện thoại và mật khẩu!', 'warning');
      return;
    }

    try {
      btnSubmitLogin.disabled = true;
      btnSubmitLogin.innerText = '⏳ Đang đăng nhập...';

      const acc = await store.login(idVal, passVal);
      showToast(`Đăng nhập thành công! Chào mừng ${acc.fullName}`, 'success');
      window.location.hash = '#dashboard';
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      btnSubmitLogin.disabled = false;
      btnSubmitLogin.innerText = '🚀 Đăng Nhập Vào Sổ Hụi';
    }
  });

  // Đăng nhập nhanh
  container.querySelectorAll('.btn-quick-login').forEach(item => {
    item.addEventListener('click', async () => {
      const phone = item.getAttribute('data-phone');
      const pass = item.getAttribute('data-pass');
      try {
        const acc = await store.login(phone, pass);
        showToast(`Đã mở sổ của: ${acc.fullName}`, 'success');
        window.location.hash = '#dashboard';
      } catch (e) {
        showToast(e.message, 'danger');
      }
    });
  });

  // Sự kiện Đăng ký
  const btnSubmitReg = document.getElementById('btn-submit-register');
  btnSubmitReg?.addEventListener('click', async () => {
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
      btnSubmitReg.disabled = true;
      btnSubmitReg.innerText = '⏳ Đang khởi tạo tài khoản...';

      const newAcc = await store.registerAccount({
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
    } finally {
      btnSubmitReg.disabled = false;
      btnSubmitReg.innerText = '✨ Tạo Tài Khoản Đám Mây & Mở Sổ';
    }
  });

  // Modal Quên Mật Khẩu
  const modalForgot = document.getElementById('modal-forgot-password');
  document.getElementById('btn-forgot-password-link')?.addEventListener('click', () => {
    modalForgot.style.display = 'flex';
  });
  document.getElementById('btn-close-forgot-modal')?.addEventListener('click', () => {
    modalForgot.style.display = 'none';
  });
  document.getElementById('btn-cancel-forgot')?.addEventListener('click', () => {
    modalForgot.style.display = 'none';
  });

  document.getElementById('btn-submit-reset-password')?.addEventListener('click', async () => {
    const phone = document.getElementById('forgot-phone').value.trim();
    const newPass = document.getElementById('forgot-new-password').value;
    const confirmPass = document.getElementById('forgot-confirm-password').value;

    if (!phone) {
      showToast('Vui lòng nhập số điện thoại đã đăng ký!', 'warning');
      return;
    }
    if (!newPass || newPass.length < 3) {
      showToast('Mật khẩu mới phải có ít nhất 3 ký tự!', 'warning');
      return;
    }
    if (newPass !== confirmPass) {
      showToast('Mật khẩu nhập lại không trùng khớp!', 'warning');
      return;
    }

    try {
      await store.resetPassword(phone, newPass);
      showToast('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.', 'success');
      modalForgot.style.display = 'none';
      document.getElementById('login-identifier').value = phone;
      document.getElementById('login-password').value = newPass;
    } catch (e) {
      showToast(e.message, 'danger');
    }
  });
}
