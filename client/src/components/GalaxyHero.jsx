import { useEffect, useRef } from "react";
import { startGalaxy } from "../galaxy.js";

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// กาแล็กซีหมุนเป็นฉากหลังของหน้าแรก กดที่ดาวสมาชิกเพื่อเรียกดาวตก
// (หยุดวาดเมื่อเลื่อนจอพ้นไปแล้ว เพื่อประหยัดเครื่อง)
export default function GalaxyHero({ theme, members, colors, onPick }) {
  const canvasRef = useRef(null);
  const galaxyRef = useRef(null);
  const namesRef = useRef([]);
  const hoverRef = useRef(-1);

  useEffect(() => {
    namesRef.current = (members ?? []).slice(0, 3).map((m, i) => ({
      name: m.name.split(" ")[0],
      role: m.role,
      rgb: colors?.[i] ? hexToRgb(colors[i]) : undefined,
    }));
  }, [members, colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const narrow = window.matchMedia("(max-width: 760px)").matches;
    const g = startGalaxy(canvas, {
      theme,
      background: false,
      count: narrow ? 2600 : 4200,
      centerX: narrow ? 0.5 : 0.68,
      centerY: narrow ? 0.3 : 0.47,
      scale: narrow ? 0.62 : 0.5,
      formSeconds: 2.2,
      getNames: () => namesRef.current,
      getHover: () => hoverRef.current,
    });
    galaxyRef.current = g;
    const io = new IntersectionObserver(([e]) => g.pause(!e.isIntersecting));
    io.observe(canvas);
    return () => {
      io.disconnect();
      g.stop();
    };
  }, [theme]);

  function pointAt(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return galaxyRef.current?.hitTest(e.clientX - r.left, e.clientY - r.top) ?? -1;
  }

  return (
    <canvas
      ref={canvasRef}
      className="g-hero-canvas"
      aria-hidden="true"
      onMouseMove={(e) => {
        const i = pointAt(e);
        hoverRef.current = i;
        e.currentTarget.style.cursor = i >= 0 ? "pointer" : "default";
      }}
      onMouseLeave={() => { hoverRef.current = -1; }}
      onClick={(e) => {
        const i = pointAt(e);
        if (i >= 0) onPick?.(i);
      }}
    />
  );
}
