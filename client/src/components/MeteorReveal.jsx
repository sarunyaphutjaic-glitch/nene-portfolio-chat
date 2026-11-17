import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar.jsx";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ดาวตกพุ่งลงกลางจอ → ระเบิดแสง → เผยการ์ดสมาชิก
export default function MeteorReveal({ member, index, color, onClose, onOpen }) {
  const canvasRef = useRef(null);
  const closeRef = useRef(null);
  // ถ้าผู้ชมตั้งค่าลดการเคลื่อนไหว ให้เผยการ์ดทันทีโดยไม่เล่นดาวตก
  const [revealed, setRevealed] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const [r, g, b] = hexToRgb(color);
    const c = (a) => `rgba(${r},${g},${b},${a})`;
    const t0 = performance.now();
    const IMPACT = 1.15;
    const trail = [], sparks = [], burst = [];
    let raf, last = t0, didReveal = false;

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // เวลาเฟรมแรกอาจมาก่อน t0 เล็กน้อย กันไม่ให้ติดลบ (ค่าติดลบยกกำลังเศษส่วนจะได้ NaN)
      const t = Math.max(0, (now - t0) / 1000);
      const cx = w / 2, cy = h * 0.45;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(3,2,10,0.35)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (t < IMPACT) {
        // ดาวตก: พุ่งจากมุมซ้ายบนเข้าหาจุดกลาง เร่งความเร็วขึ้นเรื่อยๆ
        const u = Math.pow(t / IMPACT, 1.7);
        const sx = -w * 0.15, sy = -h * 0.25;
        const x = sx + (cx - sx) * u, y = sy + (cy - sy) * u;
        trail.push([x, y]);
        if (trail.length > 28) trail.shift();
        for (let k = 1; k < trail.length; k++) {
          const f = k / trail.length;
          ctx.strokeStyle = c(0.7 * f);
          ctx.lineWidth = 2 + f * 14;
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(trail[k - 1][0], trail[k - 1][1]); ctx.lineTo(trail[k][0], trail[k][1]); ctx.stroke();
        }
        const head = ctx.createRadialGradient(x, y, 0, x, y, 46);
        head.addColorStop(0, "rgba(255,255,255,1)"); head.addColorStop(0.25, c(0.9)); head.addColorStop(1, c(0));
        ctx.fillStyle = head; ctx.fillRect(x - 46, y - 46, 92, 92);
        for (let s = 0; s < 4; s++) sparks.push({ x, y, vx: (Math.random() - 0.7) * 120, vy: (Math.random() - 0.7) * 120, life: 1 });
      } else {
        const e = t - IMPACT;
        if (!burst.length) {
          for (let p = 0; p < 260; p++) {
            const a = Math.random() * 6.283, v = 120 + Math.random() * 620;
            burst.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, white: Math.random() < 0.3 });
          }
        }
        for (let ring = 0; ring < 3; ring++) {
          const rr = (e - ring * 0.12) * Math.max(w, h) * 0.7;
          if (rr <= 0) continue;
          ctx.strokeStyle = c(Math.max(0, 0.8 - (e - ring * 0.12) * 0.9));
          ctx.lineWidth = 3 - ring * 0.6;
          ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.stroke();
        }
        for (const p of burst) {
          if (p.life <= 0) continue;
          p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt * 0.55;
          ctx.fillStyle = p.white ? `rgba(255,255,255,${p.life})` : c(p.life);
          ctx.fillRect(p.x, p.y, 2.4, 2.4);
        }
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
        glow.addColorStop(0, c(0.35 * Math.max(0.3, 1 - e))); glow.addColorStop(1, c(0));
        ctx.fillStyle = glow; ctx.fillRect(cx - 220, cy - 220, 440, 440);
        if (e < 0.35) { ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - e / 0.35)})`; ctx.fillRect(0, 0, w, h); }
        if (!didReveal && e > 0.15) { didReveal = true; setRevealed(true); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt * 1.4;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = c(s.life); ctx.fillRect(s.x, s.y, 2, 2);
      }
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [color]);

  useEffect(() => {
    if (revealed) closeRef.current?.focus();
  }, [revealed]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="meteor"
      style={{ "--star-color": color }}
      role="dialog"
      aria-modal="true"
      aria-label={`แนะนำสมาชิก ${member.name}`}
      onClick={() => (revealed ? onClose() : setRevealed(true))}
    >
      <canvas ref={canvasRef} className="meteor-canvas" aria-hidden="true" />
      {revealed && (
        <div className="meteor-card" onClick={(e) => e.stopPropagation()}>
          <div className="meteor-rays" aria-hidden="true" />
          <span className="meteor-no">STAR 0{index + 1}</span>
          <div className="meteor-stars" aria-label="ดาวประจำตัว">✦ ✦ ✦ ✦ ✦</div>
          <span className="g-ring meteor-ring"><Avatar member={member} size={128} /></span>
          <h2>{member.name}</h2>
          <p className="meteor-role">{member.role}</p>
          {member.bio && <p className="meteor-bio">{member.bio}</p>}
          <div className="tags">
            {member.skills.map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
          <div className="meteor-actions">
            <button className="btn" onClick={onOpen}>ดูโปรไฟล์เต็ม →</button>
            <button ref={closeRef} className="btn-ghost" onClick={onClose}>ปิด</button>
          </div>
        </div>
      )}
      {!revealed && <p className="meteor-hint">แตะเพื่อข้าม</p>}
    </div>
  );
}
