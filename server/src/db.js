import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.warn("⚠ DATABASE_URL is not set");
}

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

/** ดึงข้อมูล portfolio ทั้งหมด: กลุ่ม, สมาชิก (พร้อมผลงาน), ผลงานกลุ่ม */
export async function getPortfolio() {
  const [group, members, projects] = await Promise.all([
    pool.query("SELECT * FROM group_info ORDER BY id LIMIT 1"),
    pool.query("SELECT * FROM members ORDER BY sort_order, id"),
    pool.query("SELECT * FROM projects ORDER BY id"),
  ]);

  return {
    group: group.rows[0] ?? null,
    members: members.rows.map((m) => ({
      ...m,
      projects: projects.rows.filter((p) => p.member_id === m.id),
    })),
    groupProjects: projects.rows.filter((p) => p.member_id === null),
  };
}
