import { Link } from "react-router-dom";
import { usePortfolio } from "../usePortfolio.js";
import ProjectCard from "../components/ProjectCard.jsx";
import Avatar from "../components/Avatar.jsx";

export default function HomePage() {
  const { data, error, loading } = usePortfolio();
  if (loading) return <p className="container status">กำลังโหลด…</p>;
  if (error) return <p className="container status error">โหลดข้อมูลไม่สำเร็จ: {error}</p>;

  const { group, members, groupProjects } = data;

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Group Portfolio</p>
          <h1>{group?.name}</h1>
          {group?.tagline && <p className="tagline">{group.tagline}</p>}
          <Link to="/chat" className="btn">ถาม AI เกี่ยวกับพวกเรา →</Link>
        </div>
      </section>

      <section className="container section">
        <h2>แนวคิดของเรา</h2>
        <p className="lead">{group?.concept}</p>
        <ul className="highlights">
          {group?.highlights?.map((h) => (
            <li key={h} className="card">{h}</li>
          ))}
        </ul>
      </section>

      <section className="container section">
        <h2>ผลงานที่ทำร่วมกัน</h2>
        <div className="grid">
          {groupProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      <section id="members" className="container section">
        <h2>สมาชิก</h2>
        <div className="grid">
          {members.map((m) => (
            <Link key={m.id} to={`/members/${m.id}`} className="card member-card">
              <Avatar member={m} />
              <h3>{m.name}</h3>
              <p className="role">{m.role}</p>
              <div className="tags">
                {m.skills.slice(0, 4).map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="contact" className="container section">
        <h2>ติดต่อเรา</h2>
        <div className="card contact">
          {group?.contact_email && (
            <p>📧 <a href={`mailto:${group.contact_email}`}>{group.contact_email}</a></p>
          )}
          {group?.contact_github && (
            <p>💻 <a href={group.contact_github} target="_blank" rel="noreferrer">{group.contact_github}</a></p>
          )}
          {group?.contact_other && <p>💬 {group.contact_other}</p>}
        </div>
      </section>
    </>
  );
}
