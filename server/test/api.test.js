// Integration test: ต้องมี DATABASE_URL และรัน npm run db:setup ก่อน
import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.AI_MOCK = "true"; // ไม่เรียก Claude จริงตอนเทสต์
const { app } = await import("../src/app.js");
const { pool } = await import("../src/db.js");

after(() => pool.end());

test("GET /api/health", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "ok");
});

test("GET /api/portfolio คืนข้อมูลกลุ่มและสมาชิก", async () => {
  const res = await request(app).get("/api/portfolio");
  assert.equal(res.status, 200);
  assert.ok(res.body.group?.name);
  assert.ok(Array.isArray(res.body.members) && res.body.members.length > 0);
});

test("POST /api/chat ตอบกลับและบันทึกประวัติ", async () => {
  const first = await request(app).post("/api/chat").send({ message: "กลุ่มนี้ชื่ออะไร" });
  assert.equal(first.status, 200);
  assert.ok(first.body.conversationId);
  assert.ok(first.body.reply);

  const id = first.body.conversationId;
  await request(app).post("/api/chat").send({ conversationId: id, message: "มีสมาชิกกี่คน" });

  const history = await request(app).get(`/api/chat/${id}`);
  assert.equal(history.status, 200);
  assert.deepEqual(
    history.body.messages.map((m) => m.role),
    ["user", "assistant", "user", "assistant"]
  );
});

test("POST /api/chat ข้อความว่างได้ 400", async () => {
  const res = await request(app).post("/api/chat").send({ message: "   " });
  assert.equal(res.status, 400);
});
