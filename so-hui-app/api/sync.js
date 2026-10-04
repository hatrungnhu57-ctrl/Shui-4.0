/**
 * VERCEL SERVERLESS CLOUD SYNC API
 * Đồng bộ hai chiều (Push/Pull) dữ liệu Sổ hụi giữa các thiết bị thời gian thực
 */

const globalAccounts = global.__SO_HUI_CLOUD_ACCOUNTS || new Map();
global.__SO_HUI_CLOUD_ACCOUNTS = globalAccounts;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/[\s.-]/g, '').trim();
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Chỉ hỗ trợ POST' });
  }

  try {
    const { action, phone, password, ledgerData } = req.body || {};
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone) {
      return res.status(400).json({ success: false, message: 'Thiếu số điện thoại' });
    }

    let userData = globalAccounts.get(cleanPhone);
    if (!userData) {
      // Nếu chưa có trên cloud, khởi tạo bản ghi
      userData = {
        account: {
          id: 'acc-' + Date.now(),
          phone: cleanPhone,
          password: password || '123',
          fullName: (ledgerData && ledgerData.currentUser && ledgerData.currentUser.fullName) || 'Chủ Hụi',
          role: 'owner',
          createdAt: new Date().toISOString().split('T')[0]
        },
        ledger: ledgerData || null
      };
      globalAccounts.set(cleanPhone, userData);
    }

    // 1. PUSH (Đồng bộ từ thiết bị lên Cloud)
    if (action === 'push') {
      if (!ledgerData) {
        return res.status(400).json({ success: false, message: 'Dữ liệu sổ hụi trống' });
      }

      userData.ledger = ledgerData;
      userData.lastSyncedAt = new Date().toISOString();
      globalAccounts.set(cleanPhone, userData);

      return res.status(200).json({
        success: true,
        message: 'Đã sao lưu lên Đám mây thành công!',
        syncedAt: userData.lastSyncedAt
      });
    }

    // 2. PULL (Tải dữ liệu mới nhất từ Cloud về thiết bị)
    if (action === 'pull') {
      return res.status(200).json({
        success: true,
        ledger: userData.ledger || null,
        account: userData.account,
        syncedAt: userData.lastSyncedAt || new Date().toISOString()
      });
    }

    return res.status(400).json({ success: false, message: 'Hành động không hợp lệ (push hoặc pull)' });
  } catch (error) {
    console.error('Sync Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đồng bộ: ' + error.message });
  }
};
