import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import PatientCard from '../components/PatientCard'

export default function Dashboard({ nurse, onOpenPatient, addNotification, showToast }) {
  const [patients,  setPatients]  = useState([])
  const [wardTasks, setWardTasks] = useState([])
  const [loading,   setLoading]   = useState(true)

  async function load() {
    try {
      const [pts, wt] = await Promise.all([
        api.getPatients(nurse.id),
        api.getWardTasks(),
      ])
      setPatients(pts.sort((a, b) => a.priority - b.priority))
      setWardTasks(wt)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function toggleWardTask(id, done) {
    await api.toggleWardTask(id, done)
    load()
  }

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  const allTasks  = patients.flatMap(p => [...p.diet, ...p.medicines])
  const allDone   = allTasks.filter(t => t.done).length
  const allTotal  = allTasks.length
  const critical  = patients.filter(p => p.condition === 'Critical').length

  const wardDone  = wardTasks.filter(t => t.done).length
  const wardPct   = wardTasks.length > 0 ? Math.round(wardDone / wardTasks.length * 100) : 0
  const barColor  = wardPct === 100 ? 'green' : wardPct >= 50 ? '' : 'orange'

  const allMeds   = patients.flatMap(p => p.medicines.map(m => ({ ...m, patient: p.name })))

  return (
    <div>
      <div className="section-heading">📊 Nurse Dashboard</div>
      <p className="page-desc">Welcome back! Here's your shift overview for today.</p>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 18 }}>
        <div className="stat-card blue">
          <div className="stat-label">Assigned Patients</div>
          <div className="stat-value">{patients.length}</div>
          <div className="stat-sub">Active this shift</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">Critical Patients</div>
          <div className="stat-value">{critical}</div>
          <div className="stat-sub">Needs urgent care</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Tasks Completed</div>
          <div className="stat-value">{allDone}</div>
          <div className="stat-sub">Today</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Pending Tasks</div>
          <div className="stat-value">{allTotal - allDone}</div>
          <div className="stat-sub">Across all patients</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Ward Tasks */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="icon">✅</span> General Ward Tasks</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
              {wardDone}/{wardTasks.length} ({wardPct}%)
            </span>
          </div>
          <div className="progress-wrap">
            <div className={`progress-bar ${barColor}`} style={{ width: wardPct + '%' }} />
          </div>
          <div style={{ marginTop: 14 }}>
            {wardTasks.map(t => (
              <div key={t.id} className={`task-item ${t.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={e => toggleWardTask(t.id, e.target.checked)}
                />
                <span className="task-name">{t.name}</span>
                <span className={`task-status ${t.done ? 'done' : 'pending'}`}>
                  {t.done ? '✓ Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Patients */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="icon">🧑‍⚕️</span> Priority Patients</div>
          </div>
          {patients.slice(0, 3).map(p => (
            <PatientCard key={p.id} patient={p} onClick={() => onOpenPatient(p.id)} />
          ))}
        </div>
      </div>

      {/* Medicine Timeline */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="icon">💊</span> Today's Medicine Timeline</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {allMeds.map((m, i) => (
            <div key={i} style={{
              background: m.done ? 'var(--success-light)' : 'var(--danger-light)',
              borderRadius: 10, padding: '10px 14px', fontSize: 12, minWidth: 150,
              border: `1px solid ${m.done ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{ fontWeight: 700 }}>{m.name}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{m.patient}</div>
              <div style={{ fontWeight: 600, marginTop: 2, color: m.done ? 'var(--success)' : 'var(--danger)' }}>
                ⏰ {m.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
