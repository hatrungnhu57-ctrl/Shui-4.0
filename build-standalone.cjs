const fs = require('fs');
const path = require('path');

const baseDir = '/Users/hatrungnhu/Downloads/so-hui-app';

const css = fs.readFileSync(path.join(baseDir, 'css/app.css'), 'utf8');
const guideData = fs.readFileSync(path.join(baseDir, 'js/guide-data.js'), 'utf8')
  .replace(/export const GUIDE_ARTICLES/g, 'const GUIDE_ARTICLES');
const mockData = fs.readFileSync(path.join(baseDir, 'js/mock-data.js'), 'utf8')
  .replace(/export const /g, 'const ');
const utils = fs.readFileSync(path.join(baseDir, 'js/utils.js'), 'utf8')
  .replace(/export function /g, 'function ')
  .replace(/export const /g, 'const ');

// Strip import statements
function cleanImports(code) {
  return code
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export function /g, 'function ')
    .replace(/export const /g, 'const ')
    .replace(/export default /g, '');
}

const storeCode = cleanImports(fs.readFileSync(path.join(baseDir, 'js/store.js'), 'utf8'));
const roleSelector = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/role-selector.js'), 'utf8'));
const ownerDashboard = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/owner-dashboard.js'), 'utf8'));
const memberDashboard = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/member-dashboard.js'), 'utf8'));
const membersDirectory = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/members-directory.js'), 'utf8'));
const createGroup = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/create-group.js'), 'utf8'));
const groupDetail = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/group-detail.js'), 'utf8'));
const drawScreen = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/draw-screen.js'), 'utf8'));
const cyclePayments = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/cycle-payments.js'), 'utf8'));
const guideAndLogs = cleanImports(fs.readFileSync(path.join(baseDir, 'js/views/guide-and-logs.js'), 'utf8'));
const appMain = cleanImports(fs.readFileSync(path.join(baseDir, 'js/app.js'), 'utf8'));

const bundleHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Sổ Hụi - Quản Lý Hụi Miền Nam</title>
  <style>
${css}
  </style>
</head>
<body>
  <!-- Canvas ứng dụng điện thoại Mobile-first -->
  <div id="app-container">
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: #15803d; font-weight: 700;">
      📜 Đang khởi động Sổ Hụi...
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container"></div>

  <!-- Embedded Standalone App Scripts (Chạy trực tiếp 100% không lo lỗi CORS/file://) -->
  <script>
${guideData}

${mockData}

${utils}

${storeCode}

${roleSelector}

${ownerDashboard}

${memberDashboard}

${membersDirectory}

${createGroup}

${groupDetail}

${drawScreen}

${cyclePayments}

${guideAndLogs}

${appMain}
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(baseDir, 'index.html'), bundleHtml);
console.log('Đã tạo thành công file index.html tự chạy độc lập!');
