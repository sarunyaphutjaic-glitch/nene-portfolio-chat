-- ข้อมูล Portfolio ตัวอย่าง: แก้ทุกจุดที่มี TODO เป็นข้อมูลจริงของกลุ่ม
-- รันซ้ำได้: ลบข้อมูล portfolio เดิมแล้วใส่ใหม่ (ไม่แตะประวัติแชท)

TRUNCATE projects, members, group_info RESTART IDENTITY CASCADE;

INSERT INTO group_info (name, tagline, concept, highlights, contact_email, contact_github, contact_other) VALUES (
  'เนเน่นายแน่มาก',
  'โค้ดได้ ดีไซน์ดี ส่งงานตรงเวลา',
  'เราเชื่อว่าซอฟต์แวร์ที่ดีต้องเริ่มจากการเข้าใจผู้ใช้ แล้วค่อยลงมือเขียนโค้ด',
  ARRAY['ทำงานเป็นทีมผ่าน Pull Request', 'ใช้ AI ช่วยให้ผู้ใช้หาข้อมูลได้เร็ว', 'Deploy อัตโนมัติด้วย CI/CD'],
  'nene.team@gmail.com',
  'https://github.com/nene-team',
  'IG: @nene.team'
);

INSERT INTO members (name, nickname, role, bio, skills, github_url, sort_order) VALUES
  ('นาย พิธาน เชื้อชาวนา 1670904117', 'TODO', 'Frontend Developer',
   'TODO: แนะนำตัวสั้นๆ', ARRAY['React', 'CSS', 'Figma'], 'https://github.com/TODO', 1),
  ('นางสาว ณัฐกานต์ แก้วบุตร 1670904125', 'TODO', 'Backend & Database Developer',
   'TODO: แนะนำตัวสั้นๆ', ARRAY['Node.js', 'Express', 'PostgreSQL'], 'https://github.com/TODO', 2),
  ('นาย ศรัณยภัทร ใจชื่น 1670904166', 'TODO', 'AI Integration & DevOps',
   'TODO: แนะนำตัวสั้นๆ', ARRAY['Claude API', 'GitHub Actions', 'Docker'], 'https://github.com/TODO', 3);

-- ผลงานของกลุ่ม (member_id = NULL)
INSERT INTO projects (member_id, title, description, tech, link) VALUES
  (NULL, 'Chat AI พร้อม Portfolio ของกลุ่ม',
   'เว็บแอปที่ให้ผู้เยี่ยมชมคุยกับ AI เพื่อถามเรื่องกลุ่มและสมาชิก โดย AI ตอบจากข้อมูลในฐานข้อมูล',
   ARRAY['React', 'Express', 'PostgreSQL', 'Claude API', 'GitHub Actions'], NULL),
  (NULL, 'TODO: ผลงานกลุ่มอื่นที่เคยทำร่วมกัน', 'TODO: รายละเอียด', ARRAY['TODO'], NULL);

-- ผลงานรายบุคคล
INSERT INTO projects (member_id, title, description, tech, link) VALUES
  (1, 'TODO: ผลงานของสมาชิก 1', 'TODO: รายละเอียด', ARRAY['TODO'], NULL),
  (2, 'TODO: ผลงานของสมาชิก 2', 'TODO: รายละเอียด', ARRAY['TODO'], NULL),
  (3, 'TODO: ผลงานของสมาชิก 3', 'TODO: รายละเอียด', ARRAY['TODO'], NULL);
