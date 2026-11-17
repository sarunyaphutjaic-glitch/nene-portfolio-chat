import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../usePortfolio.js";

// โทนสีกาแล็กซีตามธีมของเว็บ (stops = สีจากแกนกลางไล่ออกไปขอบ)
const PALETTES = {
  nous: { accent: "#ffd98a", stops: [[1, 0.97, 0.88], [1, 0.8, 0.45], [0.62, 0.48, 0.92], [0.31, 0.76, 0.97]], hii: [1, 0.45, 0.75] },
  terminal: { accent: "#7ff5c9", stops: [[0.94, 1, 0.97], [0.6, 1, 0.85], [0.2, 0.83, 0.6], [0.22, 0.74, 0.97]], hii: [0.7, 0.55, 1] },
  party: { accent: "#ffb27a", stops: [[1, 0.96, 0.86], [1, 0.62, 0.3], [0.88, 0.2, 0.33], [0.55, 0.25, 0.75]], hii: [1, 0.85, 0.5] },
};

function gauss() {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

function colorAt(pal, t) {
  const s = pal.stops, seg = Math.min(2.999, t * 3), k = Math.floor(seg), f = seg - k;
  const c0 = s[k], c1 = s[k + 1];
  return [0, 1, 2].map((i) => Math.round((c0[i] + (c1[i] - c0[i]) * f) * 255));
}

// สร้างดาว 5,200 ดวงเป็นกาแล็กซีกังหัน 3 แขน (แขนละหนึ่งคน)
function buildStars(pal) {
  const hii = pal.hii.map((v) => Math.round(v * 255));
  return Array.from({ length: 5200 }, (_, i) => {
    const kind = Math.random(), arm = i % 3;
    let r, th;
    if (kind < 0.16) { r = Math.abs(gauss()) * 0.14; th = Math.random() * 6.283; }
    else if (kind < 0.24) { r = 0.15 + Math.random() * 0.95; th = Math.random() * 6.283; }
    else { r = 0.08 + Math.pow(Math.random(), 1.35) * 0.95; th = arm * 2.094 + r * 4.6 + gauss() * (0.32 - r * 0.12); }
    const isHii = kind >= 0.24 && Math.random() < 0.035;
    const c = isHii ? hii : colorAt(pal, Math.min(1, r * 1.15));
    return {
      r, th, z: gauss() * 0.05 * (1 - r), hii: isHii,
      size: (Math.random() < 0.04 ? 2.2 : 0.5 + Math.random() * 1.1) * (isHii ? 2.4 : 1),
      a: 0.35 + Math.random() * 0.6, flick: Math.random() * 6.28,
      col: `rgb(${c[0]},${c[1]},${c[2]})`,
    };
  });
}

export default function IntroSplash({ onDone, theme = "nous" }) {
  const canvasRef = useRef(null);
  const warpRef = useRef(false);
  const namesRef = useRef([]);
  const enterRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const { data } = usePortfolio();
  const pal = PALETTES[theme] ?? PALETTES.nous;

  // ส่งชื่อสมาชิกจากฐานข้อมูลให้ลูปวาด canvas ใช้
  useEffect(() => {
    namesRef.current = (data?.members ?? []).slice(0, 3).map((m) => ({ name: m.name.split(" ")[0], role: m.role }));
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stars = buildStars(pal);
    const bg = Array.from({ length: 260 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.3 + 0.2, tw: Math.random() * 6.28 }));
    const core = colorAt(pal, 0);
    const t0 = performance.now();
    let raf, last = t0, zoom = 1, spinMul = 1, rot = 0;

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = (now - t0) / 1000;
      const warp = warpRef.current;
      let form = reduce ? 1 : Math.min(1, t / 2.8);
      form = 1 - Math.pow(1 - form, 3);
      if (warp) { zoom *= 1 + dt * 2.6; spinMul += dt * 9; }
      if (!reduce) rot += dt * 0.12 * spinMul;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = warp ? "rgba(1,1,3,0.35)" : "rgb(1,1,3)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      for (const s of bg) {
        ctx.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.5 + s.tw));
        ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
      }

      const cx = w / 2, cy = h * 0.4;
      const S = Math.min(w, h * 1.5) * 0.52 * zoom;
      const tilt = 0.42 + 0.06 * Math.sin(t * 0.15);
      const ct = Math.cos(-0.32), st = Math.sin(-0.32);

      // แสงเรืองที่แกนกลาง
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.38);
      glow.addColorStop(0, `rgba(${core[0]},${core[1]},${core[2]},${0.55 * form})`);
      glow.addColorStop(0.35, `rgba(${core[0]},${Math.round(core[1] * 0.8)},${Math.round(core[2] * 0.6)},${0.18 * form})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // ดาวหมุนวนเข้ามาก่อตัวเป็นกาแล็กซี (วงในหมุนเร็วกว่าวงนอก)
      for (const p of stars) {
        const ang = p.th + rot * (0.35 + 0.65 * (1 - p.r)) + (1 - form) * 4 * (1 - p.r);
        const rr = p.r * (1 + (1 - form) * 2.2);
        const x0 = Math.cos(ang) * rr, y0 = Math.sin(ang) * rr * tilt + p.z;
        const x = cx + (x0 * ct - y0 * st) * S, y = cy + (x0 * st + y0 * ct) * S;
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue;
        ctx.globalAlpha = p.a * form * (0.75 + 0.25 * Math.sin(t * 2 + p.flick));
        ctx.fillStyle = p.col;
        const sz = p.size * Math.min(3, zoom);
        ctx.fillRect(x, y, sz, sz);
      }

      // ดาวสมาชิก 3 ดวง อยู่ปลายแขนกาแล็กซีละแขน
      const show = warp ? 0 : Math.max(0, Math.min(1, (t - 3) / 1.2));
      const names = namesRef.current;
      if (show > 0) {
        for (let m = 0; m < names.length; m++) {
          const mr = 0.6, mth = m * 2.094 + mr * 4.6 + rot * (0.35 + 0.65 * (1 - mr));
          const mx0 = Math.cos(mth) * mr, my0 = Math.sin(mth) * mr * tilt;
          const mx = cx + (mx0 * ct - my0 * st) * S, my = cy + (mx0 * st + my0 * ct) * S;
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 1;
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, 26);
          g.addColorStop(0, `rgba(255,255,255,${0.95 * show})`);
          g.addColorStop(0.25, `rgba(${core[0]},${core[1]},${core[2]},${0.5 * show})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(mx - 26, my - 26, 52, 52);
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * show})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mx - 18, my); ctx.lineTo(mx + 18, my);
          ctx.moveTo(mx, my - 18); ctx.lineTo(mx, my + 18);
          ctx.stroke();

          ctx.globalCompositeOperation = "source-over";
          ctx.globalAlpha = show;
          const left = mx < cx, lx = mx + (left ? -30 : 30);
          ctx.strokeStyle = "rgba(255,255,255,0.35)";
          ctx.beginPath(); ctx.moveTo(mx + (left ? -8 : 8), my); ctx.lineTo(lx, my); ctx.stroke();
          // จัดป้ายชื่อไม่ให้ล้นขอบจอ (สำคัญบนมือถือ)
          ctx.font = "600 15px Kanit, 'Noto Sans Thai', sans-serif";
          const nw = ctx.measureText(names[m].name).width;
          ctx.font = "300 12px Kanit, 'Noto Sans Thai', sans-serif";
          const tw = Math.max(nw, ctx.measureText(names[m].role).width);
          const tx = left ? Math.max(lx - 6, tw + 8) : Math.min(lx + 6, w - tw - 8);
          ctx.textAlign = left ? "right" : "left";
          ctx.fillStyle = "#ffffff";
          ctx.font = "600 15px Kanit, 'Noto Sans Thai', sans-serif";
          ctx.fillText(names[m].name, tx, my - 2);
          ctx.fillStyle = pal.accent;
          ctx.font = "300 12px Kanit, 'Noto Sans Thai', sans-serif";
          ctx.fillText(names[m].role, tx, my + 14);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [pal]);

  useEffect(() => {
    const t = setTimeout(() => enterRef.current?.focus(), 4000);
    function onKey(e) {
      if (e.key === "Escape") onDone();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);

  function enter() {
    if (leaving) return;
    warpRef.current = true;
    setLeaving(true);
    setTimeout(onDone, 2000);
  }

  return (
    <div
      className={`intro ${leaving ? "intro-leaving" : ""}`}
      style={{ "--intro-accent": pal.accent }}
      role="dialog"
      aria-modal="true"
      aria-label="หน้าเปิดเว็บไซต์ เนเน่นายแน่มาก"
    >
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />

      <button className="intro-skip" onClick={onDone}>ข้าม ✕</button>

      <div className="intro-stage">
        <div className="intro-kicker">GROUP PORTFOLIO · AI &amp; DATA ENGINEERING</div>
        <h1 className="intro-title">เนเน่นายแน่มาก</h1>
        <p className="intro-sub">พอร์ตโฟลิโอของกลุ่ม พร้อม Nous ผู้ช่วย AI ที่ตอบได้ทุกเรื่องเกี่ยวกับพวกเรา</p>
        <button ref={enterRef} className="intro-enter" onClick={enter}>
          <span className="intro-shine" aria-hidden="true" />
          เข้าสู่เว็บไซต์
        </button>
      </div>
      <div className="intro-flash" aria-hidden="true" />
    </div>
  );
}
