import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import PatientCard from '../components/PatientCard'

export default function Patients({ nurse, onOpenPatient }) {
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.getPatients(nurse.id)
      .then(pts => setPatients(pts.sort((a, b) => a.priority - b.priority)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  return (
    <div>
      <div className="section-heading">🧑‍⚕️ Patient List</div>
      <p className="page-desc">Click on a patient card to view full details, medicines, and tasks.</p>
      {patients.map(p => (
        <PatientCard key={p.id} patient={p} onClick={() => onOpenPatient(p.id)} />
      ))}
    </div>
  )
}
