export default function ProjectCard({ project }) {
  return (
    <article className="card project">
      <h4>{project.title}</h4>
      {project.description && <p>{project.description}</p>}
      <div className="tags">
        {project.tech?.map((t) => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      {project.link && (
        <a href={project.link} target="_blank" rel="noreferrer">ดูผลงาน →</a>
      )}
    </article>
  );
}
