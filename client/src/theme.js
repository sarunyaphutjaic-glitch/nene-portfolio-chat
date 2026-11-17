import { useEffect, useState } from "react";

export const THEMES = [
  { id: "nous", label: "Nous Galaxy" },
  { id: "terminal", label: "Terminal" },
  { id: "party", label: "Party RPG" },
];
const KEY = "nene-theme";

export function readTheme() {
  try {
    const t = localStorage.getItem(KEY);
    return THEMES.some((x) => x.id === t) ? t : "nous";
  } catch {
    return "nous";
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// จำธีมที่เลือกไว้ในเบราว์เซอร์ของผู้ชม
export function useTheme() {
  const [theme, setTheme] = useState(readTheme);
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return [theme, setTheme];
}
