// สร้างตาราง (schema.sql) แล้วใส่ข้อมูล portfolio (seed.sql)
// ใช้: npm run db:setup          -> schema + seed
//      npm run db:setup -- --schema-only
import { readFile } from "node:fs/promises";
import { pool } from "../src/db.js";

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
