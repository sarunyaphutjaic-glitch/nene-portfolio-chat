// เก็บรหัสห้องแชท (conversationId) ไว้ในเบราว์เซอร์ ส่วนข้อความจริงเก็บใน PostgreSQL
const STORAGE_KEY = "nene-conversation-id";

export function loadConversationId() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveConversationId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
