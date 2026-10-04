/**
 * CÁC HÀM TIỆN ÍCH DÙNG CHUNG (UI UTILS & VIETQR & BACKUP & SECURITY)
 */

// Danh sách ngân hàng Việt Nam hỗ trợ chuẩn VietQR NAPAS247
export const VIETNAMESE_BANKS = [
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương)', bin: '970436', shortName: 'Vietcombank' },
  { code: 'MB', name: 'MBBank (Quân Đội)', bin: '970422', shortName: 'MBBank' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương)', bin: '970407', shortName: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)', bin: '970418', shortName: 'BIDV' },
  { code: 'CTG', name: 'VietinBank (Công Thương)', bin: '970415', shortName: 'VietinBank' },
  { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416', shortName: 'ACB' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', bin: '970432', shortName: 'VPBank' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)', bin: '970423', shortName: 'TPBank' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)', bin: '970403', shortName: 'Sacombank' },
  { code: 'HDB', name: 'HDBank (Phát Triển TP.HCM)', bin: '970437', shortName: 'HDBank' },
  { code: 'VIB', name: 'VIB (Quốc Tế)', bin: '970441', shortName: 'VIB' },
  { code: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)', bin: '970443', shortName: 'SHB' },
  { code: 'MSB', name: 'MSB (Hàng Hải)', bin: '970426', shortName: 'MSB' },
  { code: 'OCB', name: 'OCB (Phương Đông)', bin: '970448', shortName: 'OCB' },
  { code: 'LPB', name: 'LPBank (Lộc Phát Việt Nam)', bin: '970449', shortName: 'LPBank' },
  { code: 'SEAB', name: 'SeABank (Đông Nam Á)', bin: '970440', shortName: 'SeABank' },
  { code: 'VAB', name: 'VietABank (Việt Á)', bin: '970427', shortName: 'VietABank' },
  { code: 'NCB', name: 'NCB (Quốc Dân)', bin: '970419', shortName: 'NCB' },
  { code: 'BAB', name: 'BacABank (Bắc Á)', bin: '970409', shortName: 'BacABank' },
  { code: 'BVB', name: 'BaoVietBank (Bảo Việt)', bin: '970438', shortName: 'BaoVietBank' },
  { code: 'SGB', name: 'SaigonBank (Sài Gòn Công Thương)', bin: '970400', shortName: 'SaigonBank' },
  { code: 'PVC', name: 'PVcomBank (Đại Chúng)', bin: '970412', shortName: 'PVcomBank' },
  { code: 'NAB', name: 'NamABank (Nam Á)', bin: '970428', shortName: 'NamABank' },
  { code: 'KLB', name: 'KienLongBank (Kiên Long)', bin: '970452', shortName: 'KienLongBank' },
  { code: 'VBB', name: 'VietBank (Việt Nam Thương Tín)', bin: '970433', shortName: 'VietBank' },
  { code: 'ABB', name: 'ABBANK (An Bình)', bin: '970425', shortName: 'ABBANK' },
  { code: 'VBA', name: 'Agribank (Nông Nghiệp)', bin: '970405', shortName: 'Agribank' },
  { code: 'CAKE', name: 'CAKE by VPBank', bin: '546034', shortName: 'CAKE' },
  { code: 'TIMO', name: 'Timo by BVBank', bin: '963388', shortName: 'Timo' }
];

/**
 * Xử lý phòng chống Cross-Site Scripting (XSS) cho chuỗi người dùng nhập
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatMoney(amount) {
  if (!amount && amount !== 0) return '0 đ';
  return Number(amount).toLocaleString('vi-VN') + ' đ';
}

/**
 * Định dạng số với dấu chấm ngăn cách hàng nghìn (VD: 2000000 -> 2.000.000)
 */
export function formatNumberWithDots(val) {
  if (val === null || val === undefined || val === '') return '';
  const numStr = val.toString().replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('vi-VN');
}

/**
 * Chuyển chuỗi có dấu chấm thành số nguyên (VD: "2.000.000" -> 2000000)
 */
export function parseNumberFromDots(str) {
  if (!str) return 0;
  const numStr = str.toString().replace(/\D/g, '');
  return parseInt(numStr, 10) || 0;
}

/**
 * Đọc số tiền ra chữ tiếng Việt ngắn gọn (VD: 2.000.000 -> "2 triệu đồng", 500.000 -> "500 ngàn đồng")
 */
