import { useEffect, useRef, useState } from "react";
import { usePortfolio } from "../usePortfolio.js";
import { GALAXY_PALETTES, startGalaxy } from "../galaxy.js";

export default function IntroSplash({ onDone, theme = "nous" }) {
  const canvasRef = useRef(null);
  const galaxyRef = useRef(null);
  const namesRef = useRef([]);
  const enterRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const { data } = usePortfolio();
  const accent = (GALAXY_PALETTES[theme] ?? GALAXY_PALETTES.nous).accent;

  // ส่งชื่อสมาชิกจากฐานข้อมูลให้ลูปวาด canvas ใช้
  useEffect(() => {
    namesRef.current = (data?.members ?? []).slice(0, 3).map((m) => ({ name: m.name.split(" ")[0], role: m.role }));
  }, [data]);

  useEffect(() => {
    const g = startGalaxy(canvasRef.current, { theme, getNames: () => namesRef.current });
    galaxyRef.current = g;
    return () => g.stop();
  }, [theme]);

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
    galaxyRef.current?.warp();
    setLeaving(true);
    setTimeout(onDone, 2000);
  }

  return (
    <div
      className={`intro ${leaving ? "intro-leaving" : ""}`}
      style={{ "--intro-accent": accent }}
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
