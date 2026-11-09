import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI, ApiError as GeminiApiError } from "@google/genai";

// เลือกผู้ให้บริการ AI ผ่าน .env: AI_PROVIDER=gemini หรือ claude
const PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const MAX_OUTPUT_TOKENS = 1000;

export class AIUnavailableError extends Error {}

/**
 * ส่งประวัติแชทไปให้ AI แล้วคืนข้อความตอบกลับ
 * @param {string} system  system prompt ที่สร้างจากข้อมูล portfolio
 * @param {{role: "user"|"assistant", content: string}[]} messages
 */
export async function generateReply(system, messages) {
  if (process.env.AI_MOCK === "true") {
    const last = messages[messages.length - 1]?.content ?? "";
    return `(โหมดทดสอบ AI_MOCK) คุณถามว่า: "${last}"`;
  }

  const text = PROVIDER === "claude" ? await askClaude(system, messages) : await askGemini(system, messages);
  return text?.trim() || "ขออภัย ไม่ได้รับคำตอบจาก AI ลองใหม่อีกครั้งนะครับ";
}

/* ---------------- Gemini ---------------- */
let gemini;

async function askGemini(system, messages) {
  gemini ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      // Gemini ใช้ role "model" แทน "assistant"
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: system,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    });
    return response.text;
  } catch (err) {
    if (err instanceof GeminiApiError) {
      console.error("Gemini API error:", err.status, err.message);
      if (err.status === 429) throw new AIUnavailableError("AI ถูกใช้งานหนาแน่น กรุณาลองใหม่ในอีกสักครู่");
      if (err.status === 400 || err.status === 401 || err.status === 403) {
        throw new AIUnavailableError("ระบบ AI ยังไม่พร้อมใช้งาน");
      }
      throw new AIUnavailableError("ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่");
    }
    console.error("Gemini error:", err);
    throw new AIUnavailableError("เชื่อมต่อ AI ไม่ได้ กรุณาลองใหม่");
  }
}

/* ---------------- Claude ---------------- */
let claude;

async function askClaude(system, messages) {
  claude ??= new Anthropic(); // อ่าน ANTHROPIC_API_KEY จาก environment

  try {
    const response = await claude.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-haiku-5-5",
      max_tokens: MAX_OUTPUT_TOKENS,
      output_config: { effort: "low" },
      system,
      messages,
    });
    if (response.stop_reason === "refusal") {
      return "ขออภัย ไม่สามารถตอบคำถามนี้ได้ ลองถามเรื่องกลุ่มหรือสมาชิกดูนะครับ";
    }
    return response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      throw new AIUnavailableError("AI ถูกใช้งานหนาแน่น กรุณาลองใหม่ในอีกสักครู่");
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Claude API key ไม่ถูกต้อง: ตรวจสอบ ANTHROPIC_API_KEY");
      throw new AIUnavailableError("ระบบ AI ยังไม่พร้อมใช้งาน");
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new AIUnavailableError("เชื่อมต่อ AI ไม่ได้ กรุณาลองใหม่");
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error:", err.status, err.message);
      throw new AIUnavailableError("ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่");
    }
    throw err;
  }
}
