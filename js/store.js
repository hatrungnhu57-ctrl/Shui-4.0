/**
 * SỔ HỤI - QUẢN LÝ DỮ LIỆU & LOGIC NGHIỆP VỤ ĐA TÀI KHOẢN (MULTI-TENANT STORE)
 * Hỗ trợ Đăng ký, Đăng nhập, Cách ly dữ liệu theo tài khoản, Cấu hình Ngân hàng VietQR,
 * Khóa mã PIN, Sao lưu & Khôi phục JSON (.sohui), Reactive Subscriptions, Audit Logs.
 */

import {
  INITIAL_USERS,
  INITIAL_PROFILES,
  INITIAL_GROUPS,
  INITIAL_GROUP_MEMBERS,
  INITIAL_CYCLES,
  INITIAL_PAYMENTS,
  INITIAL_RECEIPTS,
  INITIAL_RANDOM_DRAWS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS
} from './mock-data.js';
import { cloudSync } from './cloud-sync.js';

class SoHuiStore {
  constructor() {
    this.accountsStorageKey = 'SO_HUI_ACCOUNTS_V2';
    this.sessionStorageKey = 'SO_HUI_SESSION_V2';
    this.currentRoleKey = 'SO_HUI_CURRENT_ROLE';
    this.listeners = [];

    // Khởi tạo danh sách tài khoản nếu chưa có
    this.initAccounts();

    // Nạp phiên đăng nhập và dữ liệu của tài khoản hiện tại
    this.currentAccount = this.loadSession();
    this.state = this.loadAccountData(this.currentAccount.id);
  }

  // --- 1. QUẢN LÝ TÀI KHOẢN & PHIÊN ĐĂNG NHẬP (AUTH & SESSIONS) ---
  initAccounts() {
    try {
      const savedAccounts = localStorage.getItem(this.accountsStorageKey);
      if (!savedAccounts) {
        // Tạo sẵn tài khoản mẫu mặc định
        const defaultAccounts = [
          {
            id: 'acc-demo-cobay',
            fullName: 'Cô Bảy (Chủ Hụi Mẫu)',
            phone: '0918123456',
            email: 'cobay@sohui.vn',
            password: '123',
            role: 'owner',
            shopName: 'Tiệm Hụi Cô Bảy - Chợ Trà Vinh',
            address: 'Khóm 1, Phường 2, TP. Trà Vinh',
            bankCode: 'VCB',
            bankName: 'Vietcombank',
            accountNumber: '0741000123456',
            accountHolder: 'NGUYEN THI BAY',
            pinCode: '',
            isDemo: true,
            createdAt: '2026-01-01'
          },
          {
            id: 'acc-demo-bakhia',
            fullName: 'Anh Ba Khía (Hụi Viên Mẫu)',
            phone: '0903987654',
            email: 'bakhia@sohui.vn',
            password: '123',
            role: 'member',
            shopName: '',
            address: 'Xã Long Đức, TP. Trà Vinh',
            bankCode: 'MB',
            bankName: 'MBBank',
            accountNumber: '88880903987654',
            accountHolder: 'TRAN VAN KHIA',
            pinCode: '',
            isDemo: true,
            createdAt: '2026-01-01'
          },
          {
            id: 'acc-demo-utlanh',
            fullName: 'Chị Út Lành (Chủ & Hụi Viên Mẫu)',
            phone: '0988654321',
            email: 'utlanh@sohui.vn',
            password: '123',
            role: 'hybrid',
            shopName: 'Tạp hóa Út Lành',
            address: 'Chợ Càng Long, Trà Vinh',
            bankCode: 'TCB',
            bankName: 'Techcombank',
            accountNumber: '19034567890123',
            accountHolder: 'LE THI UT LANH',
            pinCode: '',
            isDemo: true,
            createdAt: '2026-01-01'
          }
        ];
        localStorage.setItem(this.accountsStorageKey, JSON.stringify(defaultAccounts));

        // Khởi tạo dữ liệu mẫu cho tài khoản demo
        this.saveAccountData('acc-demo-cobay', this.getDefaultDemoData());
      }
    } catch (e) {
      console.warn('Lỗi khởi tạo tài khoản:', e);
    }
  }

