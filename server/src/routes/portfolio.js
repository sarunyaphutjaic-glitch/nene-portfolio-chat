import { Router } from "express";
import { getPortfolio } from "../db.js";

const router = Router();

// GET /api/portfolio -> ข้อมูลกลุ่ม สมาชิก และผลงาน
router.get("/", async (req, res, next) => {
  try {
    res.json(await getPortfolio());
  } catch (err) {
    next(err);
  }
});

export default router;
