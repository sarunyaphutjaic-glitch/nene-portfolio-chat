import { useEffect, useRef, useState } from "react";
import { MEMBER_COLORS, READY_AT, startMoon } from "../moon.js";

const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// ฉากที่ 2 ของหน้าเปิด: บินไปลงจอดบนดวงจันทร์ สมาชิก 3 คนเป็นนักบินอวกาศ คนกลางถือธงชาติไทย
export default function MoonLanding({ onDone, getNames }) {
  const canvasRef = useRef(null);
  const goRef = useRef(null);
  const [reduced] = useState(prefersReduced);
  const [ready, setReady] = useState(reduced);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const m = startMoon(canvasRef.current, { getNames, colors: MEMBER_COLORS, reduced });
    return () => m.stop();
  }, [getNames, reduced]);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setReady(true), READY_AT * 1000);
    return () => clearTimeout(t);
  }, [reduced]);

  useEffect(() => {
    if (ready) goRef.current?.focus();
  }, [ready]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onDone();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  function leave() {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDone, 700);
  }

  return (
    <div
      className={`moon ${leaving ? "moon-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="ลงจอดบนดวงจันทร์ สมาชิกทั้งสามคนพร้อมธงชาติไทย"
    >
      <canvas ref={canvasRef} className="moon-canvas" aria-hidden="true" />
      <button className="intro-skip" onClick={onDone}>ข้าม ✕</button>
      <div className={`moon-stage ${ready ? "on" : ""}`}>
        <div className="moon-kicker">MISSION COMPLETE · ลงจอดสำเร็จ</div>
        <h2 className="moon-title"><span>สามดาว</span> <span>ถึงดวงจันทร์แล้ว</span></h2>
        <button ref={goRef} className="moon-go" onClick={leave} tabIndex={ready ? 0 : -1}>
          เข้าสู่เว็บไซต์ →
        </button>
      </div>
      {!reduced && <div className="moon-flash" aria-hidden="true" />}
    </div>
  );
}
