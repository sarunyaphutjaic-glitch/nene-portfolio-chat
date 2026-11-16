import { THEMES } from "../theme.js";

export default function ThemePicker({ theme, onChange }) {
  return (
    <div className="theme-picker" role="group" aria-label="เลือกธีม">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`theme-btn ${t.id}`}
          aria-pressed={theme === t.id}
          aria-label={`ธีม ${t.label}`}
          title={t.label}
          onClick={() => onChange(t.id)}
        />
      ))}
    </div>
  );
}
