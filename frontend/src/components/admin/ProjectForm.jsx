import { useState } from 'react'
import api from '../../api'

const emptyForm = {
  title: '',
  short_description: '',
  description: '',
  tech_stack: '',
  github_url: '',
  live_url: '',
  is_featured: false,
  is_published: false,
  display_order: '',
}

function projectToForm(project) {
  return {
    title: project.title ?? '',
    short_description: project.short_description ?? '',
    description: project.description ?? '',
    tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
    github_url: project.github_url ?? '',
    live_url: project.live_url ?? '',
    is_featured: Boolean(project.is_featured),
    is_published: Boolean(project.is_published),
    display_order: project.display_order ?? '',
  }
}

export default function ProjectForm({ editingProject, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(() => (editingProject ? projectToForm(editingProject) : emptyForm))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function buildPayload() {
    return {
      title: form.title,
      short_description: form.short_description,
      description: form.description,
      tech_stack: form.tech_stack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      github_url: form.github_url || null,
      live_url: form.live_url || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
      display_order: form.display_order === '' ? undefined : Number(form.display_order),
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setMessage('')

    try {
      const payload = buildPayload()

      if (editingProject) {
        await api.put(`/api/projects/${editingProject.id}`, payload)
        setMessage('Project updated.')
      } else {
        await api.post('/api/projects', payload)
        setMessage('Project created.')
        setForm(emptyForm)
      }

      onSaved()
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {})
      } else {
        setMessage(error.response?.data?.message || 'Could not save the project.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card admin-form-card">
      <div className="sec-head" style={{ marginBottom: 20, textAlign: 'left' }}>
        <h2>{editingProject ? 'Edit project' : 'New project'}</h2>
      </div>

      {message && <p className="form-message success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
          {errors.title && <span className="field-error">{errors.title[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="short_description">Short description</label>
          <input
            id="short_description"
            value={form.short_description}
            onChange={(e) => updateField('short_description', e.target.value)}
            maxLength={300}
            required
          />
          {errors.short_description && <span className="field-error">{errors.short_description[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          />
          {errors.description && <span className="field-error">{errors.description[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="tech_stack">Technologies (comma-separated)</label>
          <input
            id="tech_stack"
            value={form.tech_stack}
            onChange={(e) => updateField('tech_stack', e.target.value)}
            placeholder="Laravel, React, PostgreSQL"
            required
          />
          {errors.tech_stack && <span className="field-error">{errors.tech_stack[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="github_url">GitHub URL</label>
          <input id="github_url" value={form.github_url} onChange={(e) => updateField('github_url', e.target.value)} />
          {errors.github_url && <span className="field-error">{errors.github_url[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="live_url">Live URL</label>
          <input id="live_url" value={form.live_url} onChange={(e) => updateField('live_url', e.target.value)} />
          {errors.live_url && <span className="field-error">{errors.live_url[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="display_order">Display order</label>
          <input
            id="display_order"
            type="number"
            min="0"
            value={form.display_order}
            onChange={(e) => updateField('display_order', e.target.value)}
          />
          {errors.display_order && <span className="field-error">{errors.display_order[0]}</span>}
        </div>

        <div className="field checkbox-row">
          <input
            id="is_featured"
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => updateField('is_featured', e.target.checked)}
          />
          <label htmlFor="is_featured">Featured</label>
        </div>

        <div className="field checkbox-row">
          <input
            id="is_published"
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => updateField('is_published', e.target.checked)}
          />
          <label htmlFor="is_published">Published</label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingProject ? 'Save changes' : 'Create project'}
          </button>

          {editingProject && (
            <button type="button" className="btn btn-ghost" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
