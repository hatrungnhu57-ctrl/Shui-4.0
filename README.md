# 📜 SỔ HỤI - ỨNG DỤNG QUẢN LÝ HỤI MIỀN NAM (MVP)

> **Minh Bạch - Tiện Lợi - An Toàn - Chuẩn Tập Quán Dân Gian Nam Bộ**

---

## 🌟 1. Giới thiệu tổng quan
**Sổ Hụi** là ứng dụng di động (Mobile-first Web App) được thiết kế và phát triển chuyên biệt dành cho **Chủ Hụi (Đầu thảo)** và **Hụi Viên (Tay hụi)** theo đúng thuật ngữ và tập quán chơi hụi truyền thống tại miền Nam.

### 🛡️ Tuyên ngôn an toàn cốt lõi:
> **"Sổ Hụi chỉ là công cụ ghi chép, tính toán toán học, nhắc việc và lưu vết chứng cứ minh bạch. Ứng dụng TUYỆT ĐỐI KHÔNG giữ tiền hộ, không thu hộ tiền, không cung cấp dịch vụ ví điện tử, không bảo lãnh tài chính và không cho vay."**

---

## 👥 2. Đối tượng sử dụng & Luồng màn hình

### 2.1. Ba vai trò người dùng:
1. **Tôi là Chủ Hụi:** Quản lý dây hụi, danh bạ thành viên, khui hụi, quay random, thu tiền, xuất biên nhận và chốt sổ.
2. **Tôi là Hụi Viên:** Theo dõi các chân hụi đang tham gia, số tiền cần đóng theo kỳ (hụi chết/sống), xem biên nhận và gửi phản hồi.
3. **Tôi vừa là Chủ vừa là Hụi Viên (Hybrid):** Chuyển đổi linh hoạt giữa các dây mình làm chủ và các chân hụi mình góp ở nơi khác.

### 2.2. Sơ đồ luồng ứng dụng:
```
[Khởi động] ──► [Chọn vai trò: Chủ / Viên / Cả hai]
                      │
                      ├──► [Dashboard Chủ Hụi]
                      │      ├── Danh bạ hụi viên (Chống trùng SĐT, Cảnh báo nợ, Gộp hồ sơ)
                      │      ├── Tạo dây hụi mới (Chọn người từ danh bạ, phân bổ số phần)
                      │      ├── Chi tiết dây & Quản lý kỳ hụi
                      │      ├── Khui hụi:
                      │      │     ├─ 🎲 Quay Random (Lồng cầu quay số, loại trừ nợ, lý do quay lại)
                      │      │     ├─ 🏷️ Kêu hụi / Bỏ lãi
                      │      │     └─ 🗳️ Bỏ thăm kín
                      │      ├── Bảng thu tiền & Tự động tính Hụi sống / Hụi chết
                      │      └── Biên nhận điện tử (Mộc đỏ, số tiền bằng chữ, in PDF/Zalo, xuất Excel)
                      │
                      ├──► [Dashboard Hụi Viên]
                      │      ├── Dây đang chơi & Tiến độ
                      │      ├── Cảnh báo tiền cần nộp kỳ tới
                      │      ├── Kho biên nhận điện tử
                      │      └── Gửi phản hồi / Báo sai số tiền cho chủ hụi
                      │
                      ├──► [Cẩm nang chơi hụi] (13 chuyên đề kiến thức, pháp lý, an toàn)
                      └──► [Nhật ký kiểm toán] (Lưu vết mọi thay đổi dữ liệu)
```

---

## 📊 3. Data Model Chi Tiết

