import { useState } from 'react'
import api from '../../api'
import ProjectsPanel from './ProjectsPanel'
import ProfilePanel from './ProfilePanel'
import SkillsPanel from './SkillsPanel'

const TABS = [
  { id: 'projects', label: 'Projects' },
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
]

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('projects')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await api.post('/logout')
      onLogout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <section>
      <div className="wrap">
        <div className="admin-header">
          <div>
            <div className="sec-kicker">Admin</div>
            <h2>Welcome, {user.name}</h2>
          </div>

          <button type="button" className="btn btn-ghost" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>

        <div className="admin-tabs">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn btn-sm ${tab === item.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'projects' && <ProjectsPanel />}
        {tab === 'profile' && <ProfilePanel />}
        {tab === 'skills' && <SkillsPanel />}
      </div>
    </section>
  )
}
