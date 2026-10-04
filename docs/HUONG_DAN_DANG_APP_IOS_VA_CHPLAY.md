# 📱 HƯỚNG DẪN HOÀN CHỈNH: ĐƯA SỔ HỤI LÊN WEB, GOOGLE PLAY (CH PLAY) & APPLE APP STORE

Tài liệu này hướng dẫn chi tiết từng bước (A-Z) để đưa ứng dụng **Sổ Hụi** vào hoạt động chính thức:
1. **Đưa lên Website Online** để bất kỳ ai cũng có thể truy cập, tạo tài khoản riêng và quản lý độc lập trên điện thoại/máy tính.
2. **Đóng gói & Phát hành lên Google Play Store (CH Play)** cho điện thoại Android.
3. **Đóng gói & Phát hành lên Apple App Store** cho iPhone / iPad.

---

## 🌐 PHẦN 1: ĐƯA LÊN TRANG WEB ONLINE (HOÀN TOÀN MIỄN PHÍ)

Khi đưa lên Web, người dùng có thể mở link từ bất kỳ đâu, tự đăng ký tài khoản và có thể bấm **"Thêm vào Màn hình chính"** (PWA) để dùng như một ứng dụng di động thực thụ.

### Cách 1: Triển khai nhanh 1-Click lên Vercel (Khuyên dùng)
1. Truy cập [vercel.com](https://vercel.com) và đăng ký/đăng nhập tài khoản miễn phí.
2. Cài đặt công cụ Vercel CLI trên máy (nếu muốn đẩy từ máy tính):
   ```bash
   npm i -g vercel
   ```
3. Mở thư mục ứng dụng trong Terminal và chạy:
   ```bash
   cd /Users/hatrungnhu/Downloads/so-hui-app
   vercel --prod
   ```
4. Chọn `Yes`, Vercel sẽ tự động build và cấp cho bạn một đường link trực tiếp (ví dụ: `https://so-hui-app.vercel.app`).
5. Bạn có thể gắn tên miền riêng của mình (như `sohui.vn` hoặc `sohui.app`) trong mục **Settings > Domains** trên Vercel.

### Cách 2: Kéo thả lên Netlify (Không cần gõ lệnh)
1. Truy cập [app.netlify.com/drop](https://app.netlify.com/drop).
2. Kéo thả toàn bộ thư mục `/Users/hatrungnhu/Downloads/so-hui-app` vào khung tải lên của Netlify.
3. Trong vòng 10 giây, trang web của bạn sẽ hoạt động trực tuyến với chứng chỉ bảo mật HTTPS miễn phí.

---

## 🤖 PHẦN 2: ĐÓNG GÓI & PHÁT HÀNH LÊN GOOGLE PLAY STORE (ANDROID / CH PLAY)

Ứng dụng đã được cấu hình sẵn chuẩn **CapacitorJS** để biến mã nguồn web thành ứng dụng Android Native 100%.

### Bước 1: Cài đặt công cụ trên máy Mac
1. Đảm bảo máy đã cài **Node.js** và **Android Studio** (tải miễn phí từ [developer.android.com/studio](https://developer.android.com/studio)).
2. Trong Android Studio, cài đặt **Android SDK Platform 34 (hoặc mới hơn)** và **Android SDK Build-Tools**.

### Bước 2: Tạo dự án Android
Mở Terminal tại thư mục app và chạy các lệnh sau:
```bash
cd /Users/hatrungnhu/Downloads/so-hui-app

# 1. Build mã nguồn mới nhất
npm run build

# 2. Cài đặt các gói Capacitor (nếu chưa cài)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Khởi tạo thư mục native Android
npx cap add android

# 4. Đồng bộ file vào Android
npx cap sync android

# 5. Mở dự án trong Android Studio
npx cap open android
```

### Bước 3: Tạo Khóa Ký Số (Release Keystore)
Trong Android Studio:
1. Vào menu **Build > Generate Signed Bundle / APK...**
2. Chọn **Android App Bundle (.aab)** > Bấm **Next**.
3. Tại mục **Key store path**, bấm **Create new...** để tạo file khóa ký (ví dụ: `sohui-release-key.jks`), đặt mật khẩu và lưu giữ file này cẩn thận.
4. Chọn kiểu build **release** > Bấm **Create**.
5. Android Studio sẽ sinh ra file `app-release.aab` nằm tại: `android/app/release/app-release.aab`.

### Bước 4: Đăng tải lên Google Play Console
1. Đăng ký tài khoản nhà phát triển Google Play tại [play.google.com/console](https://play.google.com/console) (phí $25 một lần duy nhất).
2. Bấm **Tạo ứng dụng**:
   - Tên ứng dụng: `Sổ Hụi - Quản Lý Hụi Miền Nam`
   - Ngôn ngữ mặc định: `Tiếng Việt (vi-VN)`
   - Loại ứng dụng: `Ứng dụng (App)` / `Miễn phí (Free)`
3. Điền thông tin nội dung ứng dụng:
   - **Chính sách quyền riêng tư (Privacy Policy):** Cung cấp link trang điều khoản (không thu thập dữ liệu nhạy cảm).
   - **Tuyên bố tài chính:** Chọn danh mục *Công cụ tiện ích / Ghi chép tài chính cá nhân*. Nêu rõ: *Ứng dụng chỉ phục vụ tính toán, ghi chép và lưu trữ chứng cứ giữa các cá nhân theo Nghị định 19/2019/NĐ-CP, tuyệt đối KHÔNG cung cấp dịch vụ cho vay hoặc giữ tiền*.
4. Tại mục **Phát hành (Production)** > Bấm **Tạo bản phát hành mới**:
   - Tải file `app-release.aab` vừa build lên.
   - Nhập ghi chú phát hành: `Phiên bản 2.0.0 - Quản lý dây hụi, tự động tính tiền hụi sống/chết, tích hợp VietQR và bảo mật mã PIN`.
5. Bấm **Xem lại bản phát hành** và gửi cho Google xét duyệt (thời gian duyệt từ 1-3 ngày).

---

## 🍏 PHẦN 3: ĐÓNG GÓI & PHÁT HÀNH LÊN APPLE APP STORE (IOS / IPHONE)

### Bước 1: Cài đặt công cụ trên máy Mac
1. Cài đặt **Xcode** từ Mac App Store.
2. Cài đặt CocoaPods (nếu chưa có):
   ```bash
   sudo gem install cocoapods
   ```

### Bước 2: Tạo dự án iOS
Mở Terminal và chạy:
```bash
cd /Users/hatrungnhu/Downloads/so-hui-app

# 1. Cài đặt gói Capacitor iOS
npm install @capacitor/ios

# 2. Khởi tạo dự án iOS
npx cap add ios

# 3. Đồng bộ dữ liệu
npx cap sync ios

# 4. Mở dự án trong Xcode
npx cap open ios
```

### Bước 3: Cấu hình trong Xcode
1. Trong Xcode, bấm vào mục **App** ở cột trái.
2. Chọn tab **Signing & Capabilities**:
   - Tích chọn **Automatically manage signing**.
   - Tại mục **Team**, đăng nhập tài khoản Apple Developer ($99/năm) của bạn.
   - Bundle Identifier: `vn.sohui.app`.
3. Kiểm tra mục **General**:
   - Display Name: `Sổ Hụi`
   - Version: `2.0.0`
   - Deployment Target: `iOS 14.0` trở lên.

### Bước 4: Đóng gói Archive & Upload lên App Store Connect
1. Trên thanh công cụ Xcode, chọn thiết bị đích là **Any iOS Device (arm64)**.
2. Vào menu **Product > Archive**.
3. Khi quá trình đóng gói hoàn tất, cửa sổ **Organizer** sẽ hiện ra.
4. Bấm nút **Distribute App** > Chọn **App Store Connect** > Bấm **Upload**.
5. Xcode sẽ tự động kiểm tra và tải bản build lên App Store Connect.

### Bước 5: Nộp xét duyệt trên App Store Connect
1. Truy cập [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. Bấm dấu `+` để **Thêm ứng dụng mới**:
   - Tên: `Sổ Hụi - Quản Lý Hụi`
   - Ngôn ngữ: `Tiếng Việt`
   - Bundle ID: chọn `vn.sohui.app`.
3. Tải lên 3-4 ảnh chụp màn hình kích thước chuẩn 6.5 inch (iPhone 15 Pro Max / 14 Plus) và 5.5 inch (iPhone 8 Plus).
4. Điền mô tả ứng dụng, từ khóa (`sổ hụi, quan ly hui, hui mien nam, vietqr, phieu thu`).
5. Cung cấp tài khoản thử nghiệm cho nhân viên duyệt Apple (Apple Review Account):
   - SĐT: `0918123456`
   - Mật khẩu: `123`
6. Bấm **Submit for Review** (Gửi xét duyệt). Apple thường duyệt trong vòng 24 - 48 giờ.

---

## 🔒 LƯU Ý QUAN TRỌNG VỀ PHÁP LÝ & DUYỆT ỨNG DỤNG HỤI
Để vượt qua vòng kiểm duyệt của cả Google Play và Apple App Store nhanh chóng:
- **Tuyên bố an toàn (Disclaimer):** Luôn nêu rõ ứng dụng là công cụ phần mềm hỗ trợ tính toán kế toán dân sự theo **Nghị định 19/2019/NĐ-CP của Chính phủ về họ, hụi, biêu, phường**, không phải là trung gian thanh toán, không huy động vốn và không cho vay trực tuyến.
- **Tính năng VietQR:** Là đường dẫn chuyển khoản trực tiếp giữa tài khoản ngân hàng của cá nhân với cá nhân (P2P), ứng dụng không can thiệp hay thu bất kỳ khoản phí giao dịch nào.
