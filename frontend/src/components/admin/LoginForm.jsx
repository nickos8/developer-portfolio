import { useState } from 'react'
import api from '../../api'

export default function LoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/login', { email, password })

      const response = await api.get('/api/user')
      onLoggedIn(response.data.user)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card form-card">
      <div className="sec-head" style={{ marginBottom: 24 }}>
        <div className="sec-kicker">Admin</div>
        <h2>Sign in</h2>
      </div>

      {message && <p className="form-message error">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', justifyContent: 'center' }}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
