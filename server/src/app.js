import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import portfolioRouter from "./routes/portfolio.js";
import chatRouter from "./routes/chat.js";

export const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.set("trust proxy", 1); // อยู่หลัง proxy ของ Render
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/portfolio", portfolioRouter);

// จำกัด 20 ข้อความ/นาที ต่อ IP เพื่อป้องกันเครดิต AI หมด
const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  message: { error: "ส่งข้อความถี่เกินไป กรุณารอสักครู่" },
});
app.use("/api/chat", chatLimiter, chatRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบ" });
});
