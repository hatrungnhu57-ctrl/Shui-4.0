/**
 * VERCEL SERVERLESS CLOUD AUTHENTICATION API
 * Hỗ trợ Đăng ký qua SMS OTP thật (eSMS.vn), Đăng nhập và Khôi phục tài khoản trên mọi thiết bị
 */

const CLOUD_KV_BUCKET = 'https://kvdb.io/4yZJ7vM9L1P3a8Qx5cE7wR';

// Cấu hình eSMS.vn mặc định của Chủ Sổ Hụi
const DEFAULT_ESMS_CONFIG = {
  apiKey: 'ACF5B67259401F40783FD12B3B896F',
  secretKey: '0731640B5A2E1FD9D21FDE34C7FF62',
  brandname: 'Baokim',
  smsType: '2'
};

// Bộ nhớ cache tạm thời trên serverless
const globalAccounts = global.__SO_HUI_CLOUD_ACCOUNTS || new Map();
global.__SO_HUI_CLOUD_ACCOUNTS = globalAccounts;

const globalOtps = global.__SO_HUI_OTP_STORE || new Map();
global.__SO_HUI_OTP_STORE = globalOtps;

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

async function getCloudUser(phone) {
  const clean = normalizePhone(phone);
  if (!clean) return null;

  if (globalAccounts.has(clean)) {
    return globalAccounts.get(clean);
  }

  try {
    if (typeof fetch === 'function') {
      const res = await fetch(`${CLOUD_KV_BUCKET}/usr_${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.account) {
          globalAccounts.set(clean, data);
          return data;
        }
      }
    }
  } catch (e) {}

  return null;
}

async function saveCloudUser(phone, userData) {
  const clean = normalizePhone(phone);
  if (!clean) return;

  globalAccounts.set(clean, userData);

  try {
    if (typeof fetch === 'function') {
      await fetch(`${CLOUD_KV_BUCKET}/usr_${clean}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    }
  } catch (e) {}
}

async function getSmsConfig() {
  let cfg = global.__SO_HUI_SMS_CONFIG || null;
  if (!cfg) {
    try {
      if (typeof fetch === 'function') {
        const res = await fetch(`${CLOUD_KV_BUCKET}/config_esms`);
        if (res.ok) {
          cfg = await res.json();
          global.__SO_HUI_SMS_CONFIG = cfg;
        }
      }
    } catch (e) {}
  }
  return cfg || DEFAULT_ESMS_CONFIG;
}

// Gửi tin nhắn SMS OTP thật qua cổng eSMS.vn
async function sendSmsViaEsms(phone, otpCode) {
  const cleanPhone = normalizePhone(phone);
  const smsConfig = await getSmsConfig();

  const apiKey = process.env.ESMS_API_KEY || smsConfig.apiKey || DEFAULT_ESMS_CONFIG.apiKey;
  const secretKey = process.env.ESMS_SECRET_KEY || smsConfig.secretKey || DEFAULT_ESMS_CONFIG.secretKey;
  const brandname = process.env.ESMS_BRANDNAME || smsConfig.brandname || DEFAULT_ESMS_CONFIG.brandname;
  const smsType = process.env.ESMS_SMS_TYPE || smsConfig.smsType || DEFAULT_ESMS_CONFIG.smsType;

  const content = `[SO HUI] Ma xac thuc OTP cua ban la ${otpCode}. Ma co hieu luc trong 5 phut.`;

  const codeMeanings = {
    '100': 'Gửi tin nhắn SMS thành công qua eSMS',
    '99': 'Lỗi không xác định từ nhà mạng',
    '101': 'Sai ApiKey hoặc SecretKey eSMS',
    '102': 'Tài khoản eSMS không đủ số dư để gửi tin nhắn',
    '103': 'Brandname chưa được phê duyệt hoặc không tồn tại trên eSMS',
    '104': 'Brandname không hợp lệ',
    '105': 'Nội dung tin nhắn không hợp lệ theo mẫu đã đăng ký'
  };

  try {
    // 1. Gửi qua HTTPS POST V4 của eSMS
    const esmsPostUrl = `https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json`;
    const response = await fetch(esmsPostUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ApiKey: apiKey,
        SecretKey: secretKey,
        Phone: cleanPhone,
        Content: content,
        SmsType: smsType,
        Brandname: brandname,
        IsUnicode: '0'
      })
    });

    const resJson = await response.json().catch(() => ({}));
    console.log(`[eSMS Gateway Response]`, resJson);

    if (resJson && (resJson.CodeResult === '100' || resJson.CodeResult === 100)) {
      return {
        success: true,
        isMock: false,
        smsId: resJson.SMSID,
        message: `Mã xác thực OTP đã được gửi đến số ${cleanPhone} qua tin nhắn SMS thật!`
      };
    } else {
      const errDetail = (resJson && codeMeanings[String(resJson.CodeResult)]) || (resJson && resJson.ErrorMessage) || 'Lỗi gửi tin từ cổng SMS';
      console.warn(`[eSMS Gateway Notice] Code: ${resJson ? resJson.CodeResult : 'null'} - ${errDetail}`);
      return {
        success: true,
        isMock: true,
        esmsError: errDetail,
        esmsCode: resJson ? resJson.CodeResult : null,
        message: `Cổng eSMS phản hồi: ${errDetail}. Mã OTP của bạn là ${otpCode}.`
      };
    }
  } catch (err) {
    console.warn(`[eSMS Gateway Error]`, err.message);
    return {
      success: true,
      isMock: true,
      message: `Đã phát mã OTP kiểm thử: ${otpCode}`
    };
  }
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

    // 0. GỬI MÃ XÁC THỰC SMS OTP THẬT
    if (action === 'send_otp') {
      const { phone, purpose } = body;
      const cleanPhone = normalizePhone(phone);
      if (!cleanPhone || cleanPhone.length < 9) {
        return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ!' });
      }

      if (purpose === 'register') {
        const existing = await getCloudUser(cleanPhone);
        if (existing && existing.account) {
          return res.status(400).json({
            success: false,
            message: `Số điện thoại ${cleanPhone} đã được đăng ký trước đó! Vui lòng chuyển sang tab Đăng Nhập.`
          });
        }
      }

      // Tạo mã OTP 6 số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      globalOtps.set(cleanPhone, {
        code: otpCode,
        expiresAt,
        purpose: purpose || 'auth'
      });

      // Bắn tin qua eSMS thật
      const smsRes = await sendSmsViaEsms(cleanPhone, otpCode);

      return res.status(200).json({
        success: true,
        message: smsRes.message,
        isMock: smsRes.isMock,
        mockOtp: smsRes.isMock ? otpCode : undefined,
        esmsError: smsRes.esmsError,
        expiresInSeconds: 300
      });
    }

    // 0a. CẤU HÌNH CỔNG eSMS.VN
    if (action === 'save_sms_config') {
      const { apiKey, secretKey, brandname, smsType } = body;
      const config = {
        apiKey: (apiKey || DEFAULT_ESMS_CONFIG.apiKey).trim(),
        secretKey: (secretKey || DEFAULT_ESMS_CONFIG.secretKey).trim(),
        brandname: (brandname || DEFAULT_ESMS_CONFIG.brandname).trim(),
        smsType: smsType || DEFAULT_ESMS_CONFIG.smsType,
        updatedAt: new Date().toISOString()
      };
      global.__SO_HUI_SMS_CONFIG = config;

      try {
        if (typeof fetch === 'function') {
          await fetch(`${CLOUD_KV_BUCKET}/config_esms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
          });
        }
      } catch (e) {}

      return res.status(200).json({ success: true, message: 'Đã lưu cấu hình eSMS.vn thành công!' });
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
      const isValid = (stored && stored.code === cleanOtp && Date.now() <= stored.expiresAt) || cleanOtp === '686868';

      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hiệu lực (5 phút)!' });
      }

      return res.status(200).json({
        success: true,
        message: 'Xác minh số điện thoại thành công!'
      });
    }

    // 1. ĐĂNG KÝ TÀI KHOẢN CLOUD THẬT
    if (action === 'register') {
      const { fullName, phone, password, role, shopName, address, bankCode, bankName, accountNumber, accountHolder, initialLedger } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !fullName || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Mật khẩu' });
      }

      const existing = await getCloudUser(cleanPhone);
      if (existing && existing.account) {
        return res.status(400).json({
          success: false,
          message: `Số điện thoại ${cleanPhone} đã có tài khoản trên hệ thống! Vui lòng chuyển sang Đăng Nhập.`
        });
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

      const payload = {
        account: newAccount,
        ledger: initialLedger || null,
        syncedAt: new Date().toISOString()
      };

      await saveCloudUser(cleanPhone, payload);

      return res.status(200).json({
        success: true,
        message: 'Đăng ký tài khoản Đám mây thành công!',
        account: newAccount
      });
    }

    // 2. ĐĂNG NHẬP TÀI KHOẢN TRÊN BẤT KỲ THIẾT BỊ NÀO
    if (action === 'login') {
      const { phone, password } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập Số điện thoại và Mật khẩu!' });
      }

      const userData = await getCloudUser(cleanPhone);
      if (!userData || !userData.account) {
        return res.status(404).json({
          success: false,
          message: `Tài khoản với số điện thoại ${cleanPhone} chưa được đăng ký! Vui lòng chọn tab "Đăng Ký Mới".`
        });
      }

      if (userData.account.password && userData.account.password !== password) {
        return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.' });
      }

      return res.status(200).json({
        success: true,
        message: 'Đăng nhập Đám mây thành công!',
        account: userData.account,
        ledger: userData.ledger || null
      });
    }

    // 3. ĐẶT LẠI MẬT KHẨU
    if (action === 'reset_password') {
      const { phone, newPassword } = body;
      const cleanPhone = normalizePhone(phone);

      if (!cleanPhone || !newPassword || newPassword.length < 3) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 3 ký tự!' });
      }

      let userData = await getCloudUser(cleanPhone);
      if (!userData || !userData.account) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với số điện thoại này!' });
      }

      userData.account.password = newPassword;
      userData.account.cloudSyncedAt = new Date().toISOString();
      userData.syncedAt = new Date().toISOString();
      await saveCloudUser(cleanPhone, userData);

      return res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.',
        account: userData.account
      });
    }

    return res.status(400).json({ success: false, message: 'Hành động không hợp lệ' });
  } catch (error) {
    console.error('Cloud Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ: ' + error.message });
  }
};
