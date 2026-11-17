import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePortfolio } from "../usePortfolio.js";
import ProjectCard from "../components/ProjectCard.jsx";
import Avatar from "../components/Avatar.jsx";
import GalaxyHero from "../components/GalaxyHero.jsx";
import MeteorReveal from "../components/MeteorReveal.jsx";

// สีประจำตัวสมาชิก: คนที่ 1 ทอง, คนที่ 2 ฟ้า, คนที่ 3 ชมพู
const STAR_COLORS = ["#ffb547", "#4fd1ff", "#ff5fa2"];

function SectionHead({ no, en, th }) {
  return (
    <header className="g-head">
      <span className="g-kicker">{no} — {en}</span>
      <h2>{th}</h2>
    </header>
  );
}

export default function HomePage({ theme }) {
  const { data, error, loading } = usePortfolio();
  const navigate = useNavigate();
  const [reveal, setReveal] = useState(null); // { member, index } ของการ์ดที่กด
  if (loading) return <p className="container status">กำลังโหลด…</p>;
  if (error) return <p className="container status error">โหลดข้อมูลไม่สำเร็จ: {error}</p>;

  const { group, members, groupProjects } = data;
  const projectCount = groupProjects.length + members.reduce((n, m) => n + m.projects.length, 0);

  return (
    <>
      <section className="g-hero">
        <GalaxyHero theme={theme} members={members} />
        <div className="g-hero-fade" aria-hidden="true" />
        <div className="container g-hero-content">
          <p className="g-kicker">GROUP PORTFOLIO · AI &amp; DATA ENGINEERING</p>
          <h1 className="g-title">{group?.name}</h1>
          {group?.tagline && <p className="g-tagline">{group.tagline}</p>}
          <div className="g-actions">
            <Link to="/chat" className="btn">คุยกับ Nous →</Link>
            <a href="#members" className="btn-ghost">พบกับสมาชิก</a>
          </div>
          <dl className="g-stats">
            <div><dt>สมาชิก</dt><dd>{members.length}</dd></div>
            <div><dt>ผลงาน</dt><dd>{projectCount}</dd></div>
            <div><dt>ผู้ช่วย AI</dt><dd>1</dd></div>
          </dl>
        </div>
        <a href="#concept" className="g-scroll" aria-label="เลื่อนลงไปดูเนื้อหา">
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section id="concept" className="container section">
        <SectionHead no="01" en="CONCEPT" th="แนวคิดของเรา" />
        <p className="lead">{group?.concept}</p>
        <ul className="g-highlights">
          {group?.highlights?.map((h, i) => (
            <li key={h} className="card g-highlight">
              <span className="g-highlight-no">0{i + 1}</span>
              <span className="g-star" aria-hidden="true">✦</span>
              <p>{h}</p>
            </li>
          ))}
        </ul>
      </section>

      {group?.tech_stack?.length > 0 && (
        <section className="container section">
          <SectionHead no="02" en="TECH STACK" th="เทคโนโลยีที่ใช้" />
          <ul className="g-stack">
            {group.tech_stack.map((t) => (
              <li key={t}><span className="g-dot" aria-hidden="true" />{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="container section">
        <SectionHead no="03" en="PROJECTS" th="ผลงานที่ทำร่วมกัน" />
        <div className="grid">
          {groupProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section id="members" className="container section">
        <SectionHead no="04" en="THE THREE STARS" th="สมาชิก" />
        <div className="grid g-members">
          {members.map((m, i) => (
            <Link
              key={m.id}
              to={`/members/${m.id}`}
              className="card member-card g-member"
              style={{ "--star-color": STAR_COLORS[i % STAR_COLORS.length] }}
              onClick={(e) => {
                e.preventDefault(); // เล่นดาวตกก่อน แล้วค่อยให้เลือกไปหน้าโปรไฟล์
                setReveal({ member: m, index: i });
              }}
            >
              <span className="g-member-no">STAR 0{i + 1}</span>
              <span className="g-ring"><Avatar member={m} size={84} /></span>
              <h3>{m.name}</h3>
              <p className="role">{m.role}</p>
              <div className="tags">
                {m.skills.slice(0, 4).map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
              <span className="profile-link">แตะเพื่อเรียกดาว ✦</span>
            </Link>
          ))}
        </div>
        {reveal && (
          <MeteorReveal
            member={reveal.member}
            index={reveal.index}
            color={STAR_COLORS[reveal.index % STAR_COLORS.length]}
            onClose={() => setReveal(null)}
            onOpen={() => navigate(`/members/${reveal.member.id}`)}
          />
        )}
      </section>

      <section id="contact" className="container section">
        <SectionHead no="05" en="CONTACT" th="ติดต่อเรา" />
        <div className="card g-contact">
          {group?.contact_email && (
            <p><span className="g-label">อีเมล</span><a href={`mailto:${group.contact_email}`}>{group.contact_email}</a></p>
          )}
          {group?.contact_github && (
            <p><span className="g-label">GitHub</span><a href={group.contact_github} target="_blank" rel="noreferrer">{group.contact_github}</a></p>
          )}
          {group?.contact_other && <p><span className="g-label">อื่นๆ</span>{group.contact_other}</p>}
        </div>
      </section>

      <section className="container section">
        <div className="g-cta">
          <div>
            <p className="g-kicker">ASK NOUS</p>
            <h2>มีคำถามเกี่ยวกับพวกเรา?</h2>
            <p className="muted">Nous ผู้ช่วย AI ประจำกลุ่ม ตอบได้ทุกเรื่องเกี่ยวกับสมาชิกและผลงาน</p>
          </div>
          <Link to="/chat" className="btn">เริ่มคุยกับ Nous →</Link>
        </div>
      </section>
    </>
  );
}
