"use strict";

// build/icon.png üretir: koyu yuvarlatılmış kare üzerinde gradyan dört köşeli yıldız.
// electron-builder Windows ikonunu bu PNG'den türetir.

const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const SIZE = 256;

/* ---------- PNG yardımcıları ---------- */

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/* ---------- Çizim ---------- */

function inRoundedRect(x, y, cx, cy, w, h, r) {
  const dx0 = Math.max(r - (x - (cx - w / 2)), 0);
  const dx1 = Math.max(r - (cx + w / 2 - x), 0);
  const dy0 = Math.max(r - (y - (cy - h / 2)), 0);
  const dy1 = Math.max(r - (cy + h / 2 - y), 0);
  const dx = Math.max(dx0, dx1);
  const dy = Math.max(dy0, dy1);
  return dx * dx + dy * dy <= r * r;
}

const starPts = (() => {
  const R = 92;
  const r = 50;
  const rad = (a) => (a * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < 4; i++) {
    const a = i * 90;
    pts.push([128 + R * Math.sin(rad(a)), 128 - R * Math.cos(rad(a))]);
    pts.push([128 + r * Math.sin(rad(a + 45)), 128 - r * Math.cos(rad(a + 45))]);
  }
  return pts;
})();

function inStar(x, y) {
  let inside = false;
  const n = starPts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = starPts[i][0];
    const yi = starPts[i][1];
    const xj = starPts[j][0];
    const yj = starPts[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const rows = [];
for (let y = 0; y < SIZE; y++) {
  const row = Buffer.alloc(1 + SIZE * 4);
  row[0] = 0; // filtre yok
  for (let x = 0; x < SIZE; x++) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    const px = x + 0.5;
    const py = y + 0.5;
    if (inRoundedRect(px, py, 128, 128, SIZE - 8, SIZE - 8, 56)) {
      r = 13; g = 17; b = 23; a = 255; // #0d1117
    }
    if (inStar(px, py)) {
      const t = py / SIZE;
      r = Math.round(122 + (176 - 122) * t); // #7ab3ff → #b08cff
      g = Math.round(179 + (140 - 179) * t);
      b = 255;
      a = 255;
    }
    const o = 1 + x * 4;
    row[o] = r;
    row[o + 1] = g;
    row[o + 2] = b;
    row[o + 3] = a;
  }
  rows.push(row);
}

const raw = Buffer.concat(rows);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit derinliği
ihdr[9] = 6; // RGBA

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const outDir = path.join(__dirname, "..", "build");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "icon.png");
fs.writeFileSync(out, png);
console.log("yazıldı:", out, png.length + " bayt");