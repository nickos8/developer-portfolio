import { useEffect, useState } from 'react'
import api from '../api'

export default function AboutSection() {
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/api/profile')
        setProfile(response.data.profile)
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadProfile()
  }, [])

  if (status !== 'ready' || !profile) {
    return null
  }

  return (
    <section id="about">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-kicker">About</div>
          <h2>{profile.name}</h2>
          {profile.role && <div className="rule" />}
        </div>

        <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>
          {profile.role && (
            <p style={{ color: 'var(--accent-2)', fontWeight: 600, marginTop: 0 }}>{profile.role}</p>
          )}
          {profile.bio && <p style={{ whiteSpace: 'pre-line' }}>{profile.bio}</p>}
        </div>
      </div>
    </section>
  )
}
