export default function ProjectCard({ project, featured = false }) {
  return (
    <article className={`card proj${featured ? ' feature' : ''}`}>
      <div className="proj-top">
        <h3>{project.title}</h3>
        {project.is_featured && <span className="tag">Featured</span>}
      </div>

      <p>{project.short_description}</p>

      {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
        <div className="stack">
          {project.tech_stack.map((tech) => (
            <span className="pill" key={tech}>
              {tech}
            </span>
          ))}
        </div>
      )}

      {(project.github_url || project.live_url) && (
        <div className="links">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noreferrer">
              Live demo
            </a>
          )}
        </div>
      )}
    </article>
  )
}
