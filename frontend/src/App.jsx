import { useEffect, useState } from 'react'
import api from './api'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import ProjectsSection from './components/ProjectsSection'
import Footer from './components/Footer'
import LoginForm from './components/admin/LoginForm'
import AdminDashboard from './components/admin/AdminDashboard'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
  } catch {
    // localStorage may be unavailable; fall back to the default theme.
  }

  return 'dark'
}

function App() {
  const [view, setView] = useState('public')
  const [theme, setTheme] = useState(getInitialTheme)
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Ignore storage errors (private browsing, disabled storage).
    }
  }, [theme])

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

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  if (isCheckingSession) {
    return <p className="checking">Loading...</p>
  }

  return (
    <>
      <Header view={view} onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} isAuthenticated={Boolean(user)} />

      {view === 'admin' ? (
        user ? (
          <AdminDashboard user={user} onLogout={() => setUser(null)} />
        ) : (
          <main className="wrap" style={{ paddingBlock: 60 }}>
            <LoginForm onLoggedIn={setUser} />
          </main>
        )
      ) : (
        <>
          <Hero />
          <ProjectsSection />
        </>
      )}

      <Footer onNavigate={setView} />
    </>
  )
}

export default App
