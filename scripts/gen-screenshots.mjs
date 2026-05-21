/**
 * Generate placeholder screenshot PNGs for PWA manifest.
 * Creates simple colored fills — replace with real screenshots before prod.
 */

import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, c]);
}

function solidPNG(w, h, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const row = Buffer.alloc(1 + w * 3);
  row[0] = 0;
  for (let x = 0; x < w; x++) {
    row[1 + x * 3] = r; row[2 + x * 3] = g; row[3 + x * 3] = b;
  }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  const idat = deflateSync(raw);

  return Buffer.concat([sig, pngChunk("IHDR", ihdr), pngChunk("IDAT", idat), pngChunk("IEND", Buffer.alloc(0))]);
}

mkdirSync("public/screenshots", { recursive: true });
writeFileSync("public/screenshots/mobile.png",  solidPNG(390,  844, 248, 248, 245));
writeFileSync("public/screenshots/desktop.png", solidPNG(1280, 800, 248, 248, 245));
console.log("✓ screenshots/mobile.png");
console.log("✓ screenshots/desktop.png");
console.log("Replace with real screenshots before production.");
