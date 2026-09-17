/**
 * DỮ LIỆU KHỞI TẠO DEMO (MOCK DATA)
 * Sổ Hụi - Đầy đủ các trường hợp hụi sống, hụi chết, trễ hạn, cảnh báo nợ, quay random
 */

export const INITIAL_USERS = [
  {
    id: "u-owner",
    fullName: "Nguyễn Thị Bảy (Cô Bảy)",
    phone: "0918123456",
    role: "owner",
    avatar: "👩‍💼",
    title: "Chủ Hụi Uy Tín - Chợ Vĩnh Kim"
  },
  {
    id: "u-member",
    fullName: "Trần Văn Ba (Anh Ba Khía)",
    phone: "0909888999",
    role: "member",
    avatar: "👨‍🌾",
    title: "Hụi Viên - Nông Trại Vườn Sầu Riêng"
  },
  {
    id: "u-hybrid",
    fullName: "Lê Thị Út Lành (Chị Út)",
    phone: "0987654321",
    role: "hybrid",
    avatar: "🧕",
    title: "Chủ Hụi kiêm Hụi Viên - Tiệm May Út Lành"
  }
];

export const INITIAL_PROFILES = [
  {
    id: "mp-1",
    fullName: "Nguyễn Thị Bảy",
    nickname: "Cô Bảy Chủ Thảo",
    phone: "0918123456",
    address: "Ấp Vĩnh Hòa, Vĩnh Kim, Châu Thành, Tiền Giang",
    notes: "Chủ hụi thâm niên 15 năm, uy tín tuyệt đối tại khu chợ",
    creditRating: 5,
    activeHuiCount: 3,
    completedHuiCount: 18,
    latePaymentCount: 0,
    hotedCount: 3,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-01-01"
  },
  {
    id: "mp-2",
    fullName: "Trần Văn Ba",
    nickname: "Anh Ba Khía",
    phone: "0909888999",
    address: "Xã Tam Bình, Cai Lậy, Tiền Giang",
    notes: "Chủ vựa sầu riêng, tài chính mạnh, luôn đóng tiền trước ngày khui",
    creditRating: 5,
    activeHuiCount: 2,
    completedHuiCount: 8,
    latePaymentCount: 0,
    hotedCount: 1,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-02-10"
  },
  {
    id: "mp-3",
    fullName: "Lê Thị Tư",
    nickname: "Chị Tư Cà Mau",
    phone: "0939111222",
    address: "Chợ Nổi Cái Răng, Cần Thơ",
    notes: "Tiểu thương bán trái cây ghe hàng, tính tình xởi lởi",
    creditRating: 4,
    activeHuiCount: 2,
    completedHuiCount: 5,
    latePaymentCount: 1,
    hotedCount: 1,
    riskNote: "Từng trễ 1 ngày do ghe hàng bị kẹt phà, đã thanh toán đủ",
    isMerged: false,
    createdAt: "2024-03-15"
  },
  {
    id: "mp-4",
    fullName: "Phạm Văn Năm",
    nickname: "Chú Năm Tạp Hóa",
    phone: "0913444555",
    address: "Ngã ba Chợ Giữa, Vĩnh Long",
    notes: "Chủ tiệm bách hóa tổng hợp, tham gia hụi để tích lũy dưỡng già",
    creditRating: 5,
    activeHuiCount: 2,
    completedHuiCount: 12,
    latePaymentCount: 0,
    hotedCount: 0,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-01-20"
  },
  {
    id: "mp-5",
    fullName: "Hoàng Thị Sáu",
    nickname: "Chị Sáu Bến Tre",
    phone: "0977666777",
    address: "Mỏ Cày Nam, Bến Tre",
    notes: "Kinh doanh kẹo dừa và dừa xiêm xuất khẩu",
    creditRating: 4,
    activeHuiCount: 2,
    completedHuiCount: 6,
    latePaymentCount: 0,
    hotedCount: 1,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-04-01"
  },
  {
    id: "mp-6",
    fullName: "Trần Văn Tám",
    nickname: "Bác Tám Chợ Gạo",
    phone: "0945888777",
    address: "Chợ Gạo, Tiền Giang",
    notes: "Cựu giáo viên hưu trí, rất nghiêm túc và đúng giờ",
    creditRating: 5,
    activeHuiCount: 1,
    completedHuiCount: 10,
    latePaymentCount: 0,
    hotedCount: 0,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-01-15"
  },
  {
    id: "mp-7",
    fullName: "Lê Thị Út Lành",
    nickname: "Chị Út Lành",
    phone: "0987654321",
    address: "Đường Hùng Vương, Phường 2, TP. Mỹ Tho",
    notes: "Chủ tiệm may áo dài Út Lành, chơi 2 phần ở dây 2 triệu",
    creditRating: 5,
    activeHuiCount: 2,
    completedHuiCount: 7,
    latePaymentCount: 0,
    hotedCount: 1,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-02-01"
  },
  {
    id: "mp-8",
    fullName: "Đỗ Văn Mười",
    nickname: "Anh Mười Cò Đất",
    phone: "0969999000",
    address: "Huyện Cai Lậy, Tiền Giang",
    notes: "Môi giới nhà đất, thường đóng tiền sát giờ, hay xin khất",
    creditRating: 2,
    activeHuiCount: 1,
    completedHuiCount: 2,
    latePaymentCount: 3,
    hotedCount: 1,
    riskNote: "CẢNH BÁO: Từng trễ 3 kỳ ở dây trước, đang còn nợ 1.500.000đ tiền hụi chết kỳ 2 dây 5 triệu. Cần giám sát chặt chẽ!",
    isMerged: false,
    createdAt: "2024-05-12"
  },
  {
    id: "mp-9",
    fullName: "Võ Thị Hồng",
    nickname: "Cô Hồng Cá Kiểng",
    phone: "0902333444",
    address: "TP. Cao Lãnh, Đồng Tháp",
    notes: "Nuôi cá kiểng bán chợ nổi",
    creditRating: 4,
    activeHuiCount: 1,
    completedHuiCount: 3,
    latePaymentCount: 0,
    hotedCount: 0,
    riskNote: "",
    isMerged: false,
    createdAt: "2024-06-01"
  },
  {
    id: "mp-10",
    fullName: "Nguyễn Văn Đực",
    nickname: "Chú Chín Vịt Cỏ",
    phone: "0919222333",
    address: "Huyện Tháp Mười, Đồng Tháp",
    notes: "Chủ đàn vịt chạy đồng 5.000 con",
    creditRating: 4,
    activeHuiCount: 1,
    completedHuiCount: 4,
    latePaymentCount: 1,
    hotedCount: 0,
    riskNote: "Đóng tiền phụ thuộc vào lứa xuất chuồng, nhưng luôn tất toán đủ",
    isMerged: false,
    createdAt: "2024-06-15"
  }
];

