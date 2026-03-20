import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import { Chart } from 'chart.js/auto'

export default function Analytics({ nurse }) {
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)

  const condRef    = useRef(null); const condInst    = useRef(null)
  const compRef    = useRef(null); const compInst    = useRef(null)
  const medRef     = useRef(null); const medInst     = useRef(null)
  const hourlyRef  = useRef(null); const hourlyInst  = useRef(null)

  useEffect(() => {
    api.getPatients(nurse.id).then(pts => { setPatients(pts); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!patients.length) return

    const critical = patients.filter(p => p.condition === 'Critical').length
    const stable   = patients.filter(p => p.condition === 'Stable').length
    const normal   = patients.filter(p => p.condition === 'Normal').length

    if (condInst.current) condInst.current.destroy()
    condInst.current = new Chart(condRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Critical','Stable','Normal'],
        datasets: [{ data:[critical,stable,normal], backgroundColor:['#dc2626','#7c3aed','#16a34a'], borderWidth:0 }]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } } }
    })

    if (compInst.current) compInst.current.destroy()
    compInst.current = new Chart(compRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: patients.map(p => p.name.split(' ')[0]),
        datasets: [
          { label:'Done',    data: patients.map(p => p.diet.filter(d=>d.done).length  + p.medicines.filter(m=>m.done).length),  backgroundColor:'#16a34a', borderRadius:4 },
          { label:'Pending', data: patients.map(p => p.diet.filter(d=>!d.done).length + p.medicines.filter(m=>!m.done).length), backgroundColor:'#dc2626', borderRadius:4 },
        ]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } }, scales:{ x:{stacked:true}, y:{stacked:true, grid:{color:'#f1f5f9'}} } }
    })

    const medDone  = patients.flatMap(p=>p.medicines).filter(m=>m.done).length
    const medPend  = patients.flatMap(p=>p.medicines).filter(m=>!m.done).length
    const dietDone = patients.flatMap(p=>p.diet).filter(d=>d.done).length
    const dietPend = patients.flatMap(p=>p.diet).filter(d=>!d.done).length

    if (medInst.current) medInst.current.destroy()
    medInst.current = new Chart(medRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Medicine Given','Medicine Pending','Diet Given','Diet Pending'],
        datasets: [{ data:[medDone,medPend,dietDone,dietPend], backgroundColor:['#16a34a','#dc2626','#2563eb','#f59e0b'], borderRadius:6 }]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ grid:{ color:'#f1f5f9' } } } }
    })

    if (hourlyInst.current) hourlyInst.current.destroy()
    hourlyInst.current = new Chart(hourlyRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM'],
        datasets: [{
          label: 'Tasks Completed',
          data: [2,4,3,5,6,4,3,5,4,2,3],
          borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,0.08)',
          fill:true, tension:.4, pointBackgroundColor:'#2563eb', pointRadius:4
        }]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ grid:{ color:'#f1f5f9' } } } }
    })
  }, [patients])

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  return (
    <div>
      <div className="section-heading">📈 Analytics &amp; Reports</div>
      <p className="page-desc">Shift performance overview and task completion analytics.</p>
      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom:14 }}><span className="icon">🍩</span> Patient Condition Distribution</div>
          <div className="chart-container"><canvas ref={condRef} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom:14 }}><span className="icon">📊</span> Per-Patient Task Completion</div>
          <div className="chart-container"><canvas ref={compRef} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom:14 }}><span className="icon">💊</span> Medicine vs Diet Completion</div>
          <div className="chart-container"><canvas ref={medRef} /></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom:14 }}><span className="icon">⏱️</span> Hourly Task Activity</div>
          <div className="chart-container"><canvas ref={hourlyRef} /></div>
        </div>
      </div>
    </div>
  )
}
