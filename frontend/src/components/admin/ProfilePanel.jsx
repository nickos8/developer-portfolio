import { useEffect, useState } from 'react'
import api from '../../api'

const emptyForm = { name: '', role: '', bio: '' }

export default function ProfilePanel() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('loading')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/api/profile')
        const profile = response.data.profile

        if (profile) {
          setForm({ name: profile.name ?? '', role: profile.role ?? '', bio: profile.bio ?? '' })
        }

        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadProfile()
  }, [])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setMessage('')

    try {
      await api.put('/api/profile', form)
      setMessage('Profile saved.')
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {})
      } else {
        setMessage(error.response?.data?.message || 'Could not save the profile.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return <p className="state-msg">Loading profile...</p>
  }

  if (status === 'error') {
    return <p className="state-msg">Could not load the profile.</p>
  }

  return (
    <div className="card form-card" style={{ maxWidth: 560 }}>
      <div className="sec-head" style={{ marginBottom: 20, textAlign: 'left' }}>
        <h2>Profile</h2>
        <p style={{ margin: '8px 0 0' }}>
          This name, role, and bio appear in the About section of the public page.
        </p>
      </div>

      {message && <p className="form-message success">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="profile-name">Name</label>
          <input id="profile-name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          {errors.name && <span className="field-error">{errors.name[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="profile-role">Role</label>
          <input
            id="profile-role"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            placeholder="Junior PHP / Laravel Developer"
          />
          {errors.role && <span className="field-error">{errors.role[0]}</span>}
        </div>

        <div className="field">
          <label htmlFor="profile-bio">Bio</label>
          <textarea id="profile-bio" rows={5} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} />
          {errors.bio && <span className="field-error">{errors.bio[0]}</span>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
