import { useEffect, useRef, useState } from "react";
import Astrolabe from "./Astrolabe.jsx";
import { usePortfolio } from "../usePortfolio.js";

const BOOT_LINES = [
  "> wake nous --core erudition",
  "> link postgres://knowledge-vault ✓",
  "> load members, projects ✓",
  "> omniscience: ONLINE",
];

// ฉากหลังดาวแบบ 3 มิติ วาดด้วย canvas: ปกติลอยช้าๆ กดเข้าเว็บแล้ววาร์ปเป็นเส้นแสง
function useStarfield(canvasRef, warpRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const color = getComputedStyle(document.documentElement).getPropertyValue("--star").trim() || "#e0f2fe";
    let w, h, raf;
    const stars = Array.from({ length: 700 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }));
    let speed = 0.0012;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      const target = warpRef.current ? 0.045 : reduce ? 0 : 0.0012;
      speed += (target - speed) * 0.06;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      const cx = w / 2, cy = h / 2, scale = Math.max(w, h) * 0.3;
      for (const s of stars) {
        const pz = s.z;
        s.z -= speed;
        if (s.z <= 0.02) {
          s.x = Math.random() * 2 - 1;
          s.y = Math.random() * 2 - 1;
          s.z = 1;
          continue;
        }
        const sx = cx + (s.x / s.z) * scale;
        const sy = cy + (s.y / s.z) * scale;
        const size = (1 - s.z) * 2.2;
        ctx.globalAlpha = Math.min(1, (1 - s.z) * 1.4);
        if (speed > 0.006) {
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(cx + (s.x / pz) * scale, cy + (s.y / pz) * scale);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillRect(sx, sy, size, size);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, warpRef]);
}

export default function IntroSplash({ onDone }) {
  const canvasRef = useRef(null);
  const warpRef = useRef(false);
  const enterRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const { data } = usePortfolio();
  useStarfield(canvasRef, warpRef);

  function enter() {
    if (leaving) return;
    warpRef.current = true;
    setLeaving(true);
    setTimeout(onDone, 1400);
  }

  useEffect(() => {
    const t = setTimeout(() => enterRef.current?.focus(), 3400);
    function onKey(e) {
      if (e.key === "Escape") onDone();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);

  const members = data?.members ?? [];
  const names = members.map((m) => m.name.split(" ")[0]);

  return (
    <div className={`intro ${leaving ? "intro-leaving" : ""}`} role="dialog" aria-modal="true" aria-label="หน้าเปิดเว็บไซต์ เนเน่นายแน่มาก">
      <div className="intro-nebula" aria-hidden="true" />
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <div className="intro-vignette" aria-hidden="true" />

      <div className="hud hud-tl" aria-hidden="true">
        <span className="hud-dot" /> ERUDITION CORE · NENE-01
      </div>
      <div className="hud hud-bl" aria-hidden="true">
        {BOOT_LINES.map((line, i) => (
          <div key={line} className="boot-line" style={{ animationDelay: `${0.6 + i * 0.35}s` }}>{line}</div>
        ))}
      </div>
      <div className="hud hud-br" aria-hidden="true">RA 05h 35m · DEC −05° 23′<br />AI &amp; DATA ENGINEERING</div>
      <button className="intro-skip" onClick={onDone}>ข้าม ✕</button>

      <div className="intro-stage">
        <div className="intro-sigil">
          <Astrolabe names={names} />
        </div>

        <h1 className="intro-title">
          {["เนเน่", "นาย", "แน่", "มาก"].map((w, i) => (
            <span key={w} className="intro-word" style={{ animationDelay: `${1.6 + i * 0.15}s` }}>{w}</span>
          ))}
        </h1>
        <p className="intro-sub">— คลังปัญญาแห่ง Nous —</p>

        {members.length > 0 && (
          <ul className="intro-roster">
            {members.map((m, i) => (
              <li key={m.id} style={{ animationDelay: `${2.4 + i * 0.15}s` }}>
                <span className="roster-star" aria-hidden="true">✦</span>
                <span>
                  <strong>{m.name}</strong>
                  <em>{m.role}</em>
                </span>
              </li>
            ))}
          </ul>
        )}

        <button ref={enterRef} className="intro-enter" onClick={enter}>
          <span>เข้าสู่คลังปัญญา</span>
        </button>
      </div>
      <div className="intro-flash" aria-hidden="true" />
    </div>
  );
}
