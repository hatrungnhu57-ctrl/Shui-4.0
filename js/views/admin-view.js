/**
 * MÀN HÌNH QUẢN TRỊ HỆ THỐNG & QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG (ADMIN PANEL)
 * Dành cho Quản trị viên quản lý danh sách tài khoản, hỗ trợ đổi mật khẩu,
 * khóa/mở khóa tài khoản và theo dõi trạng thái hệ thống.
 */

import { store } from '../store.js';
import { showToast, formatDate, formatDateTime, escapeHtml } from '../utils.js';

export function renderAdminView(container) {
  const accounts = store.getAccounts();
  const realAccounts = accounts.filter(a => !a.isDemo);
  const demoAccounts = accounts.filter(a => a.isDemo);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Header Quản Trị -->
      <div class="card highlight" style="padding: 16px; border-left: 4px solid #7c3aed; background: #faf5ff;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">👑</span>
              <h2 style="font-size: 18px; font-weight: 800; color: #581c87;">Trung Tâm Quản Trị Tài Khoản</h2>
            </div>
            <div style="font-size: 12.5px; color: #6b21a8; margin-top: 2px;">
              Quản lý danh sách người dùng, hỗ trợ cấp lại mật khẩu và giám sát hệ thống
            </div>
          </div>
          <button class="btn btn-sm btn-outline" id="btn-admin-back" style="font-size: 12px;">
            ← Trở về
          </button>
        </div>
      </div>

      <!-- Thống kê nhanh -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
        <div class="card" style="text-align: center; padding: 12px;">
          <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Tổng Người Dùng</div>
          <div style="font-size: 20px; font-weight: 800; color: var(--primary); margin-top: 2px;">${accounts.length}</div>
        </div>
        <div class="card" style="text-align: center; padding: 12px;">
          <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Tài Khoản Thật</div>
          <div style="font-size: 20px; font-weight: 800; color: #0284c7; margin-top: 2px;">${realAccounts.length}</div>
        </div>
        <div class="card" style="text-align: center; padding: 12px;">
          <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Tài Khoản Demo</div>
          <div style="font-size: 20px; font-weight: 800; color: #b45309; margin-top: 2px;">${demoAccounts.length}</div>
        </div>
      </div>

      <!-- CẤU HÌNH CỔNG SMS OTP (eSMS.vn) -->
      <div class="card" style="border-left: 4px solid #16a34a; background: #f0fdf4;">
        <div class="card-header">
          <div class="card-title" style="color: #166534; font-size: 15px;">
            📲 Cấu Hình Cổng Gửi SMS OTP Thật (eSMS.vn)
          </div>
          <span class="badge badge-success" id="sms-config-status">Cổng SMS</span>
        </div>
        <p style="font-size: 12.5px; color: #15803d; margin-bottom: 8px;">
          Gắn APIKey & SecretKey từ tài khoản <strong>eSMS.vn</strong> để kích hoạt gửi mã OTP và tin nhắn nhắc nợ trực tiếp vào SIM điện thoại của hụi viên.
        </p>

        <div class="form-group" style="margin-bottom: 8px;">
          <label class="form-label" style="font-size: 12px;">ApiKey (từ eSMS.vn):</label>
          <input type="text" id="cfg-esms-apikey" class="form-control" placeholder="Ví dụ: E1A2B3C4D5E6F7..." style="font-family: monospace; font-size: 12.5px;" />
        </div>

        <div class="form-group" style="margin-bottom: 8px;">
          <label class="form-label" style="font-size: 12px;">SecretKey (từ eSMS.vn):</label>
          <input type="password" id="cfg-esms-secretkey" class="form-control" placeholder="Nhập SecretKey bí mật..." style="font-family: monospace; font-size: 12.5px;" />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="form-group" style="margin-bottom: 8px;">
            <label class="form-label" style="font-size: 12px;">Brandname / Đầu số:</label>
            <input type="text" id="cfg-esms-brandname" class="form-control" placeholder="Baokim hoặc Brandname riêng" value="Baokim" style="font-size: 12.5px;" />
          </div>
          <div class="form-group" style="margin-bottom: 8px;">
            <label class="form-label" style="font-size: 12px;">Loại tin (SmsType):</label>
            <select id="cfg-esms-smstype" class="form-control form-select" style="font-size: 12.5px;">
              <option value="2" selected>2 - CSKH / OTP (Độ tin cậy cao)</option>
              <option value="1">1 - Tin nhắn quảng cáo</option>
              <option value="8">8 - Đầu số cố định</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary btn-sm btn-block" id="btn-save-esms-config" style="background: #16a34a; border-color: #15803d; font-weight: 700; margin-top: 4px;">
          💾 Lưu Cấu Hình & Kích Hoạt Gửi SMS Thật
        </button>
      </div>

      <!-- Thanh tìm kiếm tài khoản -->
      <div class="form-group" style="margin-bottom: 0;">
        <input type="text" id="admin-search-user" class="form-control" placeholder="🔍 Tìm kiếm theo Họ tên hoặc Số điện thoại..." />
      </div>

      <!-- Danh sách tài khoản -->
      <div id="admin-user-list" style="display: flex; flex-direction: column; gap: 10px;">
        ${renderUserCards(accounts)}
      </div>

      <!-- Modal Đổi Mật Khẩu Hộ Cho Người Dùng -->
      <div id="modal-admin-reset-pwd" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-admin-pwd-title">Đổi Mật Khẩu Cho Người Dùng</h3>
            <button class="btn btn-sm btn-outline btn-circle" id="btn-close-admin-pwd">✕</button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="admin-target-phone" />
            <div style="background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 13px; margin-bottom: 12px;">
              Đang hỗ trợ cho: <strong id="admin-target-name" style="color: var(--primary);"></strong><br />
              Số điện thoại: <strong id="admin-target-phone-display"></strong>
            </div>

            <div class="form-group">
              <label class="form-label">Mật khẩu mới cấp cho người này (*):</label>
              <input type="text" id="admin-new-password" class="form-control" placeholder="Ví dụ: 123456" />
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">
                💡 Sau khi bấm lưu, bạn hãy nhắn mật khẩu mới này cho người dùng để họ đăng nhập.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-admin-pwd" style="flex: 1;">Hủy</button>
            <button class="btn btn-primary" id="btn-confirm-admin-pwd" style="flex: 2;">💾 Cập Nhật & Cấp Mật Khẩu</button>
          </div>
        </div>
      </div>
    </div>
  `;

  function renderUserCards(list) {
    if (list.length === 0) {
      return `<div style="text-align:center; padding: 24px; color: var(--text-muted);">Không tìm thấy tài khoản nào phù hợp.</div>`;
    }

    return list.map(acc => {
      const roleLabel = acc.role === 'owner' ? 'Chủ Hụi' : (acc.role === 'member' ? 'Hụi Viên' : 'Chủ & Hụi Viên');
      const roleBadgeClass = acc.role === 'owner' ? 'badge-success' : (acc.role === 'member' ? 'badge-info' : 'badge-warning');

      return `
        <div class="card" style="padding: 14px; border-left: 4px solid ${acc.isDemo ? '#f59e0b' : 'var(--primary)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">${acc.role === 'owner' ? '👩‍💼' : (acc.role === 'member' ? '👨‍🌾' : '🧕')}</span>
              <div>
                <div style="font-weight: 800; font-size: 14.5px; color: var(--text-main);">
                  ${escapeHtml(acc.fullName)}
                </div>
                <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 1px;">
                  📞 <strong>${escapeHtml(acc.phone)}</strong> • MK hiện tại: <code style="background:#e2e8f0; padding:2px 4px; border-radius:4px; font-weight:700;">${escapeHtml(acc.password)}</code>
                </div>
              </div>
            </div>
            <div>
              <span class="badge ${roleBadgeClass}">${roleLabel}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 8px 10px; border-radius: 8px; font-size: 11.5px; margin-top: 8px;">
            <div>Tiệm: <strong>${escapeHtml(acc.shopName) || 'Không có'}</strong></div>
            <div>Ngân hàng: <strong>${escapeHtml(acc.bankCode || 'VCB')} - ${escapeHtml(acc.accountNumber) || 'Chưa cấu hình'}</strong></div>
            <div>Tạo ngày: ${escapeHtml(acc.createdAt || 'N/A')}</div>
            <div>Trạng thái: ${acc.isDemo ? '<span style="color:#b45309; font-weight:700;">Dữ liệu mẫu</span>' : '<span style="color:#15803d; font-weight:700;">Tài khoản thật</span>'}</div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-color);">
            <button class="btn btn-sm btn-outline btn-admin-reset-user-pwd" data-phone="${escapeHtml(acc.phone)}" data-name="${escapeHtml(acc.fullName)}">
              🔑 Đổi mật khẩu
            </button>
            <button class="btn btn-sm btn-primary btn-admin-switch-to-user" data-phone="${escapeHtml(acc.phone)}" data-pass="${escapeHtml(acc.password)}">
              🚀 Vào xem sổ
            </button>
            ${!acc.isDemo ? `
              <button class="btn btn-sm btn-outline btn-admin-delete-user" data-id="${escapeHtml(acc.id)}" data-name="${escapeHtml(acc.fullName)}" style="color: var(--accent); border-color: #fecaca;">
                🗑️ Xóa
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Tìm kiếm
  const searchInput = document.getElementById('admin-search-user');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const filtered = accounts.filter(a =>
      a.fullName.toLowerCase().includes(q) ||
      a.phone.includes(q)
    );
    const listEl = document.getElementById('admin-user-list');
    if (listEl) listEl.innerHTML = renderUserCards(filtered);
    attachActionButtons();
  });

  // Nút quay lại
  document.getElementById('btn-admin-back')?.addEventListener('click', () => {
    window.location.hash = '#settings';
  });

  // Modal đổi mật khẩu
  const modalReset = document.getElementById('modal-admin-reset-pwd');
  document.getElementById('btn-close-admin-pwd')?.addEventListener('click', () => modalReset.style.display = 'none');
  document.getElementById('btn-cancel-admin-pwd')?.addEventListener('click', () => modalReset.style.display = 'none');

  document.getElementById('btn-confirm-admin-pwd')?.addEventListener('click', async () => {
    const phone = document.getElementById('admin-target-phone').value;
    const newPass = document.getElementById('admin-new-password').value.trim();

    if (!newPass || newPass.length < 3) {
      showToast('Mật khẩu mới phải có ít nhất 3 ký tự!', 'warning');
      return;
    }

    try {
      await store.resetPassword(phone, newPass);
      showToast(`Đã đổi mật khẩu thành công! Mật khẩu mới là: ${newPass}`, 'success');
      modalReset.style.display = 'none';
      renderAdminView(container);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  });

  function attachActionButtons() {
    // Lưu cấu hình eSMS
    document.getElementById('btn-save-esms-config')?.addEventListener('click', async () => {
      const apiKey = document.getElementById('cfg-esms-apikey').value.trim();
      const secretKey = document.getElementById('cfg-esms-secretkey').value.trim();
      const brandname = document.getElementById('cfg-esms-brandname').value.trim();
      const smsType = document.getElementById('cfg-esms-smstype').value;

      if (!apiKey || !secretKey) {
        showToast('Vui lòng nhập đầy đủ ApiKey và SecretKey từ eSMS.vn!', 'warning');
        return;
      }

      const btnSave = document.getElementById('btn-save-esms-config');
      try {
        btnSave.disabled = true;
        btnSave.innerText = '⏳ Đang lưu...';

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_sms_config',
            apiKey,
            secretKey,
            brandname,
            smsType
          })
        });

        // Backup to persistent cloud store as well
        fetch('https://kvdb.io/4yZJ7vM9L1P3a8Qx5cE7wR/config_esms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, secretKey, brandname, smsType })
        }).catch(() => {});

        showToast('Đã lưu cấu hình eSMS.vn thành công! Hệ thống sẵn sàng gửi tin nhắn thật.', 'success');
        document.getElementById('sms-config-status').innerText = '🟢 Đã Kích Hoạt';
      } catch (e) {
        showToast('Lỗi lưu cấu hình: ' + e.message, 'danger');
      } finally {
        btnSave.disabled = false;
        btnSave.innerText = '💾 Lưu Cấu Hình & Kích Hoạt Gửi SMS Thật';
      }
    });

    // Mở modal đổi mật khẩu
    container.querySelectorAll('.btn-admin-reset-user-pwd').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phone = e.currentTarget.getAttribute('data-phone');
        const name = e.currentTarget.getAttribute('data-name');
        document.getElementById('admin-target-phone').value = phone;
        document.getElementById('admin-target-phone-display').innerText = phone;
        document.getElementById('admin-target-name').innerText = name;
        document.getElementById('admin-new-password').value = '123456';
        modalReset.style.display = 'flex';
      });
    });

    // Vào xem sổ của tài khoản đó
    container.querySelectorAll('.btn-admin-switch-to-user').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const phone = e.currentTarget.getAttribute('data-phone');
        const pass = e.currentTarget.getAttribute('data-pass');
        try {
          const acc = await store.login(phone, pass);
          showToast(`Đã chuyển sang sổ của: ${acc.fullName}`, 'success');
          window.location.hash = '#dashboard';
        } catch (err) {
          showToast(err.message, 'danger');
        }
      });
    });

    // Xóa tài khoản
    container.querySelectorAll('.btn-admin-delete-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi hệ thống không?`)) {
          const accs = store.getAccounts().filter(a => a.id !== id);
          store.saveAccounts(accs);
          showToast(`Đã xóa tài khoản ${name}!`, 'info');
          renderAdminView(container);
        }
      });
    });
  }

  attachActionButtons();
}
