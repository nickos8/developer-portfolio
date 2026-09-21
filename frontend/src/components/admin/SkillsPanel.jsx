import { useEffect, useState } from 'react'
import api from '../../api'
import SkillForm from './SkillForm'

async function fetchSkills() {
  const response = await api.get('/api/skills')
  return response.data
}

export default function SkillsPanel() {
  const [skills, setSkills] = useState([])
  const [status, setStatus] = useState('loading')
  const [editingSkill, setEditingSkill] = useState(null)

  useEffect(() => {
    async function loadOnMount() {
      try {
        setSkills(await fetchSkills())
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadOnMount()
  }, [])

  async function loadSkills() {
    try {
      setSkills(await fetchSkills())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleDelete(skill) {
    if (!window.confirm(`Delete "${skill.name}"? This cannot be undone.`)) {
      return
    }

    await api.delete(`/api/skills/${skill.id}`)

    if (editingSkill?.id === skill.id) {
      setEditingSkill(null)
    }

    loadSkills()
  }

  return (
    <div className="admin-grid">
      <div className="admin-list">
        {status === 'loading' && <p className="state-msg">Loading skills...</p>}
        {status === 'error' && <p className="state-msg">Could not load skills.</p>}
        {status === 'ready' && skills.length === 0 && (
          <p className="empty-state">No skills yet. Add the first one.</p>
        )}

        {status === 'ready' &&
          skills.map((skill) => (
            <div className="card admin-project-row" key={skill.id}>
              <div className="meta">
                <h4>{skill.name}</h4>
                {skill.category && (
                  <div className="badges">
                    <span className="status-pill on">{skill.category}</span>
                  </div>
                )}
              </div>

              <div className="admin-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingSkill(skill)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(skill)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <SkillForm
        key={editingSkill?.id ?? 'new'}
        editingSkill={editingSkill}
        onSaved={() => {
          loadSkills()
          setEditingSkill(null)
        }}
        onCancelEdit={() => setEditingSkill(null)}
      />
    </div>
  )
}
