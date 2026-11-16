import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSystemPrompt } from "../src/services/prompt.js";

test("system prompt มีข้อมูลกลุ่ม สมาชิก และผลงาน", () => {
  const prompt = buildSystemPrompt({
    group: { name: "กลุ่มทดสอบ", highlights: ["เร็ว"], tech_stack: ["React"], contact_email: "a@b.c" },
    members: [
      {
        id: 1, name: "สมชาย", role: "Frontend", skills: ["CSS"], student_id: "123",
        email: "s@b.c", projects: [{ title: "เว็บร้านกาแฟ", tech: ["Vue"] }],
      },
    ],
    groupProjects: [{ title: "แอปแชท", tech: ["Node.js"] }],
  });

  for (const expected of ["กลุ่มทดสอบ", "สมชาย", "Frontend", "CSS", "123", "s@b.c", "เว็บร้านกาแฟ", "แอปแชท", "a@b.c", "Nous"]) {
    assert.ok(prompt.includes(expected), `prompt ควรมี "${expected}"`);
  }
});
