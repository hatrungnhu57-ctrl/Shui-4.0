# 📜 SỔ HỤI - ỨNG DỤNG QUẢN LÝ HỤI MIỀN NAM (BẢN CHÍNH THỨC 2.0)

> **Minh Bạch - Tiện Lợi - An Toàn - Chuẩn Tập Quán Dân Gian Nam Bộ**  
> *Sẵn sàng hoạt động trên Web, Android (CH Play) và iOS (Apple App Store)*

---

## 🌟 1. Giới thiệu tổng quan
**Sổ Hụi** là nền tảng quản lý sổ hụi chuyên nghiệp (Multi-tenant SaaS & PWA Mobile App) được thiết kế chuyên biệt dành cho **Chủ Hụi (Đầu thảo)** và **Hụi Viên (Tay hụi)** theo đúng thuật ngữ và tập quán chơi hụi truyền thống tại miền Nam.

### 🛡️ Tuyên ngôn an toàn cốt lõi:
> **"Sổ Hụi chỉ là công cụ ghi chép, tính toán toán học, nhắc việc và lưu vết chứng cứ minh bạch giữa các cá nhân theo Nghị định 19/2019/NĐ-CP. Ứng dụng TUYỆT ĐỐI KHÔNG giữ tiền hộ, không thu hộ tiền, không cung cấp dịch vụ ví điện tử, không bảo lãnh tài chính và không cho vay."**

---

## ✨ 2. Các tính năng nổi bật của Bản Chính Thức (Production Ready)

1. **Hệ thống Tài khoản Riêng biệt (Multi-User Data Isolation):**
   - Bất kỳ ai cũng có thể tự đăng ký tài khoản Chủ hụi hoặc Hụi viên bằng Số điện thoại.
   - Dữ liệu sổ hụi của từng tài khoản được cách ly an toàn 100%, bảo mật tuyệt đối.
   - Hỗ trợ chuyển đổi giữa dữ liệu thực tế và dữ liệu mẫu (demo).

2. **Tích hợp VietQR Chuẩn Ngân Hàng Quốc Gia (NAPAS 24/7):**
   - Chủ hụi cấu hình tài khoản ngân hàng (Vietcombank, MB, Techcombank, BIDV, ACB...).
   - Khi tạo bảng thu tiền hoặc gửi biên nhận, app **tự động sinh mã VietQR động** kèm đúng số tiền và nội dung chuyển khoản `[Ten] dong hui [TenDay] ky [X]`.
   - Hụi viên chỉ cần quét mã QR bằng app ngân hàng là chuyển khoản chính xác 100%.

3. **Bảo mật Mã PIN Khóa Sổ (App Lock):**
   - Cài đặt mã PIN 4-6 số bảo vệ riêng tư khi cho người khác mượn điện thoại.

4. **Sao lưu & Phục hồi Toàn diện (Data Backup & Restore):**
   - Xuất file sao lưu `.sohui` / `.json` về máy tính, Zalo, Google Drive bất cứ lúc nào.
   - Khôi phục dữ liệu tức thì khi chuyển sang điện thoại hoặc máy tính mới.

5. **Đầy đủ Nghiệp vụ Hụi Nam Bộ:**
   - 3 hình thức khui: Kêu hụi (Bỏ lãi), Bỏ thăm kín, Quay Random ngẫu nhiên (có lồng cầu quay số và lọc nợ).
   - Tự động phân biệt Hụi Sống (trừ thăm) và Hụi Chết (nộp đủ gốc 100%).
   - Biên nhận điện tử có dấu mộc đỏ, đọc tiền bằng chữ tiếng Việt, in PDF và xuất Excel.
   - Cẩm nang 13 chuyên đề pháp lý và hợp đồng hụi mẫu theo Nghị định 19/2019/NĐ-CP.

---

## 🚀 3. Hướng dẫn sử dụng & Triển khai

### 3.1. Chạy trên máy tính cá nhân (Offline):
```bash
cd /Users/hatrungnhu/Downloads/so-hui-app
node server.cjs
```
Mở trình duyệt: `http://localhost:3456`

### 3.2. Đưa lên Web Online (Miễn phí 100%):
- **Vercel:** Chạy `npx vercel --prod`
- **Netlify:** Kéo thả thư mục vào [app.netlify.com/drop](https://app.netlify.com/drop)

### 3.3. Đóng gói cho Android (Google Play) & iOS (App Store):
Xem tài liệu hướng dẫn chi tiết từng bước tại:
👉 [`docs/HUONG_DAN_DANG_APP_IOS_VA_CHPLAY.md`](./docs/HUONG_DAN_DANG_APP_IOS_VA_CHPLAY.md)

---

## 📁 4. Cấu trúc Dự án

```
so-hui-app/
├── index.html                   # Ứng dụng độc lập chạy được ngay trên mọi trình duyệt
├── manifest.json                # Cấu hình PWA cài đặt vào điện thoại
├── sw.js                        # Service Worker hỗ trợ Offline 100%
├── capacitor.config.json        # Cấu hình đóng gói iOS & Android Native
├── package.json                 # Kịch bản build và công cụ
├── vercel.json & netlify.toml   # Cấu hình Cloud Hosting
├── icons/                       # Bộ icon độ phân giải cao (192, 512, SVG)
├── css/
│   └── app.css                  # Hệ thống giao diện bản sắc miền Nam
├── js/
│   ├── app.js                   # Bộ điều hướng & Controller chính
│   ├── store.js                 # Quản lý Đa tài khoản, Data Isolation, VietQR, PIN, State
│   ├── utils.js                 # Tiện ích, VietQR API, xuất file Excel/JSON, đọc tiền tiếng Việt
│   ├── guide-data.js            # 13 bài cẩm nang kiến thức & pháp lý
│   ├── mock-data.js             # Bộ dữ liệu mẫu tham khảo
│   └── views/                   # 10 màn hình giao diện chuyên sâu
└── docs/
    ├── DESIGN_SPEC.md           # Đặc tả kiến trúc kỹ thuật & tài chính
    └── HUONG_DAN_DANG_APP_IOS_VA_CHPLAY.md  # Hướng dẫn xuất bản App Store & CH Play
```