export const INITIAL_GROUPS = [
  {
    id: "grp-1",
    name: "Dây 2 Triệu Chợ Chiều Vĩnh Kim",
    baseAmount: 2000000,
    totalParts: 12,
    periodType: "month",
    startDate: "2026-06-15",
    openDayRule: "Mùng 15 Tây hàng tháng",
    drawMethod: "bidding", // Kêu hụi bỏ lãi
    commissionRate: 50, // 50% mức 1 phần (1.000.000đ khi hốt)
    status: "active",
    agreementNotes: "Hụi viên nộp tiền trong vòng 24h sau khi khui. Người hốt chịu tiền thảo 1.000.000đ cho chủ hụi. Ai trễ hạn quá 3 ngày chịu phạt 50.000đ/ngày.",
    createdBy: "mp-1",
    createdAt: "2026-06-01"
  },
  {
    id: "grp-2",
    name: "Dây 5 Triệu Tương Trợ Miệt Vườn (Random)",
    baseAmount: 5000000,
    totalParts: 10,
    periodType: "month",
    startDate: "2026-07-01",
    openDayRule: "Mùng 01 Tây hàng tháng",
    drawMethod: "random", // Quay ngẫu nhiên
    commissionRate: 0, // Hụi tương trợ không lấy tiền thảo
    status: "active",
    agreementNotes: "Dây hụi không lãi tương trợ quay số ngẫu nhiên hoàn toàn qua app Sổ Hụi trước sự chứng kiến của mọi người. Người trúng hốt trọn 50 triệu không mất lãi.",
    createdBy: "mp-1",
    createdAt: "2026-06-20"
  },
  {
    id: "grp-3",
    name: "Dây Tuần 500k Chị Em Tiệm May",
    baseAmount: 500000,
    totalParts: 15,
    periodType: "week",
    startDate: "2026-08-01",
    openDayRule: "Chiều Thứ 7 hàng tuần (16:00)",
    drawMethod: "secret_ballot", // Bỏ thăm kín
    commissionRate: 50, // 250k tiền thảo
    status: "active",
    agreementNotes: "Hụi chị em bạn hữu khui chiều thứ 7, đóng bằng tiền mặt hoặc chuyển khoản MoMo/Vietcombank.",
    createdBy: "mp-7", // Do Chị Út Lành làm chủ
    createdAt: "2026-07-25"
  }
];

