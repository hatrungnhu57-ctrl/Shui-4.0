# TÀI LIỆU THIẾT KẾ VÀ KIẾN TRÚC HỆ THỐNG "SỔ HỤI" (MVP)

> **Ứng Dụng Quản Lý Hụi Miền Nam - Minh Bạch, An Toàn, Tiện Lợi**
> **Tuyên ngôn cốt lõi:** "Sổ Hụi là công cụ ghi nhận, thống kê, nhắc việc và lưu vết chứng cứ minh bạch. Ứng dụng **tuyệt đối KHÔNG** giữ tiền hộ, không bảo lãnh tài chính, không thu hộ và không cung cấp dịch vụ tín dụng/đầu tư."

---

## I. TỔNG QUAN SẢN PHẨM & ĐỐI TƯỢNG SỬ DỤNG

### 1.1. Đối tượng sử dụng
1. **Chủ Hụi (Chủ Thảo):** Người đứng ra khơi dây hụi, gom tiền, tổ chức khui hụi, giao tiền hốt hụi và theo dõi đóng hụi chết/sống.
2. **Hụi Viên (Tay Hụi / Con Hụi):** Người tham gia góp hụi định kỳ để tích lũy hoặc huy động vốn khi cần.
3. **Người vừa là Chủ Hụi vừa là Hụi Viên:** Chủ hụi ở dây này nhưng đồng thời có thể tham gia chân hụi ở dây hụi khác (hoặc tự giữ một số chân trong chính dây mình làm chủ).

### 1.2. Thuật ngữ Hụi Miền Nam chuẩn hóa trong hệ thống
* **Dây hụi (Chõ hụi / Dây họ):** Một nhóm người cùng tham gia đóng tiền định kỳ.
* **Chủ hụi (Đầu thảo):** Người chịu trách nhiệm quản lý, kêu gọi và đôn đốc các tay hụi.
* **Hụi viên (Tay hụi / Chân hụi):** Thành viên góp vốn trong dây hụi.
* **Phần hụi (Chân hụi):** Suất tham gia trong dây. Một người có thể chơi nhiều chân.
* **Mức góp (Tiền hụi định kỳ):** Số tiền danh nghĩa phải đóng mỗi kỳ (VD: Hụi 2 triệu, hụi 5 triệu).
* **Kỳ hụi (Kỳ khui):** Lần họp/tập hợp để gom tiền và trao tiền hốt hụi cho người được lĩnh.
* **Khui hụi:** Thời điểm xác định người hốt hụi của kỳ đó.
* **Hốt hụi (Lĩnh hụi / Lãnh hụi):** Nhận trọn gói số tiền hụi gom được trong kỳ.
* **Hụi sống:** Người CHƯA hốt hụi. Khi đóng tiền chỉ cần đóng: `[Mức góp] - [Tiền thăm/kêu trúng]`.
* **Hụi chết:** Người ĐÃ hốt hụi ở các kỳ trước. Kể từ kỳ sau khi hốt, phải đóng ĐỦ 100% `[Mức góp]` không được trừ lãi.
* **Kêu hụi / Bỏ lãi:** Hình thức ai chịu trả mức lãi (tiền thăm) cao nhất cho mỗi phần thì người đó được hốt kỳ này.
* **Bỏ thăm kín:** Viết số tiền muốn chịu lỗ vào giấy kín, chủ hụi mở đồng loạt; ai bỏ cao nhất trúng hụi.
* **Quay Random (Xổ số may mắn / Bốc thăm ngẫu nhiên):** Thường áp dụng cho hụi không lãi (hụi giúp nhau) hoặc khi nhiều người cùng bỏ mức giá bằng nhau.
* **Tiền thảo (Hoa hồng chủ hụi):** Tiền bồi dưỡng cho chủ hụi theo thỏa thuận khi một tay hụi hốt hụi thành công (thường là 50% mức góp 1 kỳ của 1 phần).

---

## II. SƠ ĐỒ MÀN HÌNH & LUỒNG NGƯỜI DÙNG (USER FLOWS)

