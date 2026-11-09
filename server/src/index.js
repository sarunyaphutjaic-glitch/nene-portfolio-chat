import { app } from "./app.js";

const port = process.env.PORT || 3001;

app.listen(port, (err) => {
  if (err) {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} ถูกใช้อยู่แล้ว: มี backend อีกตัวรันค้างอยู่ ให้ปิดหน้าต่างนั้นก่อน (Ctrl+C)`);
    } else {
      console.error("❌ เปิดเซิร์ฟเวอร์ไม่สำเร็จ:", err.message);
    }
    process.exit(1);
  }
  console.log(`API listening on http://localhost:${port}`);
});
