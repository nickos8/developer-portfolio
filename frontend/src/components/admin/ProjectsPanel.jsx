import { useEffect, useState } from 'react'
import api from '../../api'
import ProjectForm from './ProjectForm'

async function fetchProjects() {
  const response = await api.get('/api/admin/projects')
  return response.data
}

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading')
  const [editingProject, setEditingProject] = useState(null)

  useEffect(() => {
    async function loadOnMount() {
      try {
        setProjects(await fetchProjects())
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadOnMount()
  }, [])

  async function loadProjects() {
    try {
      setProjects(await fetchProjects())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
      return
    }

    await api.delete(`/api/projects/${project.id}`)

    if (editingProject?.id === project.id) {
      setEditingProject(null)
    }

    loadProjects()
  }

  return (
    <div className="admin-grid">
      <div className="admin-list">
        {status === 'loading' && <p className="state-msg">Loading projects...</p>}
        {status === 'error' && <p className="state-msg">Could not load projects.</p>}
        {status === 'ready' && projects.length === 0 && (
          <p className="empty-state">No projects yet. Create the first one.</p>
        )}

        {status === 'ready' &&
          projects.map((project) => (
            <div className="card admin-project-row" key={project.id}>
              <div className="meta">
                <h4>{project.title}</h4>
                <div className="badges">
                  <span className={`status-pill${project.is_published ? ' on' : ''}`}>
                    {project.is_published ? 'Published' : 'Draft'}
                  </span>
                  {project.is_featured && <span className="status-pill on">Featured</span>}
                </div>
              </div>

              <div className="admin-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingProject(project)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(project)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <ProjectForm
        key={editingProject?.id ?? 'new'}
        editingProject={editingProject}
        onSaved={() => {
          loadProjects()
          setEditingProject(null)
        }}
        onCancelEdit={() => setEditingProject(null)}
      />
    </div>
  )
}
