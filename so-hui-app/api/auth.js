/**
 * VERCEL SERVERLESS CLOUD AUTHENTICATION API
 * Hỗ trợ Đăng ký, Đăng nhập và Khôi phục tài khoản trên mọi thiết bị
 */

// Lưu trữ đám mây tạm thời trong bộ nhớ Serverless
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
    return res.status(405).json({ success: false, message: 'Chỉ hỗ trợ phương thức POST' });
  }

  try {
    const body = req.body || {};
    const action = body.action || 'login';

    // 1. ĐĂNG KÝ TÀI KHOẢN CLOUD
    if (action === 'register') {
      const { fullName, phone, password, role, shopName, address, bankCode, bankName, accountNumber, accountHolder, seedDemoData } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !fullName || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Mật khẩu' });
      }

      if (globalAccounts.has(cleanPhone)) {
        return res.status(400).json({ success: false, message: `Số điện thoại ${cleanPhone} đã được đăng ký trên hệ thống đám mây!` });
      }

      const newAccount = {
        id: 'acc-' + Date.now(),
        fullName: fullName.trim(),
        phone: cleanPhone,
        password: password,
        role: role || 'owner',
        shopName: shopName ? shopName.trim() : `Sổ Hụi ${fullName.trim()}`,
        address: address ? address.trim() : '',
        bankCode: bankCode || 'VCB',
        bankName: bankName || 'Vietcombank',
        accountNumber: accountNumber ? accountNumber.trim() : '',
        accountHolder: accountHolder ? accountHolder.trim().toUpperCase() : fullName.trim().toUpperCase(),
        pinCode: '',
        isDemo: false,
        createdAt: new Date().toISOString().split('T')[0],
        cloudSyncedAt: new Date().toISOString()
      };

      globalAccounts.set(cleanPhone, {
        account: newAccount,
        ledger: body.initialLedger || null
      });

      return res.status(200).json({
        success: true,
        message: 'Đăng ký tài khoản Đám mây thành công!',
        account: newAccount
      });
    }

    // 2. ĐĂNG NHẬP TÀI KHOẢN TRÊN THIẾT BỊ MỚI
    if (action === 'login') {
      const { phone, password } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập Số điện thoại và Mật khẩu!' });
      }

      const userData = globalAccounts.get(cleanPhone);
      if (!userData || !userData.account) {
        return res.status(404).json({ success: false, message: 'Tài khoản chưa tồn tại trên hệ thống Đám mây!' });
      }

      if (userData.account.password !== password) {
        return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác!' });
      }

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập Đám mây thành công!',
        account: userData.account,
        ledger: userData.ledger || null
      });
    }

    // 3. ĐẶT LẠI MẬT KHẨU / QUÊN MẬT KHẨU
    if (action === 'reset_password') {
      const { phone, newPassword } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !newPassword || newPassword.length < 3) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 3 ký tự!' });
      }

      const userData = globalAccounts.get(cleanPhone);
      if (!userData || !userData.account) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với số điện thoại này!' });
      }

      userData.account.password = newPassword;
      userData.account.cloudSyncedAt = new Date().toISOString();
      globalAccounts.set(cleanPhone, userData);

      return res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.',
        account: userData.account
      });
    }

    // 4. KIỂM TRA TÀI KHOẢN TỒN TẠI
    if (action === 'check_phone') {
      const cleanPhone = normalizePhone(body.phone);
      const exists = globalAccounts.has(cleanPhone);
      return res.status(200).json({ success: true, exists });
    }

    return res.status(400).json({ success: false, message: 'Hành động không hợp lệ' });
  } catch (error) {
    console.error('Cloud Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
  }
};
