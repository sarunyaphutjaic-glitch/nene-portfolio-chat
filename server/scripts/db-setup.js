// สร้างตาราง (schema.sql) แล้วใส่ข้อมูล portfolio (seed.sql)
// ใช้: npm run db:setup          -> schema + seed
//      npm run db:setup -- --schema-only
//      --if-configured             -> ข้ามเงียบๆ ถ้ายังไม่ได้ตั้ง DATABASE_URL (ใช้ตอน build บน Vercel)
import { readFile } from "node:fs/promises";
import { pool, databaseUrl } from "../src/db.js";

if (!databaseUrl && process.argv.includes("--if-configured")) {
  console.log("ℹ ยังไม่ได้ตั้งค่าฐานข้อมูล ข้ามการสร้างตาราง");
  process.exit(0);
}

const schemaOnly = process.argv.includes("--schema-only");
const files = ["schema.sql", ...(schemaOnly ? [] : ["seed.sql"])];

try {
  for (const file of files) {
    const sql = await readFile(new URL(`../db/${file}`, import.meta.url), "utf8");
    await pool.query(sql);
    console.log(`✔ ${file}`);
  }
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