```
[Màn hình Khởi động / Splash]
           │
           ▼
[1. Màn hình Chọn Vai Trò]
   ├── 🅰️ "Tôi là Chủ Hụi" ───────────► [Dashboard Chủ Hụi]
   ├── 🅱️ "Tôi là Hụi Viên" ──────────► [Dashboard Hụi Viên]
   └── 🆎 "Tôi vừa là Chủ vừa là Hụi Viên" ──► [Dashboard Tổng hợp / Switch Tab]

─── LUỒNG CHỦ HỤI ─────────────────────────────────────────────────────────────
[Dashboard Chủ Hụi]
   ├──► [Danh bạ Hụi viên] ──► [Thêm mới] / [Chi tiết hồ sơ] / [Gộp hồ sơ trùng] / [Xem lịch sử nợ]
   ├──► [Tạo Dây Hụi Mới] ──► [Chọn người từ Danh bạ] ──► [Phân bổ số chân] ──► [Kích hoạt dây]
   ├──► [Chi tiết Dây Hụi] ──► [Xem danh sách các Kỳ] ──► [Tiến hành Khui Hụi]
   │                              │
   │                              ├── (Chế độ 1: Kêu hụi / Bỏ lãi)
   │                              ├── (Chế độ 2: Bỏ thăm kín)
   │                              └── (Chế độ 3: Quay Random 🎲)
   │                                     ├── Lọc danh sách chưa hốt & không nợ
   │                                     ├── Hiệu ứng lồng cầu quay số
   │                                     ├── Kết quả: Tên, Kỳ, Dây, Thời gian
   │                                     ├── Lưu Log + Lý do nếu quay lại
   │                                     └── Chia sẻ ảnh kết quả (Zalo/FB/SMS)
   │
   ├──► [Quản lý Kỳ Hụi & Đóng Tiền]
   │      ├── Bảng theo dõi: Đã đóng (Xanh) / Chưa đóng (Cam) / Trễ hạn (Đỏ)
   │      ├── Ghi nhận thanh toán: Tiền mặt / Chuyển khoản (có mã giao dịch + đính ảnh)
   │      ├── Tạo & In Biên nhận / Xuất PDF / Xuất Excel
   │      └── Chốt kỳ hụi & Lưu vết kiểm toán
   │
   └──► [Nhật ký Hoạt động & Báo cáo]

─── LUỒNG HỤI VIÊN ───────────────────────────────────────────────────────────
[Dashboard Hụi Viên]
   ├──► [Thống kê nhanh]: Tổng tiền cần đóng tháng này, Dây đang tham gia, Chân sống/chết
   ├──► [Danh sách Dây Hụi Tham Gia] ──► [Chi tiết dây]:
   │      ├── Số chân tham gia, trạng thái (Đã hốt / Chưa hốt)
   │      ├── Lịch sử các kỳ đã đóng kèm Biên nhận điện tử
   │      └── Thông tin Chủ hụi & Lịch khui kỳ tới
   ├──► [Mục Phản Hồi]: Gửi yêu cầu kiểm tra số tiền / Thiếu biên nhận / Nhắn chủ hụi
   └──► [Cẩm Nang Chơi Hụi]: 13 bài học pháp lý, an toàn, cách tính tiền chuẩn miền Nam
```

---

## III. DATA MODEL CHI TIẾT

