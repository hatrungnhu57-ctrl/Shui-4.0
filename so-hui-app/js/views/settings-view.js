/**
 * MÀN HÌNH CÀI ĐẶT SỔ HỤI, TÀI KHOẢN & ĐỒNG BỘ ĐÁM MÂY (SETTINGS & CLOUD SYNC)
 * Cấu hình chủ hụi, thiết lập Ngân hàng & VietQR, Khóa mã PIN, Đổi mật khẩu,
 * Đồng bộ đám mây trực tuyến và Sao lưu khôi phục JSON
 */

import { store } from '../store.js';
import { showToast, VIETNAMESE_BANKS, generateVietQRUrl, exportJSONFile, formatDateTime, escapeHtml } from '../utils.js';
import { cloudSync } from '../cloud-sync.js';

export function renderSettingsView(container) {
  const acc = store.currentAccount;
  const groups = store.state.groups;
  const profiles = store.state.profiles.filter(p => !p.isMerged);
  const receipts = store.state.receipts;

  const currentBankCode = acc.bankCode || 'VCB';
  const qrPreviewUrl = generateVietQRUrl(currentBankCode, acc.accountNumber || '', acc.accountHolder || acc.fullName, 1000000, 'Dong tien hui mau');

  const lastSyncStr = cloudSync.lastSyncedTime ? formatDateTime(cloudSync.lastSyncedTime) : 'Vừa mới xong';

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
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${escapeHtml(acc.fullName)}</h3>
              <div style="font-size: 12px; color: var(--text-muted);">
                📞 ${escapeHtml(acc.phone)} • ${acc.role === 'owner' ? 'Chủ Hụi' : (acc.role === 'member' ? 'Hụi Viên' : 'Chủ & Hụi Viên')}
                ${acc.isDemo ? '<span class="badge badge-warning" style="margin-left:4px;">Dữ liệu mẫu</span>' : '<span class="badge badge-success" style="margin-left:4px;">Sổ thực tế</span>'}
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" id="btn-switch-or-logout" title="Đăng xuất / Đổi tài khoản">
            🚪 Đổi TK
          </button>
        </div>
        <button class="btn btn-sm btn-outline" id="btn-open-admin-panel" style="background: #faf5ff; border-color: #c084fc; color: #7c3aed; font-weight: 700; margin-top: 10px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px;">
          👑 Trung Tâm Quản Trị Hệ Thống (${store.getAccounts().length} Tài Khoản)
        </button>
      </div>

      <!-- CARD 1: ĐỒNG BỘ ĐÁM MÂY (CLOUD SYNC 24/7 - CROSS-DEVICE) -->
      <div class="card" style="border-left: 4px solid #0284c7; background: #f0f9ff;">
        <div class="card-header">
          <div class="card-title" style="color: #0369a1;">
            ☁️ Đồng Bộ Đám Mây & Chuyển Thiết Bị
          </div>
          <span class="badge ${cloudSync.isOnline ? 'badge-success' : 'badge-warning'}" id="cloud-status-badge">
            ${cloudSync.isOnline ? '🟢 Đang Online' : '🟡 Ngoại tuyến'}
          </span>
        </div>
        <div style="font-size: 12.5px; color: #0c4a6e;">
          Toàn bộ sổ sách của bạn được tự động sao lưu lên Đám mây. Bạn có thể mở máy tính hoặc điện thoại khác, đăng nhập bằng SĐT <strong>${escapeHtml(acc.phone)}</strong> để xem sổ liền tức thì.
        </div>

        <div style="background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #bae6fd; font-size: 12.5px; display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <div>
            <span style="color: var(--text-muted);">Lần đồng bộ gần nhất:</span>
            <strong id="cloud-last-sync-text" style="color: var(--text-main); margin-left: 4px;">${lastSyncStr}</strong>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-manual-cloud-sync" style="background: #0284c7; border-color: #0284c7; padding: 4px 10px; font-size: 12px;">
            🔄 Đồng bộ ngay
          </button>
        </div>

        <!-- Nút Tạo mã đồng bộ sang máy khác -->
        <button class="btn btn-sm btn-outline btn-block" id="btn-generate-sync-code" style="margin-top: 8px; background: #ffffff; border-color: #38bdf8; color: #0284c7; font-weight: 700; padding: 9px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>📲</span>
          <span>Tạo Mã Đồng Bộ / QR Sang Điện Thoại Khác</span>
        </button>
      </div>

      <!-- MODAL HIỂN THỊ MÃ ĐỒNG BỘ THIẾT BỊ -->
      <div id="modal-sync-code-display" class="modal-overlay" style="display: none; z-index: 300;">
        <div class="modal-content" style="max-width: 360px; text-align: center;">
          <div class="modal-header">
            <h3 class="modal-title">📲 Mã Đồng Bộ Thiết Bị</h3>
            <button class="btn btn-sm btn-outline btn-circle" id="btn-close-sync-code-modal">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 12.5px; color: var(--text-muted);">
              Mở app Sổ Hụi trên máy mới, ở màn hình Đăng Nhập hãy nhập mã sau để đồng bộ toàn bộ dữ liệu:
            </p>

            <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 10px; padding: 14px; margin: 12px 0;">
              <div style="font-size: 11.5px; color: #166534; font-weight: 600; text-transform: uppercase;">MÃ ĐỒNG BỘ CỦA BẠN</div>
              <div id="sync-code-val-display" style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: var(--primary); margin: 6px 0;">
                SH-8899
              </div>
              <button class="btn btn-sm btn-primary" id="btn-copy-sync-code" style="font-size: 11.5px; padding: 4px 10px;">
                📋 Sao Chép Mã
              </button>
            </div>

            <div style="font-size: 12px; color: #64748b; line-height: 1.4; text-align: left; background: #f8fafc; padding: 8px 10px; border-radius: 6px;">
              ✅ <strong>Cách sử dụng trên máy mới:</strong><br/>
              1. Truy cập app Sổ Hụi trên điện thoại mới.<br/>
              2. Nhập mã <strong id="sync-code-instruction">SH-8899</strong> vào ô <em>"Đồng bộ nhanh"</em>.<br/>
              3. Bấm <strong>"⚡ Đồng Bộ"</strong> ➔ Toàn bộ dây hụi và tài khoản được tải về ngay lập tức!
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-block" id="btn-done-sync-code">Đã Hiểu & Đóng</button>
          </div>
        </div>
      </div>

      <!-- CARD 2: THÔNG TIN CHỦ HỤI & TIỆM HỤI -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            👤 Thông tin Cá nhân & Tiệm Hụi
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Họ và tên:</label>
          <input type="text" id="set-fullname" class="form-control" value="${escapeHtml(acc.fullName || '')}" />
        </div>

        <div class="form-group">
          <label class="form-label">Tên Tiệm Hụi / Sổ Hụi (in trên biên nhận):</label>
          <input type="text" id="set-shopname" class="form-control" value="${escapeHtml(acc.shopName || '')}" placeholder="Ví dụ: Sổ Hụi Cô Bảy - Chợ Trà Vinh" />
        </div>

        <div class="form-group">
          <label class="form-label">Địa chỉ hoạt động / Khu vực chợ:</label>
          <input type="text" id="set-address" class="form-control" value="${escapeHtml(acc.address || '')}" placeholder="Ví dụ: Khóm 1, Phường 2, TP. Trà Vinh" />
        </div>

        <button class="btn btn-primary btn-sm" id="btn-save-profile" style="align-self: flex-start;">
          💾 Lưu Thông Tin Cá Nhân
        </button>
      </div>

      <!-- CARD 3: CẤU HÌNH NGÂN HÀNG & VIETQR TỰ ĐỘNG -->
      <div class="card" style="border-left: 4px solid var(--primary);">
        <div class="card-header">
          <div class="card-title">
            💳 Tài khoản Ngân hàng & VietQR Chuẩn
          </div>
          <span class="badge badge-success">NAPAS 247</span>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Dùng để tự động sinh mã QR có sẵn số tiền và nội dung cho hụi viên quét nộp tiền kỳ hụi nhanh chóng và chính xác 100%.
        </div>

        <div class="form-group">
          <label class="form-label">Ngân hàng nhận tiền:</label>
          <select id="set-bank-code" class="form-control form-select">
            ${VIETNAMESE_BANKS.map(b => `<option value="${escapeHtml(b.code)}" ${b.code === currentBankCode ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Số tài khoản ngân hàng:</label>
          <input type="text" id="set-bank-acc" class="form-control" value="${escapeHtml(acc.accountNumber || '')}" placeholder="Nhập số tài khoản ngân hàng..." />
        </div>

        <div class="form-group">
          <label class="form-label">Tên chủ tài khoản (không dấu):</label>
          <input type="text" id="set-bank-holder" class="form-control" value="${escapeHtml(acc.accountHolder || acc.fullName || '')}" placeholder="Ví dụ: NGUYEN THI BAY" />
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
        <div id="qr-preview-box" style="display: none; background: #f8fafc; border: 1px dashed var(--border-color); border-radius: 8px; padding: 12px; text-align: center; margin-top: 8px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px; color: var(--text-main);">
            Mẫu mã VietQR tự sinh khi thu tiền:
          </div>
          <img id="qr-preview-img" src="${qrPreviewUrl}" alt="VietQR" style="max-width: 220px; border-radius: 8px; box-shadow: var(--shadow-sm);" />
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 6px;">
            Hụi viên mở bất kỳ ứng dụng ngân hàng nào quét mã này là thanh toán được ngay!
          </div>
        </div>
      </div>

      <!-- CARD 4: ĐỔI MẬT KHẨU TÀI KHOẢN -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            🔑 Đổi Mật Khẩu Đăng Nhập
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Mật khẩu mới:</label>
          <input type="password" id="set-new-password" class="form-control" placeholder="Nhập ít nhất 3 ký tự..." />
        </div>
        <button class="btn btn-outline btn-sm" id="btn-change-password" style="align-self: flex-start;">
          🔒 Cập Nhật Mật Khẩu Mới
        </button>
      </div>

      <!-- CARD 5: BẢO MẬT & MÃ PIN KHÓA APP -->
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

      <!-- CARD 6: SAO LƯU & KHÔI PHỤC DỮ LIỆU FILE (OFFLINE BACKUP & RESTORE) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            💾 Xuất File Sao Lưu Cục Bộ
          </div>
        </div>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Dữ liệu sổ hụi (${groups.length} dây, ${profiles.length} hụi viên, ${receipts.length} biên nhận). Bạn có thể tải file sao lưu về máy để lưu trữ trên Zalo, Google Drive phòng ngừa.
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
          <button class="btn btn-primary btn-block" id="btn-export-backup" style="padding: 12px;">
            📥 Tải File Sao Lưu Sổ Hụi (.sohui / .json)
          </button>

          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="file" id="input-restore-file" accept=".json,.sohui" style="display: none;" />
            <button class="btn btn-outline btn-block" id="btn-trigger-restore" style="padding: 10px;">
              📤 Khôi Phục Sổ Từ File Đã Lưu
            </button>
          </div>
        </div>
      </div>

      <!-- CARD 7: QUẢN LÝ TRẠNG THÁI DỮ LIỆU -->
      <div class="card" style="border-color: #fecaca; background: #fffaf0;">
        <div class="card-header">
          <div class="card-title" style="color: #991b1b;">
            ⚠️ Quản Lý Trạng Thái Dữ Liệu
          </div>
        </div>
        <div style="font-size: 12.5px; color: #78350f;">
          Bạn có thể xóa toàn bộ dữ liệu mẫu để bắt đầu tạo sổ hụi thực tế sạch sẽ, hoặc nạp lại dữ liệu mẫu để hướng dẫn người khác.
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
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

  // Sự kiện Đồng bộ Cloud thủ công
  document.getElementById('btn-manual-cloud-sync')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-manual-cloud-sync');
    try {
      if (btn) {
        btn.disabled = true;
        btn.innerText = '⏳ Đang đồng bộ...';
      }
      await store.syncWithCloudNow();
      showToast('Đã đồng bộ toàn bộ sổ hụi lên Đám mây thành công!', 'success');
      const text = document.getElementById('cloud-last-sync-text');
      if (text) text.innerText = formatDateTime(new Date().toISOString());
    } catch (e) {
      showToast('Lỗi đồng bộ: ' + e.message, 'danger');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '🔄 Đồng bộ ngay';
      }
    }
  });

  // Sự kiện Tạo Mã Đồng Bộ Thiết Bị
  const modalSyncCode = document.getElementById('modal-sync-code-display');
  let currentGeneratedSyncCode = '';

  document.getElementById('btn-generate-sync-code')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-generate-sync-code');
    try {
      if (btn) {
        btn.disabled = true;
        btn.innerText = '⏳ Đang tạo mã...';
      }
      const ledger = store.exportJSONData();
      const code = await cloudSync.createSyncCode(acc, ledger);
      currentGeneratedSyncCode = code;

      document.getElementById('sync-code-val-display').innerText = code;
      document.getElementById('sync-code-instruction').innerText = code;
      modalSyncCode.style.display = 'flex';
      showToast('Đã tạo mã đồng bộ thiết bị thành công!', 'success');
    } catch (e) {
      showToast(e.message, 'danger');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '📲 Tạo Mã Đồng Bộ / QR Sang Điện Thoại Khác';
      }
    }
  });

  document.getElementById('btn-close-sync-code-modal')?.addEventListener('click', () => {
    modalSyncCode.style.display = 'none';
  });
  document.getElementById('btn-done-sync-code')?.addEventListener('click', () => {
    modalSyncCode.style.display = 'none';
  });
  document.getElementById('btn-copy-sync-code')?.addEventListener('click', () => {
    if (currentGeneratedSyncCode && navigator.clipboard) {
      navigator.clipboard.writeText(currentGeneratedSyncCode);
      showToast(`Đã sao chép mã ${currentGeneratedSyncCode}!`, 'success');
    }
  });

  // Sự kiện Đổi mật khẩu
  document.getElementById('btn-change-password')?.addEventListener('click', async () => {
    const newPass = document.getElementById('set-new-password').value;
    if (!newPass || newPass.length < 3) {
      showToast('Mật khẩu mới phải có ít nhất 3 ký tự!', 'warning');
      return;
    }

    try {
      await store.resetPassword(acc.phone, newPass);
      showToast('Cập nhật mật khẩu mới thành công!', 'success');
      document.getElementById('set-new-password').value = '';
    } catch (e) {
      showToast(e.message, 'danger');
    }
  });

  // Lưu thông tin cá nhân
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

  // Lưu tài khoản ngân hàng
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

    const newUrl = generateVietQRUrl(bankCode, accountNumber, accountHolder, 1000000, 'Dong tien hui');
    const imgEl = document.getElementById('qr-preview-img');
    if (imgEl) imgEl.src = newUrl;
  });

  // Xem trước QR
  document.getElementById('btn-preview-qr')?.addEventListener('click', () => {
    const box = document.getElementById('qr-preview-box');
    if (box) {
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
  });

  // Lưu PIN
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

  // Xóa PIN
  document.getElementById('btn-remove-pin')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn tắt khóa mã PIN không?')) {
      store.setPinCode('');
      showToast('Đã tắt khóa mã PIN!', 'info');
      renderSettingsView(container);
    }
  });

  // Tải file sao lưu
  document.getElementById('btn-export-backup')?.addEventListener('click', () => {
    const backupData = store.exportBackup();
    const filename = `so_hui_backup_${acc.phone}_${new Date().toISOString().split('T')[0]}.sohui`;
    exportJSONFile(filename, backupData);
    showToast('Đã xuất file sao lưu thành công!', 'success');
  });

  // Khôi phục từ file
  const fileInput = document.getElementById('input-restore-file');
  document.getElementById('btn-trigger-restore')?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        store.importBackup(content);
        showToast('Khôi phục dữ liệu sổ hụi thành công!', 'success');
        renderSettingsView(container);
      } catch (err) {
        showToast('Lỗi nạp file: ' + err.message, 'danger');
      }
    };
    reader.readAsText(file);
  });

  // Xóa sạch dữ liệu bắt đầu sổ thật
  document.getElementById('btn-clear-real-data')?.addEventListener('click', () => {
    if (confirm('CẢNH BÁO: Thao tác này sẽ xóa sạch toàn bộ dây hụi và lịch sử đóng tiền của tài khoản này để bạn tạo sổ thật. Bạn có chắc chắn muốn tiếp tục?')) {
      store.clearCurrentAccountData();
      showToast('Đã làm sạch sổ! Bạn có thể bắt đầu tạo dây hụi thật.', 'success');
      renderSettingsView(container);
    }
  });

  // Nạp lại dữ liệu mẫu
  document.getElementById('btn-load-demo-sample')?.addEventListener('click', () => {
    if (confirm('Bạn có muốn nạp lại dữ liệu hụi mẫu để tập sử dụng không?')) {
      store.resetToDemoData();
      showToast('Đã nạp lại dữ liệu mẫu thành công!', 'success');
      renderSettingsView(container);
    }
  });

  // Đổi tài khoản / Đăng xuất
  document.getElementById('btn-switch-or-logout')?.addEventListener('click', () => {
    window.location.hash = '#auth';
  });

  // Mở trang Quản trị Admin
  document.getElementById('btn-open-admin-panel')?.addEventListener('click', () => {
    window.location.hash = '#admin';
  });
}
