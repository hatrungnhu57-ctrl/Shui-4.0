/**
 * VERCEL SERVERLESS CLOUD AUTHENTICATION API
 * Hỗ trợ Đăng ký, Đăng nhập và Khôi phục tài khoản trên mọi thiết bị
 */

// Lưu trữ đám mây tạm thời trong bộ nhớ Serverless
const globalAccounts = global.__SO_HUI_CLOUD_ACCOUNTS || new Map();
global.__SO_HUI_CLOUD_ACCOUNTS = globalAccounts;

// Lưu trữ mã xác thực OTP đám mây (Hết hạn sau 5 phút)
const globalOtps = global.__SO_HUI_OTP_STORE || new Map();
global.__SO_HUI_OTP_STORE = globalOtps;

// Bucket lưu trữ đám mây vĩnh viễn (Persistent Global Cloud Store)
const CLOUD_KV_URL = 'https://kvdb.io/4yZJ7vM9L1P3a8Qx5cE7wR';

async function fetchFromPersistentCloud(key) {
  try {
    if (typeof fetch === 'function') {
      const res = await fetch(`${CLOUD_KV_URL}/${key}`);
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (e) {
    console.warn('Persistent Cloud Read Error:', e.message);
  }
  return null;
}

async function saveToPersistentCloud(key, data) {
  try {
    if (typeof fetch === 'function') {
      await fetch(`${CLOUD_KV_URL}/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
  } catch (e) {
    console.warn('Persistent Cloud Write Error:', e.message);
  }
}

async function getCloudUser(phone) {
  const clean = normalizePhone(phone);
  if (globalAccounts.has(clean)) {
    return globalAccounts.get(clean);
  }
  const persisted = await fetchFromPersistentCloud(`usr_${clean}`);
  if (persisted && persisted.account) {
    globalAccounts.set(clean, persisted);
    return persisted;
  }
  return null;
}

async function saveCloudUser(phone, userData) {
  const clean = normalizePhone(phone);
  globalAccounts.set(clean, userData);
  await saveToPersistentCloud(`usr_${clean}`, userData);
}

// Hàm gửi tin nhắn SMS thật qua cổng eSMS.vn
async function sendSmsViaEsms(phone, otpCode) {
  const cleanPhone = normalizePhone(phone);
  const smsConfig = (await fetchFromPersistentCloud('config_esms')) || global.__SO_HUI_SMS_CONFIG || {};

  const apiKey = process.env.ESMS_API_KEY || smsConfig.apiKey;
  const secretKey = process.env.ESMS_SECRET_KEY || smsConfig.secretKey;
  const brandname = process.env.ESMS_BRANDNAME || smsConfig.brandname || 'Baokim';
  const smsType = process.env.ESMS_SMS_TYPE || smsConfig.smsType || '2'; // 2 = OTP / CSKH

  if (!apiKey || !secretKey) {
    console.log(`[SMS OTP MOCK] Chưa gắn eSMS API Key. Mã OTP giả lập cho ${cleanPhone}: ${otpCode}`);
    return { success: true, isMock: true, message: 'Đã gửi qua chế độ mô phỏng OTP' };
  }

  try {
    const content = `[SO HUI] Ma xac thuc OTP cua ban la ${otpCode}. Ma co hieu luc trong 5 phut.`;
    const esmsUrl = `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json`;

    if (typeof fetch === 'function') {
      const response = await fetch(esmsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ApiKey: apiKey,
          SecretKey: secretKey,
          Phone: cleanPhone,
          Content: content,
          SmsType: smsType,
          Brandname: brandname
        })
      });

      const resJson = await response.json().catch(() => ({}));
      console.log(`[eSMS Gateway Response]`, resJson);
      return { success: true, isMock: false, data: resJson };
    }
  } catch (err) {
    console.warn(`[eSMS Gateway Error]`, err.message);
  }

  return { success: true, isMock: true };
}

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

    // 0. GỬI MÃ XÁC THỰC SMS / ZALO OTP
    if (action === 'send_otp') {
      const { phone, purpose } = body;
      const cleanPhone = normalizePhone(phone);
      if (!cleanPhone || cleanPhone.length < 9) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ!' });
      }

      if (purpose === 'register' && globalAccounts.has(cleanPhone)) {
        return res.status(400).json({ success: false, message: `Số điện thoại ${cleanPhone} đã được đăng ký! Vui lòng chuyển sang Đăng nhập.` });
      }

      if (purpose === 'forgot_password' && !globalAccounts.has(cleanPhone)) {
        return res.status(404).json({ success: false, message: `Không tìm thấy tài khoản với số điện thoại ${cleanPhone}!` });
      }

      // Tạo mã OTP 6 chữ số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // Có hiệu lực 5 phút

      globalOtps.set(cleanPhone, {
        code: otpCode,
        expiresAt,
        purpose: purpose || 'auth'
      });

      console.log(`[SMS OTP GATEWAY] Gửi OTP tới ${cleanPhone}: ${otpCode}`);

      // Bắn tin SMS thật qua eSMS nếu có cấu hình
      const smsRes = await sendSmsViaEsms(cleanPhone, otpCode);

      return res.status(200).json({
        success: true,
        message: `Mã xác thực OTP đã được gửi đến số điện thoại ${cleanPhone}!`,
        mockOtp: otpCode, // Trả về để hệ thống hiển thị thông báo mô phỏng SMS tức thì khi test
        isMock: smsRes.isMock,
        expiresInSeconds: 300
      });
    }

    // 0a. CẤU HÌNH CỔNG eSMS.VN
    if (action === 'save_sms_config') {
      const { apiKey, secretKey, brandname, smsType } = body;
      const config = {
        apiKey: (apiKey || '').trim(),
        secretKey: (secretKey || '').trim(),
        brandname: (brandname || 'Baokim').trim(),
        smsType: smsType || '2',
        updatedAt: new Date().toISOString()
      };
      global.__SO_HUI_SMS_CONFIG = config;
      await saveToPersistentCloud('config_esms', config);
      return res.status(200).json({ success: true, message: 'Đã lưu cấu hình eSMS.vn thành công!' });
    }

    if (action === 'get_sms_config') {
      const config = (await fetchFromPersistentCloud('config_esms')) || global.__SO_HUI_SMS_CONFIG || {};
      return res.status(200).json({
        success: true,
        config: {
          apiKey: config.apiKey ? '••••••••' + config.apiKey.slice(-4) : '',
          hasKey: !!config.apiKey,
          brandname: config.brandname || 'Baokim',
          smsType: config.smsType || '2'
        }
      });
    }

    // 0b. XÁC MINH MÃ OTP
    if (action === 'verify_otp') {
      const { phone, otp } = body;
      const cleanPhone = normalizePhone(phone);
      const cleanOtp = (otp || '').toString().trim();

      if (!cleanPhone || !cleanOtp) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Số điện thoại và Mã OTP!' });
      }

      const stored = globalOtps.get(cleanPhone);
      // Cho phép mã OTP vừa sinh hoặc mã mặc định kiểm thử 686868
      const isValid = (stored && stored.code === cleanOtp && Date.now() <= stored.expiresAt) || cleanOtp === '686868';

      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hiệu lực!' });
      }

      return res.status(200).json({
        success: true,
        message: 'Xác minh số điện thoại thành công!'
      });
    }

    // 1. ĐĂNG KÝ TÀI KHOẢN CLOUD
    if (action === 'register') {
      const { fullName, phone, password, role, shopName, address, bankCode, bankName, accountNumber, accountHolder, seedDemoData } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !fullName || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Mật khẩu' });
      }

      const existing = await getCloudUser(cleanPhone);
      if (existing) {
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

      await saveCloudUser(cleanPhone, {
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

      const userData = await getCloudUser(cleanPhone);
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

      const userData = await getCloudUser(cleanPhone);
      if (!userData || !userData.account) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với số điện thoại này!' });
      }

      userData.account.password = newPassword;
      userData.account.cloudSyncedAt = new Date().toISOString();
      await saveCloudUser(cleanPhone, userData);

      return res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.',
        account: userData.account
      });
    }

    // 4. KIỂM TRA TÀI KHOẢN TỒN TẠI
    if (action === 'check_phone') {
      const cleanPhone = normalizePhone(body.phone);
      const user = await getCloudUser(cleanPhone);
      return res.status(200).json({ success: true, exists: !!user });
    }

    return res.status(400).json({ success: false, message: 'Hành động không hợp lệ' });
  } catch (error) {
    console.error('Cloud Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
  }
};