```typescript
// 1. User & Vai trò
interface User {
  id: string;
  phone: string;
  fullName: string;
  role: 'owner' | 'member' | 'hybrid'; // Chủ hụi | Hụi viên | Cả hai
  avatarUrl?: string;
  createdAt: string;
}

// 2. Hồ sơ hụi viên trong danh bạ dùng chung (MemberProfile)
interface MemberProfile {
  id: string;
  fullName: string;            // Họ tên đầy đủ
  nickname: string;            // Tên thường gọi / biệt danh miền Nam (VD: Ba Khía, Bảy May Mặc)
  phone: string;               // Số điện thoại (DUY NHẤT - Không cho tạo trùng)
  address: string;             // Địa chỉ / khu vực
  notes: string;               // Ghi chú thêm
  creditRating: 1 | 2 | 3 | 4 | 5; // Mức độ uy tín nội bộ (1: Rất rủi ro -> 5: Rất uy tín)
  activeHuiCount: number;      // Số dây đang tham gia
  completedHuiCount: number;   // Số dây đã hoàn tất
  latePaymentCount: number;    // Số lần từng trễ hạn
  hotedCount: number;          // Số lần đã từng hốt hụi
  riskNote: string;            // Cảnh báo rủi ro nội bộ (VD: "Từng trễ 2 kỳ dây 10tr", "Đang nợ dây Chị Thảo")
  isMerged: boolean;           // Đã bị gộp hồ sơ hay chưa
  mergedIntoId?: string;       // ID hồ sơ chính nếu bị gộp
  createdAt: string;
  updatedAt: string;
}

// 3. Dây hụi (HuiGroup)
interface HuiGroup {
  id: string;
  name: string;                // Tên dây hụi (VD: "Hụi 2 Triệu Chợ Chiều", "Dây Tháng 5 Triệu")
  baseAmount: number;          // Mức góp mỗi kỳ cho 1 phần (VD: 2,000,000 VNĐ)
  totalParts: number;          // Tổng số phần hụi (VD: 12 phần = 12 kỳ)
  periodType: 'day' | 'week' | 'half_month' | 'month'; // Chu kỳ
  startDate: string;           // Ngày bắt đầu khơi hụi
  openDayRule: string;         // Quy định ngày khui (VD: "Mùng 15 âm lịch hàng tháng", "Thứ 7 hàng tuần")
  drawMethod: 'bidding' | 'secret_ballot' | 'random'; // Kêu hụi / Bỏ thăm kín / Quay random
  commissionRate: number;      // Tiền thảo chủ hụi (% hoặc số tiền cố định, mặc định 50% 1 phần)
  status: 'active' | 'completed' | 'cancelled';
  agreementNotes: string;      // Thỏa thuận / Luật riêng của dây hụi
  createdBy: string;           // User ID chủ hụi
  createdAt: string;
}

// 4. Quan hệ Hụi viên tham gia Dây hụi (HuiGroupMember)
interface HuiGroupMember {
  id: string;
  groupId: string;
  memberProfileId: string;
  sharesCount: number;         // Số phần tham gia trong dây này (1 người có thể chơi 2-3 phần)
  hotedCycles: number[];       // Mảng các kỳ mà người này đã hốt hụi (VD: [3])
  status: 'active' | 'hoted' | 'in_debt' | 'stopped'; // Chưa hốt | Đã hốt | Đang nợ | Ngưng
  joinDate: string;
  notes?: string;
}

// 5. Kỳ hụi (HuiCycle)
interface HuiCycle {
  id: string;
  groupId: string;
  cycleNumber: number;         // Kỳ số mấy (1, 2, 3...)
  openDate: string;            // Ngày khui thực tế
  winnerMemberProfileId?: string; // Người hốt kỳ này
  winningBidAmount: number;    // Mức tiền kêu / bỏ thăm trúng kỳ này (tiền lãi mỗi phần hụi sống được bớt)
  totalCollected: number;      // Tổng tiền thực tế đã thu được
  totalExpected: number;       // Tổng tiền cần thu theo lý thuyết
  potAmount: number;           // Số tiền người hốt nhận được (Sau khi trừ tiền thảo & cộng hụi chết/sống)
  commissionAmount: number;    // Tiền thảo chủ hụi thu
  status: 'open' | 'closed' | 'cancelled'; // Đang mở | Đã chốt | Đã hủy
  incidentNote?: string;       // Ghi chú sự cố kỳ hụi
  closedAt?: string;
  closedBy?: string;
}

// 6. Giao dịch đóng tiền (Payment)
interface Payment {
  id: string;
  cycleId: string;
  groupId: string;
  memberProfileId: string;
  sharesCount: number;         // Đóng cho mấy phần
  isDeadHui: boolean;          // Đóng theo diện Hụi chết hay Hụi sống
  amountDue: number;           // Số tiền phải đóng
  amountPaid: number;          // Số tiền thực trả
  paymentMethod: 'cash' | 'transfer'; // Tiền mặt | Chuyển khoản
  transferProofUrl?: string;   // Ảnh chụp biên nhận / ủy nhiệm chi ngân hàng
  transactionRef?: string;     // Mã giao dịch ngân hàng
  status: 'unpaid' | 'paid' | 'late' | 'partial';
  paidAt?: string;
  recordedBy: string;          // Người ghi nhận (Chủ hụi)
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// 7. Biên nhận / Phiếu thu điện tử (Receipt)
interface Receipt {
  id: string;
  receiptNumber: string;       // Mã phiếu thu: BN-202609-001
  paymentId: string;
  payerName: string;
  receiverName: string;
  amount: number;
  amountInWords: string;       // Tiền bằng chữ
  huiName: string;
  cycleNumber: number;
  paymentMethod: string;
  paymentDate: string;
  signaturePlaceholder: boolean;
  createdAt: string;
}

// 8. Kết quả quay Random (RandomDraw)
interface RandomDraw {
  id: string;
  groupId: string;
  cycleNumber: number;
  eligibleCandidates: string[]; // Danh sách ID các hụi viên đủ điều kiện trước khi quay
  excludedCandidates: string[]; // Danh sách người bị loại (đang nợ / đã hốt)
  winnerProfileId: string;     // Người trúng ngẫu nhiên
  winnerName: string;
  drawTimestamp: string;
  isRedrawn: boolean;          // Có phải lượt quay lại không
  redrawReason?: string;       // Lý do quay lại nếu có
  drawnBy: string;
}

// 9. Nhật ký hoạt động kiểm toán (ActivityLog)
interface ActivityLog {
  id: string;
  action: 'CREATE_HUI' | 'ADD_MEMBER' | 'OPEN_CYCLE' | 'RECORD_PAYMENT' | 'RANDOM_DRAW' | 'CLOSE_CYCLE' | 'MERGE_PROFILE' | 'UPDATE_PAYMENT';
  actorName: string;
  targetType: 'HuiGroup' | 'MemberProfile' | 'HuiCycle' | 'Payment' | 'RandomDraw';
  targetId: string;
  oldData?: any;               // Dữ liệu trước khi sửa
  newData?: any;               // Dữ liệu sau khi sửa
  description: string;
  timestamp: string;
}

// 10. Cẩm nang kiến thức (GuideArticle)
interface GuideArticle {
  id: string;
  slug: string;
  title: string;
  category: 'knowledge' | 'law' | 'safety' | 'template';
  summary: string;
  content: string;
}

// 11. Thông báo (Notification)
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'warning' | 'info' | 'success';
  targetUserId?: string;
  read: boolean;
  createdAt: string;
}
```

