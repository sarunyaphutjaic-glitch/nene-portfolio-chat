# เนเน่นายแน่มาก: Chat AI พร้อม Portfolio ของกลุ่ม

เว็บแอป Portfolio ของกลุ่ม ผู้เยี่ยมชมคุยกับ **Nous (เทพแห่งปัญญา)** ผู้ช่วย AI ประจำกลุ่ม (Gemini หรือ Claude)
เพื่อถามเรื่องกลุ่ม ผลงาน และสมาชิกแต่ละคนได้ โดย AI ตอบจากข้อมูล Portfolio ที่เก็บในฐานข้อมูล PostgreSQL

### หน้าในเว็บ
| หน้า | URL | รายละเอียด |
|---|---|---|
| ข้อมูลโปรเจกต์ | `/` | แนวคิด จุดเด่น เทคโนโลยี ผลงานกลุ่ม สมาชิก ช่องทางติดต่อ |
| โปรไฟล์สมาชิก | `/members/:id` | รูป รหัสนักศึกษา อีเมล (กดคัดลอกได้) ทักษะ ผลงาน |
| คุยกับ Nous | `/chat` | แชท AI พร้อมคำถามลัด ปุ่มรีเซ็ตแชท |
| ประวัติการสนทนา | `/history` | ดึงประวัติแชทจาก PostgreSQL |

- **เว็บที่ deploy แล้ว:** TODO ใส่ลิงก์
- **API:** TODO ใส่ลิงก์

## สถาปัตยกรรม

```
React (Vite) ──► Express API ──► PostgreSQL
  Vercel      Vercel Function │  Vercel Storage (Neon)
                              └──► Gemini / Claude API (system prompt สร้างจากข้อมูลใน DB)
```

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React 19 + Vite + React Router |
| Backend | Node.js 22 + Express 5 |
| Database | PostgreSQL 16 |
| AI | Gemini (`@google/genai`) เป็นค่าเริ่มต้น หรือ Claude (`@anthropic-ai/sdk`) เลือกด้วย `AI_PROVIDER` |
| CI/CD | GitHub Actions → Vercel |

### การทำงานของแชท (`POST /api/chat`)
1. รับข้อความจาก Chat UI
2. ดึงประวัติแชท 10 ข้อความล่าสุดจากตาราง `messages`
3. ดึงข้อมูลกลุ่ม สมาชิก ผลงาน จาก DB แล้วสร้าง **system prompt** (`server/src/services/prompt.js`)
4. ส่งไปให้ AI (`server/src/services/ai.js`)
5. บันทึกคำถามและคำตอบลง DB แล้วส่งคำตอบกลับ

## API

| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/health` | ตรวจสถานะเซิร์ฟเวอร์ |
| GET | `/api/portfolio` | ข้อมูลกลุ่ม สมาชิก และผลงาน |
| POST | `/api/chat` | `{ conversationId?, message }` → `{ conversationId, reply }` |
| GET | `/api/chat/:conversationId` | ประวัติแชท |

## ฐานข้อมูล

`group_info`, `members`, `projects` (ผลงาน, `member_id = NULL` คือผลงานกลุ่ม), `conversations`, `messages`
ดูรายละเอียดใน `server/db/schema.sql` ส่วนข้อมูล portfolio อยู่ใน `server/db/seed.sql`

## ติดตั้งและรันในเครื่อง

ต้องมี: Node.js 22+, Docker (หรือ PostgreSQL ที่ติดตั้งเอง)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. เปิด PostgreSQL
docker compose up -d

# 3. ตั้งค่า environment
cp server/.env.example server/.env
cp client/.env.example client/.env
#    แล้วใส่ GEMINI_API_KEY ใน server/.env
#    (หรือตั้ง AI_MOCK=true เพื่อทดสอบโดยไม่เรียก AI จริง)

# 4. สร้างตารางและใส่ข้อมูล portfolio
npm run db:setup

# 5. รัน backend (port 3001) และ frontend (port 5173) คนละ terminal
npm run dev:server
npm run dev:client
```

เปิด http://localhost:5173

### คำสั่งอื่นๆ
```bash
npm run lint    # ESLint
npm test        # เทสต์ API (ต้องมี DB และรัน db:setup ก่อน)
npm run build   # build frontend
```

## Environment variables

ดู `server/.env.example` และ `client/.env.example`

| ตัวแปร | ที่ | คำอธิบาย |
|---|---|---|
| `DATABASE_URL` | server | connection string ของ PostgreSQL |
| `AI_PROVIDER` | server | `gemini` (ค่าเริ่มต้น) หรือ `claude` |
| `GEMINI_API_KEY` | server | key จาก aistudio.google.com/apikey (**ห้าม commit**) |
| `GEMINI_MODEL` | server | ค่าเริ่มต้น `gemini-3.8-flash` |
| `ANTHROPIC_API_KEY` | server | key ของ Claude (ใช้เมื่อ `AI_PROVIDER=claude`) |
| `CLAUDE_MODEL` | server | ค่าเริ่มต้น `claude-haiku-5-5` |
| `AI_MOCK` | server | `true` = ตอบแบบ echo ไม่เรียก AI |
| `CLIENT_URL` | server | URL frontend ที่อนุญาต (CORS) |
| `VITE_API_URL` | client | URL ของ backend ตอน deploy |

## CI/CD

`.github/workflows/ci.yml`
- **ทุก Pull Request และ push เข้า `main`:** lint → สร้าง DB (Postgres service) → test → build
- **push เข้า `main` และเทสต์ผ่าน:** trigger deploy ไป Vercel ผ่าน deploy hook

### Deploy ขึ้น Vercel (ทำครั้งเดียว)

ทั้งระบบอยู่บน Vercel ที่เดียว:
- หน้าเว็บ React build จาก `client/` (ไฟล์ออกที่ `client/dist`)
- Express API ทำงานเป็น serverless function ที่ `api/index.js` (ทุก `/api/*`)
- ฐานข้อมูล Postgres สร้างจากเมนู Storage ของ Vercel
- ตอน build สคริปต์ `npm run vercel-build` จะสร้างตารางและใส่ข้อมูลจาก `seed.sql` ให้อัตโนมัติ

ขั้นตอน:
1. vercel.com → **Add New… → Project** → Import repo นี้ (Root Directory = ค่าเริ่มต้น `./`, ไม่ต้องแก้ build settings เพราะอยู่ใน `vercel.json` แล้ว)
2. **Environment Variables**: `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_MOCK=false` แล้วกด **Deploy**
3. ในโปรเจกต์ → **Storage → Create Database → Neon (Postgres)** → Connect กับโปรเจกต์นี้ (จะได้ตัวแปร `DATABASE_URL` อัตโนมัติ)
4. **Deployments → Redeploy** หนึ่งครั้ง เพื่อให้สร้างตารางและใส่ข้อมูล
5. (CI/CD) Settings → Git → **Deploy Hooks** สร้าง hook แล้วใส่เป็น GitHub secret `VERCEL_DEPLOY_HOOK_URL`

## สมาชิกและหน้าที่

| ชื่อ | บทบาท | รับผิดชอบ |
|---|---|---|
| พิธาน เชื้อชาวนา | Full Stack Developer | เชื่อมการทำงาน Frontend และ Backend ของระบบ AI |
| ศรัณยภัทร ใจชื่น | Frontend Developer (FE) | หน้า Portfolio, หน้าสมาชิก, หน้าแชท AI |
| ณัฐกานต์ แก้วบุตร | AI Developer | ดูแล AI, ออกแบบ Prompt, ทดสอบความถูกต้อง |
