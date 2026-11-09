import { Link, useParams } from "react-router-dom";
import { usePortfolio } from "../usePortfolio.js";
import ProjectCard from "../components/ProjectCard.jsx";
import Avatar from "../components/Avatar.jsx";

export default function MemberPage() {
  const { id } = useParams();
  const { data, error, loading } = usePortfolio();
  if (loading) return <p className="container status">กำลังโหลด…</p>;
  if (error) return <p className="container status error">โหลดข้อมูลไม่สำเร็จ: {error}</p>;

  const member = data.members.find((m) => String(m.id) === id);
  if (!member) return <p className="container status">ไม่พบสมาชิกคนนี้</p>;

  return (
    <section className="container section">
      <Link to="/#members" className="back">← กลับ</Link>
      <div className="member-header">
        <Avatar member={member} size={112} />
        <div>
          <h1>{member.name}</h1>
          {member.nickname && <p className="muted">ชื่อเล่น: {member.nickname}</p>}
          <p className="role">{member.role}</p>
          {member.github_url && (
            <a href={member.github_url} target="_blank" rel="noreferrer">GitHub →</a>
          )}
        </div>
      </div>

      {member.bio && <p className="lead">{member.bio}</p>}

      <h2>ทักษะ</h2>
      <div className="tags">
        {member.skills.map((s) => (
          <span key={s} className="tag">{s}</span>
        ))}
      </div>

      <h2>ผลงาน</h2>
      <div className="grid">
        {member.projects.length ? (
          member.projects.map((p) => <ProjectCard key={p.id} project={p} />)
        ) : (
          <p className="muted">ยังไม่มีผลงาน</p>
        )}
      </div>

      <Link to="/chat" className="btn">ถาม AI เกี่ยวกับ {member.nickname || member.name} →</Link>
    </section>
  );
}
