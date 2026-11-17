import { useEffect, useRef } from "react";
import { startGalaxy } from "../galaxy.js";

// กาแล็กซีหมุนเป็นฉากหลังของหน้าแรก (หยุดวาดเมื่อเลื่อนจอพ้นไปแล้ว เพื่อประหยัดเครื่อง)
export default function GalaxyHero({ theme, members }) {
  const canvasRef = useRef(null);
  const namesRef = useRef([]);

  useEffect(() => {
    namesRef.current = (members ?? []).slice(0, 3).map((m) => ({ name: m.name.split(" ")[0], role: m.role }));
  }, [members]);

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
    });
    const io = new IntersectionObserver(([e]) => g.pause(!e.isIntersecting));
    io.observe(canvas);
    return () => {
      io.disconnect();
      g.stop();
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="g-hero-canvas" aria-hidden="true" />;
}
