// ฉากลงจอดบนดวงจันทร์ (ต่อจากหน้าเปิดกาแล็กซี) วาดด้วย Canvas 2D ทั้งหมด ไม่ใช้ไฟล์รูป
// ลำดับเวลา: บินผ่านดวงดาว → ดวงจันทร์ใหญ่ขึ้นจนเต็มจอ → กล้องเงยขึ้นเห็นพื้นผิว → นักบินอวกาศ 3 คนลงจอด
// คนกลางอุ้มทีวีที่หน้าจอเป็นแชทกับ Nous และมีนักบินอวกาศอีกหลายคนเดินไปมาด้านหลัง

export const MEMBER_COLORS = ["#ffb547", "#4fd1ff", "#ff5fa2"]; // ทอง ฟ้า ชมพู (ตรงกับหน้าแรก)

const APPROACH = 2.2; // วินาทีที่บินเข้าหาดวงจันทร์
const TILT_END = 3.4; // กล้องเงยขึ้นจนเห็นขอบฟ้า
const LAND = [3.5, 3.85, 4.2]; // เวลาที่แต่ละคนแตะพื้น
const TV_ON = 4.6; // จอทีวีติด เริ่มแชท
export const READY_AT = 5.2; // แสดงข้อความและปุ่ม


const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const easeInOut = (v) => {
  const x = clamp01(v);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function startMoon(canvas, { getInfo = () => ({}), colors = MEMBER_COLORS, reduced = false } = {}) {
  const ctx = canvas.getContext("2d");
  const rnd = seeded(7);

  // ดาวสามมิติสำหรับช่วงบิน
  const flyStars = Array.from({ length: 420 }, () => ({ x: (rnd() - 0.5) * 2, y: (rnd() - 0.5) * 2, z: rnd() * 1 + 0.05 }));
  // ดาวบนท้องฟ้าตอนอยู่บนพื้น
  const skyStars = Array.from({ length: 220 }, () => ({ x: rnd(), y: rnd(), r: rnd() * 1.3 + 0.3, p: rnd() * 6.28 }));
  // หลุมบนดวงจันทร์ (พิกัดในวงกลมหนึ่งหน่วย)
  const moonCraters = Array.from({ length: 38 }, () => {
    const a = rnd() * 6.28, d = Math.sqrt(rnd()) * 0.85;
    return { u: Math.cos(a) * d, v: Math.sin(a) * d, r: rnd() * 0.09 + 0.02 };
  });
  // หลุมบนพื้น (gx = ซ้ายขวา, d = ความลึกจากขอบฟ้า 0..1)
  const groundCraters = Array.from({ length: 16 }, () => ({ gx: rnd() * 2.4 - 1.2, d: rnd() * 0.95 + 0.05, r: rnd() * 0.06 + 0.025 }));
  const hills = Array.from({ length: 9 }, () => rnd());
  // นักบินอวกาศที่เดินไปมาด้านหลัง (d = ระยะลึก, dir = ทิศทาง)
  const WALK_COLORS = ["#a58bff", "#7ef0c3", "#ff8a5c", "#ffffff", "#ffd98a", "#8ab4ff", "#ff9ad5"];
  const walkers = Array.from({ length: 7 }, (_, k) => ({
    d: 0.06 + (k / 7) * 0.26 + rnd() * 0.03,
    x: rnd(),
    dir: k % 2 ? -1 : 1,
    sp: 0.5 + rnd() * 0.4,
    ph: rnd() * 6.28,
    color: WALK_COLORS[k],
  }));

  let W = 0, H = 0, dpr = 1, raf = 0;
  const t0 = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w * dpr !== canvas.width || h * dpr !== canvas.height) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    W = w;
    H = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawFlyStars(t) {
    const speed = 1.4 * Math.pow(1 - clamp01(t / (APPROACH + 0.3)), 2) + 0.03;
    const cx = W / 2, cy = H / 2, f = Math.min(W, H) * 0.6;
    ctx.lineCap = "round";
    for (const s of flyStars) {
      const zPrev = s.z;
      s.z -= speed * 0.016;
      if (s.z < 0.04) {
        s.z += 1;
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        continue;
      }
      const x1 = cx + (s.x / s.z) * f, y1 = cy + (s.y / s.z) * f;
      const x0 = cx + (s.x / zPrev) * f, y0 = cy + (s.y / zPrev) * f;
      const a = clamp01(1.2 - s.z);
      ctx.strokeStyle = `rgba(230,236,255,${a})`;
      ctx.lineWidth = Math.max(0.6, 2.2 - s.z * 2);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1 + 0.1, y1 + 0.1);
      ctx.stroke();
    }
  }

  function drawMoon(t) {
    const p = clamp01(t / APPROACH);
    const base = Math.min(W, H);
    const r = base * 0.05 * Math.exp(Math.log(2.6 * Math.max(W, H) / (base * 0.05)) * easeInOut(p));
    const cx = W / 2, cy = H / 2;

    ctx.save();
    // แสงขอบฟ้าสีฟ้าเหมือนชั้นบรรยากาศบาง ๆ
    ctx.shadowColor = "rgba(120,170,255,0.9)";
    ctx.shadowBlur = Math.min(60, r * 0.25);
    const g = ctx.createRadialGradient(cx + r * 0.35, cy - r * 0.3, r * 0.1, cx, cy, r);
    g.addColorStop(0, "#d9d9de");
    g.addColorStop(0.7, "#a7a7af");
    g.addColorStop(1, "#7d7d88");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    for (const c of moonCraters) {
      const x = cx + c.u * r, y = cy + c.v * r, rr = c.r * r;
      ctx.fillStyle = "rgba(70,70,82,0.35)";
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(240,240,248,0.35)";
      ctx.lineWidth = Math.max(1, rr * 0.12);
      ctx.beginPath();
      ctx.arc(x, y, rr, Math.PI * 0.9, Math.PI * 1.9);
      ctx.stroke();
    }
    // ด้านมืด (เสี้ยว) ค่อย ๆ จางลงเมื่อเข้าใกล้
    ctx.fillStyle = `rgba(4,4,10,${0.88 * (1 - easeOut(p * 1.1))})`;
    ctx.beginPath();
    ctx.arc(cx - r * 0.55, cy + r * 0.05, r * 1.02, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function groundY(horizon, d) {
    return horizon + (H - horizon) * Math.pow(d, 1.6) * 1.05;
  }

  function drawSurface(t) {
    const tilt = easeOut((t - APPROACH) / (TILT_END - APPROACH));
    const horizon = -H * 0.15 + (H * 0.58 + H * 0.15) * tilt;

    // ดาวบนท้องฟ้า
    for (const s of skyStars) {
      const y = s.y * horizon;
      if (y < 0) continue;
      const tw = 0.6 + 0.4 * Math.sin(t * 2 + s.p);
      ctx.fillStyle = `rgba(255,255,255,${0.75 * tw})`;
      ctx.beginPath();
      ctx.arc(s.x * W, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // โลกบนท้องฟ้า
    const er = Math.min(W, H) * 0.055;
    const ex = W * 0.84, ey = horizon - H * 0.38;
    if (ey + er > 0) {
      ctx.save();
      ctx.globalAlpha = clamp01((t - TILT_END + 0.4) / 0.8);
      ctx.shadowColor = "rgba(90,160,255,0.8)";
      ctx.shadowBlur = er * 0.8;
      const eg = ctx.createRadialGradient(ex - er * 0.3, ey - er * 0.3, er * 0.1, ex, ey, er);
      eg.addColorStop(0, "#9fd4ff");
      eg.addColorStop(0.55, "#2f7de0");
      eg.addColorStop(1, "#0b2a6b");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(90,180,110,0.85)";
      ctx.beginPath();
      ctx.ellipse(ex - er * 0.2, ey + er * 0.1, er * 0.35, er * 0.22, 0.6, 0, Math.PI * 2);
      ctx.ellipse(ex + er * 0.35, ey - er * 0.35, er * 0.18, er * 0.12, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,10,0.55)";
      ctx.beginPath();
      ctx.arc(ex + er * 0.45, ey + er * 0.2, er, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // เนินไกล ๆ
    ctx.fillStyle = "#8a8a93";
    ctx.beginPath();
    ctx.moveTo(0, horizon + 6);
    for (let i = 0; i < hills.length; i++) {
      const x = (i / (hills.length - 1)) * W;
      ctx.lineTo(x, horizon - 4 - hills[i] * H * 0.025);
    }
    ctx.lineTo(W, horizon + 6);
    ctx.closePath();
    ctx.fill();

    // พื้นผิว (โค้งเล็กน้อย)
    const gg = ctx.createLinearGradient(0, horizon, 0, H);
    gg.addColorStop(0, "#c4c4cb");
    gg.addColorStop(0.35, "#a3a3ac");
    gg.addColorStop(1, "#6d6d78");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.moveTo(0, horizon + H * 0.012);
    ctx.quadraticCurveTo(W / 2, horizon - H * 0.012, W, horizon + H * 0.012);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // หลุมบนพื้น
    for (const c of groundCraters) {
      const y = groundY(horizon, c.d);
      if (y > H + 40) continue;
      const scale = 0.25 + c.d * 1.2;
      const x = W / 2 + c.gx * W * 0.5 * (0.6 + c.d * 0.6);
      const rx = c.r * W * scale, ry = rx * (0.18 + c.d * 0.2);
      ctx.fillStyle = "rgba(80,80,92,0.45)";
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(235,235,242,0.45)";
      ctx.lineWidth = Math.max(1, ry * 0.25);
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    return horizon;
  }

  // ---------- ทีวีโบราณ หน้าจอเป็นแชทกับ Nous ----------
  const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("th", { granularity: "grapheme" }) : null;
  const graphemes = (s) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));

  function chatScript(info) {
    const names = info.names ?? [];
    return [
      { q: "โปรเจกต์นี้ชื่ออะไร?", a: info.project },
      { q: "ทีมมีใครบ้าง?", a: names.length ? names.map((n) => n.name).join(" · ") : "สามดาวแห่งเนเน่นายแน่มาก" },
      { q: "Nous คือใคร?", a: "ผู้ช่วย AI ที่ตอบจากพอร์ตของพวกเรา" },
    ];
  }

  // ตัดบรรทัดตามความกว้าง: ตัดที่ช่องว่างก่อน ถ้าคำยาวเกิน (เช่นภาษาไทยไม่มีเว้นวรรค) ค่อยตัดทีละตัวอักษร
  function wrap(text, maxW, maxLines) {
    const lines = [];
    let cur = "";
    const fits = (str) => ctx.measureText(str).width <= maxW;
    for (const token of text.split(/(\s+)/)) {
      if (!token) continue;
      if (fits(cur + token)) {
        cur += token;
        continue;
      }
      if (cur.trim()) lines.push(cur.trimEnd());
      cur = "";
      if (/^\s+$/.test(token)) continue;
      for (const g of graphemes(token)) {
        if (!fits(cur + g) && cur) {
          lines.push(cur);
          cur = "";
        }
        cur += g;
      }
    }
    if (cur.trim()) lines.push(cur.trimEnd());
    return lines.slice(0, maxLines);
  }

  function bubble(x, y, maxW, text, f, side, fill, ink, stroke) {
    const lines = wrap(text, maxW - f * 1.2, 3);
    const w = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + f * 1.2);
    const h = lines.length * f * 1.3 + f * 0.6;
    const bx = side === "right" ? x - w : x;
    ctx.beginPath();
    ctx.roundRect(bx, y, w, h, f * 0.6);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(1, f * 0.08);
      ctx.stroke();
    }
    ctx.fillStyle = ink;
    lines.forEach((l, k) => ctx.fillText(l, bx + f * 0.6, y + f * 0.3 + f * (k + 1) * 1.3 - f * 0.3));
    return h;
  }

  function drawScreen(sx, sy, sw, sh, u, t, info) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 5 * u);
    ctx.clip();
    const bg = ctx.createLinearGradient(0, sy, 0, sy + sh);
    bg.addColorStop(0, "#14113a");
    bg.addColorStop(1, "#07061a");
    ctx.fillStyle = bg;
    ctx.fillRect(sx, sy, sw, sh);

    const on = t - TV_ON;
    if (on < 0) {
      // ช่วงเปิดเครื่อง: จอซ่าแล้วขึ้น ERROR แวบหนึ่ง (เหมือนคลิปต้นแบบ)
      for (let k = 0; k < 90; k++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
        ctx.fillRect(sx + Math.random() * sw, sy + Math.random() * sh, 2 * u, 1.2 * u);
      }
      if (on > -0.5) {
        ctx.font = `700 ${9 * u}px Kanit, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "#ff4d5e";
        ctx.fillText("ERROR", sx + sw / 2, sy + sh / 2 + 3 * u);
      }
    } else {
      const f = Math.max(7, 4.4 * u);
      ctx.textAlign = "left";
      // แถบหัว: ชื่อโปรเจกต์
      ctx.fillStyle = "rgba(255,217,138,0.14)";
      ctx.fillRect(sx, sy, sw, f * 1.9);
      ctx.fillStyle = "#7ef0a0";
      ctx.beginPath();
      ctx.arc(sx + f * 0.8, sy + f * 0.95, f * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `600 ${f}px Kanit, "Noto Sans Thai", sans-serif`;
      ctx.fillStyle = "#ffd98a";
      ctx.fillText(info.short, sx + f * 1.4, sy + f * 1.3);

      const script = chatScript(info);
      const CYCLE = 7;
      const n = Math.floor(on / CYCLE) % script.length;
      const c = on % CYCLE;
      const { q, a } = script[n];
      let y = sy + f * 2.6;
      const pad = f * 0.6, maxW = sw * 0.84;
      if (c > 0.2) y += bubble(sx + sw - pad, y, maxW, q, f, "right", "#5b47c9", "#ffffff") + f * 0.5;
      if (c > 0.9 && c < 1.8) {
        // จุดกำลังพิมพ์
        for (let k = 0; k < 3; k++) {
          ctx.fillStyle = `rgba(255,217,138,${0.4 + 0.6 * Math.max(0, Math.sin(t * 8 - k))})`;
          ctx.beginPath();
          ctx.arc(sx + pad + f * (0.6 + k * 0.8), y + f * 0.7, f * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (c >= 1.8) {
        const g = graphemes(a);
        const shown = g.slice(0, Math.floor((c - 1.8) * 22)).join("");
        if (shown) bubble(sx + pad, y, maxW, shown, f, "left", "rgba(255,217,138,0.12)", "#ffeac2", "rgba(255,217,138,0.6)");
      }
    }

    // เส้นสแกนแบบจอ CRT + แสงสะท้อน
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = sy; y < sy + sh; y += Math.max(2, 1.6 * u)) ctx.fillRect(sx, y, sw, Math.max(0.7, 0.5 * u));
    const gl = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    gl.addColorStop(0, "rgba(255,255,255,0.12)");
    gl.addColorStop(0.4, "rgba(255,255,255,0)");
    ctx.fillStyle = gl;
    ctx.fillRect(sx, sy, sw, sh);
    ctx.restore();
  }

  function drawTV(u, t, info) {
    // เสาอากาศ
    ctx.strokeStyle = "#c9ced8";
    ctx.lineWidth = 1.6 * u;
    ctx.beginPath();
    ctx.moveTo(-26 * u, -84 * u);
    ctx.lineTo(-48 * u, -112 * u);
    ctx.moveTo(26 * u, -84 * u);
    ctx.lineTo(50 * u, -114 * u);
    ctx.stroke();
    ctx.fillStyle = "#e3e6ec";
    ctx.beginPath();
    ctx.arc(-48 * u, -112 * u, 2 * u, 0, Math.PI * 2);
    ctx.arc(50 * u, -114 * u, 2 * u, 0, Math.PI * 2);
    ctx.fill();

    // ตัวกล่องไม้
    const wood = ctx.createLinearGradient(0, -86 * u, 0, -16 * u);
    wood.addColorStop(0, "#9a5a32");
    wood.addColorStop(1, "#5e321a");
    ctx.beginPath();
    ctx.roundRect(-48 * u, -86 * u, 96 * u, 68 * u, 7 * u);
    ctx.fillStyle = wood;
    ctx.fill();
    ctx.strokeStyle = "#3d2010";
    ctx.lineWidth = 1.4 * u;
    ctx.stroke();
    // ขาทีวี
    ctx.fillStyle = "#3d2010";
    ctx.fillRect(-38 * u, -19 * u, 8 * u, 5 * u);
    ctx.fillRect(30 * u, -19 * u, 8 * u, 5 * u);
    // ปุ่มหมุน + ลำโพง
    ctx.fillStyle = "#c9b28a";
    ctx.fillRect(28 * u, -80 * u, 15 * u, 56 * u);
    for (const ky of [-70, -54]) {
      ctx.fillStyle = "#2b2b33";
      ctx.beginPath();
      ctx.arc(35.5 * u, ky * u, 5 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#d9d9e0";
      ctx.fillRect(35 * u, (ky - 4.5) * u, 1.2 * u, 4.5 * u);
    }
    ctx.fillStyle = "#6e5434";
    for (let k = 0; k < 4; k++) ctx.fillRect(30 * u, (-42 + k * 4) * u, 11 * u, 1.6 * u);

    // หน้าจอเรืองแสง
    ctx.save();
    ctx.shadowColor = "rgba(165,139,255,0.9)";
    ctx.shadowBlur = 14 * u;
    ctx.fillStyle = "#0b0a1f";
    ctx.beginPath();
    ctx.roundRect(-43 * u, -81 * u, 68 * u, 58 * u, 6 * u);
    ctx.fill();
    ctx.restore();
    drawScreen(-41 * u, -79 * u, 64 * u, 54 * u, u, t, info);
  }

  // นักบินอวกาศหนึ่งคน (x, เท้าอยู่ที่ feet, ขนาด A = ความสูงทั้งตัว)
  // o: { wave: "left" | "right", tv: info, walk: เฟสการเดิน, facing: 1 | -1 }
  function drawAstronaut(x, feet, A, color, t, o = {}) {
    const u = A / 112;
    const suit = "#eef0f4", seam = "#b4b9c4";
    ctx.save();
    ctx.translate(x, feet);
    if (o.facing === -1) ctx.scale(-1, 1);

    const limb = (sx, sy, ang, len, wdt, col) => {
      ctx.save();
      ctx.translate(sx * u, sy * u);
      ctx.rotate(ang);
      ctx.lineCap = "round";
      ctx.strokeStyle = seam;
      ctx.lineWidth = (wdt + 2.4) * u;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, len * u);
      ctx.stroke();
      ctx.strokeStyle = col;
      ctx.lineWidth = wdt * u;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, len * u);
      ctx.stroke();
      ctx.fillStyle = "#c9ced8";
      ctx.beginPath();
      ctx.arc(0, len * u, wdt * 0.62 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    const rrect = (x0, y0, w, h, r, fill, stroke) => {
      ctx.beginPath();
      ctx.roundRect(x0 * u, y0 * u, w * u, h * u, r * u);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.4 * u;
        ctx.stroke();
      }
    };
    const leg = (sx, ang) => {
      ctx.save();
      ctx.translate(sx * u, -40 * u);
      ctx.rotate(ang);
      ctx.translate(-sx * u, 40 * u);
      rrect(sx - 7, -40, 14, 32, 6, suit, seam);
      rrect(sx - 9.5, -10, 19, 10, 4, "#8f96a3");
      ctx.restore();
    };

    const swing = o.walk == null ? 0 : Math.sin(o.walk);
    // ขา (เดินได้)
    leg(-10, swing * 0.45);
    leg(10, -swing * 0.45);

    // เป้หลัง
    rrect(-25, -80, 50, 40, 8, "#cfd3dc", seam);

    const wave = Math.sin(t * 5) * 0.35;
    // แขนซ้าย
    let la = 0.25;
    if (o.tv) la = 0.95;
    else if (o.wave === "left") la = Math.PI * 0.85 + wave;
    else if (o.walk != null) la = 0.15 - swing * 0.4;
    limb(-19, -70, la, 30, 11, suit);

    // แขนขวา (วาดก่อนลำตัวเมื่อเดิน เพื่อให้ดูเป็นแขนด้านหลัง)
    let ra = -0.25;
    if (o.tv) ra = -0.95;
    else if (o.wave === "right") ra = -Math.PI * 0.85 - wave;
    else if (o.walk != null) ra = -0.15 + swing * 0.4;
    if (o.walk != null) limb(19, -70, ra, 30, 11, suit);

    // ลำตัว
    rrect(-21, -78, 42, 44, 11, suit, seam);
    rrect(-11, -68, 22, 13, 3, color);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-5 * u, -61.5 * u, 1.8 * u, 0, Math.PI * 2);
    ctx.arc(1 * u, -61.5 * u, 1.8 * u, 0, Math.PI * 2);
    ctx.fill();
    rrect(-21, -41, 42, 5, 2, seam);
    if (o.walk == null && !o.tv) limb(19, -70, ra, 30, 11, suit);
    if (o.tv) limb(19, -70, ra, 30, 11, suit);

    // หมวก + กระจกหน้า
    ctx.fillStyle = suit;
    ctx.strokeStyle = seam;
    ctx.lineWidth = 1.4 * u;
    ctx.beginPath();
    ctx.arc(0, -94 * u, 20 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const vg = ctx.createLinearGradient(0, -104 * u, 0, -82 * u);
    vg.addColorStop(0, "#0c0d1c");
    vg.addColorStop(1, color);
    ctx.fillStyle = vg;
    ctx.beginPath();
    ctx.ellipse(o.walk != null ? 3 * u : 0, -93 * u, 14 * u, 11.5 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.ellipse(0, -93 * u, 10 * u, 8 * u, 0, Math.PI * 1.15, Math.PI * 1.45);
    ctx.stroke();

    // อุ้มทีวีไว้หน้าอก แล้ววาดถุงมือจับขอบทีวี
    if (o.tv) {
      drawTV(u, t, o.tv);
      ctx.fillStyle = "#c9ced8";
      ctx.strokeStyle = seam;
      ctx.lineWidth = 1.2 * u;
      for (const gx of [-48, 48]) {
        ctx.beginPath();
        ctx.arc(gx * u, -50 * u, 7 * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // นักบินอวกาศเดินไปมาด้านหลัง
  function drawWalkers(t, horizon, A) {
    const fade = clamp01((t - TILT_END + 0.3) / 0.8);
    if (fade <= 0) return;
    ctx.globalAlpha = fade;
    for (const w of walkers) {
      const size = A * (0.22 + 0.6 * w.d);
      const span = W + size * 2;
      let xf = (w.x * span + w.dir * w.sp * size * t) % span;
      if (xf < 0) xf += span;
      const x = xf - size;
      const feet = groundY(horizon, w.d);
      const phase = w.ph + t * 5.2;
      const bob = -Math.abs(Math.sin(phase)) * size * 0.05;
      ctx.fillStyle = "rgba(20,20,30,0.25)";
      ctx.beginPath();
      ctx.ellipse(x, feet + 1, size * 0.25, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      drawAstronaut(x, feet + bob, size, w.color, t, { walk: phase, facing: w.dir });
    }
    ctx.globalAlpha = 1;
  }

  function drawCrew(t, horizon) {
    const info = getInfo();
    const names = info.names ?? [];
    const project = info.project || "Trinity Bot / Nous AI Assistant Portfolio";
    const tvInfo = { names, project, short: project.split("/")[0].trim() };
    const A = Math.min(H * 0.27, W * (W < H ? 0.27 : 0.17));
    const feet = horizon + (H - horizon) * 0.66;
    const gap = Math.min(W * (W < H ? 0.3 : 0.24), A * 1.9);
    const xs = [W / 2 - gap, W / 2, W / 2 + gap];

    drawWalkers(t, horizon, A);

    for (let i = 0; i < 3; i++) {
      const dt = t - LAND[i];
      if (dt < -0.9) continue;
      const Ai = i === 1 ? A * 1.12 : A;
      // ตกลงมาช้า ๆ แบบแรงโน้มถ่วงต่ำ แล้วเด้งเบา ๆ
      let off;
      if (dt < 0) off = -Math.pow(-dt / 0.9, 2) * (feet + Ai);
      else off = -Ai * 0.1 * Math.abs(Math.sin(dt * 5)) * Math.exp(-dt * 3.5);
      const bob = dt > 1 ? Math.sin(t * 2 + i) * Ai * 0.006 : 0;

      // เงา
      const sh = clamp01(1 + off / (Ai * 2));
      ctx.fillStyle = `rgba(20,20,30,${0.35 * sh})`;
      ctx.beginPath();
      ctx.ellipse(xs[i] + Ai * 0.12, feet + 2, Ai * 0.3 * (0.6 + 0.4 * sh), Ai * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();

      // แสงจากจอทีวีตกกระทบพื้น
      if (i === 1 && t > TV_ON) {
        const lg = ctx.createRadialGradient(xs[1], feet, 0, xs[1], feet, Ai * 0.9);
        lg.addColorStop(0, `rgba(165,139,255,${0.22 * clamp01(t - TV_ON)})`);
        lg.addColorStop(1, "rgba(165,139,255,0)");
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.ellipse(xs[1], feet, Ai * 0.9, Ai * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // ฝุ่นตอนแตะพื้น
      if (dt > 0 && dt < 1.4) {
        const k = dt / 1.4;
        for (let d = 0; d < 9; d++) {
          const side = d % 2 ? 1 : -1;
          const spread = (0.25 + (d / 9) * 0.6) * Ai * easeOut(k);
          ctx.fillStyle = `rgba(215,215,224,${0.45 * (1 - k)})`;
          ctx.beginPath();
          ctx.ellipse(xs[i] + side * spread, feet - Ai * 0.03 - (d % 3) * Ai * 0.02 * k, Ai * (0.06 + 0.08 * k), Ai * (0.03 + 0.03 * k), 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const opts = i === 1 ? { tv: tvInfo } : { wave: i === 0 ? "left" : "right" };
      drawAstronaut(xs[i], feet + off + bob, Ai, colors[i], t + i, opts);

      // ชื่อใต้เท้า
      const nm = names[i]?.name;
      if (nm && dt > 0.3) {
        ctx.globalAlpha = clamp01((dt - 0.3) / 0.5);
        ctx.font = `600 ${Math.max(13, A * 0.12)}px Kanit, "Noto Sans Thai", sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(5,4,13,0.55)";
        ctx.fillText(nm, xs[i] + 1, feet + A * 0.2 + 1);
        ctx.fillStyle = colors[i];
        ctx.fillText(nm, xs[i], feet + A * 0.2);
        ctx.globalAlpha = 1;
      }
    }
  }

  function frame(now) {
    resize();
    const t = reduced ? 30 : (now - t0) / 1000;
    ctx.fillStyle = "#010103";
    ctx.fillRect(0, 0, W, H);

    if (t < APPROACH + 0.25) {
      drawFlyStars(t);
      drawMoon(t);
    }
    if (t >= APPROACH) {
      const horizon = drawSurface(t);
      drawCrew(t, horizon);
    }
    // รอยต่อระหว่างดวงจันทร์เต็มจอกับพื้นผิว
    const cross = 1 - Math.abs(t - APPROACH) / 0.25;
    if (cross > 0) {
      ctx.fillStyle = `rgba(190,190,198,${cross})`;
      ctx.fillRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  return {
    stop() {
      cancelAnimationFrame(raf);
    },
  };
}
