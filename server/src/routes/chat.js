import { Router } from "express";
import { pool, getPortfolio } from "../db.js";
import { buildSystemPrompt } from "../services/prompt.js";
import { generateReply, AIUnavailableError } from "../services/ai.js";

const router = Router();
const HISTORY_LIMIT = 10; // ส่งประวัติแค่ 10 ข้อความล่าสุดให้ AI (ประหยัด token)
const MAX_MESSAGE_LENGTH = 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getMessages(conversationId, limit) {
  const { rows } = await pool.query(
    `SELECT role, content, created_at FROM (
       SELECT id, role, content, created_at FROM messages
       WHERE conversation_id = $1 ORDER BY id DESC LIMIT $2
     ) t ORDER BY id`,
    [conversationId, limit]
  );
  return rows;
}

// GET /api/chat/:conversationId -> ประวัติแชท
router.get("/:conversationId", async (req, res, next) => {
  const { conversationId } = req.params;
  if (!UUID_RE.test(conversationId)) return res.status(400).json({ error: "conversationId ไม่ถูกต้อง" });
  try {
    res.json({ conversationId, messages: await getMessages(conversationId, 200) });
  } catch (err) {
    next(err);
  }
});

// POST /api/chat { conversationId?, message } -> { conversationId, reply }
router.post("/", async (req, res, next) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  let { conversationId } = req.body ?? {};

  if (!message) return res.status(400).json({ error: "กรุณาพิมพ์ข้อความ" });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `ข้อความยาวเกิน ${MAX_MESSAGE_LENGTH} ตัวอักษร` });
  }

  try {
    // 1) หา/สร้าง conversation
    const exists =
      conversationId && UUID_RE.test(conversationId)
        ? (await pool.query("SELECT 1 FROM conversations WHERE id = $1", [conversationId])).rowCount > 0
        : false;
    if (!exists) {
      const { rows } = await pool.query("INSERT INTO conversations DEFAULT VALUES RETURNING id");
      conversationId = rows[0].id;
    }

    // 2) ประวัติ + ข้อความใหม่ (ต้องเริ่มด้วย user เสมอ)
    const history = (await getMessages(conversationId, HISTORY_LIMIT)).map(({ role, content }) => ({ role, content }));
    while (history.length && history[0].role !== "user") history.shift();
    const messages = [...history, { role: "user", content: message }];

    // 3) สร้าง system prompt จากข้อมูลใน DB แล้วเรียก AI
    const system = buildSystemPrompt(await getPortfolio());
    const reply = await generateReply(system, messages);

    // 4) บันทึกทั้งคำถามและคำตอบ (บันทึกหลัง AI ตอบสำเร็จ ประวัติจึงสลับ user/assistant เสมอ)
    await pool.query(
      `INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'user', $2), ($1, 'assistant', $3)`,
      [conversationId, message, reply]
    );

    res.json({ conversationId, reply });
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      return res.status(503).json({ error: err.message, conversationId });
    }
    next(err);
  }
});

export default router;
