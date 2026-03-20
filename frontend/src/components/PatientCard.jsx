export default function PatientCard({ patient: p, onClick }) {
  const total = p.diet.length + p.medicines.length
  const done  = p.diet.filter(d => d.done).length + p.medicines.filter(m => m.done).length
  const pct   = total > 0 ? Math.round(done / total * 100) : 0

  return (
    <div className={`patient-card ${p.condition.toLowerCase()}`} onClick={onClick}>
      <div className="patient-info">
        <div className="patient-name">👤 {p.name}</div>
        <div className="patient-meta">Room {p.room} &bull; Age {p.age}</div>
        <div style={{ marginTop: 6 }}>
          <span className={`badge badge-${p.condition.toLowerCase()}`}>{p.condition}</span>
        </div>
      </div>
      <div className="patient-card-right">
        <div className="patient-progress-mini">{done}/{total} tasks</div>
        <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Nunito',sans-serif", color: 'var(--primary)' }}>{pct}%</div>
        <button className="btn-view">View →</button>
      </div>
    </div>
  )
}