export const INITIAL_GROUP_MEMBERS = [
  // Dây 1: "Dây 2 Triệu Chợ Chiều" (12 phần)
  { id: "gm-1-1", groupId: "grp-1", memberProfileId: "mp-1", sharesCount: 1, hotedCycles: [1], status: "hoted", joinDate: "2026-06-01", notes: "Chủ hụi hưởng phần đầu (kỳ 1)" },
  { id: "gm-1-2", groupId: "grp-1", memberProfileId: "mp-2", sharesCount: 1, hotedCycles: [2], status: "hoted", joinDate: "2026-06-01", notes: "Đã hốt kỳ 2 (thăm 350.000đ)" },
  { id: "gm-1-3", groupId: "grp-1", memberProfileId: "mp-3", sharesCount: 1, hotedCycles: [3], status: "hoted", joinDate: "2026-06-01", notes: "Đã hốt kỳ 3 (thăm 300.000đ)" },
  { id: "gm-1-4", groupId: "grp-1", memberProfileId: "mp-4", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-01", notes: "Hụi sống" },
  { id: "gm-1-5", groupId: "grp-1", memberProfileId: "mp-5", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-01", notes: "Hụi sống" },
  { id: "gm-1-6", groupId: "grp-1", memberProfileId: "mp-6", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-01", notes: "Hụi sống" },
  { id: "gm-1-7", groupId: "grp-1", memberProfileId: "mp-7", sharesCount: 2, hotedCycles: [], status: "active", joinDate: "2026-06-01", notes: "Chơi 2 phần hụi sống" },
  { id: "gm-1-8", groupId: "grp-1", memberProfileId: "mp-8", sharesCount: 1, hotedCycles: [], status: "in_debt", joinDate: "2026-06-01", notes: "Hụi sống nhưng hay chậm trễ" },
  { id: "gm-1-9", groupId: "grp-1", memberProfileId: "mp-9", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-01", notes: "Hụi sống" },
  { id: "gm-1-10", groupId: "grp-1", memberProfileId: "mp-10", sharesCount: 2, hotedCycles: [], status: "active", joinDate: "2026-06-01", notes: "Chơi 2 phần hụi sống" },

  // Dây 2: "Dây 5 Triệu Random" (10 phần)
  { id: "gm-2-1", groupId: "grp-2", memberProfileId: "mp-1", sharesCount: 1, hotedCycles: [1], status: "hoted", joinDate: "2026-06-20", notes: "Kỳ 1" },
  { id: "gm-2-2", groupId: "grp-2", memberProfileId: "mp-2", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-20", notes: "Chưa hốt" },
  { id: "gm-2-3", groupId: "grp-2", memberProfileId: "mp-4", sharesCount: 1, hotedCycles: [2], status: "hoted", joinDate: "2026-06-20", notes: "Đã trúng random kỳ 2" },
  { id: "gm-2-4", groupId: "grp-2", memberProfileId: "mp-5", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-20", notes: "Chưa hốt" },
  { id: "gm-2-5", groupId: "grp-2", memberProfileId: "mp-6", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-20", notes: "Chưa hốt" },
  { id: "gm-2-6", groupId: "grp-2", memberProfileId: "mp-7", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-20", notes: "Chưa hốt" },
  { id: "gm-2-7", groupId: "grp-2", memberProfileId: "mp-8", sharesCount: 1, hotedCycles: [], status: "in_debt", joinDate: "2026-06-20", notes: "Đang nợ kỳ 2 chưa đóng" },
  { id: "gm-2-8", groupId: "grp-2", memberProfileId: "mp-9", sharesCount: 1, hotedCycles: [], status: "active", joinDate: "2026-06-20", notes: "Chưa hốt" },
  { id: "gm-2-9", groupId: "grp-2", memberProfileId: "mp-10", sharesCount: 2, hotedCycles: [], status: "active", joinDate: "2026-06-20", notes: "Chơi 2 phần" }
];

export const INITIAL_CYCLES = [
  // Dây 1 - Kỳ 1: Khởi động (Chủ hụi hốt)
  {
    id: "cyc-1-1",
    groupId: "grp-1",
    cycleNumber: 1,
    openDate: "2026-06-15",
    winnerMemberProfileId: "mp-1",
    winningBidAmount: 0,
    totalCollected: 22000000,
    totalExpected: 22000000,
    potAmount: 22000000,
    commissionAmount: 0,
    status: "closed",
    incidentNote: "Kỳ đầu chủ hụi hưởng theo tập quán.",
    closedAt: "2026-06-16 10:00:00",
    closedBy: "mp-1"
  },
  // Dây 1 - Kỳ 2: Anh Ba Khía hốt (Thăm 350k)
  {
    id: "cyc-1-2",
    groupId: "grp-1",
    cycleNumber: 2,
    openDate: "2026-07-15",
    winnerMemberProfileId: "mp-2",
    winningBidAmount: 350000,
    totalCollected: 18500000,
    totalExpected: 18500000,
    potAmount: 17500000,
    commissionAmount: 1000000,
    status: "closed",
    incidentNote: "Anh Ba Khía kêu hụi trúng 350k, hụi sống nộp 1.650k, hụi chết nộp 2tr.",
    closedAt: "2026-07-16 15:30:00",
    closedBy: "mp-1"
  },
  // Dây 1 - Kỳ 3: Chị Tư Cà Mau hốt (Thăm 300k)
  {
    id: "cyc-1-3",
    groupId: "grp-1",
    cycleNumber: 3,
    openDate: "2026-08-15",
    winnerMemberProfileId: "mp-3",
    winningBidAmount: 300000,
    totalCollected: 19300000,
    totalExpected: 19300000,
    potAmount: 18300000,
    commissionAmount: 1000000,
    status: "closed",
    incidentNote: "Đã thu đủ và giao tiền mặt đầy đủ cho Chị Tư.",
    closedAt: "2026-08-16 11:20:00",
    closedBy: "mp-1"
  },
  // Dây 1 - Kỳ 4: Kỳ hiện tại đang mở thu tiền (Mùng 15/09/2026 vừa khui xong)
  {
    id: "cyc-1-4",
    groupId: "grp-1",
    cycleNumber: 4,
    openDate: "2026-09-15",
    winnerMemberProfileId: "mp-5", // Chị Sáu Bến Tre trúng thăm 280k
    winningBidAmount: 280000,
    totalCollected: 14760000,
    totalExpected: 19760000,
    potAmount: 18760000,
    commissionAmount: 1000000,
    status: "open",
    incidentNote: "Chị Sáu Bến Tre trúng hụi 280k. Hụi chết: mp-1, mp-2, mp-3 (2.000k/chân). Hụi sống: 1.720k/chân. Còn 2 người chưa nộp.",
    closedAt: null,
    closedBy: null
  },

  // Dây 2 - Kỳ 1: Random kỳ 1
  {
    id: "cyc-2-1",
    groupId: "grp-2",
    cycleNumber: 1,
    openDate: "2026-07-01",
    winnerMemberProfileId: "mp-1",
    winningBidAmount: 0,
    totalCollected: 45000000,
    totalExpected: 45000000,
    potAmount: 45000000,
    commissionAmount: 0,
    status: "closed",
    incidentNote: "Dây tương trợ không lãi.",
    closedAt: "2026-07-02 09:00:00",
    closedBy: "mp-1"
  },
  // Dây 2 - Kỳ 2: Random kỳ 2 (Chú Năm Tạp Hóa trúng)
  {
    id: "cyc-2-2",
    groupId: "grp-2",
    cycleNumber: 2,
    openDate: "2026-08-01",
    winnerMemberProfileId: "mp-4",
    winningBidAmount: 0,
    totalCollected: 40000000,
    totalExpected: 45000000,
    potAmount: 45000000,
    commissionAmount: 0,
    status: "closed",
    incidentNote: "Quay random trúng Chú Năm. Anh Mười (mp-8) chưa nộp 5tr, chủ hụi đã tạm ứng giao đủ cho Chú Năm.",
    closedAt: "2026-08-03 14:00:00",
    closedBy: "mp-1"
  },
  // Dây 2 - Kỳ 3: Chuẩn bị khui (Ngày 01/10/2026)
  {
    id: "cyc-2-3",
    groupId: "grp-2",
    cycleNumber: 3,
    openDate: "2026-10-01",
    winnerMemberProfileId: null,
    winningBidAmount: 0,
    totalCollected: 0,
    totalExpected: 45000000,
    potAmount: 45000000,
    commissionAmount: 0,
    status: "open",
    incidentNote: "Sắp tới ngày khui random kỳ 3.",
    closedAt: null,
    closedBy: null
  }
];

export const INITIAL_PAYMENTS = [
  // Các khoản đóng Kỳ 4 của Dây 1:
  // Hụi chết: mp-1 (Chủ hụi tự trừ), mp-2 (Anh Ba Khía đã đóng CK 2tr), mp-3 (Chị Tư Cà Mau đã đóng tiền mặt 2tr)
  {
    id: "pay-1",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-1",
    sharesCount: 1,
    isDeadHui: true,
    amountDue: 2000000,
    amountPaid: 2000000,
    paymentMethod: "cash",
    status: "paid",
    paidAt: "2026-09-15 10:00:00",
    recordedBy: "Cô Bảy",
    note: "Hụi chết kỳ 1 tự khấu trừ",
    createdAt: "2026-09-15 10:00:00",
    updatedAt: "2026-09-15 10:00:00"
  },
  {
    id: "pay-2",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-2",
    sharesCount: 1,
    isDeadHui: true,
    amountDue: 2000000,
    amountPaid: 2000000,
    paymentMethod: "transfer",
    transactionRef: "VCB.20260915.99281",
    status: "paid",
    paidAt: "2026-09-15 14:20:00",
    recordedBy: "Cô Bảy",
    note: "Anh Ba Khía chuyển khoản Vietcombank",
    createdAt: "2026-09-15 14:25:00",
    updatedAt: "2026-09-15 14:25:00"
  },
  {
    id: "pay-3",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-3",
    sharesCount: 1,
    isDeadHui: true,
    amountDue: 2000000,
    amountPaid: 2000000,
    paymentMethod: "cash",
    status: "paid",
    paidAt: "2026-09-15 16:00:00",
    recordedBy: "Cô Bảy",
    note: "Chị Tư ghé nhà gửi tiền mặt",
    createdAt: "2026-09-15 16:05:00",
    updatedAt: "2026-09-15 16:05:00"
  },
  // Hụi sống (1.720k/phần): Chú Năm (mp-4) đã nộp, Chị Út Lành (mp-7 chơi 2 phần = 3.440k) đã nộp, Bác Tám (mp-6) đã nộp
  {
    id: "pay-4",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-4",
    sharesCount: 1,
    isDeadHui: false,
    amountDue: 1720000,
    amountPaid: 1720000,
    paymentMethod: "transfer",
    transactionRef: "MB.20260916.11029",
    status: "paid",
    paidAt: "2026-09-16 08:30:00",
    recordedBy: "Cô Bảy",
    note: "Chú Năm chuyển khoản MBBank",
    createdAt: "2026-09-16 08:35:00",
    updatedAt: "2026-09-16 08:35:00"
  },
  {
    id: "pay-5",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-7",
    sharesCount: 2,
    isDeadHui: false,
    amountDue: 3440000,
    amountPaid: 3440000,
    paymentMethod: "transfer",
    transactionRef: "ACB.20260916.44812",
    status: "paid",
    paidAt: "2026-09-16 09:15:00",
    recordedBy: "Cô Bảy",
    note: "Chị Út Lành đóng đủ cho 2 chân",
    createdAt: "2026-09-16 09:20:00",
    updatedAt: "2026-09-16 09:20:00"
  },
  {
    id: "pay-6",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-6",
    sharesCount: 1,
    isDeadHui: false,
    amountDue: 1720000,
    amountPaid: 1720000,
    paymentMethod: "cash",
    status: "paid",
    paidAt: "2026-09-16 11:00:00",
    recordedBy: "Cô Bảy",
    note: "Bác Tám gửi tiền mặt tại sạp",
    createdAt: "2026-09-16 11:05:00",
    updatedAt: "2026-09-16 11:05:00"
  },
  {
    id: "pay-7",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-9",
    sharesCount: 1,
    isDeadHui: false,
    amountDue: 1720000,
    amountPaid: 1720000,
    paymentMethod: "transfer",
    transactionRef: "VCB.20260916.77234",
    status: "paid",
    paidAt: "2026-09-16 15:45:00",
    recordedBy: "Cô Bảy",
    note: "Cô Hồng Cá Kiểng chuyển khoản",
    createdAt: "2026-09-16 15:50:00",
    updatedAt: "2026-09-16 15:50:00"
  },
  // CHƯA ĐÓNG / TRỄ HẠN:
  // 1. Anh Mười (mp-8): 1 phần = 1.720.000đ (Chưa đóng - Trễ hạn)
  {
    id: "pay-8",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-8",
    sharesCount: 1,
    isDeadHui: false,
    amountDue: 1720000,
    amountPaid: 0,
    paymentMethod: "cash",
    status: "late",
    paidAt: null,
    recordedBy: "Cô Bảy",
    note: "Đã gọi điện 2 lần, hứa chiều 17/09 đóng",
    createdAt: "2026-09-15 10:00:00",
    updatedAt: "2026-09-17 08:00:00"
  },
  // 2. Chú Chín Vịt Cỏ (mp-10): 2 phần = 3.440.000đ (Chưa đóng)
  {
    id: "pay-9",
    cycleId: "cyc-1-4",
    groupId: "grp-1",
    memberProfileId: "mp-10",
    sharesCount: 2,
    isDeadHui: false,
    amountDue: 3440000,
    amountPaid: 0,
    paymentMethod: "cash",
    status: "unpaid",
    paidAt: null,
    recordedBy: "Cô Bảy",
    note: "Đang lùa vịt ở Đồng Tháp, hẹn tối chuyển khoản",
    createdAt: "2026-09-15 10:00:00",
    updatedAt: "2026-09-15 10:00:00"
  }
];

export const INITIAL_RECEIPTS = [
  {
    id: "rec-1",
    receiptNumber: "BN-202609-001",
    paymentId: "pay-2",
    payerName: "Trần Văn Ba (Anh Ba Khía)",
    receiverName: "Nguyễn Thị Bảy (Cô Bảy)",
    amount: 2000000,
    amountInWords: "Hai triệu đồng chẵn",
    huiName: "Dây 2 Triệu Chợ Chiều Vĩnh Kim",
    cycleNumber: 4,
    paymentMethod: "Chuyển khoản Vietcombank (Mã: VCB.20260915.99281)",
    paymentDate: "2026-09-15 14:20:00",
    signaturePlaceholder: true,
    createdAt: "2026-09-15 14:25:00"
  },
  {
    id: "rec-2",
    receiptNumber: "BN-202609-002",
    paymentId: "pay-5",
    payerName: "Lê Thị Út Lành (Chị Út)",
    receiverName: "Nguyễn Thị Bảy (Cô Bảy)",
    amount: 3440000,
    amountInWords: "Ba triệu bốn trăm bốn mươi ngàn đồng",
    huiName: "Dây 2 Triệu Chợ Chiều Vĩnh Kim",
    cycleNumber: 4,
    paymentMethod: "Chuyển khoản ACB (Mã: ACB.20260916.44812)",
    paymentDate: "2026-09-16 09:15:00",
    signaturePlaceholder: true,
    createdAt: "2026-09-16 09:20:00"
  }
];

export const INITIAL_RANDOM_DRAWS = [
  {
    id: "rd-1",
    groupId: "grp-2",
    cycleNumber: 2,
    eligibleCandidates: ["mp-2", "mp-4", "mp-5", "mp-6", "mp-7", "mp-9", "mp-10"],
    excludedCandidates: ["mp-1 (Đã hốt)", "mp-8 (Đang nợ)"],
    winnerProfileId: "mp-4",
    winnerName: "Phạm Văn Năm (Chú Năm Tạp Hóa)",
    drawTimestamp: "2026-08-01 10:30:15",
    isRedrawn: false,
    redrawReason: "",
    drawnBy: "Cô Bảy Chủ Thảo"
  }
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    id: "log-1",
    action: "CREATE_HUI",
    actorName: "Cô Bảy",
    targetType: "HuiGroup",
    targetId: "grp-1",
    description: "Khởi tạo dây hụi 'Dây 2 Triệu Chợ Chiều Vĩnh Kim' (12 phần, kỳ mở mùng 15).",
    timestamp: "2026-06-01 08:00:00"
  },
  {
    id: "log-2",
    action: "OPEN_CYCLE",
    actorName: "Cô Bảy",
    targetType: "HuiCycle",
    targetId: "cyc-1-4",
    description: "Khui hụi Kỳ 4 Dây 2 Triệu. Người hốt: Chị Sáu Bến Tre với mức thăm 280.000đ.",
    timestamp: "2026-09-15 09:30:00"
  },
  {
    id: "log-3",
    action: "RECORD_PAYMENT",
    actorName: "Cô Bảy",
    targetType: "Payment",
    targetId: "pay-2",
    description: "Ghi nhận đóng tiền 2.000.000đ (Chuyển khoản VCB) từ Anh Ba Khía cho Kỳ 4.",
    timestamp: "2026-09-15 14:25:00"
  },
  {
    id: "log-4",
    action: "RECORD_PAYMENT",
    actorName: "Cô Bảy",
    targetType: "Payment",
    targetId: "pay-5",
    description: "Ghi nhận đóng tiền 3.440.000đ (2 chân hụi sống) từ Chị Út Lành cho Kỳ 4.",
    timestamp: "2026-09-16 09:20:00"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Nhắc nhở nợ hụi",
    message: "Anh Mười Cò Đất đang trễ hạn đóng Kỳ 4 Dây 2 Triệu (1.720.000đ) và Kỳ 2 Dây 5 Triệu.",
    type: "warning",
    read: false,
    createdAt: "2026-09-17 07:00:00"
  },
  {
    id: "notif-2",
    title: "Khui hụi thành công",
    message: "Kỳ 4 Dây 2 Triệu Chợ Chiều đã khui. Chị Sáu Bến Tre trúng thăm 280k.",
    type: "success",
    read: true,
    createdAt: "2026-09-15 09:35:00"
  }
];