  getAccounts() {
    try {
      const saved = localStorage.getItem(this.accountsStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveAccounts(accounts) {
    localStorage.setItem(this.accountsStorageKey, JSON.stringify(accounts));
  }

  loadSession() {
    try {
      const savedSessionId = localStorage.getItem(this.sessionStorageKey);
      const accounts = this.getAccounts();
      if (savedSessionId) {
        const found = accounts.find(a => a.id === savedSessionId);
        if (found) return found;
      }
      // Nếu chưa có session, mặc định lấy tài khoản demo Cô Bảy
      const defaultAcc = accounts[0] || {
        id: 'acc-guest',
        fullName: 'Chủ Hụi',
        phone: '0900000000',
        role: 'owner',
        shopName: 'Sổ Hụi Của Tôi'
      };
      localStorage.setItem(this.sessionStorageKey, defaultAcc.id);
      return defaultAcc;
    } catch (e) {
      return { id: 'acc-guest', fullName: 'Chủ Hụi', role: 'owner' };
    }
  }

  // --- 2. CÁCH LY DỮ LIỆU TỪNG TÀI KHOẢN (DATA ISOLATION) ---
  getAccountStorageKey(accountId) {
    return `SO_HUI_DATA_${accountId}`;
  }

  loadAccountData(accountId) {
    try {
      const key = this.getAccountStorageKey(accountId);
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu tài khoản:', e);
    }

    // Nếu là tài khoản demo, nạp dữ liệu mẫu
    if (accountId === 'acc-demo-cobay' || accountId === 'acc-demo-bakhia' || accountId === 'acc-demo-utlanh') {
      const demoData = this.getDefaultDemoData();
      this.saveAccountData(accountId, demoData);
      return demoData;
    }

    // Tài khoản thật mới: Khởi tạo database sạch 100%
    const freshData = {
      users: [this.currentAccount],
      currentUser: this.currentAccount,
      currentRole: this.currentAccount.role || 'owner',
      profiles: [],
      groups: [],
      groupMembers: [],
      cycles: [],
      payments: [],
      receipts: [],
      randomDraws: [],
      logs: [
        {
          id: 'log-init-' + Date.now(),
          action: 'INIT_ACCOUNT',
          actorName: this.currentAccount.fullName,
          targetType: 'Account',
          targetId: this.currentAccount.id,
          description: `Khởi tạo sổ hụi thực tế cho ${this.currentAccount.fullName}`,
          timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
      ],
      notifications: []
    };
    this.saveAccountData(accountId, freshData);
    return freshData;
  }

  getDefaultDemoData() {
    return {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0],
      currentRole: 'owner',
      profiles: JSON.parse(JSON.stringify(INITIAL_PROFILES)),
      groups: JSON.parse(JSON.stringify(INITIAL_GROUPS)),
      groupMembers: JSON.parse(JSON.stringify(INITIAL_GROUP_MEMBERS)),
      cycles: JSON.parse(JSON.stringify(INITIAL_CYCLES)),
      payments: JSON.parse(JSON.stringify(INITIAL_PAYMENTS)),
      receipts: JSON.parse(JSON.stringify(INITIAL_RECEIPTS)),
      randomDraws: JSON.parse(JSON.stringify(INITIAL_RANDOM_DRAWS)),
      logs: JSON.parse(JSON.stringify(INITIAL_ACTIVITY_LOGS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS))
    };
  }

  createFreshLedgerData(account) {
    return {
      users: [account],
      currentUser: account,
      currentRole: account.role || 'owner',
      profiles: [],
      groups: [],
      groupMembers: [],
      cycles: [],
      payments: [],
      receipts: [],
      randomDraws: [],
      logs: [
        {
          id: 'log-init-' + Date.now(),
          action: 'INIT_ACCOUNT',
          actorName: account.fullName,
          targetType: 'Account',
          targetId: account.id,
          description: `Khởi tạo sổ hụi thực tế cho ${account.fullName}`,
          timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
      ],
      notifications: []
    };
  }

  saveAccountData(accountId, data) {
    try {
      localStorage.setItem(this.getAccountStorageKey(accountId), JSON.stringify(data));
    } catch (e) {
      console.error('Không thể lưu dữ liệu:', e);
    }
  }

  saveState(newState = this.state) {
    try {
      this.state = newState;
      this.saveAccountData(this.currentAccount.id, this.state);
      if (typeof cloudSync !== 'undefined' && cloudSync.scheduleSync) {
        cloudSync.scheduleSync(this.currentAccount, this.state);
      }
      this.notifyListeners();
    } catch (e) {
      console.error('Lỗi khi lưu state:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  // --- 3. ĐĂNG KÝ, ĐĂNG NHẬP, ĐĂNG XUẤT (HYBRID LOCAL + CLOUD) ---
  async registerAccount(data) {
    const accounts = this.getAccounts();
    const cleanPhone = this.normalizePhone(data.phone);

    if (!cleanPhone) {
      throw new Error('Vui lòng nhập số điện thoại hợp lệ!');
    }
    if (!data.fullName || !data.fullName.trim()) {
      throw new Error('Vui lòng nhập họ và tên!');
    }
    if (!data.password || data.password.length < 3) {
      throw new Error('Mật khẩu phải có ít nhất 3 ký tự!');
    }

    // Kiểm tra xem số điện thoại đã đăng ký chưa
    if (accounts.some(a => this.normalizePhone(a.phone) === cleanPhone)) {
      throw new Error(`Số điện thoại "${cleanPhone}" đã được đăng ký tài khoản! Vui lòng đăng nhập.`);
    }

    const newAccountId = 'acc-' + Date.now();
    const newAccount = {
      id: newAccountId,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      email: data.email ? data.email.trim() : '',
      password: data.password,
      role: data.role || 'owner',
      shopName: data.shopName ? data.shopName.trim() : `Sổ Hụi ${data.fullName.trim()}`,
      address: data.address ? data.address.trim() : '',
      bankCode: data.bankCode || 'VCB',
      bankName: data.bankName || 'Vietcombank',
      accountNumber: data.accountNumber ? data.accountNumber.trim() : '',
      accountHolder: data.accountHolder ? data.accountHolder.trim().toUpperCase() : data.fullName.trim().toUpperCase(),
      pinCode: data.pinCode || '',
      isDemo: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    let initialData;
    if (data.seedDemoData) {
      initialData = this.getDefaultDemoData();
    } else {
      initialData = this.createFreshLedgerData(newAccount);
    }
    this.saveAccountData(newAccountId, initialData);

    // Đồng bộ lên Cloud ngầm
    if (typeof cloudSync !== 'undefined' && cloudSync.registerCloud) {
      cloudSync.registerCloud(newAccount, initialData).catch(err => console.warn('Lỗi sync cloud:', err));
    }

    // Tự động đăng nhập
    this.loginWithAccount(newAccount);
    return newAccount;
  }

  async login(identifier, password) {
    const accounts = this.getAccounts();
    const cleanId = identifier.trim().replace(/[\s.-]/g, '');
    let account = accounts.find(a =>
      (this.normalizePhone(a.phone) === this.normalizePhone(cleanId) || (a.email && a.email.toLowerCase() === identifier.toLowerCase())) &&
      a.password === password
    );

    // Trường hợp 1: Tài khoản có sẵn trên thiết bị này
    if (account) {
      this.loginWithAccount(account);
      // Kéo dữ liệu mới nhất từ Cloud về nếu có
      if (!account.isDemo && typeof cloudSync !== 'undefined' && cloudSync.pullLedger) {
        cloudSync.pullLedger(account.phone, account.password).then(cloudLedger => {
          if (cloudLedger) {
            this.state = cloudLedger;
            this.saveAccountData(account.id, cloudLedger);
            this.notifyListeners();
          }
        }).catch(() => {});
      }
      return account;
    }

    // Trường hợp 2: Đăng nhập trên thiết bị mới -> Kết nối Cloud tải dữ liệu về!
    if (typeof cloudSync !== 'undefined' && cloudSync.loginCloud) {
      const cloudRes = await cloudSync.loginCloud(cleanId, password);
      if (cloudRes && cloudRes.account) {
        const cloudAcc = cloudRes.account;
        accounts.push(cloudAcc);
        this.saveAccounts(accounts);

        const cloudLedger = cloudRes.ledger || this.createFreshLedgerData(cloudAcc);
        this.saveAccountData(cloudAcc.id, cloudLedger);

        this.loginWithAccount(cloudAcc);
        return cloudAcc;
      }
    }

    throw new Error('Số điện thoại/Email hoặc mật khẩu không chính xác!');
  }

  async resetPassword(phone, newPassword) {
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone || !newPassword || newPassword.length < 3) {
      throw new Error('Vui lòng nhập số điện thoại và mật khẩu mới (ít nhất 3 ký tự)!');
    }

    const accounts = this.getAccounts();
    const acc = accounts.find(a => this.normalizePhone(a.phone) === cleanPhone);
    if (acc) {
      acc.password = newPassword;
      this.saveAccounts(accounts);
    }

    if (typeof cloudSync !== 'undefined' && cloudSync.resetPasswordCloud) {
      await cloudSync.resetPasswordCloud(cleanPhone, newPassword);
    }

    return true;
  }

  syncWithCloudNow() {
    if (this.currentAccount && !this.currentAccount.isDemo && typeof cloudSync !== 'undefined') {
      return cloudSync.pushLedger(this.currentAccount.phone, this.currentAccount.password, this.state);
    }
  }

  loginWithAccount(account) {
    this.currentAccount = account;
    localStorage.setItem(this.sessionStorageKey, account.id);
    this.state = this.loadAccountData(account.id);
    this.state.currentUser = account;
    this.state.currentRole = account.role || 'owner';
    this.saveState();
    this.notifyListeners();
  }

  logout() {
    // Chuyển về màn hình đăng nhập hoặc tài khoản demo
    const accounts = this.getAccounts();
    const demoAcc = accounts.find(a => a.isDemo) || accounts[0];
    if (demoAcc) {
      this.loginWithAccount(demoAcc);
    }
  }

  updateCurrentAccount(data) {
    const accounts = this.getAccounts();
    const accIndex = accounts.findIndex(a => a.id === this.currentAccount.id);
    if (accIndex === -1) throw new Error('Không tìm thấy tài khoản!');

    Object.assign(accounts[accIndex], data);
    this.saveAccounts(accounts);
    this.currentAccount = accounts[accIndex];
    this.state.currentUser = this.currentAccount;
    this.saveState();
    return this.currentAccount;
  }

  setPinCode(pin) {
    return this.updateCurrentAccount({ pinCode: pin ? pin.trim() : '' });
  }

  verifyPinCode(inputPin) {
    if (!this.currentAccount.pinCode) return true;
    return this.currentAccount.pinCode === inputPin;
  }

  // --- 4. SAO LƯU & KHÔI PHỤC DỮ LIỆU (BACKUP & RESTORE) ---
  exportBackup() {
    return {
      appName: 'Sổ Hụi Miền Nam',
      version: '2.0.0-production',
      exportDate: new Date().toISOString(),
      account: {
        fullName: this.currentAccount.fullName,
        phone: this.currentAccount.phone,
        shopName: this.currentAccount.shopName,
        address: this.currentAccount.address,
        bankCode: this.currentAccount.bankCode,
        accountNumber: this.currentAccount.accountNumber,
        accountHolder: this.currentAccount.accountHolder
      },
      data: this.state
    };
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString, (key, value) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return undefined;
        }
        return value;
      });

      if (!parsed || typeof parsed !== 'object' || !parsed.data || !Array.isArray(parsed.data.groups) || !Array.isArray(parsed.data.profiles)) {
        throw new Error('File sao lưu không đúng định dạng Sổ Hụi!');
      }

      // Đảm bảo các cấu trúc mảng tồn tại hợp lệ
      this.state = {
        users: Array.isArray(parsed.data.users) ? parsed.data.users : [this.currentAccount],
        currentUser: this.currentAccount,
        currentRole: this.currentAccount.role || 'owner',
        profiles: Array.isArray(parsed.data.profiles) ? parsed.data.profiles : [],
        groups: Array.isArray(parsed.data.groups) ? parsed.data.groups : [],
        groupMembers: Array.isArray(parsed.data.groupMembers) ? parsed.data.groupMembers : [],
        cycles: Array.isArray(parsed.data.cycles) ? parsed.data.cycles : [],
        payments: Array.isArray(parsed.data.payments) ? parsed.data.payments : [],
        receipts: Array.isArray(parsed.data.receipts) ? parsed.data.receipts : [],
        randomDraws: Array.isArray(parsed.data.randomDraws) ? parsed.data.randomDraws : [],
        logs: Array.isArray(parsed.data.logs) ? parsed.data.logs : [],
        notifications: Array.isArray(parsed.data.notifications) ? parsed.data.notifications : []
      };

      if (parsed.account && typeof parsed.account === 'object') {
        const safeAccount = {
          fullName: parsed.account.fullName || this.currentAccount.fullName,
          shopName: parsed.account.shopName || this.currentAccount.shopName,
          address: parsed.account.address || this.currentAccount.address,
          bankCode: parsed.account.bankCode || this.currentAccount.bankCode,
          accountNumber: parsed.account.accountNumber || this.currentAccount.accountNumber,
          accountHolder: parsed.account.accountHolder || this.currentAccount.accountHolder
        };
        this.updateCurrentAccount(safeAccount);
      }

      this.saveState();
      this.logAction('IMPORT_BACKUP', 'System', this.currentAccount.id, 'Khôi phục dữ liệu từ file sao lưu thành công.');
      return true;
    } catch (e) {
      throw new Error('Lỗi khôi phục: ' + e.message);
    }
  }

  clearCurrentAccountData() {
    this.state = {
      users: [this.currentAccount],
      currentUser: this.currentAccount,
      currentRole: this.currentAccount.role || 'owner',
      profiles: [],
      groups: [],
      groupMembers: [],
      cycles: [],
      payments: [],
      receipts: [],
      randomDraws: [],
      logs: [
        {
          id: 'log-clear-' + Date.now(),
          action: 'CLEAR_DATA',
          actorName: this.currentAccount.fullName,
          targetType: 'Account',
          targetId: this.currentAccount.id,
          description: `Đã làm sạch toàn bộ dữ liệu để bắt đầu sổ thực tế.`,
          timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19)
        }
      ],
      notifications: []
    };
    this.saveState();
  }

  resetToDemoData() {
    this.state = this.getDefaultDemoData();
    this.saveState();
  }

  // --- 5. VAI TRÒ & CHUYỂN ĐỔI ---
  setCurrentRole(role) {
    this.state.currentRole = role;
    this.updateCurrentAccount({ role });
    this.saveState();
  }

  switchUser(userId) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      this.state.currentUser = user;
      this.state.currentRole = user.role;
      this.saveState();
    }
  }

