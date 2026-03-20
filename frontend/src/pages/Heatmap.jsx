import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import { Chart } from 'chart.js/auto'

const heatLabels = ['Low Activity', 'Normal Load', 'Moderate', 'High Demand', 'Critical!']

function getHeatLevel(score) {
  if (score >= 90) return 4
  if (score >= 70) return 3
  if (score >= 50) return 2
  if (score >= 30) return 1
  return 0
}

export default function Heatmap() {
  const [wards,   setWards]   = useState([])
  const [loading, setLoading] = useState(true)
  const chartRef  = useRef(null)
  const chartInst = useRef(null)

  useEffect(() => {
    api.getWards().then(w => { setWards(w); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!wards.length || !chartRef.current) return
    if (chartInst.current) chartInst.current.destroy()
    chartInst.current = new Chart(chartRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: wards.map(w => w.name),
        datasets: [{
          label: 'Workload Score',
          data: wards.map(w => w.score),
          backgroundColor: wards.map(w => {
            const l = getHeatLevel(w.score)
            return ['#dcfce7','#fef9c3','#fed7aa','#fca5a5','#ef4444'][l]
          }),
          borderColor: wards.map(w => {
            const l = getHeatLevel(w.score)
            return ['#16a34a','#ca8a04','#ea580c','#dc2626','#991b1b'][l]
          }),
          borderWidth: 1.5, borderRadius: 6,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
          x: { ticks: { font: { size: 10 } }, grid: { display: false } }
        }
      }
    })
  }, [wards])

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>

  const sorted = [...wards].sort((a, b) => b.score - a.score)

  return (
    <div>
      <div className="section-heading">🗺️ Ward Activity Heatmap</div>
      <p className="page-desc">Real-time workload intensity across hospital wards. Darker = higher workload.</p>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><span className="icon">🌡️</span> Hospital Ward Overview</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
            <span style={{ background: '#dcfce7', padding: '2px 8px', borderRadius: 10, color: '#166534' }}>Low</span>
            <span style={{ background: '#fef9c3', padding: '2px 8px', borderRadius: 10, color: '#854d0e' }}>Medium</span>
            <span style={{ background: '#fed7aa', padding: '2px 8px', borderRadius: 10, color: '#9a3412' }}>High</span>
            <span style={{ background: '#dc2626', padding: '2px 8px', borderRadius: 10, color: '#fff' }}>Critical</span>
          </div>
        </div>
        <div className="heatmap-grid">
          {wards.map(w => {
            const lvl = getHeatLevel(w.score)
            return (
              <div key={w.name} className={`ward-cell heat-${lvl}`} title={`${w.name}: ${w.score}% workload`}>
                <div className="ward-tag">{heatLabels[lvl]}</div>
                <div className="ward-name">🏥 {w.name}</div>
                <div className="ward-score">{w.score}%</div>
                <div className="ward-label">{w.patients} patients · {w.pending} tasks</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}><span className="icon">📊</span> Ward Workload Chart</div>
          <div className="chart-container"><canvas ref={chartRef} /></div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}><span className="icon">🏥</span> Ward Status Summary</div>
          {sorted.map((w, i) => {
            const lvl = getHeatLevel(w.score)
            const bg  = lvl >= 3 ? 'var(--danger-light)' : lvl >= 2 ? 'var(--warning-light)' : 'var(--bg)'
            const barC = lvl >= 3 ? 'red' : lvl >= 2 ? 'orange' : ''
            return (
              <div key={w.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, marginBottom:6, background:bg }}>
                <div>
                  <span style={{ fontWeight:700, fontSize:13 }}>{i+1}. {w.name}</span>
                  <span style={{ fontSize:11, color:'var(--text-secondary)', marginLeft:8 }}>{w.nurses} nurses</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div className="progress-wrap" style={{ width:80, margin:0 }}>
                    <div className={`progress-bar ${barC}`} style={{ width: w.score + '%' }} />
                  </div>
                  <span style={{ fontWeight:700, fontSize:12 }}>{w.score}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
