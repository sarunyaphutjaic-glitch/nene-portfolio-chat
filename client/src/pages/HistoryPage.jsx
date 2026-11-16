import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { loadConversationId, saveConversationId } from "../chatStore.js";

// แสดงประวัติการสนทนาของห้องแชทปัจจุบัน ดึงจากตาราง messages ใน PostgreSQL
export default function HistoryPage() {
  const [conversationId, setConversationId] = useState(loadConversationId);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!conversationId) return;
    api
      .getHistory(conversationId)
      .then((d) => setMessages(d.messages))
      .catch((e) => setError(e.message));
  }, [conversationId]);

  // จับคู่คำถาม-คำตอบ
  const pairs = [];
  for (let i = 0; i < messages.length; i += 2) {
    pairs.push({ user: messages[i], ai: messages[i + 1] });
  }

  function clearHistory() {
    if (!window.confirm("เริ่มห้องแชทใหม่? ประวัติเดิมจะไม่แสดงในหน้านี้อีก")) return;
    saveConversationId(null);
    setConversationId(null);
    setMessages([]);
  }

  return (
    <section className="container section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>ประวัติการสนทนา</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>บันทึกไว้ในฐานข้อมูล PostgreSQL</p>
        </div>
        {pairs.length > 0 && <button className="btn-danger" onClick={clearHistory}>เริ่มห้องใหม่</button>}
      </div>

      {error && <p className="error">⚠ {error}</p>}

      {pairs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", marginTop: 20 }}>
          <p className="muted">ยังไม่มีประวัติการสนทนา</p>
          <Link to="/chat" className="btn">ไปคุยกับ Nous</Link>
        </div>
      ) : (
        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          {pairs
            .slice()
            .reverse()
            .map((p, i) => (
              <div key={i} className="card">
                <div className="history-time">{new Date(p.user.created_at).toLocaleString("th-TH")}</div>
                <div className="history-item"><strong style={{ color: "#60a5fa" }}>คุณ:</strong> {p.user.content}</div>
                {p.ai && (
                  <div style={{ whiteSpace: "pre-wrap" }}><strong style={{ color: "#38bdf8" }}>Nous:</strong> <span className="muted">{p.ai.content}</span></div>
                )}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
