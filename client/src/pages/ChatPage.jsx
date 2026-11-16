import { useEffect, useRef, useState } from "react";
import { api } from "../api.js";
import { loadConversationId, saveConversationId } from "../chatStore.js";
import nousImage from "../assets/aha.png";
import TypeText from "../components/TypeText.jsx";

const WELCOME = {
  role: "assistant",
  content: "[STATION: ERUDITION CORE] ข้าคือ Nous ผู้รอบรู้แห่งกลุ่มเนเน่นายแน่มาก จงถามสิ่งที่เจ้าอยากรู้เกี่ยวกับพวกเขามาได้เลย",
};
const QUICK_PROMPTS = [
  "กลุ่ม เนเน่นายแน่มาก คือใคร?",
  "สมาชิกแต่ละคนทำหน้าที่อะไร?",
  "ใครถนัด Frontend?",
  "ติดต่อกลุ่มได้ทางไหน?",
];

export default function ChatPage() {
  const [conversationId, setConversationId] = useState(loadConversationId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typingIndex, setTypingIndex] = useState(null); // ข้อความ AI ที่กำลังพิมพ์ทีละตัว
  const bodyRef = useRef(null);

  // โหลดประวัติแชทเดิมจาก PostgreSQL
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
    const body = bodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
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
      saveConversationId(data.conversationId);
      setMessages((m) => {
        setTypingIndex(m.length + 1); // +1 เพราะมีข้อความต้อนรับอยู่ก่อน
        return [...m, { role: "assistant", content: data.reply }];
      });
    } catch (e) {
      setError(e.message);
      setMessages((m) => m.slice(0, -1)); // เอาข้อความที่ส่งไม่สำเร็จออก
      setInput(message);
    } finally {
      setSending(false);
    }
  }

  function resetChat() {
    setTypingIndex(null);
    saveConversationId(null);
    setConversationId(null);
    setMessages([]);
    setError(null);
  }

  const shown = [WELCOME, ...messages];

  return (
    <section className="chat-page">
      <div className="chat-wrapper">
        <div className="chat-header">
          <div className="who-nous">
            <img src={nousImage} alt="Nous" className="nous-avatar" />
            <div>
              <div className="header-title">Nous (Aeon of Erudition)</div>
              <div className="header-status">
                <span className="status-dot" /> Universal Omniscience Active
              </div>
            </div>
          </div>
          <button className="btn-danger" onClick={resetChat} disabled={sending}>รีเซ็ตแชท</button>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {shown.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              {m.role === "assistant" && <img src={nousImage} alt="" className="small-avatar" />}
              <div className={`bubble ${m.role}`}>
                {i === typingIndex ? (
                  <TypeText text={m.content} onDone={() => setTypingIndex(null)} />
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="message-row assistant">
              <img src={nousImage} alt="" className="small-avatar" />
              <div className="bubble assistant">
                <div className="typing-indicator" aria-label="Nous กำลังพิมพ์">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer">
          {error && <p className="chat-error">⚠ {error}</p>}
          <div className="quick-prompts">
            <span className="label">ลองถาม Nous:</span>
            {QUICK_PROMPTS.map((q) => (
              <button key={q} className="chip" onClick={() => send(q)} disabled={sending}>{q}</button>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ป้อนคำถามถึง Nous..."
              maxLength={1000}
              disabled={sending}
              aria-label="ข้อความ"
            />
            <button className="chat-btn" type="submit" disabled={sending || !input.trim()}>ส่ง</button>
          </form>
        </div>
      </div>
    </section>
  );
}
