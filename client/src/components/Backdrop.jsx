// ฉากหลังตามธีม: ดาวระยิบระยับ (Nous / Party) หรือเส้นสแกนจอ (Terminal)
const STARS = Array.from({ length: 90 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 61) % 100}%`,
  size: i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
  delay: `${(i % 10) * 0.35}s`,
}));

export default function Backdrop({ theme }) {
  if (theme === "terminal") {
    return (
      <div className="backdrop" aria-hidden="true">
        <div className="grid-bg" />
        <div className="scanline" />
      </div>
    );
  }
  return (
    <div className="backdrop" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
      <span className="shooting" />
    </div>
  );
}
