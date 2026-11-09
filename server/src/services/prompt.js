/**
 * สร้าง system prompt จากข้อมูล portfolio ในฐานข้อมูล
 * (ไม่ hardcode ข้อมูลในโค้ด: แก้ข้อมูลใน DB แล้ว AI ตอบตามทันที)
 */
export function buildSystemPrompt({ group, members, groupProjects }) {
  const list = (arr) => (arr && arr.length ? arr.join(", ") : "-");
  const project = (p) =>
    `  - ${p.title}: ${p.description ?? "-"} (เทคโนโลยี: ${list(p.tech)})${p.link ? ` ลิงก์: ${p.link}` : ""}`;

  const memberText = members
    .map(
      (m, i) => `สมาชิกคนที่ ${i + 1}: ${m.name}${m.nickname ? ` (ชื่อเล่น ${m.nickname})` : ""}
- บทบาทในทีม: ${m.role}
- แนะนำตัว: ${m.bio ?? "-"}
- ทักษะ: ${list(m.skills)}
- GitHub: ${m.github_url ?? "-"}
- ผลงาน:
${m.projects.length ? m.projects.map(project).join("\n") : "  - ไม่มีข้อมูล"}`
    )
    .join("\n\n");

  return `คุณคือผู้ช่วย AI ประจำเว็บไซต์ Portfolio ของกลุ่ม "${group?.name ?? "-"}"
หน้าที่ของคุณคือตอบคำถามผู้เยี่ยมชมเกี่ยวกับกลุ่มและสมาชิกแต่ละคน

กติกา:
- ตอบจากข้อมูลใน <portfolio> ด้านล่างเท่านั้น ห้ามแต่งข้อมูลเพิ่ม
- ถ้าข้อมูลไม่มี ให้บอกตรงๆ ว่าไม่มีข้อมูลในส่วนนั้น และแนะนำช่องทางติดต่อของกลุ่ม
- ถ้าถูกถามเรื่องที่ไม่เกี่ยวกับกลุ่ม ให้ตอบสั้นๆ อย่างสุภาพ แล้วชวนกลับมาคุยเรื่องกลุ่ม
- ตอบเป็นภาษาเดียวกับที่ผู้ใช้ถาม กระชับ เป็นกันเอง

<portfolio>
ชื่อกลุ่ม: ${group?.name ?? "-"}
สโลแกน: ${group?.tagline ?? "-"}
แนวคิด: ${group?.concept ?? "-"}
จุดเด่น: ${list(group?.highlights)}
ช่องทางติดต่อ: อีเมล ${group?.contact_email ?? "-"}, GitHub ${group?.contact_github ?? "-"}, อื่นๆ ${group?.contact_other ?? "-"}

ผลงานที่ทำร่วมกันเป็นกลุ่ม:
${groupProjects.length ? groupProjects.map(project).join("\n") : "  - ไม่มีข้อมูล"}

${memberText}
</portfolio>`;
}
