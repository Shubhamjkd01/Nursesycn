import { useState } from 'react'

const ALERT_TYPES = [
  'Code Blue – Cardiac Arrest',
  'Code Red – Fire Emergency',
  'Code Yellow – Missing Patient',
  'Rapid Response – Deteriorating Patient',
  'New Critical Admission',
]

export default function EmergencyModal({ patients, onClose, onSend }) {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '')
  const [alertType, setAlertType] = useState(ALERT_TYPES[0])

  function handleSend() {
    const p = patients.find(x => x.id === selectedPatient)
    onSend({ patientName: p ? `${p.name} – Room ${p.room}` : 'Unknown', type: alertType })
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-emergency">
        <h3>🚨 Emergency Alert</h3>
        <p>Select patient and alert type to notify all available staff and doctors immediately.</p>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Patient</label>
          <select style={{ width: '100%' }} value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} – Room {p.room}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Alert Type</label>
          <select style={{ width: '100%' }} value={alertType} onChange={e => setAlertType(e.target.value)}>
            {ALERT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={handleSend}>🚨 Send Emergency Alert</button>
        </div>
      </div>
    </div>
  )
}
