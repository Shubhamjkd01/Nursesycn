import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function ShiftHandoff({ nurse }) {
  const [patients,  setPatients]  = useState([])
  const [wardTasks, setWardTasks] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([api.getPatients(nurse.id), api.getWardTasks()])
      .then(([pts, wt]) => { setPatients(pts); setWardTasks(wt); setLoading(false) })
  }, [])

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  const completedP = [], pendingP = []
  patients.forEach(p => {
    const done  = p.diet.filter(d => d.done).length + p.medicines.filter(m => m.done).length
    const total = p.diet.length + p.medicines.length
    if (done === total) completedP.push(p)
    else pendingP.push(p)
  })

  const completedW = wardTasks.filter(t => t.done)
  const pendingW   = wardTasks.filter(t => !t.done)

  return (
    <div>
      <div className="section-heading">📋 Shift Handoff Summary</div>
      <p className="page-desc">Review what was completed and what needs follow-up in the next shift.</p>

      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}>
          👤 Nurse: {nurse.name} &nbsp;|&nbsp; Shift: {nurse.shift} &nbsp;|&nbsp; ID: {nurse.id}
        </div>

        <div className="handoff-section">
          <h4>✅ Completed Patient Tasks</h4>
          {completedP.length === 0
            ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>None completed.</p>
            : completedP.map(p => (
              <div key={p.id} className="handoff-item completed">✔ {p.name} – Room {p.room} – All tasks done</div>
            ))
          }
        </div>

        <div className="handoff-section">
          <h4>⏳ Pending Patient Tasks</h4>
          {pendingP.length === 0
            ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>All done! 🎉</p>
            : pendingP.map(p => {
                const pending = [...p.diet.filter(d => !d.done), ...p.medicines.filter(m => !m.done)]
                return (
                  <div key={p.id} className="handoff-item pending">
                    ⚠ {p.name} – {pending.length} task(s) pending
                  </div>
                )
              })
          }
        </div>

        <div className="handoff-section">
          <h4>✅ Completed Ward Tasks</h4>
          {completedW.length === 0
            ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>None</p>
            : completedW.map(t => (
              <div key={t.id} className="handoff-item completed">✔ {t.name}</div>
            ))
          }
        </div>

        <div className="handoff-section">
          <h4>⏳ Pending Ward Tasks</h4>
          {pendingW.length === 0
            ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>All done!</p>
            : pendingW.map(t => (
              <div key={t.id} className="handoff-item pending">⚠ {t.name}</div>
            ))
          }
        </div>

        <div className="handoff-section">
          <h4>📝 Patient Notes Summary</h4>
          {patients.flatMap(p =>
            p.notes.slice(-1).map((n, i) => (
              <div key={`${p.id}-${i}`} className="note-entry">
                <div className="note-meta">{p.name}</div>
                <div className="note-text">{n.text}</div>
              </div>
            ))
          ).length === 0
            ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>No notes.</p>
            : patients.flatMap(p =>
                p.notes.slice(-1).map((n, i) => (
                  <div key={`${p.id}-${i}`} className="note-entry">
                    <div className="note-meta">{p.name}</div>
                    <div className="note-text">{n.text}</div>
                  </div>
                ))
              )
          }
        </div>
      </div>
    </div>
  )
}
