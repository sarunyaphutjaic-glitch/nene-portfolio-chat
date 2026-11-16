-- ข้อมูล Portfolio ของกลุ่ม: แก้ไฟล์นี้แล้วรัน npm run db:setup
-- รันซ้ำได้: ลบข้อมูล portfolio เดิมแล้วใส่ใหม่ (ไม่แตะประวัติแชท)
-- ข้อความต้องอยู่ใน ' ' ถ้ามี ' ในข้อความให้พิมพ์ '' แทน

TRUNCATE projects, members, group_info RESTART IDENTITY CASCADE;

INSERT INTO group_info (name, tagline, concept, highlights, tech_stack, contact_email, contact_github, contact_other) VALUES (
  'เนเน่นายแน่มาก',
  'Project Portfolio - AI and Data Engineering',
  'พอร์ตโฟลิโอที่ผสานเทคโนโลยี Web Development เข้ากับ Generative AI ผู้เยี่ยมชมไม่ได้แค่ดูหน้าเว็บ แต่คุยกับ Nous (เทพแห่งปัญญา) ผู้ช่วย AI ประจำกลุ่ม ที่ตอบคำถามเกี่ยวกับสมาชิกและผลงานของพวกเราได้แบบเรียลไทม์',
  ARRAY['Nous ผู้ช่วย AI ที่ตอบจากข้อมูลจริงของกลุ่มในฐานข้อมูล', 'เก็บประวัติการสนทนาใน PostgreSQL', 'ทดสอบและ deploy อัตโนมัติด้วย CI/CD'],
  ARRAY['React', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Google Gemini API', 'GitHub Actions'],
  'team.nene@example.com',
  'https://github.com/sarunyaphutjaic-glitch/nene-portfolio-chat',
  NULL
);

INSERT INTO members (name, nickname, role, bio, skills, student_id, email, github_url, avatar_url, sort_order) VALUES
  ('พิธาน เชื้อชาวนา', NULL, 'Full Stack Developer',
   'ชื่นชอบการฟังเพลงและเล่นเกม รับผิดชอบการพัฒนาระบบแบบ Full Stack เชื่อมโยงการทำงานทั้งฝั่ง Frontend และ Backend ของระบบ AI ให้ทำงานร่วมกันได้อย่างราบรื่น',
   ARRAY['Node.js', 'React', 'Express.js', 'JavaScript', 'REST API', 'Git'],
   '1670904117', 'pithan.chue@bumail.net', NULL, '/members/pithan.jpg', 1),
  ('ศรัณยภัทร ใจชื่น', NULL, 'Frontend Developer (FE)',
   'ชอบออกแบบ UI หน้าที่หลักคือรับผิดชอบออกแบบและพัฒนาหน้า Portfolio, หน้าสมาชิก และหน้าแชท AI',
   ARRAY['JavaScript', 'HTML', 'CSS'],
   '1670904166', 'Sarunyaphut.jaic@bumail.net', 'https://github.com/sarunyaphutjaic-glitch', NULL, 2),
  ('ณัฐกานต์ แก้วบุตร', NULL, 'AI Developer',
   'สนใจด้านเทคโนโลยีและการพัฒนาระบบ AI รับผิดชอบพัฒนาและดูแลการทำงานของ AI ในโปรเจกต์ ออกแบบปรับปรุงคำสั่ง (Prompt) และทดสอบความถูกต้องของระบบ',
   ARRAY['Python', 'Java', 'HTML', 'Prompt Design'],
   '1670904125', 'Nattakan.kaewb@bumail.net', NULL, NULL, 3);

-- ผลงานของกลุ่ม (member_id = NULL)
INSERT INTO projects (member_id, title, description, tech, link) VALUES
  (NULL, 'Trinity Bot / Nous AI Assistant Portfolio',
   'เว็บพอร์ตโฟลิโอของกลุ่มที่มี Nous ผู้ช่วย AI ตอบคำถามเกี่ยวกับกลุ่มและสมาชิก โดยดึงข้อมูลจากฐานข้อมูล',
   ARRAY['React', 'Express', 'PostgreSQL', 'Gemini API', 'GitHub Actions'], NULL);

-- ผลงานเด่นของสมาชิก (เลขข้างหน้า = ลำดับสมาชิกด้านบน)
INSERT INTO projects (member_id, title, description, tech, link) VALUES
  (1, 'Trinity Bot / Nous AI Assistant (Full Stack Platform)', 'พัฒนาระบบทั้งฝั่ง Frontend และ Backend ของผู้ช่วย AI', ARRAY['Node.js', 'React', 'Express'], NULL),
  (2, 'MAAS (Web Application)', 'เว็บแอปพลิเคชันส่วนตัว', ARRAY['JavaScript', 'HTML', 'CSS'], NULL),
  (3, 'โปรแกรม Python/Java และ HTML Website เบื้องต้น', 'โปรแกรมขนาดเล็กจาก Python/Java และหน้าเว็บ HTML', ARRAY['Python', 'Java', 'HTML'], NULL);