export function readMoneyToVietnameseWords(amount) {
  const num = Number(amount) || 0;
  if (num === 0) return '0 đồng';
  if (num >= 1000000000) {
    const ty = (num / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    return `${ty} tỷ đồng`;
  }
  if (num >= 1000000) {
    const tr = (num / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    return `${tr} triệu đồng`;
  }
  if (num >= 1000) {
    const ng = (num / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    return `${ng} ngàn đồng`;
  }
  return `${num.toLocaleString('vi-VN')} đồng`;
}

/**
 * Tự động gắn bộ định dạng tiền tệ có dấu chấm và chữ giải thích khi người dùng gõ
 */
export function attachMoneyInput(inputEl, helperEl = null, onChange = null) {
  if (!inputEl) return;
  inputEl.setAttribute('inputmode', 'numeric');

  const update = () => {
    const rawVal = parseNumberFromDots(inputEl.value);
    if (inputEl.value) {
      inputEl.value = formatNumberWithDots(rawVal);
    }
    if (helperEl) {
      if (rawVal > 0) {
        helperEl.innerHTML = `💡 Bằng chữ: <strong>${readMoneyToVietnameseWords(rawVal)}</strong>`;
        helperEl.style.display = 'block';
      } else {
        helperEl.style.display = 'none';
      }
    }
    if (typeof onChange === 'function') {
      onChange(rawVal);
    }
  };

  inputEl.addEventListener('input', update);
  inputEl.addEventListener('blur', update);
  if (inputEl.value) update();
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return escapeHtml(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return escapeHtml(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'danger') icon = '🚨';

  toast.innerHTML = `
    <span style="font-size:16px;">${icon}</span>
    <span style="flex:1;">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function getCreditBadge(rating) {
  const r = Number(rating) || 5;
  if (r >= 5) return `<span class="badge badge-success">⭐ ${r}/5 - Rất uy tín</span>`;
  if (r >= 4) return `<span class="badge badge-info">⭐ ${r}/5 - Tốt</span>`;
  if (r === 3) return `<span class="badge badge-warning">⚠️ ${r}/5 - Khá</span>`;
  return `<span class="badge badge-danger">🚨 ${r}/5 - Rủi ro cao</span>`;
}

export function getPeriodLabel(type) {
  switch (type) {
    case 'day': return 'Theo ngày';
    case 'week': return 'Hàng tuần';
    case 'half_month': return 'Nửa tháng (15 ngày)';
    case 'month': return 'Hàng tháng';
    default: return escapeHtml(type);
  }
}

export function getDrawMethodLabel(method) {
  switch (method) {
    case 'bidding': return '🏷️ Kêu hụi / Bỏ lãi';
    case 'secret_ballot': return '🗳️ Bỏ thăm kín';
    case 'random': return '🎲 Quay Random ngẫu nhiên';
    default: return escapeHtml(method);
  }
}

/**
 * Sinh link ảnh mã VietQR chuẩn ngân hàng quốc gia
 */
export function generateVietQRUrl(bankCode, accountNumber, accountHolder, amount = 0, memo = '') {
  if (!bankCode || !accountNumber) return '';
  const cleanBank = encodeURIComponent(bankCode.trim());
  const cleanAcc = encodeURIComponent(accountNumber.trim().replace(/\s/g, ''));
  const cleanAmount = Math.max(0, Math.round(Number(amount) || 0));
  const encodedMemo = encodeURIComponent(memo.trim());
  const encodedName = encodeURIComponent(accountHolder ? accountHolder.trim().toUpperCase() : '');

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${cleanAmount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
}

/**
 * Xuất file CSV an toàn, phòng chống CSV Injection (Formula Injection)
 */
export function exportToCSV(filename, rows) {
  const safeFilename = (filename || 'xuat-so-hui.csv').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const processRow = (row) => {
    return row.map(val => {
      let text = (val === null || val === undefined) ? '' : val.toString();
      // Chống CSV Formula Injection: nếu bắt đầu bằng =, +, -, @, \t, \r thì thêm dấu nháy đơn '
      if (/^[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
      }
      text = text.replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
  };

  const csvContent = '﻿' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Xuất file sao lưu toàn diện định dạng JSON (.sohui)
 */
export function exportJSONFile(filename, dataObj) {
  const safeFilename = (filename || 'backup.sohui').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const jsonStr = JSON.stringify(dataObj, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', safeFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
