/**
 * CÁC HÀM TIỆN ÍCH DÙNG CHUNG (UI UTILS)
 */

export function formatMoney(amount) {
  if (!amount && amount !== 0) return '0 đ';
  return Number(amount).toLocaleString('vi-VN') + ' đ';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
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
    <span style="flex:1;">${message}</span>
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
    default: return type;
  }
}

export function getDrawMethodLabel(method) {
  switch (method) {
    case 'bidding': return '🏷️ Kêu hụi / Bỏ lãi';
    case 'secret_ballot': return '🗳️ Bỏ thăm kín';
    case 'random': return '🎲 Quay Random ngẫu nhiên';
    default: return method;
  }
}

export function exportToCSV(filename, rows) {
  const processRow = (row) => {
    return row.map(val => {
      let text = (val === null || val === undefined) ? '' : val.toString();
      text = text.replace(/"/g, '""');
      return `"${text}"`;
    }).join(',');
  };

  const csvContent = '﻿' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