  // --- 6. LOGGING VÀ KIỂM TOÁN ---
  logAction(action, targetType, targetId, description, oldData = null, newData = null) {
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      action,
      actorName: this.currentAccount.fullName || this.state.currentUser?.fullName || 'Người dùng',
      targetType,
      targetId,
      oldData,
      newData,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19)
    };
    this.state.logs = this.state.logs || [];
    this.state.logs.unshift(newLog);
    this.saveState();
  }

  // --- 7. QUẢN LÝ DANH BẠ HỤI VIÊN (MEMBER PROFILE) ---
  normalizePhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s.-]/g, '');
    if (cleaned.startsWith('+84')) {
      cleaned = '0' + cleaned.substring(3);
    }
    return cleaned;
  }

  checkPhoneExists(phone, excludeId = null) {
    const norm = this.normalizePhone(phone);
    return this.state.profiles.some(p => !p.isMerged && p.id !== excludeId && this.normalizePhone(p.phone) === norm);
  }

  addMemberProfile(data) {
    const normPhone = this.normalizePhone(data.phone);
    if (normPhone && this.checkPhoneExists(normPhone)) {
      throw new Error(`Số điện thoại "${normPhone}" đã tồn tại trong danh bạ hụi viên!`);
    }

    const newProfile = {
      id: 'mp-' + Date.now(),
      fullName: data.fullName.trim(),
      nickname: data.nickname ? data.nickname.trim() : '',
      phone: normPhone || '',
      address: data.address ? data.address.trim() : '',
      notes: data.notes ? data.notes.trim() : '',
      creditRating: Number(data.creditRating) || 5,
      activeHuiCount: 0,
      completedHuiCount: 0,
      latePaymentCount: 0,
      hotedCount: 0,
      riskNote: data.riskNote || '',
      isMerged: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.state.profiles.push(newProfile);
    this.logAction('ADD_MEMBER', 'MemberProfile', newProfile.id, `Thêm hụi viên mới vào danh bạ: ${newProfile.fullName} (${newProfile.nickname}) - SĐT: ${newProfile.phone || 'Chưa có'}`);
    this.saveState();
    return newProfile;
  }

  updateMemberProfile(id, data) {
    const profile = this.state.profiles.find(p => p.id === id);
    if (!profile) throw new Error('Không tìm thấy hụi viên!');

    const normPhone = this.normalizePhone(data.phone);
    if (normPhone && normPhone !== profile.phone && this.checkPhoneExists(normPhone, id)) {
      throw new Error(`Số điện thoại "${normPhone}" đã trùng với một hụi viên khác!`);
    }

    const oldData = { ...profile };
    Object.assign(profile, {
      fullName: data.fullName.trim(),
      nickname: data.nickname ? data.nickname.trim() : '',
      phone: normPhone,
      address: data.address ? data.address.trim() : '',
      notes: data.notes ? data.notes.trim() : '',
      creditRating: Number(data.creditRating) || profile.creditRating,
      riskNote: data.riskNote !== undefined ? data.riskNote : profile.riskNote,
      updatedAt: new Date().toISOString()
    });

    this.logAction('UPDATE_MEMBER', 'MemberProfile', profile.id, `Cập nhật thông tin hụi viên: ${profile.fullName}`, oldData, profile);
    this.saveState();
    return profile;
  }

  mergeProfiles(primaryId, duplicateId) {
    if (primaryId === duplicateId) throw new Error('Không thể gộp chính một hồ sơ vào bản thân nó!');
    const primary = this.state.profiles.find(p => p.id === primaryId);
    const duplicate = this.state.profiles.find(p => p.id === duplicateId);
    if (!primary || !duplicate) throw new Error('Không tìm thấy hồ sơ để gộp!');

    this.state.groupMembers.forEach(gm => {
      if (gm.memberProfileId === duplicateId) {
        gm.memberProfileId = primaryId;
      }
    });

    this.state.payments.forEach(pay => {
      if (pay.memberProfileId === duplicateId) {
        pay.memberProfileId = primaryId;
      }
    });

    this.state.cycles.forEach(cyc => {
      if (cyc.winnerMemberProfileId === duplicateId) {
        cyc.winnerMemberProfileId = primaryId;
      }
    });

    duplicate.isMerged = true;
    duplicate.mergedIntoId = primaryId;
    primary.notes = (primary.notes ? primary.notes + '\n' : '') + `[Đã gộp từ hồ sơ: ${duplicate.fullName} (${duplicate.phone})]`;
    if (duplicate.riskNote) {
      primary.riskNote = (primary.riskNote ? primary.riskNote + '\n' : '') + `[Cảnh báo gộp]: ${duplicate.riskNote}`;
    }
    primary.latePaymentCount += duplicate.latePaymentCount;
    primary.completedHuiCount += duplicate.completedHuiCount;

    this.logAction('MERGE_PROFILE', 'MemberProfile', primaryId, `Gộp hồ sơ trùng: Chuyển toàn bộ dữ liệu của [${duplicate.fullName} - ${duplicate.phone}] vào [${primary.fullName} - ${primary.phone}]`);
    this.saveState();
  }

  // --- 8. QUẢN LÝ DÂY HỤI (HUI GROUP) ---
  createHuiGroup(groupData, membersData) {
    if (!groupData.name || !groupData.baseAmount || !groupData.totalParts) {
      throw new Error('Vui lòng điền đầy đủ tên dây, mức góp và số phần hụi!');
    }

    const newGroup = {
      id: 'grp-' + Date.now(),
      name: groupData.name.trim(),
      baseAmount: Number(groupData.baseAmount),
      totalParts: Number(groupData.totalParts),
      periodType: groupData.periodType || 'month',
      startDate: groupData.startDate || new Date().toISOString().split('T')[0],
      openDayRule: groupData.openDayRule || 'Định kỳ hàng tháng',
      drawMethod: groupData.drawMethod || 'bidding',
      commissionRate: Number(groupData.commissionRate) || 50,
      status: 'active',
      agreementNotes: groupData.agreementNotes || '',
      createdBy: this.currentAccount.id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.state.groups.push(newGroup);

    // Thêm các thành viên được chọn vào dây
    for (const mem of membersData) {
      const shares = Number(mem.sharesCount) || 1;
      const newGroupMem = {
        id: 'gm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        groupId: newGroup.id,
        memberProfileId: mem.memberProfileId,
        sharesCount: shares,
        hotedCycles: [],
        status: 'active',
        joinDate: newGroup.startDate,
        notes: mem.notes || ''
      };
      this.state.groupMembers.push(newGroupMem);

      const prof = this.state.profiles.find(p => p.id === mem.memberProfileId);
      if (prof) prof.activeHuiCount = (prof.activeHuiCount || 0) + 1;
    }

    // Tự động tạo Kỳ 1 cho dây hụi
    const newCycle = {
      id: 'cyc-' + Date.now(),
      groupId: newGroup.id,
      cycleNumber: 1,
      openDate: newGroup.startDate,
      winnerMemberProfileId: null,
      winningBidAmount: 0,
      totalCollected: 0,
      totalExpected: newGroup.baseAmount * (newGroup.totalParts - 1),
      potAmount: newGroup.baseAmount * (newGroup.totalParts - 1),
      commissionAmount: 0,
      status: 'open',
      incidentNote: 'Kỳ 1 khởi động.',
      closedAt: null,
      closedBy: null
    };
    this.state.cycles.push(newCycle);

    this.logAction('CREATE_HUI', 'HuiGroup', newGroup.id, `Tạo dây hụi mới "${newGroup.name}" gồm ${newGroup.totalParts} phần, mức góp ${newGroup.baseAmount.toLocaleString('vi-VN')}đ`);
    this.saveState();
    return newGroup;
  }

  // --- 9. KHUI HỤI & TÍNH TIỀN KỲ HỤI ---
  executeCycleDraw(cycleId, winnerProfileId, winningBidAmount, drawType, drawDetails = {}) {
    const cycle = this.state.cycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error('Không tìm thấy kỳ hụi!');
    const group = this.state.groups.find(g => g.id === cycle.groupId);
    if (!group) throw new Error('Không tìm thấy dây hụi!');

    const winnerProfile = this.state.profiles.find(p => p.id === winnerProfileId);
    if (!winnerProfile) throw new Error('Không tìm thấy thông tin người hốt!');

    const bid = Number(winningBidAmount) || 0;
    const oldCycle = { ...cycle };

    cycle.winnerMemberProfileId = winnerProfileId;
    cycle.winningBidAmount = bid;

    const groupMember = this.state.groupMembers.find(gm => gm.groupId === group.id && gm.memberProfileId === winnerProfileId);
    if (groupMember) {
      if (!groupMember.hotedCycles.includes(cycle.cycleNumber)) {
        groupMember.hotedCycles.push(cycle.cycleNumber);
      }
      groupMember.status = 'hoted';
    }
    winnerProfile.hotedCount = (winnerProfile.hotedCount || 0) + 1;

    let commission = 0;
    if (group.commissionRate > 0 && cycle.cycleNumber > 1) {
      commission = (group.baseAmount * group.commissionRate) / 100;
    }
    cycle.commissionAmount = commission;

    this.state.payments = this.state.payments.filter(p => p.cycleId !== cycle.id);

    const membersInGroup = this.state.groupMembers.filter(gm => gm.groupId === group.id);
    let totalExpected = 0;

    membersInGroup.forEach(gm => {
      const hasHotedBefore = gm.hotedCycles.some(cNum => cNum < cycle.cycleNumber);
      const isDeadHui = hasHotedBefore;

      let singleDue = isDeadHui ? group.baseAmount : (group.baseAmount - bid);
      let amountDue = singleDue * gm.sharesCount;

      if (gm.memberProfileId === winnerProfileId) {
        amountDue = 0;
      }

      totalExpected += amountDue;

      const newPayment = {
        id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        cycleId: cycle.id,
        groupId: group.id,
        memberProfileId: gm.memberProfileId,
        sharesCount: gm.sharesCount,
        isDeadHui,
        amountDue,
        amountPaid: gm.memberProfileId === winnerProfileId ? 0 : 0,
        paymentMethod: 'cash',
        status: gm.memberProfileId === winnerProfileId ? 'paid' : 'unpaid',
        paidAt: gm.memberProfileId === winnerProfileId ? new Date().toISOString() : null,
        recordedBy: this.currentAccount.fullName,
        note: gm.memberProfileId === winnerProfileId ? 'Phần hụi của người hốt tự trừ' : (isDeadHui ? 'Hụi chết đóng đủ gốc' : `Hụi sống (đã trừ thăm ${bid.toLocaleString('vi-VN')}đ)`),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.state.payments.push(newPayment);
    });

    cycle.totalExpected = totalExpected;
    cycle.potAmount = totalExpected - commission;
    cycle.status = 'open';

    if (drawType === 'random') {
      const rdRecord = {
        id: 'rd-' + Date.now(),
        groupId: group.id,
        cycleNumber: cycle.cycleNumber,
        eligibleCandidates: drawDetails.eligibleCandidates || [],
        excludedCandidates: drawDetails.excludedCandidates || [],
        winnerProfileId: winnerProfile.id,
        winnerName: `${winnerProfile.fullName} (${winnerProfile.nickname})`,
        drawTimestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
        isRedrawn: !!drawDetails.isRedrawn,
        redrawReason: drawDetails.redrawReason || '',
        drawnBy: this.currentAccount.fullName
      };
      this.state.randomDraws.unshift(rdRecord);
    }

    this.logAction('OPEN_CYCLE', 'HuiCycle', cycle.id, `Khui hụi Kỳ ${cycle.cycleNumber} Dây "${group.name}". Người hốt: ${winnerProfile.fullName} (${drawType === 'random' ? 'Quay Random' : 'Thăm: ' + bid.toLocaleString('vi-VN') + 'đ'})`, oldCycle, cycle);
    this.saveState();
    return cycle;
  }

  // --- 10. GHI NHẬN ĐÓNG TIỀN & XUẤT BIÊN NHẬN ---
  recordPayment(paymentId, data) {
    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Không tìm thấy giao dịch đóng tiền!');

    const oldData = { ...payment };
    const amountPaid = Number(data.amountPaid);
    const method = data.paymentMethod || 'cash';

    payment.amountPaid = amountPaid;
    payment.paymentMethod = method;
    payment.transactionRef = data.transactionRef ? data.transactionRef.trim() : '';
    payment.transferProofUrl = data.transferProofUrl || '';
    payment.note = data.note ? data.note.trim() : payment.note;
    payment.paidAt = new Date().toISOString().replace('T', ' ').substr(0, 19);
    payment.recordedBy = this.currentAccount.fullName;
    payment.updatedAt = new Date().toISOString();

    if (amountPaid >= payment.amountDue) {
      payment.status = 'paid';
    } else if (amountPaid > 0) {
      payment.status = 'partial';
    } else {
      payment.status = data.status || 'unpaid';
    }

    const cycle = this.state.cycles.find(c => c.id === payment.cycleId);
    if (cycle) {
      const allPaymentsOfCycle = this.state.payments.filter(p => p.cycleId === cycle.id);
      cycle.totalCollected = allPaymentsOfCycle.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    }

    const group = this.state.groups.find(g => g.id === payment.groupId);
    const payer = this.state.profiles.find(p => p.id === payment.memberProfileId);
    let receipt = null;

    if (amountPaid > 0 && payer && group && cycle) {
      receipt = {
        id: 'rec-' + Date.now(),
        receiptNumber: `BN-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        paymentId: payment.id,
        payerName: `${payer.fullName} (${payer.nickname})`,
        receiverName: this.currentAccount.fullName || 'Chủ Hụi',
        shopName: this.currentAccount.shopName || 'Sổ Hụi Miền Nam',
        amount: amountPaid,
        amountInWords: this.numberToVietnameseWords(amountPaid),
        huiName: group.name,
        cycleNumber: cycle.cycleNumber,
        paymentMethod: method === 'transfer' ? `Chuyển khoản ${payment.transactionRef ? '(Mã: ' + payment.transactionRef + ')' : ''}` : 'Tiền mặt',
        paymentDate: payment.paidAt,
        signaturePlaceholder: true,
        createdAt: new Date().toISOString()
      };
      this.state.receipts.unshift(receipt);
    }

    this.logAction('RECORD_PAYMENT', 'Payment', payment.id, `Ghi nhận thu ${amountPaid.toLocaleString('vi-VN')}đ từ ${payer?.fullName || 'Hụi viên'} cho Kỳ ${cycle?.cycleNumber || ''} Dây "${group?.name || ''}"`, oldData, payment);
    this.saveState();
    return { payment, receipt };
  }

  // --- 11. CHỐT KỲ HỤI & TẠO KỲ TIẾP THEO ---
  closeCycle(cycleId, incidentNote = '') {
    const cycle = this.state.cycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error('Không tìm thấy kỳ hụi!');
    const group = this.state.groups.find(g => g.id === cycle.groupId);
    if (!group) throw new Error('Không tìm thấy dây hụi!');

    cycle.status = 'closed';
    cycle.closedAt = new Date().toISOString().replace('T', ' ').substr(0, 19);
    cycle.closedBy = this.currentAccount.fullName;
    if (incidentNote) cycle.incidentNote = incidentNote;

    if (cycle.cycleNumber >= group.totalParts) {
      group.status = 'completed';
      this.logAction('CLOSE_CYCLE', 'HuiGroup', group.id, `Dây hụi "${group.name}" đã hoàn tất trọn vẹn ${group.totalParts} kỳ!`);
    } else {
      const nextCycleNumber = cycle.cycleNumber + 1;
      const nextCycle = {
        id: 'cyc-' + Date.now(),
        groupId: group.id,
        cycleNumber: nextCycleNumber,
        openDate: this.calculateNextOpenDate(cycle.openDate, group.periodType),
        winnerMemberProfileId: null,
        winningBidAmount: 0,
        totalCollected: 0,
        totalExpected: 0,
        potAmount: 0,
        commissionAmount: 0,
        status: 'open',
        incidentNote: `Kỳ số ${nextCycleNumber} chuẩn bị khui.`,
        closedAt: null,
        closedBy: null
      };
      this.state.cycles.push(nextCycle);
    }

    this.logAction('CLOSE_CYCLE', 'HuiCycle', cycle.id, `Chốt sổ hoàn tất Kỳ ${cycle.cycleNumber} Dây "${group.name}".`);
    this.saveState();
  }

  calculateNextOpenDate(currentDateStr, periodType) {
    try {
      const d = new Date(currentDateStr);
      if (periodType === 'day') {
        d.setDate(d.getDate() + 1);
      } else if (periodType === 'week') {
        d.setDate(d.getDate() + 7);
      } else if (periodType === 'half_month') {
        d.setDate(d.getDate() + 15);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      return d.toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }

  // --- 12. THUẬT TOÁN ĐỌC TIỀN TIẾNG VIỆT CHUẨN ---
  numberToVietnameseWords(n) {
    if (!n || isNaN(n) || n === 0) return 'Không đồng';
    const units = ['', 'ngàn', 'triệu', 'tỷ', 'ngàn tỷ', 'triệu tỷ'];
    const numbers = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

    function readGroup(num) {
      let h = Math.floor(num / 100);
      let t = Math.floor((num % 100) / 10);
      let o = num % 10;
      let res = '';

      if (h > 0 || t > 0 || o > 0) {
        res += numbers[h] + ' trăm ';
        if (t === 0 && o > 0) {
          res += 'lẻ ' + numbers[o] + ' ';
        } else if (t === 1) {
          res += 'mười ';
          if (o === 1) res += 'một ';
          else if (o === 5) res += 'lăm ';
          else if (o > 0) res += numbers[o] + ' ';
        } else if (t > 1) {
          res += numbers[t] + ' mươi ';
          if (o === 1) res += 'mốt ';
          else if (o === 4) res += 'tư ';
          else if (o === 5) res += 'lăm ';
          else if (o > 0) res += numbers[o] + ' ';
        }
      }
      return res.trim();
    }

    let numStr = Math.round(n).toString();
    let groups = [];
    while (numStr.length > 0) {
      groups.push(parseInt(numStr.slice(-3), 10));
      numStr = numStr.slice(0, -3);
    }

    let words = [];
    for (let i = 0; i < groups.length; i++) {
      let grp = groups[i];
      if (grp > 0) {
        let grpWords = readGroup(grp);
        if (units[i]) {
          grpWords += ' ' + units[i];
        }
        words.unshift(grpWords);
      }
    }

    let finalStr = words.join(' ').replace(/\s+/g, ' ').trim();
    if (!finalStr) return 'Không đồng';
    return finalStr.charAt(0).toUpperCase() + finalStr.slice(1) + ' đồng chẵn';
  }
}

export const store = new SoHuiStore();
