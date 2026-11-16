// แอสโตรเลบ (วงล้อดวงดาว) สัญลักษณ์ของ Nous เทพแห่งปัญญา
// วงแหวนหลายชั้นหมุนคนละทิศ มีลูกแก้วพลังงานตรงกลาง และสมาชิก 3 คนเป็นดาวที่เชื่อมกันเป็นกลุ่มดาว
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const long = i % 6 === 0;
  const r1 = 190, r2 = long ? 176 : 183;
  return { x1: 200 + r1 * Math.cos(a), y1: 200 + r1 * Math.sin(a), x2: 200 + r2 * Math.cos(a), y2: 200 + r2 * Math.sin(a), long };
});
const RING_TEXT = "ERUDITION CORE ✦ เนเน่นายแน่มาก ✦ PROJECT PORTFOLIO ✦ AI & DATA ENGINEERING ✦ ";

function nodes(n) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: 200 + 112 * Math.cos(a), y: 200 + 112 * Math.sin(a), lx: 200 + 140 * Math.cos(a), ly: 200 + 140 * Math.sin(a) };
  });
}

export default function Astrolabe({ names = [] }) {
  const pts = nodes(3);
  return (
    <svg className="astrolabe" viewBox="0 0 400 400" role="img" aria-label="สัญลักษณ์ของ Nous: วงล้อดวงดาว">
      <defs>
        <radialGradient id="orb" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" style={{ stopColor: "var(--primary)" }} />
          <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </radialGradient>
        <path id="ringPath" d="M200,200 m-162,0 a162,162 0 1,1 324,0 a162,162 0 1,1 -324,0" />
      </defs>

      <g className="spin-slow">
        <circle cx="200" cy="200" r="190" className="stroke-primary" strokeWidth="1.5" fill="none" opacity="0.6" />
        {TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className="stroke-primary" strokeWidth={t.long ? 2 : 1} opacity={t.long ? 0.9 : 0.45} />
        ))}
      </g>

      <g className="spin-text">
        <text className="ring-text">
          <textPath href="#ringPath">{RING_TEXT}</textPath>
        </text>
      </g>

      <g className="spin-rev">
        <circle cx="200" cy="200" r="148" className="stroke-accent" strokeWidth="1" fill="none" strokeDasharray="2 8" />
        <circle cx="200" cy="200" r="132" className="stroke-primary" strokeWidth="1" fill="none" opacity="0.5" />
      </g>

      <g className="spin-mid">
        <rect x="128" y="128" width="144" height="144" className="stroke-accent" strokeWidth="1" fill="none" opacity="0.55" />
        <rect x="128" y="128" width="144" height="144" className="stroke-primary" strokeWidth="1" fill="none" opacity="0.55" transform="rotate(45 200 200)" />
      </g>

      <g className="constellation">
        <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")} className="stroke-primary" strokeWidth="1" fill="none" opacity="0.7" strokeDasharray="4 4" />
        {pts.map((p, i) => (
          <g key={i} className="node" style={{ animationDelay: `${1.2 + i * 0.2}s` }}>
            <circle cx={p.x} cy={p.y} r="9" className="fill-primary" opacity="0.25" />
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" />
            {names[i] && (
              <text x={p.lx} y={p.ly + 4} className="node-label" textAnchor="middle">{names[i]}</text>
            )}
          </g>
        ))}
      </g>

      <circle cx="200" cy="200" r="70" fill="url(#orb)" className="orb-glow" />
      <circle cx="200" cy="200" r="34" fill="url(#orb)" className="orb-core" />
    </svg>
  );
}
