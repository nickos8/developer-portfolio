import { useEffect, useState } from 'react'
import api from '../api'

function groupByCategory(skills) {
  const groups = new Map()

  for (const skill of skills) {
    const category = skill.category || 'Other'
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category).push(skill)
  }

  return groups
}

export default function SkillsSection() {
  const [skills, setSkills] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function loadSkills() {
      try {
        const response = await api.get('/api/skills')
        setSkills(response.data)
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    loadSkills()
  }, [])

  if (status !== 'ready' || skills.length === 0) {
    return null
  }

  const groups = groupByCategory(skills)

  return (
    <section id="skills">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-kicker">Skills</div>
          <h2>Technologies I work with</h2>
          <div className="rule" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[...groups.entries()].map(([category, items]) => (
            <div className="card" key={category}>
              <h3 style={{ fontSize: 15.5, fontWeight: 650, marginBottom: 14 }}>{category}</h3>
              <div className="stack">
                {items.map((skill) => (
                  <span className="pill" key={skill.id}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
