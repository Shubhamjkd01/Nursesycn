import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import ConfirmModal from '../components/ConfirmModal'

export default function PatientDetail({ nurse, patientId, onBack, addNotification, showToast }) {
  const [patients,     setPatients]     = useState([])
  const [noteText,     setNoteText]     = useState('')
  const [confirmState, setConfirmState] = useState(null) // {pid, mid}
  const [loading,      setLoading]      = useState(true)

  async function load() {
    const pts = await api.getPatients(nurse.id)
    setPatients(pts)
    setLoading(false)
  }

  useEffect(() => { load() }, [patientId])

  const p = patients.find(x => x.id === patientId)

  async function toggleDiet(did, done) {
    await api.toggleDiet(patientId, did, done)
    showToast(done ? '✅ Diet marked as given' : 'Diet unmarked', 'success')
    load()
  }

  async function confirmMed(mid, checked) {
    if (checked) {
      setConfirmState({ mid })
    } else {
      await api.toggleMedicine(patientId, mid, false)
      load()
    }
  }

  async function handleConfirmYes() {
    await api.toggleMedicine(patientId, confirmState.mid, true)
    showToast('✅ Medicine marked as administered', 'success')
    setConfirmState(null)
    load()
  }

  async function saveNote() {
    if (!noteText.trim()) { showToast('Please write a note first', 'warn'); return }
    await api.addNote(patientId, { text: noteText, nurse: nurse.name })
    addNotification({ type: 'info', msg: `📝 New note for ${p?.name} by ${nurse.name}` })
    showToast('✅ Note saved and forwarded to Doctor Panel', 'success')
    setNoteText('')
    load()
  }

  if (loading || !p) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  const totalTasks = p.diet.length + p.medicines.length
  const doneTasks  = p.diet.filter(d => d.done).length + p.medicines.filter(m => m.done).length
  const pct        = totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0
  const barColor   = pct === 100 ? 'green' : pct >= 50 ? '' : 'orange'

  return (
    <div>
      <button className="btn-back" onClick={onBack}>← Back to Patients</button>

      {/* Header card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>{p.name}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Age: {p.age} &bull; Room: {p.room}</p>
          </div>
          <span className={`badge badge-${p.condition.toLowerCase()}`} style={{ fontSize: 14, padding: '6px 14px' }}>
            {p.condition}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="card-title"><span className="icon">📊</span> Task Completion</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: 13 }}>
          <span>{doneTasks}/{totalTasks} tasks completed</span>
          <span style={{ fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="progress-wrap">
          <div className={`progress-bar ${barColor}`} style={{ width: pct + '%' }} />
        </div>
      </div>

      {/* Diet */}
      <div className="card">
        <div className="card-title"><span className="icon">🍽️</span> Diet Schedule</div>
        <div style={{ marginTop: 12 }}>
          {p.diet.map(d => (
            <div key={d.id} className="med-item">
              <div className="med-left">
                <input
                  type="checkbox"
                  checked={d.done}
                  onChange={e => toggleDiet(d.id, e.target.checked)}
                />
                <div>
                  <div className="med-name"><b>{d.meal}</b> – {d.desc}</div>
                </div>
              </div>
              <span className={`med-status ${d.done ? 'given' : 'pending'}`}>
                {d.done ? '✓ Given' : '⏰ Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Medicines */}
      <div className="card">
        <div className="card-title"><span className="icon">💊</span> Medicine Schedule</div>
        <div style={{ marginTop: 12 }}>
          {p.medicines.map(m => (
            <div key={m.id} className="med-item">
              <div className="med-left">
                <input
                  type="checkbox"
                  checked={m.done}
                  onChange={e => confirmMed(m.id, e.target.checked)}
                />
                <div>
                  <div className="med-name">{m.name}</div>
                  <div className="med-time">⏰ {m.time}</div>
                </div>
              </div>
              <span className={`med-status ${m.done ? 'given' : 'pending'}`}>
                {m.done ? '✓ Given' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <div className="card-title"><span className="icon">📝</span> Nurse Notes</div>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Write your observations about this patient..."
          rows={3}
          style={{ marginTop: 12 }}
        />
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={saveNote}>
          💾 Save Note
        </button>
        <div style={{ marginTop: 16 }}>
          {p.notes.length === 0
            ? <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No notes yet.</p>
            : [...p.notes].reverse().map((n, i) => (
              <div key={i} className="note-entry">
                <div className="note-meta">🕐 {n.time} &nbsp;|&nbsp; {n.nurse}</div>
                <div className="note-text">{n.text}</div>
              </div>
            ))
          }
        </div>
      </div>

      {confirmState && (
        <ConfirmModal
          text={`Are you sure this medicine has been administered to ${p.name}?`}
          onConfirm={handleConfirmYes}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  )
}
