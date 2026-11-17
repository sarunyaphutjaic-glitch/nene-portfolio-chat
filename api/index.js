// Vercel serverless function: ทุก request ที่ขึ้นต้นด้วย /api/ จะถูกส่งมาที่ Express app ตัวเดียวกับที่รันในเครื่อง
import { app } from "../server/src/app.js";

export default app;
