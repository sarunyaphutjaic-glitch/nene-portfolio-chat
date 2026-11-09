import { useEffect, useState } from "react";
import { api } from "./api.js";

let cache = null; // โหลดครั้งเดียว ใช้ร่วมกันทุกหน้า

export function usePortfolio() {
  const [data, setData] = useState(cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache) return;
    api
      .getPortfolio()
      .then((d) => {
        cache = d;
        setData(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  return { data, error, loading: !data && !error };
}
