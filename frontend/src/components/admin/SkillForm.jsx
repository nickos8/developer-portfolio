import { useState } from 'react'
import api from '../../api'

const emptyForm = { name: '', category: '', display_order: '' }

function skillToForm(skill) {
  return {
    name: skill.name ?? '',
    category: skill.category ?? '',
    display_order: skill.display_order ?? '',
  }
}

export default function SkillForm({ editingSkill, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(() => (editingSkill ? skillToForm(editingSkill) : emptyForm))
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setMessage('')

    const payload = {
      name: form.name,
      category: form.category || null,
      display_order: form.display_order === '' ? undefined : Number(form.display_order),
    }

    try {
      if (editingSkill) {
        await api.put(`/api/skills/${editingSkill.id}`, payload)
        setMessage('Skill updated.')
      } else {
        await api.post('/api/skills', payload)
        setMessage('Skill added.')
        setForm(emptyForm)
      }

      onSaved()
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {})
      } else {
        setMessage(error.response?.data?.message || 'Could not save the skill.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card admin-form-card">
      <div className="sec-head" style={{ marginBottom: 20, textAlign: 'left' }}>
        <h2>{editingSkill ? 'Edit skill' : 'Add skill'}</h2>
      </div>

      {message && <p className="form-message success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="skill-name">Name</label>
          <input id="skill-name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          {errors.name && <span className="field-error">{errors.name[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="skill-category">Category</label>
          <input
            id="skill-category"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            placeholder="Backend, Frontend, Database..."
          />
          {errors.category && <span className="field-error">{errors.category[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="skill-order">Display order</label>
          <input
            id="skill-order"
            type="number"
            min="0"
            value={form.display_order}
            onChange={(e) => updateField('display_order', e.target.value)}
          />
          {errors.display_order && <span className="field-error">{errors.display_order[0]}</span>}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingSkill ? 'Save changes' : 'Add skill'}
          </button>

          {editingSkill && (
            <button type="button" className="btn btn-ghost" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
