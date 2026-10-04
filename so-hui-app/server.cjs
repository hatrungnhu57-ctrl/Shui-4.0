const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const SAFE_ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const authHandler = require('./api/auth.js');
const syncHandler = require('./api/sync.js');

const server = http.createServer((req, res) => {
  // Chuẩn hóa và giải mã URI để chống Path Traversal (%2e%2e, ../)
  let rawPath = req.url.split('?')[0];
  try {
    rawPath = decodeURIComponent(rawPath);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // Xử lý API Cloud Endpoints
  if (rawPath === '/api/auth' || rawPath === '/api/sync') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      if (bodyData.length > 5 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = {};
      }

      // Helper mock res.status().json()
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };
      res.json = function(data) {
        this.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
        this.end(JSON.stringify(data));
      };

      if (rawPath === '/api/auth') {
        authHandler(req, res);
      } else {
        syncHandler(req, res);
      }
    });
    return;
  }

  // Chỉ cho phép phương thức GET và HEAD cho static files
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('405 Method Not Allowed');
    return;
  }

  if (rawPath === '/' || rawPath === '') {
    rawPath = '/index.html';
  }

  // Loại bỏ ký tự null byte
  rawPath = rawPath.replace(/\0/g, '');

  const resolvedPath = path.resolve(SAFE_ROOT, '.' + rawPath);

  // Kiểm tra đường dẫn có nằm hoàn toàn trong thư mục an toàn không (Chống Path Traversal)
  if (!resolvedPath.startsWith(SAFE_ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden: Access denied');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://img.vietqr.io data: blob:;"
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(resolvedPath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server Sổ Hụi (Secure) đang chạy tại: http://localhost:${PORT}`);
});
