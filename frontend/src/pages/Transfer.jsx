import { useState, useEffect } from 'react'
import { api } from '../utils/api'

export default function Transfer({ nurse, showToast, addNotification }) {
  const [step,           setStep]     = useState(1)
  const [nurses,         setNurses]   = useState([])
  const [patients,       setPatients] = useState([])
  const [received,       setReceived] = useState([])
  const [toNurse,        setToNurse]  = useState('')
  const [selectedTasks,  setSel]      = useState([])
  const [availableTasks, setAvail]    = useState([])

  useEffect(() => {
    Promise.all([
      api.getNurses(),
      api.getPatients(nurse.id),
      api.getReceived(nurse.id),
    ]).then(([ns, pts, rec]) => {
      setNurses(ns.filter(n => n.id !== nurse.id))
      setPatients(pts)
      setReceived(rec)
    })
  }, [])

  function buildTasks(pts) {
    const tasks = []
    pts.forEach(p => {
      p.medicines.filter(m => !m.done).forEach(m =>
        tasks.push({ id: `${p.id}_${m.id}`, label: `${m.name} for ${p.name} (${m.time})` })
      )
      p.diet.filter(d => !d.done).forEach(d =>
        tasks.push({ id: `${p.id}_${d.id}`, label: `Diet: ${d.meal} for ${p.name}` })
      )
    })
    return tasks
  }

  function goStep(n) {
    if (n === 2) {
      if (!toNurse) { showToast('Please select a nurse', 'warn'); return }
      setAvail(buildTasks(patients))
    }
    if (n === 3) {
      if (selectedTasks.length === 0) { showToast('Please select at least one task', 'warn'); return }
    }
    setStep(n)
  }

  async function confirmTransfer() {
    const toName = nurses.find(n => n.id === toNurse)?.name || toNurse
    await api.transferTasks({ fromNurse: nurse.name, toNurse: toName, tasks: selectedTasks })
    addNotification({ type: 'info', msg: `🔄 You transferred ${selectedTasks.length} tasks to ${toName}` })
    showToast(`✅ ${selectedTasks.length} task(s) transferred to ${toName}`, 'success')
    setStep(1)
    setSel([])
    setToNurse('')
    // refresh received
    api.getReceived(nurse.id).then(setReceived)
  }

  function toggleTask(task) {
    setSel(prev =>
      prev.find(t => t.id === task.id) ? prev.filter(t => t.id !== task.id) : [...prev, task]
    )
  }

  const toName = nurses.find(n => n.id === toNurse)?.name

  return (
    <div>
      <div className="section-heading">🔄 Task Transfer</div>
      <p className="page-desc">Transfer pending tasks to another nurse for this shift.</p>

      <div className="card" style={{ maxWidth: 600 }}>
        {/* Step indicator */}
        <div className="step-indicator">
          {[{n:1,label:'Select Nurse'},{n:2,label:'Select Tasks'},{n:3,label:'Confirm'}].map(s => (
            <div key={s.n} className={`step-dot ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
              <div className="dot">{step > s.n ? '✓' : s.n}</div>
              <div className="step-label">{s.label}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:8 }}>Select Nurse to Transfer To:</label>
            <select style={{ width:'100%', marginBottom:16 }} value={toNurse} onChange={e => setToNurse(e.target.value)}>
              <option value="">-- Choose Nurse --</option>
              {nurses.map(n => <option key={n.id} value={n.id}>{n.id} – {n.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => goStep(2)}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:8 }}>Select Tasks to Transfer:</label>
            <div style={{ marginBottom:16 }}>
              {availableTasks.length === 0
                ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>No pending tasks to transfer.</p>
                : availableTasks.map(t => (
                  <div key={t.id} className="task-item">
                    <input
                      type="checkbox"
                      checked={!!selectedTasks.find(s => s.id === t.id)}
                      onChange={() => toggleTask(t)}
                    />
                    <span className="task-name">{t.label}</span>
                  </div>
                ))
              }
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-secondary" onClick={() => goStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => goStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="note-entry" style={{ marginBottom:16 }}>
              <div className="note-meta">Transferring to: <b>{toNurse} – {toName}</b></div>
              <div className="note-text">
                {selectedTasks.map(t => <div key={t.id}>• {t.label}</div>)}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-secondary" onClick={() => goStep(2)}>← Back</button>
              <button className="btn btn-success" onClick={confirmTransfer}>✅ Confirm Transfer</button>
            </div>
          </div>
        )}
      </div>

      {/* Received tasks */}
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-title" style={{ marginBottom: 12 }}><span className="icon">📥</span> Received Tasks</div>
        {received.length === 0
          ? <p style={{ color:'var(--text-secondary)', fontSize:13 }}>No tasks received yet.</p>
          : received.map((t, i) => (
            <div key={i} className="task-item">
              <span className="task-name">📨 {t.task} <span style={{ color:'var(--text-secondary)' }}>(from {t.from})</span></span>
              <span className="task-status pending">Received</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
