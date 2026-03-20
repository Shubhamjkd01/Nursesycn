import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function DoctorPanel() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDoctorNotes().then(n => { setNotes(n); setLoading(false) })
  }, [])

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  return (
    <div>
      <div className="section-heading">👨‍⚕️ Doctor Review Panel</div>
      <p className="page-desc">All nurse notes are automatically forwarded here for doctor review.</p>

      {notes.length === 0
        ? <p style={{ color: 'var(--text-secondary)' }}>No nurse notes submitted yet.</p>
        : [...notes].reverse().map((n, i) => (
          <div key={i} className="doctor-note-card">
            <div className="dnc-header">
              <span className="dnc-patient">👤 {n.patient} – Room {n.room}</span>
              <span className={`badge badge-${(n.condition || 'normal').toLowerCase()}`}>
                {n.condition || 'N/A'}
              </span>
            </div>
            <div className="dnc-note">{n.text}</div>
            <div className="dnc-nurse">📝 By {n.nurse} &nbsp;|&nbsp; 🕐 {n.time}</div>
          </div>
        ))
      }
    </div>
  )
}
