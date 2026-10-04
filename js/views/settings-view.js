/**
 * MÀN HÌNH CÀI ĐẶT SỔ HỤI & TÀI KHOẢN (SETTINGS & DATA MANAGEMENT)
 * Cấu hình chủ hụi, thiết lập Ngân hàng & VietQR, Khóa mã PIN, Sao lưu & Khôi phục JSON
 */

import { store } from '../store.js';
import { showToast, VIETNAMESE_BANKS, generateVietQRUrl, exportJSONFile } from '../utils.js';

export function renderSettingsView(container) {
  const acc = store.currentAccount;
  const groups = store.state.groups;
  const profiles = store.state.profiles.filter(p => !p.isMerged);
  const receipts = store.state.receipts;

  const currentBankCode = acc.bankCode || 'VCB';
  const qrPreviewUrl = generateVietQRUrl(currentBankCode, acc.accountNumber || '', acc.accountHolder || acc.fullName, 1000000, 'Dong tien hui mau');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Tiêu đề Header của Cài đặt -->
      <div class="card highlight" style="padding: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff;">
              ${acc.role === 'owner' ? '👩‍💼' : (acc.role === 'member' ? '👨‍🌾' : '🧕')}
            </div>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${acc.fullName}</h3>
              <div style="font-size: 12px; color: var(--text-muted);">
                📞 ${acc.phone} • ${acc.role === 'owner' ? 'Chủ Hụi' : (acc.role === 'member' ? 'Hụi Viên' : 'Chủ & Hụi Viên')}
                ${acc.isDemo ? '<span class="badge badge-warning" style="margin-left:4px;">Dữ liệu mẫu</span>' : '<span class="badge badge-success" style="margin-left:4px;">Sổ thực tế</span>'}
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" id="btn-switch-or-logout" title="Đăng xuất / Đổi tài khoản">
            🚪 Đổi TK
          </button>
        </div>
      </div>

      <!-- CARD 1: THÔNG TIN CHỦ HỤI & TIỆM HỤI -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            👤 Thông tin Cá nhân & Tiệm Hụi
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Họ và tên:</label>
          <input type="text" id="set-fullname" class="form-control" value="${acc.fullName || ''}" />
        </div>

        <div class="form-group">
          <label class="form-label">Tên Tiệm Hụi / Sổ Hụi (in trên biên nhận):</label>
          <input type="text" id="set-shopname" class="form-control" value="${acc.shopName || ''}" placeholder="Ví dụ: Sổ Hụi Cô Bảy - Chợ Trà Vinh" />
        </div>

        <div class="form-group">
          <label class="form-label">Địa chỉ hoạt động / Khu vực chợ:</label>
          <input type="text" id="set-address" class="form-control" value="${acc.address || ''}" placeholder="Ví dụ: Khóm 1, Phường 2, TP. Trà Vinh" />
        </div>

        <button class="btn btn-primary btn-sm" id="btn-save-profile" style="align-self: flex-start;">
          💾 Lưu Thông Tin Cá Nhân
        </button>
      </div>

      <!-- CARD 2: CẤU HÌNH NGÂN HÀNG & VIETQR TỰ ĐỘNG -->
      <div class="card" style="border-left: 4px solid var(--primary);">
        <div class="card-header">
          <div class="card-title">
            💳 Tài khoản Ngân hàng & VietQR Chuẩn
          </div>
          <span class="badge badge-success">NAPAS 247</span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Thông tin này dùng để tự động sinh mã QR có sẵn số tiền và nội dung cho hụi viên quét nộp tiền kỳ hụi nhanh chóng và chính xác 100%.
        </div>

        <div class="form-group">
          <label class="form-label">Ngân hàng nhận tiền:</label>
          <select id="set-bank-code" class="form-control form-select">
            ${VIETNAMESE_BANKS.map(b => `<option value="${b.code}" ${b.code === currentBankCode ? 'selected' : ''}>${b.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Số tài khoản ngân hàng:</label>
          <input type="text" id="set-bank-acc" class="form-control" value="${acc.accountNumber || ''}" placeholder="Nhập số tài khoản ngân hàng..." />
        </div>

        <div class="form-group">
          <label class="form-label">Tên chủ tài khoản (không dấu):</label>
          <input type="text" id="set-bank-holder" class="form-control" value="${acc.accountHolder || acc.fullName || ''}" placeholder="Ví dụ: NGUYEN THI BAY" />
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-save-bank">
            💾 Cập Nhật Tài Khoản Ngân Hàng
          </button>
          <button class="btn btn-outline btn-sm" id="btn-preview-qr">
            📱 Xem Thử Mã VietQR
          </button>
        </div>

        <!-- Khung hiển thị xem thử QR -->
        <div id="qr-preview-box" style="display: none; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px; color: var(--text-main);">
            Mẫu mã VietQR tự sinh khi thu tiền:
          </div>
          <img id="qr-preview-img" src="${qrPreviewUrl}" alt="VietQR" style="max-width: 220px; border-radius: 8px; box-shadow: var(--shadow-sm);" />
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px;">
            Hụi viên mở bất kỳ ứng dụng ngân hàng nào quét mã này là thanh toán được ngay!
          </div>
        </div>
      </div>

      <!-- CARD 3: BẢO MẬT & MÃ PIN KHÓA APP -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            🔒 Khóa Ứng Dụng Bằng Mã PIN
          </div>
          <span class="badge ${acc.pinCode ? 'badge-success' : 'badge-gray'}">
            ${acc.pinCode ? 'Đã bật PIN' : 'Chưa cài PIN'}
          </span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Cài mã PIN (4 hoặc 6 số) để bảo mật sổ hụi của bạn khi cho người thân hoặc khách mượn điện thoại.
        </div>

        <div class="form-group">
          <label class="form-label">${acc.pinCode ? 'Đổi mã PIN mới (hoặc để trống để tắt):' : 'Thiết lập mã PIN mới:'}</label>
          <input type="password" id="set-pincode" class="form-control" maxlength="6" placeholder="Nhập 4-6 chữ số bí mật..." />
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-save-pin">
            ${acc.pinCode ? '🔑 Đổi Mã PIN' : '🔒 Kích Hoạt Mã PIN'}
          </button>
          ${acc.pinCode ? `
            <button class="btn btn-outline btn-sm" id="btn-remove-pin" style="color: var(--accent);">
              ✕ Tắt Khóa PIN
            </button>
          ` : ''}
        </div>
      </div>

      <!-- CARD 4: SAO LƯU & KHÔI PHỤC DỮ LIỆU (BACKUP & RESTORE) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            💾 Sao Lưu & Khôi Phục Dữ Liệu
          </div>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Dữ liệu sổ hụi (${groups.length} dây, ${profiles.length} hụi viên, ${receipts.length} biên nhận) được lưu trữ an toàn trên thiết bị của bạn. Bạn nên xuất file sao lưu định kỳ để không bao giờ sợ mất dữ liệu.
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Nút Tải file Sao lưu -->
          <button class="btn btn-primary btn-block" id="btn-export-backup" style="padding: 12px;">
            📥 Tải File Sao Lưu Sổ Hụi (.sohui / .json)
          </button>

          <!-- Nút Khôi phục từ File -->
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="file" id="input-restore-file" accept=".json,.sohui" style="display: none;" />
            <button class="btn btn-outline btn-block" id="btn-trigger-restore" style="padding: 10px;">
              📤 Khôi Phục Sổ Từ File Đã Lưu
            </button>
          </div>
        </div>
      </div>

      <!-- CARD 5: CHUYỂN ĐỔI SỔ THỰC TẾ & RESET DỮ LIỆU -->
      <div class="card" style="border-color: #fecaca; background: #fffaf0;">
        <div class="card-header">
          <div class="card-title" style="color: #991b1b;">
            ⚠️ Quản Lý Trạng Thái Dữ Liệu
          </div>
        </div>
        <div style="font-size: 12.5px; color: #78350f;">
          Bạn có thể xóa toàn bộ dữ liệu mẫu để bắt đầu tạo sổ hụi thực tế sạch sẽ, hoặc nạp lại dữ liệu mẫu để hướng dẫn người khác.
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-danger btn-sm" id="btn-clear-real-data">
            🧹 Xóa Hết Dữ Liệu (Bắt đầu Sổ Thật)
          </button>
          <button class="btn btn-outline btn-sm" id="btn-load-demo-sample">
            🔄 Nạp Lại Dữ Liệu Mẫu
          </button>
        </div>
      </div>
    </div>
  `;

  // Sự kiện lưu thông tin cá nhân
  document.getElementById('btn-save-profile')?.addEventListener('click', () => {
    const fullName = document.getElementById('set-fullname').value.trim();
    const shopName = document.getElementById('set-shopname').value.trim();
    const address = document.getElementById('set-address').value.trim();

    if (!fullName) {
      showToast('Vui lòng nhập họ tên!', 'warning');
      return;
    }

    store.updateCurrentAccount({ fullName, shopName, address });
    showToast('Đã lưu thông tin cá nhân thành công!', 'success');
  });

  // Sự kiện lưu tài khoản ngân hàng
  document.getElementById('btn-save-bank')?.addEventListener('click', () => {
    const bankCode = document.getElementById('set-bank-code').value;
    const accountNumber = document.getElementById('set-bank-acc').value.trim();
    const accountHolder = document.getElementById('set-bank-holder').value.trim();

    const selectedBank = VIETNAMESE_BANKS.find(b => b.code === bankCode);

    store.updateCurrentAccount({
      bankCode,
      bankName: selectedBank ? selectedBank.name : bankCode,
      accountNumber,
      accountHolder: accountHolder.toUpperCase()
    });

    showToast('Đã cập nhật thông tin Ngân hàng VietQR thành công!', 'success');

    // Cập nhật ảnh preview
    const newUrl = generateVietQRUrl(bankCode, accountNumber, accountHolder, 1000000, 'Dong tien hui');
    const imgEl = document.getElementById('qr-preview-img');
    if (imgEl) imgEl.src = newUrl;
  });

  // Sự kiện xem trước QR
  document.getElementById('btn-preview-qr')?.addEventListener('click', () => {
    const box = document.getElementById('qr-preview-box');
    if (box) {
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Sự kiện lưu PIN
  document.getElementById('btn-save-pin')?.addEventListener('click', () => {
    const pin = document.getElementById('set-pincode').value.trim();
    if (!pin || pin.length < 4) {
      showToast('Mã PIN phải có từ 4 đến 6 số!', 'warning');
      return;
    }
    store.setPinCode(pin);
    showToast('Đã cài đặt mã PIN bảo vệ ứng dụng thành công!', 'success');
    renderSettingsView(container);
  });

  // Sự kiện xóa PIN
  document.getElementById('btn-remove-pin')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn tắt khóa mã PIN không?')) {
      store.setPinCode('');
      showToast('Đã tắt khóa mã PIN!', 'info');
      renderSettingsView(container);
    }
  });

  // Sự kiện tải file sao lưu
  document.getElementById('btn-export-backup')?.addEventListener('click', () => {
    const backupData = store.exportBackup();
    const dateSlug = new Date().toISOString().split('T')[0];
    const filename = `SoHui_Backup_${acc.fullName.replace(/\s+/g, '_')}_${dateSlug}.sohui`;
    exportJSONFile(filename, backupData);
    showToast('Đã tải file sao lưu về máy thành công!', 'success');
  });

  // Sự kiện kích hoạt input file khôi phục
  document.getElementById('btn-trigger-restore')?.addEventListener('click', () => {
    document.getElementById('input-restore-file')?.click();
  });

  document.getElementById('input-restore-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        store.importBackup(event.target.result);
        showToast('Khôi phục dữ liệu từ file sao lưu thành công!', 'success');
        window.location.hash = '#dashboard';
      } catch (err) {
        showToast(err.message, 'danger');
      }
    };
    reader.readAsText(file);
  });

  // Sự kiện Xóa dữ liệu sạch để làm thật
  document.getElementById('btn-clear-real-data')?.addEventListener('click', () => {
    if (confirm('⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA HẾT DỮ LIỆU ĐỂ BẮT ĐẦU SỔ HỤI THỰC TẾ KHÔNG?\n\n(Thao tác này sẽ xóa sạch danh sách dây hụi và các biên nhận hiện t��i để bạn nhập dữ liệu thật của mình)')) {
      store.clearCurrentAccountData();
      store.updateCurrentAccount({ isDemo: false });
      showToast('Đã tạo sổ hụi thực tế sạch sẽ 100%! Hãy bắt đầu thêm danh bạ và tạo dây hụi.', 'success');
      window.location.hash = '#dashboard';
    }
  });

  // Sự kiện Nạp lại dữ liệu mẫu
  document.getElementById('btn-load-demo-sample')?.addEventListener('click', () => {
    if (confirm('Bạn có muốn nạp lại dữ liệu mẫu ban đầu (Cô Bảy, Anh Ba Khía...) không?')) {
      store.resetToDemoData();
      showToast('Đã nạp lại dữ liệu mẫu thành công!', 'info');
      window.location.hash = '#dashboard';
    }
  });

  // Sự kiện đổi tài khoản / Đăng xuất
  document.getElementById('btn-switch-or-logout')?.addEventListener('click', () => {
    window.location.hash = '#auth';
  });
}
