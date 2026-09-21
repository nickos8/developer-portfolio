import { useEffect, useState } from 'react'
import api from '../api'
import ProjectCard from './ProjectCard'

export default function ProjectsSection() {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await api.get('/api/projects')
        setProjects(response.data)
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadProjects()
  }, [])

  return (
    <section id="projects">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-kicker">Work</div>
          <h2>Published projects</h2>
          <div className="rule" />
        </div>

        {status === 'loading' && <p className="state-msg">Loading projects...</p>}
        {status === 'error' && <p className="state-msg">Could not load projects right now.</p>}
        {status === 'ready' && projects.length === 0 && (
          <p className="empty-state">No published projects yet. Check back soon.</p>
        )}

        {status === 'ready' && projects.length > 0 && (
          <div className="proj-grid">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} featured={project.is_featured} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
