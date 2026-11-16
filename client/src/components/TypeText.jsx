import { useEffect, useState } from "react";

// แบ่งข้อความเป็นตัวอักษรแบบไม่ตัดสระ/วรรณยุกต์ไทยออกจากพยัญชนะ
function splitGraphemes(text) {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    return Array.from(new Intl.Segmenter("th", { granularity: "grapheme" }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

// แสดงข้อความทีละตัวเหมือนกำลังพิมพ์ (ใช้กับคำตอบใหม่ของ AI)
export default function TypeText({ text, speed = 18, onDone }) {
  const [count, setCount] = useState(0);
  const parts = splitGraphemes(text);
  const done = count >= parts.length;

  useEffect(() => {
    if (done) {
      onDone?.();
      return;
    }
    const step = Math.max(1, Math.ceil(parts.length / 300)); // ข้อความยาวพิมพ์เร็วขึ้น
    const t = setTimeout(() => setCount((c) => c + step), speed);
    return () => clearTimeout(t);
  }, [count, done, parts.length, speed, onDone]);

  return (
    <>
      {parts.slice(0, count).join("")}
      {!done && <span className="caret" aria-hidden="true" />}
    </>
  );
}
