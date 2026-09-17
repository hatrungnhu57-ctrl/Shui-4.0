/**
 * SỔ HỤI - QUẢN LÝ DỮ LIỆU & LOGIC NGHIỆP VỤ (STATE STORE)
 * Hỗ trợ LocalStorage, Reactive Subscriptions, Audit Logs, Soft Delete
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

class SoHuiStore {
  constructor() {
    this.storageKey = 'SO_HUI_DB_V1';
    this.currentUserKey = 'SO_HUI_CURRENT_USER';
    this.currentRoleKey = 'SO_HUI_CURRENT_ROLE';
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu từ LocalStorage, dùng dữ liệu mặc định:', e);
    }

    // Khởi tạo mặc định nếu chưa có
    const defaultState = {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0], // Mặc định Cô Bảy
      currentRole: 'owner', // 'owner' | 'member' | 'hybrid'
      profiles: INITIAL_PROFILES,
      groups: INITIAL_GROUPS,
      groupMembers: INITIAL_GROUP_MEMBERS,
      cycles: INITIAL_CYCLES,
      payments: INITIAL_PAYMENTS,
      receipts: INITIAL_RECEIPTS,
      randomDraws: INITIAL_RANDOM_DRAWS,
      logs: INITIAL_ACTIVITY_LOGS,
      notifications: INITIAL_NOTIFICATIONS
    };
    this.saveState(defaultState);
    return defaultState;
  }

  saveState(newState = this.state) {
    try {
      this.state = newState;
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Không thể lưu dữ liệu vào LocalStorage:', e);
    }
  }

  resetToDemoData() {
    localStorage.removeItem(this.storageKey);
    this.state = {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0],
      currentRole: 'owner',
      profiles: INITIAL_PROFILES,
      groups: INITIAL_GROUPS,
      groupMembers: INITIAL_GROUP_MEMBERS,
      cycles: INITIAL_CYCLES,
      payments: INITIAL_PAYMENTS,
      receipts: INITIAL_RECEIPTS,
      randomDraws: INITIAL_RANDOM_DRAWS,
      logs: INITIAL_ACTIVITY_LOGS,
      notifications: INITIAL_NOTIFICATIONS
    };
    this.saveState();
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

  // --- QUẢN LÝ VAI TRÒ & NGƯỜI DÙNG HIỆN TẠI ---
  setCurrentRole(role) {
    this.state.currentRole = role;
    if (role === 'owner') {
      this.state.currentUser = this.state.users.find(u => u.role === 'owner') || this.state.users[0];
    } else if (role === 'member') {
      this.state.currentUser = this.state.users.find(u => u.role === 'member') || this.state.users[1];
    } else {
      this.state.currentUser = this.state.users.find(u => u.role === 'hybrid') || this.state.users[2];
    }
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

  // --- LOGGING VÀ KIỂM TOÁN ---
  logAction(action, targetType, targetId, description, oldData = null, newData = null) {
    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      action,
      actorName: this.state.currentUser.fullName,
      targetType,
      targetId,
      oldData,
      newData,
      description,
      timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19)
    };
    this.state.logs.unshift(newLog);
    this.saveState();
  }

  // --- QUẢN LÝ DANH BẠ HỤI VIÊN (MEMBER PROFILE) ---
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
    if (this.checkPhoneExists(normPhone)) {
      throw new Error(`Số điện thoại "${normPhone}" đã tồn tại trong danh bạ hụi viên!`);
    }

    const newProfile = {
      id: 'mp-' + Date.now(),
      fullName: data.fullName.trim(),
      nickname: data.nickname ? data.nickname.trim() : '',
      phone: normPhone,
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
    this.logAction('ADD_MEMBER', 'MemberProfile', newProfile.id, `Thêm hụi viên mới vào danh bạ: ${newProfile.fullName} (${newProfile.nickname}) - SĐT: ${newProfile.phone}`);
    this.saveState();
    return newProfile;
  }

  updateMemberProfile(id, data) {
    const profile = this.state.profiles.find(p => p.id === id);
    if (!profile) throw new Error('Không tìm thấy hụi viên!');

    const normPhone = this.normalizePhone(data.phone);
    if (normPhone !== profile.phone && this.checkPhoneExists(normPhone, id)) {
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

    // Chuyển toàn bộ groupMembers, payments, cycles sang primaryId
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

  // --- QUẢN LÝ DÂY HỤI (HUI GROUP) ---
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
      createdBy: this.state.currentUser.id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.state.groups.push(newGroup);

    // Thêm các thành viên được chọn vào dây
    let assignedPartsCount = 0;
    for (const mem of membersData) {
      const shares = Number(mem.sharesCount) || 1;
      assignedPartsCount += shares;
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

      // Cập nhật số dây đang tham gia trong profile
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

  // --- KHUI HỤI & TÍNH TIỀN KỲ HỤI ---
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

    // Cập nhật trạng thái hoted trong groupMember
    const groupMember = this.state.groupMembers.find(gm => gm.groupId === group.id && gm.memberProfileId === winnerProfileId);
    if (groupMember) {
      if (!groupMember.hotedCycles.includes(cycle.cycleNumber)) {
        groupMember.hotedCycles.push(cycle.cycleNumber);
      }
      groupMember.status = 'hoted';
    }
    winnerProfile.hotedCount = (winnerProfile.hotedCount || 0) + 1;

    // Tính toán tiền thảo
    let commission = 0;
    if (group.commissionRate > 0 && cycle.cycleNumber > 1) {
      commission = (group.baseAmount * group.commissionRate) / 100;
    }
    cycle.commissionAmount = commission;

    // Xóa các payments cũ chưa chốt của kỳ này nếu có và tạo bảng kê thanh toán chi tiết
    this.state.payments = this.state.payments.filter(p => p.cycleId !== cycle.id);

    const membersInGroup = this.state.groupMembers.filter(gm => gm.groupId === group.id);
    let totalExpected = 0;

    membersInGroup.forEach(gm => {
      // Xác định xem thành viên này đóng theo diện Hụi Chết hay Hụi Sống
      // Hụi chết nếu đã hốt ở các kỳ TRƯỚC kỳ hiện tại
      const hasHotedBefore = gm.hotedCycles.some(cNum => cNum < cycle.cycleNumber);
      const isDeadHui = hasHotedBefore;

      let singleDue = isDeadHui ? group.baseAmount : (group.baseAmount - bid);
      let amountDue = singleDue * gm.sharesCount;

      // Nếu chính là người hốt kỳ này, họ không phải nộp cho phần họ hốt
      if (gm.memberProfileId === winnerProfileId) {
        amountDue = 0; // Tự trừ
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
        recordedBy: this.state.currentUser.fullName,
        note: gm.memberProfileId === winnerProfileId ? 'Phần hụi của người hốt tự trừ' : (isDeadHui ? 'Hụi chết đóng đủ gốc' : `Hụi sống (đã trừ thăm ${bid.toLocaleString('vi-VN')}đ)`),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.state.payments.push(newPayment);
    });

    cycle.totalExpected = totalExpected;
    cycle.potAmount = totalExpected - commission;
    cycle.status = 'open';

    // Nếu là quay random, lưu vào randomDraws
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
        drawnBy: this.state.currentUser.fullName
      };
      this.state.randomDraws.unshift(rdRecord);
    }

    this.logAction('OPEN_CYCLE', 'HuiCycle', cycle.id, `Khui hụi Kỳ ${cycle.cycleNumber} Dây "${group.name}". Người hốt: ${winnerProfile.fullName} (${drawType === 'random' ? 'Quay Random' : 'Thăm: ' + bid.toLocaleString('vi-VN') + 'đ'})`, oldCycle, cycle);
    this.saveState();
    return cycle;
  }

  // --- GHI NHẬN ĐÓNG TIỀN & XUẤT BIÊN NHẬN ---
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
    payment.recordedBy = this.state.currentUser.fullName;
    payment.updatedAt = new Date().toISOString();

    if (amountPaid >= payment.amountDue) {
      payment.status = 'paid';
    } else if (amountPaid > 0) {
      payment.status = 'partial';
    } else {
      payment.status = data.status || 'unpaid';
    }

    // Cập nhật tổng tiền thu trong cycle
    const cycle = this.state.cycles.find(c => c.id === payment.cycleId);
    if (cycle) {
      const allPaymentsOfCycle = this.state.payments.filter(p => p.cycleId === cycle.id);
      cycle.totalCollected = allPaymentsOfCycle.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    }

    // Tự động tạo Biên nhận điện tử
    const group = this.state.groups.find(g => g.id === payment.groupId);
    const payer = this.state.profiles.find(p => p.id === payment.memberProfileId);
    let receipt = null;

    if (amountPaid > 0 && payer && group && cycle) {
      receipt = {
        id: 'rec-' + Date.now(),
        receiptNumber: `BN-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
        paymentId: payment.id,
        payerName: `${payer.fullName} (${payer.nickname})`,
        receiverName: this.state.currentUser.fullName,
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

  // --- CHỐT KỲ HỤI & TẠO KỲ TIẾP THEO ---
  closeCycle(cycleId, incidentNote = '') {
    const cycle = this.state.cycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error('Không tìm thấy kỳ hụi!');
    const group = this.state.groups.find(g => g.id === cycle.groupId);
    if (!group) throw new Error('Không tìm thấy dây hụi!');

    cycle.status = 'closed';
    cycle.closedAt = new Date().toISOString().replace('T', ' ').substr(0, 19);
    cycle.closedBy = this.state.currentUser.fullName;
    if (incidentNote) cycle.incidentNote = incidentNote;

    // Kiểm tra xem đã hết số kỳ của dây hụi chưa
    if (cycle.cycleNumber >= group.totalParts) {
      group.status = 'completed';
      this.logAction('CLOSE_CYCLE', 'HuiGroup', group.id, `Dây hụi "${group.name}" đã hoàn tất trọn vẹn ${group.totalParts} kỳ!`);
    } else {
      // Tự động mở Kỳ tiếp theo
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

  // --- THUẬT TOÁN ĐỌC TIỀN TIẾNG VIỆT CHUẨN ---
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
        if (t === 0 && o > 0) res += 'lẻ ' + numbers[o];
        if (t === 1) res += 'mười ' + (o === 5 ? 'lăm' : (o > 0 ? numbers[o] : ''));
        if (t > 1) res += numbers[t] + ' mươi ' + (o === 1 ? 'mốt' : (o === 5 ? 'lăm' : (o > 0 ? numbers[o] : '')));
      }
      return res.trim();
    }

    let str = Math.floor(n).toString();
    let groups = [];
    while (str.length > 0) {
      groups.push(parseInt(str.slice(-3), 10));
      str = str.slice(0, -3);
    }

    let words = [];
    for (let i = 0; i < groups.length; i++) {
      let g = groups[i];
      if (g > 0) {
        let grpWords = readGroup(g);
        if (units[i]) grpWords += ' ' + units[i];
        words.unshift(grpWords);
      }
    }

    let result = words.join(' ').replace(/\s+/g, ' ').trim() + ' đồng';
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
}

export const store = new SoHuiStore();
