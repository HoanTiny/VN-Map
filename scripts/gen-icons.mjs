/**
 * Generate minimal valid PNG icons for PWA.
 * Draws a red rounded-rect background with a gold star in the center.
 * No dependencies — uses only Node.js built-ins (zlib, fs).
 *
 * Usage: node scripts/gen-icons.mjs
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
  const l = Buffer.alloc(4);
  l.writeUInt32BE(data.length);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([l, t, data, c]);
}

/**
 * Render a star polygon and return a set of [x,y] points filling the star.
 * Returns a function (x, y) -> boolean: is this pixel inside the star?
 */
function makeStarTest(cx, cy, outerR, innerR, points = 5) {
  const verts = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    verts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  return function (px, py) {
    let inside = false;
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
      const xi = verts[i][0], yi = verts[i][1];
      const xj = verts[j][0], yj = verts[j][1];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
    return inside;
  };
}

function generateIcon(size) {
  const BG_R = 198, BG_G = 40, BG_B = 40;     // brand red
  const STAR_R = 255, STAR_G = 215, STAR_B = 0; // gold
  const WHITE = 255;

  const radius = size * 0.19; // rounded corner radius
  const cx = size / 2, cy = size / 2;
  const starOuter = size * 0.33;
  const starInner = size * 0.14;
  const inStar = makeStarTest(cx, cy, starOuter, starInner);

  // RGBA pixels (4 bytes per pixel)
  const pixels = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const corner =
        dx > cx - radius && dy > cy - radius
          ? Math.hypot(dx - (cx - radius), dy - (cy - radius)) > radius
          : false;

      if (corner) {
        // Outside rounded rect — white bg (or transparent via alpha)
        pixels[idx] = WHITE; pixels[idx + 1] = WHITE;
        pixels[idx + 2] = WHITE; pixels[idx + 3] = 0; // transparent
      } else if (inStar(x, y)) {
        pixels[idx] = STAR_R; pixels[idx + 1] = STAR_G;
        pixels[idx + 2] = STAR_B; pixels[idx + 3] = 255;
      } else {
        pixels[idx] = BG_R; pixels[idx + 1] = BG_G;
        pixels[idx + 2] = BG_B; pixels[idx + 3] = 255;
      }
    }
  }

  // Build PNG raw data (RGBA, filter byte 0 per row)
  const rowLen = 1 + size * 4;
  const raw = Buffer.alloc(size * rowLen);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter None
    pixels.copy(raw, y * rowLen + 1, y * size * 4, (y + 1) * size * 4);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  const idat = deflateSync(raw);

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
for (const size of [192, 512]) {
  const buf = generateIcon(size);
  writeFileSync(`public/icons/icon-${size}.png`, buf);
  console.log(`✓ icon-${size}.png  (${buf.length} bytes)`);
}
