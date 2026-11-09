const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  getPortfolio: () => request("/api/portfolio"),
  getHistory: (id) => request(`/api/chat/${id}`),
  sendMessage: (conversationId, message) =>
    request("/api/chat", { method: "POST", body: JSON.stringify({ conversationId, message }) }),
};
