import { useEffect, useState } from 'react'
import api from './api'
import './App.css'

const initialProjectForm = {
  title: '',
  short_description: '',
  description: '',
  tech_stack: '',
  github_url: '',
  live_url: '',
  is_featured: false,
  is_published: false,
  display_order: 0,
}


function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [projectForm, setProjectForm] = useState(initialProjectForm)


  useEffect(() => {
    async function checkSession() {
      try {
        const response = await api.get('/api/user')

        setUser(response.data.user)
      } catch {
        setUser(null)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

function handleProjectChange(event) {
  const { name, value } = event.target

  setProjectForm((currentForm) => ({
    ...currentForm,
    [name]: value,
  }))
}

  async function handleLogin(event) {
    event.preventDefault()

    setIsSubmitting(true)
    setMessage('')

    try {
      await api.get('/sanctum/csrf-cookie')

      await api.post('/login', {
        email,
        password,
      })

      const response = await api.get('/api/user')

      setUser(response.data.user)
      setPassword('')
      setMessage('Login successful.')
    } catch (error) {
      setUser(null)
      setMessage(error.response?.data?.message || 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

    async function handleLogout() {
    setIsLoggingOut(true)
    setMessage('')

    try {
      await api.post('/logout')

      setUser(null)
      setEmail('')
      setPassword('')
      setMessage('You have been logged out.')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Logout failed.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isCheckingSession) {
    return (
      <main>
        <p>Checking session...</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Portfolio Admin Login</h1>

      {user ? (
        <section>
  <p>Welcome, {user.name}.</p>
  <p>{message}</p>

<h2>Create Project</h2>

<div>
  <label htmlFor="project-title">Title</label>
  <input
    id="project-title"
    name="title"
    type="text"
    value={projectForm.title}
    onChange={handleProjectChange}
  />
</div>

<div>
  <label htmlFor="project-short-description">
    Short Description
  </label>
  <textarea
    id="project-short-description"
    name="short_description"
    value={projectForm.short_description}
    onChange={handleProjectChange}
    maxLength="300"
  />
</div>

<div>
  <label htmlFor="project-description">Description</label>
  <textarea
    id="project-description"
    name="description"
    value={projectForm.description}
    onChange={handleProjectChange}
  />
</div>

<div>
  <label htmlFor="project-tech-stack">Technology Stack</label>
  <input
    id="project-tech-stack"
    name="tech_stack"
    type="text"
    value={projectForm.tech_stack}
    onChange={handleProjectChange}
    placeholder="Laravel, React, PostgreSQL"
  />
</div>

  <button
    type="button"
    onClick={handleLogout}
    disabled={isLoggingOut}
  >

    

    {isLoggingOut ? 'Logging out...' : 'Log out'}
  </button>
</section>
      ) : (
        <form onSubmit={handleLogin}>
          <div>
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

          <div>
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>

          {message && <p>{message}</p>}
        </form>
      )}
    </main>
  )
}

export default App