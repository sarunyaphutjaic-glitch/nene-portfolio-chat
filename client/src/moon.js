// ฉากลงจอดบนดวงจันทร์ (ต่อจากหน้าเปิดกาแล็กซี) วาดด้วย Canvas 2D ทั้งหมด ไม่ใช้ไฟล์รูป
// ลำดับเวลา: บินผ่านดวงดาว → ดวงจันทร์ใหญ่ขึ้นจนเต็มจอ → กล้องเงยขึ้นเห็นพื้นผิว → นักบินอวกาศ 3 คนลงจอด → ธงชาติไทยโบก

export const MEMBER_COLORS = ["#ffb547", "#4fd1ff", "#ff5fa2"]; // ทอง ฟ้า ชมพู (ตรงกับหน้าแรก)

const APPROACH = 2.2; // วินาทีที่บินเข้าหาดวงจันทร์
const TILT_END = 3.4; // กล้องเงยขึ้นจนเห็นขอบฟ้า
const LAND = [3.5, 3.85, 4.2]; // เวลาที่แต่ละคนแตะพื้น
const FLAG_OPEN = 4.6; // ธงเริ่มคลี่
export const READY_AT = 5.2; // แสดงข้อความและปุ่ม

// ธงชาติไทย แดง ขาว น้ำเงิน(2 ส่วน) ขาว แดง
const FLAG_STRIPES = [
  ["#a51931", 1],
  ["#f4f5f8", 1],
  ["#2d2a4a", 2],
  ["#f4f5f8", 1],
  ["#a51931", 1],
];

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

