const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height) {
  // RGBA buffer
  const rawData = Buffer.alloc(height * (1 + width * 4));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rectangle mask (radius ~ 22% of width)
      const r = width * 0.22;
      const rx = Math.max(0, Math.abs(dx) - (cx - r));
      const ry = Math.max(0, Math.abs(dy) - (cy - r));
      const cornerDist = Math.sqrt(rx * rx + ry * ry);
      const isInside = cornerDist <= r;

      if (!isInside) {
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0; // Transparent
        continue;
      }

      // Emerald Green Gradient Background (#15803d to #166534)
      const t = (x + y) / (width + height);
      let rVal = Math.round(21 * (1 - t) + 22 * t);
      let gVal = Math.round(128 * (1 - t) + 101 * t);
      let bVal = Math.round(61 * (1 - t) + 52 * t);

      // Golden border around the scroll icon in center
      const inScroll = (x >= width * 0.26 && x <= width * 0.74 && y >= height * 0.22 && y <= height * 0.78);
      if (inScroll) {
        // Parchment white-cream #fffbeb
        rVal = 255;
        gVal = 251;
        bVal = 235;

        // Golden scroll ends
        if (y < height * 0.28 || y > height * 0.72) {
          rVal = 217;
          gVal = 119;
          bVal = 6;
        }

        // Decorative horizontal text lines
        if ((y > height * 0.36 && y < height * 0.38 && x > width * 0.34 && x < width * 0.66) ||
            (y > height * 0.44 && y < height * 0.46 && x > width * 0.34 && x < width * 0.62) ||
            (y > height * 0.52 && y < height * 0.54 && x > width * 0.34 && x < width * 0.58)) {
          rVal = 21;
          gVal = 128;
          bVal = 61;
        }

        // Red seal stamp at bottom right
        const sealDx = x - width * 0.58;
        const sealDy = y - height * 0.62;
        const sealDist = Math.sqrt(sealDx * sealDx + sealDy * sealDy);
        if (sealDist < width * 0.08) {
          rVal = 220;
          gVal = 38;
          bVal = 38;
        }
      }

      rawData[pixelOffset] = rVal;
      rawData[pixelOffset + 1] = gVal;
      rawData[pixelOffset + 2] = bVal;
      rawData[pixelOffset + 3] = 255; // Alpha
    }
  }

  // Deflate IDAT data
  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: 0
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.slice(4, 8 + len));
    buf.writeUInt32BE(crc >>> 0, 8 + len);
    return buf;
  }

  // Simple CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPNG(512, 512));
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180));
console.log('✅ Đã tạo thành công các file icon PNG chuẩn (512x512, 192x192, 180x180)!');
