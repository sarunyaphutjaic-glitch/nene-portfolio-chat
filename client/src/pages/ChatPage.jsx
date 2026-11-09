import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";

const STORAGE_KEY = "nene-conversation-id";
const SUGGESTIONS = [
  "กลุ่มนี้มีแนวคิดอะไร",
  "สมาชิกแต่ละคนทำหน้าที่อะไร",
  "ใครเก่ง Backend บ้าง",
  "ติดต่อกลุ่มได้ทางไหน",
];

function loadId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function saveId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState(loadId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const boxRef = useRef(null);

  // โหลดประวัติแชทเดิม (เก็บใน PostgreSQL)
  useEffect(() => {
    if (!conversationId) return;
    api
      .getHistory(conversationId)
      .then((d) => setMessages(d.messages))
      .catch(() => {});
    // โหลดครั้งเดียวตอนเปิดหน้า
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text) {
    const message = text.trim();
    if (!message || sending) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: message }]);
    setSending(true);
    try {
      const data = await api.sendMessage(conversationId, message);
      setConversationId(data.conversationId);
      saveId(data.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e.message);
      setMessages((m) => m.slice(0, -1)); // เอาข้อความที่ส่งไม่สำเร็จออก
      setInput(message);
    } finally {
      setSending(false);
    }
  }

  function newChat() {
    saveId(null);
    setConversationId(null);
    setMessages([]);
    setError(null);
  }

  return (
    <section className="container chat">
      <div className="chat-header">
        <div>
          <h1>คุยกับ AI ของเนเน่นายแน่มาก</h1>
          <p className="muted">ถามเรื่องกลุ่ม สมาชิก ทักษะ หรือผลงานได้เลย</p>
        </div>
        <button className="btn-ghost" onClick={newChat} disabled={sending}>แชทใหม่</button>
      </div>

      <div className="chat-box" ref={boxRef}>
        {messages.length === 0 && (
          <div className="suggestions">
            <p className="muted">ลองถามว่า…</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            <span className="who">{m.role === "user" ? "คุณ" : "AI"}</span>
            <p>{m.content}</p>
          </div>
        ))}
        {sending && (
          <div className="bubble assistant typing">
            <span className="who">AI</span>
            <p><span className="dot" /><span className="dot" /><span className="dot" /></p>
          </div>
        )}
      </div>

      {error && <p className="error">⚠ {error}</p>}

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถาม…"
          maxLength={1000}
          disabled={sending}
          aria-label="ข้อความ"
        />
        <button className="btn" type="submit" disabled={sending || !input.trim()}>ส่ง</button>
      </form>
    </section>
  );
}
