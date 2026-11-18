import { useEffect, useRef, useState } from "react";
import { MEMBER_COLORS, READY_AT, startMoon } from "../moon.js";

const prefersReduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

// ฉากที่ 2 ของหน้าเปิด: บินไปลงจอดบนดวงจันทร์ สมาชิก 3 คนเป็นนักบินอวกาศ คนกลางอุ้มทีวีที่เป็นหน้าแชทกับ Nous
export default function MoonLanding({ onDone, getInfo }) {
  const canvasRef = useRef(null);
  const goRef = useRef(null);
  const [reduced] = useState(prefersReduced);
  const [ready, setReady] = useState(reduced);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const m = startMoon(canvasRef.current, { getInfo, colors: MEMBER_COLORS, reduced });
    return () => m.stop();
  }, [getInfo, reduced]);

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
      aria-label="ลงจอดบนดวงจันทร์ สมาชิกทั้งสามคน คนกลางอุ้มทีวีที่แชทกับ Nous"
    >
      <canvas ref={canvasRef} className="moon-canvas" aria-hidden="true" />
      <button className="intro-skip" onClick={onDone}>ข้าม ✕</button>
      <div className={`moon-stage ${ready ? "on" : ""}`}>
        <div className="moon-kicker">TRINITY BOT · NOUS AI ASSISTANT</div>
        <h2 className="moon-title"><span>สามดาว</span> <span>ถึงดวงจันทร์แล้ว</span></h2>
        <button ref={goRef} className="moon-go" onClick={leave} tabIndex={ready ? 0 : -1}>
          เข้าสู่เว็บไซต์ →
        </button>
      </div>
      {!reduced && <div className="moon-flash" aria-hidden="true" />}
    </div>
  );
}
