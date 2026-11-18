/* Minimal QR code encoder for the browser: byte mode, error-correction level M, versions 1-40.
   Ported from qr.py (checked against the spec test vectors) and extended past version 10.
   Usage: QR.svg("text") -> SVG string;  QR.matrix("text") -> boolean[][] */
(function (G) {
  "use strict";
  // Level M, index = version
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
    26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
  var NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
    17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];

  var EXP = new Array(512), LOG = new Array(256), x = 1, i;
  for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11D; }
  for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  function gmul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }

  function rawModules(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function dataCodewords(v) { return Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[v] * NUM_BLOCKS[v]; }
  function alignPos(v) {
    if (v === 1) return [];
    var na = Math.floor(v / 7) + 2, size = v * 4 + 17;
    var step = Math.floor((v * 8 + na * 3 + 5) / (na * 4 - 4)) * 2, out = [6];
    for (var p = size - 7; out.length < na; p -= step) out.splice(1, 0, p);
    return out;
  }
  function rsGen(deg) {
    var g = [1];
    for (var i = 0; i < deg; i++) {
      var ng = new Array(g.length + 1).fill(0);
      for (var j = 0; j < g.length; j++) { ng[j] ^= g[j]; ng[j + 1] ^= gmul(g[j], EXP[i]); }
      g = ng;
    }
    return g;
  }
  function rsRem(data, gen) {
    var deg = gen.length - 1, rem = new Array(deg).fill(0);
    data.forEach(function (b) {
      var f = b ^ rem[0];
      rem.shift(); rem.push(0);
      for (var i = 0; i < deg; i++) rem[i] ^= gmul(gen[i + 1], f);
    });
    return rem;
  }

  function codewords(bytes, v) {
    var cap = dataCodewords(v), bits = [];
    function put(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);
    put(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    for (var pad = 0xEC; data.length < cap; pad ^= 0xEC ^ 0x11) data.push(pad);

    var nb = NUM_BLOCKS[v], ecl = ECC_PER_BLOCK[v], total = Math.floor(rawModules(v) / 8);
    var nShort = nb - total % nb, shortLen = Math.floor(total / nb);   // shortLen includes ECC
    var gen = rsGen(ecl), blocks = [], eccs = [], pos = 0;
    for (i = 0; i < nb; i++) {
      var len = shortLen - ecl + (i < nShort ? 0 : 1);
      var blk = data.slice(pos, pos + len); pos += len;
      blocks.push(blk); eccs.push(rsRem(blk, gen));
    }
    var out = [];
    for (i = 0; i <= shortLen - ecl; i++) blocks.forEach(function (b) { if (i < b.length) out.push(b[i]); });
    for (i = 0; i < ecl; i++) eccs.forEach(function (e) { out.push(e[i]); });
    return out;
  }

  function build(v, cw, mask) {
    var n = v * 4 + 17, m = [], fn = [], y, x2;
    for (y = 0; y < n; y++) { m.push(new Array(n).fill(false)); fn.push(new Array(n).fill(false)); }
    function setf(x, y, d) { m[y][x] = d; fn[y][x] = true; }
    for (var i = 0; i < n; i++) { setf(6, i, i % 2 === 0); setf(i, 6, i % 2 === 0); }
    [[3, 3], [n - 4, 3], [3, n - 4]].forEach(function (c) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var xx = c[0] + dx, yy = c[1] + dy;
        if (xx >= 0 && xx < n && yy >= 0 && yy < n) { var d = Math.max(Math.abs(dx), Math.abs(dy)); setf(xx, yy, d !== 2 && d !== 4); }
      }
    });
    var ap = alignPos(v), last = ap.length - 1;
    ap.forEach(function (ax, i) {
      ap.forEach(function (ay, j) {
        if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
        for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setf(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      });
    });
    function format(mask) {
      var data = (0 << 3) | mask, rem = data;            // level M = 00
      for (var k = 0; k < 10; k++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((data << 10) | rem) ^ 0x5412;
      function g(i) { return ((bits >>> i) & 1) === 1; }
      for (var i = 0; i < 6; i++) setf(8, i, g(i));
      setf(8, 7, g(6)); setf(8, 8, g(7)); setf(7, 8, g(8));
      for (i = 9; i < 15; i++) setf(14 - i, 8, g(i));
      for (i = 0; i < 8; i++) setf(n - 1 - i, 8, g(i));
      for (i = 8; i < 15; i++) setf(8, n - 15 + i, g(i));
      setf(8, n - 8, true);
    }
    format(0);
    if (v >= 7) {
      var rem = v;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (v << 12) | rem;
      for (i = 0; i < 18; i++) { var bit = ((vb >>> i) & 1) === 1, a = n - 11 + i % 3, b = Math.floor(i / 3); setf(a, b, bit); setf(b, a, bit); }
    }
    // data
    var k = 0, total = cw.length * 8;
    for (var right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < n; vert++) for (var j = 0; j < 2; j++) {
        x2 = right - j;
        var up = ((right + 1) & 2) === 0;
        y = up ? n - 1 - vert : vert;
        if (!fn[y][x2] && k < total) { m[y][x2] = ((cw[k >>> 3] >>> (7 - (k & 7))) & 1) === 1; k++; }
      }
    }
    var MF = [
      function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; },
      function (x) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; },
      function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
      function (x, y) { return x * y % 2 + x * y % 3 === 0; },
      function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; },
      function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }][mask];
    for (y = 0; y < n; y++) for (x2 = 0; x2 < n; x2++) if (!fn[y][x2] && MF(x2, y)) m[y][x2] = !m[y][x2];
    format(mask);
    return m;
  }

  function penalty(m) {
    var n = m.length, score = 0, y, x, cols = [];
    for (x = 0; x < n; x++) { var c = []; for (y = 0; y < n; y++) c.push(m[y][x]); cols.push(c); }
    [m, cols].forEach(function (rows) {
      rows.forEach(function (row) {
        var run = 0, prev = null;
        row.forEach(function (v) { if (v === prev) run++; else { if (run >= 5) score += run - 2; run = 1; prev = v; } });
        if (run >= 5) score += run - 2;
        for (var x = 0; x + 7 <= n; x++) {
          if (row[x] && !row[x + 1] && row[x + 2] && row[x + 3] && row[x + 4] && !row[x + 5] && row[x + 6]) {
            var b4 = x >= 4 && !row[x - 1] && !row[x - 2] && !row[x - 3] && !row[x - 4];
            var a4 = x + 11 <= n && !row[x + 7] && !row[x + 8] && !row[x + 9] && !row[x + 10];
            if (b4 || a4) score += 40;
          }
        }
      });
    });
    for (y = 0; y < n - 1; y++) for (x = 0; x < n - 1; x++) {
      var v = m[y][x];
      if (v === m[y][x + 1] && v === m[y + 1][x] && v === m[y + 1][x + 1]) score += 3;
    }
    var dark = 0;
    m.forEach(function (r) { r.forEach(function (v) { if (v) dark++; }); });
    score += Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
    return score;
  }

  function utf8(s) { return Array.prototype.slice.call(new TextEncoder().encode(s)); }

  function matrix(text, forceMask) {
    var bytes = typeof text === "string" ? utf8(text) : text, v;
    for (v = 1; v <= 40; v++) if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= dataCodewords(v) * 8) break;
    if (v > 40) throw new Error("QR: data too long");
    var cw = codewords(bytes, v), best = null, bestScore = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      if (forceMask != null && mask !== forceMask) continue;
      var mm = build(v, cw, mask), s = forceMask != null ? 0 : penalty(mm);
      if (s < bestScore) { best = mm; bestScore = s; }
    }
    return best;
  }

  function svg(text, quiet) {
    var m = matrix(text), n = m.length, q = quiet == null ? 4 : quiet, size = n + q * 2, d = "";
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) d += "M" + (x + q) + "," + (y + q) + "h1v1h-1z";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" shape-rendering="crispEdges">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }

  G.QR = { matrix: matrix, svg: svg, version: function (m) { return (m.length - 17) / 4; } };
})(typeof window !== "undefined" ? window : globalThis);