---

## IV. NGUYÊN TẮC BẢO MẬT & RÀNG BUỘC NGHIỆP VỤ

1. **Nguyên tắc bất biến dữ liệu (Audit Trail & Soft Delete):**
   * Không bao giờ xóa cứng (HARD DELETE) các bản ghi dây hụi, thành viên và giao dịch đóng tiền.
   * Chỉ cho phép đổi trạng thái sang `cancelled` / `stopped` kèm theo lý do bắt buộc.
   * Khi chỉnh sửa số tiền đã đóng, hệ thống tự động ghi bản ghi mới vào `ActivityLog` với đầy đủ `oldData`, `newData`, người sửa và timestamp.

2. **Nguyên tắc danh bạ duy nhất (Single Source of Truth):**
   * Chuẩn hóa số điện thoại (bỏ khoảng trắng, dấu chấm, quy đổi `+84` về `0`).
   * Không cho tạo trùng hồ sơ nếu số điện thoại đã tồn tại. Nếu phát hiện người dùng tạo 2 tên cho 1 người, dùng tính năng "Gộp hồ sơ" để hợp nhất lịch sử hụi.

3. **Cảnh báo rủi ro tự động khi tạo dây mới:**
   * Khi chủ hụi gán hụi viên vào dây mới, nếu hụi viên đó có `latePaymentCount > 0` hoặc đang có trạng thái `in_debt` ở bất kỳ dây nào khác, hệ thống sẽ hiện hộp thoại cảnh báo màu cam kèm chi tiết nợ để chủ hụi cân nhắc trước khi đồng ý cho vào dây.

4. **Quy trình Quay số Random minh bạch:**
   * Hệ thống tự động lọc danh sách thành viên: Chỉ lấy những người **chưa hốt** và **không nợ**.
   * Trước khi ấn nút quay, phải hiển thị danh sách tất cả các ứng viên hợp lệ trên màn hình để mọi người cùng chứng kiến.
   * Khi quay có hiệu ứng lồng cầu xoay trực quan.
   * Kết quả sinh ra có mã hash / ID xác thực, thời gian chính xác tới từng giây.
   * Cho phép chụp/xuất ảnh chứng thực kết quả có dấu mộc watermark ứng dụng để gửi vào nhóm Zalo hụi viên.
   * Nếu có tranh chấp buộc phải quay lại, bắt buộc nhập `redrawReason` (Lý do quay lại) và lưu vĩnh viễn vào nhật ký.

5. **Công thức tính tiền Hụi chuẩn Miền Nam:**
   * **Số tiền Hụi viên hụi sống phải đóng:**
     $$\text{Tiền đóng hụi sống} = \text{Số chân} \times (\text{Mức góp cơ bản} - \text{Mức thăm trúng})$$
   * **Số tiền Hụi viên hụi chết phải đóng:**
     $$\text{Tiền đóng hụi chết} = \text{Số chân} \times \text{Mức góp cơ bản}$$
   * **Số tiền Người hốt hụi thực nhận:**
     $$\text{Tổng tiền hốt} = \sum(\text{Hụi sống}) + \sum(\text{Hụi chết}) - \text{Tiền thảo chủ hụi} - (\text{Phần của chính người hốt})$$