export function startMoon(canvas, { getNames = () => [], colors = MEMBER_COLORS, reduced = false } = {}) {
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

  function drawFlag(x, topY, u, t, open) {
    const w = 62 * u * open, h = 40 * u;
    if (w < 1) return;
    const N = 22;
    const amp = 4 * u;
    let y0 = topY;
    for (const [color, part] of FLAG_STRIPES) {
      const sh = (h * part) / 6;
      for (let j = 0; j < N; j++) {
        const xa = (j / N) * w, xb = ((j + 1) / N) * w;
        const wa = Math.sin(xa / (14 * u) - t * 5) * amp * (xa / w);
        const wb = Math.sin(xb / (14 * u) - t * 5) * amp * (xb / w);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + xa, y0 + wa);
        ctx.lineTo(x + xb + 0.6, y0 + wb);
        ctx.lineTo(x + xb + 0.6, y0 + sh + wb + 0.6);
        ctx.lineTo(x + xa, y0 + sh + wa + 0.6);
        ctx.closePath();
        ctx.fill();
        const shade = Math.cos(xa / (14 * u) - t * 5) * 0.12 * (xa / w);
        if (shade > 0) {
          ctx.fillStyle = `rgba(0,0,0,${shade})`;
          ctx.fill();
        }
      }
      y0 += sh;
    }
  }

  // นักบินอวกาศหนึ่งคน (x, เท้าอยู่ที่ feet, ขนาด A = ความสูงทั้งตัว)
  function drawAstronaut(x, feet, A, color, t, i, holdsFlag, flagOpen) {
    const u = A / 112;
    const suit = "#eef0f4", seam = "#b4b9c4";
    ctx.save();
    ctx.translate(x, feet);

    const limb = (sx, sy, ang, len, wdt, col) => {
      ctx.save();
      ctx.translate(sx * u, sy * u);
      ctx.rotate(ang);
      ctx.strokeStyle = seam;
      ctx.lineWidth = (wdt + 2.4) * u;
      ctx.lineCap = "round";
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

    // ขา + รองเท้า
    rrect(-17, -40, 14, 34, 6, suit, seam);
    rrect(3, -40, 14, 34, 6, suit, seam);
    rrect(-20, -9, 19, 9, 4, "#8f96a3");
    rrect(1, -9, 19, 9, 4, "#8f96a3");

    // เป้หลัง
    rrect(-25, -80, 50, 40, 8, "#cfd3dc", seam);

    // แขนซ้าย (ฝั่งจอ) : คนที่ 1 โบกมือ
    const wave = Math.sin(t * 5 + i) * 0.35;
    const leftArm = i === 0 ? Math.PI * 0.85 + wave : 0.25;
    limb(-19, -70, leftArm, 30, 11, suit);

    // ลำตัว
    rrect(-21, -78, 42, 44, 11, suit, seam);
    rrect(-11, -68, 22, 13, 3, color);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-5 * u, -61.5 * u, 1.8 * u, 0, Math.PI * 2);
    ctx.arc(1 * u, -61.5 * u, 1.8 * u, 0, Math.PI * 2);
    ctx.fill();
    rrect(-21, -41, 42, 5, 2, seam);

    // ธง (คนถือธงจับเสาด้วยมือขวา)
    if (holdsFlag) {
      const poleX = 34 * u, poleTop = -150 * u;
      ctx.strokeStyle = "#d9dde5";
      ctx.lineWidth = 2.6 * u;
      ctx.beginPath();
      ctx.moveTo(poleX, 0);
      ctx.lineTo(poleX, poleTop);
      ctx.stroke();
      ctx.fillStyle = "#f2d27a";
      ctx.beginPath();
      ctx.arc(poleX, poleTop, 3 * u, 0, Math.PI * 2);
      ctx.fill();
      drawFlag(poleX + 1.3 * u, poleTop + 3 * u, u, t, flagOpen);
      limb(19, -70, -1.25, 21, 11, suit);
    } else {
      const rightArm = i === 2 ? -Math.PI * 0.85 - Math.sin(t * 5 + 2) * 0.35 : -0.25;
      limb(19, -70, rightArm, 30, 11, suit);
    }

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
    ctx.ellipse(0, -93 * u, 14 * u, 11.5 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.ellipse(0, -93 * u, 10 * u, 8 * u, 0, Math.PI * 1.15, Math.PI * 1.45);
    ctx.stroke();

    ctx.restore();
  }

  function drawCrew(t, horizon) {
    const names = getNames();
    const A = Math.min(H * 0.27, W * (W < H ? 0.25 : 0.17));
    const feet = horizon + (H - horizon) * 0.66;
    const gap = Math.min(W * (W < H ? 0.3 : 0.24), A * 1.9);
    const xs = [W / 2 - gap, W / 2, W / 2 + gap];

    for (let i = 0; i < 3; i++) {
      const dt = t - LAND[i];
      if (dt < -0.9) continue;
      // ตกลงมาช้า ๆ แบบแรงโน้มถ่วงต่ำ แล้วเด้งเบา ๆ
      let off;
      if (dt < 0) off = -Math.pow(-dt / 0.9, 2) * (feet + A);
      else off = -A * 0.1 * Math.abs(Math.sin(dt * 5)) * Math.exp(-dt * 3.5);
      const bob = dt > 1 ? Math.sin(t * 2 + i) * A * 0.006 : 0;

      // เงา
      const sh = clamp01(1 + off / (A * 2));
      ctx.fillStyle = `rgba(20,20,30,${0.35 * sh})`;
      ctx.beginPath();
      ctx.ellipse(xs[i] + A * 0.12, feet + 2, A * 0.3 * (0.6 + 0.4 * sh), A * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();

      // ฝุ่นตอนแตะพื้น
      if (dt > 0 && dt < 1.4) {
        const k = dt / 1.4;
        for (let d = 0; d < 9; d++) {
          const side = d % 2 ? 1 : -1;
          const spread = (0.25 + (d / 9) * 0.6) * A * easeOut(k);
          ctx.fillStyle = `rgba(215,215,224,${0.45 * (1 - k)})`;
          ctx.beginPath();
          ctx.ellipse(xs[i] + side * spread, feet - A * 0.03 - (d % 3) * A * 0.02 * k, A * (0.06 + 0.08 * k), A * (0.03 + 0.03 * k), 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const flagOpen = easeOut((t - FLAG_OPEN) / 0.8);
      drawAstronaut(xs[i], feet + off + bob, A, colors[i], t, i, i === 1, flagOpen);

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