| Model | Mục đích | Ràng buộc chính |
|---|---|---|
| **`User`** | Tài khoản đăng nhập & vai trò | `owner`, `member`, `hybrid` |
| **`MemberProfile`** | Hồ sơ hụi viên gốc trong danh bạ dùng chung | **SĐT là DUY NHẤT (không cho tạo trùng)**, mức uy tín 1-5 sao, lịch sử trễ hạn, cảnh báo rủi ro, hỗ trợ gộp hồ sơ |
| **`HuiGroup`** | Dây hụi | Mức góp, số phần, chu kỳ (ngày/tuần/nửa tháng/tháng), hình thức khui, tiền thảo |
| **`HuiGroupMember`** | Thành viên tham gia dây cụ thể | Số phần tham gia, mảng các kỳ đã hốt (`hotedCycles`), trạng thái sống/chết/nợ |
| **`HuiCycle`** | Kỳ hụi | Kỳ số mấy, ngày mở, người hốt, mức thăm trúng, tổng tiền thu, tiền thảo, trạng thái mở/chốt/hủy |
| **`Payment`** | Giao dịch đóng tiền | Diện hụi chết (đóng đủ 100% gốc) hay hụi sống (trừ mức thăm), tiền mặt / chuyển khoản, mã giao dịch |
| **`Receipt`** | Biên nhận / Phiếu thu điện tử | Mã phiếu thu chuẩn `BN-YYYYMM-XXX`, họ tên, số tiền số và chữ tiếng Việt, mộc "ĐÃ THU TIỀN" |
| **`RandomDraw`** | Kết quả quay random minh bạch | Danh sách đủ chuẩn, danh sách bị loại (có nợ), người trúng, thời gian, lý do quay lại |
| **`ActivityLog`** | Nhật ký kiểm toán bất biến | Người thực hiện, hành động, đối tượng, dữ liệu cũ (`oldData`), dữ liệu mới (`newData`), timestamp |
| **`GuideArticle`** | Cẩm nang kiến thức chuẩn miền Nam | 13 chuyên đề phân loại theo thuật ngữ, an toàn, pháp lý, mẫu thỏa thuận |
| **`Notification`** | Hệ thống thông báo | Nhắc nợ, kết quả khui hụi |

---

## 📐 4. Công Thức Tính Tiền Chuẩn Miền Nam

1. **Tiền đóng Hụi Sống (Chưa hốt):**
   $$\text{Tiền nộp} = \text{Số chân} \times (\text{Mức góp cơ bản} - \text{Tiền thăm trúng})$$

2. **Tiền đóng Hụi Chết (Đã từng hốt ở kỳ trước):**
   $$\text{Tiền nộp} = \text{Số chân} \times \text{Mức góp cơ bản}$$

3. **Tiền Người hốt hụi thực nhận:**
   $$\text{Tổng tiền hốt} = \sum(\text{Hụi sống}) + \sum(\text{Hụi chết}) - \text{Tiền thảo chủ hụi} - (\text{Phần của người hốt tự trừ})$$

---

## 🚀 5. Hướng dẫn chạy và sử dụng ứng dụng

### 5.1. Chạy máy chủ tĩnh cục bộ:
Ứng dụng được viết hoàn toàn bằng Pure Modern Web Standards (HTML5, CSS3, ES6 Modules) không phụ thuộc external network:

```bash
cd /Users/hatrungnhu/Downloads/so-hui-app
node server.cjs
```
Truy cập trình duyệt: **`http://localhost:3456`**

### 5.2. Dữ liệu Demo có sẵn:
- **Chủ Hụi:** Nguyễn Thị Bảy (Cô Bảy Chủ Thảo - 0918123456)
- **Hụi Viên:** Trần Văn Ba (Anh Ba Khía - 0909888999)
- **Chủ kiêm Hụi Viên:** Lê Thị Út Lành (Chị Út - 0987654321)
- **Hụi viên cảnh báo nợ:** Đỗ Văn Mười (Anh Mười Cò Đất - Từng trễ 3 kỳ)
- **Dây 1:** Dây 2 Triệu Chợ Chiều Vĩnh Kim (Kêu hụi bỏ lãi, đang mở Kỳ 4)
- **Dây 2:** Dây 5 Triệu Tương Trợ Miệt Vườn (Quay Random ngẫu nhiên, không lãi)
- **Dây 3:** Dây Tuần 500k Chị Em Tiệm May (Bỏ thăm kín)
