import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../utils/api'

import Dashboard     from '../pages/Dashboard'
import Patients      from '../pages/Patients'
import PatientDetail from '../pages/PatientDetail'
import Heatmap       from '../pages/Heatmap'
import Transfer      from '../pages/Transfer'
import DoctorPanel   from '../pages/DoctorPanel'
import ShiftHandoff  from '../pages/ShiftHandoff'
import Analytics     from '../pages/Analytics'
import EmergencyModal from './EmergencyModal'

const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'patients',  icon: '🧑‍⚕️', label: 'Patients' },
  { key: 'heatmap',   icon: '🗺️',  label: 'Ward Heatmap' },
  { key: 'transfer',  icon: '🔄',  label: 'Task Transfer' },
  { key: 'doctor',    icon: '👨‍⚕️', label: 'Doctor Panel' },
  { key: 'handoff',   icon: '📋',  label: 'Shift Handoff' },
  { key: 'analytics', icon: '📈',  label: 'Analytics' },
]

const TITLES = {
  dashboard: '📊 Dashboard', patients: '🧑‍⚕️ Patient List',
  patientDetail: '🧑‍⚕️ Patient Detail', heatmap: '🗺️ Ward Heatmap',
  transfer: '🔄 Task Transfer', doctor: '👨‍⚕️ Doctor Panel',
  handoff: '📋 Shift Handoff', analytics: '📈 Analytics',
}

export default function AppShell() {
  const { nurse, logout } = useAuth()
  const showToast = useToast()

  const [page, setPage]             = useState('dashboard')
  const [currentPatientId, setCPID] = useState(null)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [emergencyOpen, setEmgOpen] = useState(false)
  const [notifications, setNotifs]  = useState([])
  const [patients, setPatients]     = useState([])
  const [time, setTime]             = useState('')

  // fetch notifications
  useEffect(() => {
    api.getNotifications().then(setNotifs).catch(() => {})
  }, [])

  // fetch patients for emergency dropdown + workload chip
  useEffect(() => {
    if (nurse) api.getPatients(nurse.id).then(setPatients).catch(() => {})
  }, [nurse])

  // clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  function navigate(key) {
    setPage(key)
    setNotifOpen(false)
  }

  function openPatient(id) {
    setCPID(id)
    setPage('patientDetail')
  }

  function addNotification(n) {
    setNotifs(prev => [n, ...prev])
    api.addNotification(n).catch(() => {})
  }

  async function handleLogout() {
    navigate('handoff')
    showToast('Shift handoff generated. Logging out...', 'success')
    setTimeout(() => logout(), 2200)
  }

  async function sendEmergency({ patientName, type }) {
    setEmgOpen(false)
    addNotification({ type: 'urgent', msg: `🚨 EMERGENCY: ${type} – ${patientName}` })
    showToast('🚨 Emergency alert sent! All staff notified.', 'error')
    setNotifOpen(true)
  }

  const urgentCount = notifications.filter(n => n.type === 'urgent').length || notifications.length

  function renderPage() {
    switch (page) {
      case 'dashboard':     return <Dashboard nurse={nurse} onOpenPatient={openPatient} addNotification={addNotification} showToast={showToast} />
      case 'patients':      return <Patients  nurse={nurse} onOpenPatient={openPatient} />
      case 'patientDetail': return <PatientDetail nurse={nurse} patientId={currentPatientId} onBack={() => navigate('patients')} addNotification={addNotification} showToast={showToast} />
      case 'heatmap':       return <Heatmap />
      case 'transfer':      return <Transfer nurse={nurse} showToast={showToast} addNotification={addNotification} />
      case 'doctor':        return <DoctorPanel />
      case 'handoff':       return <ShiftHandoff nurse={nurse} />
      case 'analytics':     return <Analytics nurse={nurse} />
      default:              return null
    }
  }

  return (
    <div>
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <h2>🏥 NurseSync</h2>
          <p>Hospital Task Management</p>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{nurse?.name?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{nurse?.name}</span>
            <span className="user-role">ID: {nurse?.id}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div
              key={n.key}
              className={`nav-item ${page === n.key || (n.key === 'patients' && page === 'patientDetail') ? 'active' : ''}`}
              onClick={() => navigate(n.key)}
            >
              <span className="nav-icon">{n.icon}</span> {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>🚪 Logout & Generate Handoff</button>
        </div>
      </div>

      {/* HEADER */}
      <div className="main-header">
        <div className="header-title">{TITLES[page] || ''}</div>
        <div className="header-right">
          <div className="workload-chip">👤 {patients.length} Patients Assigned</div>
          <button className="emergency-btn" onClick={() => setEmgOpen(true)}>🚨 Emergency Alert</button>
          <div className="notif-bell" onClick={() => setNotifOpen(o => !o)}>
            🔔
            <div className="notif-badge">{urgentCount}</div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION PANEL */}
      <div className={`notif-panel ${notifOpen ? 'open' : ''}`}>
        <div className="notif-panel-header">
          <h3>🔔 Notifications</h3>
          <button className="notif-close" onClick={() => setNotifOpen(false)}>✕</button>
        </div>
        <div className="notif-list">
          {notifications.map((n, i) => (
            <div key={i} className={`notif-item ${n.type}`}>
              {n.msg}
              <div className="notif-time">Just now</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {renderPage()}
      </div>

      {/* EMERGENCY MODAL */}
      {emergencyOpen && (
        <EmergencyModal
          patients={patients}
          onClose={() => setEmgOpen(false)}
          onSend={sendEmergency}
        />
      )}
    </div>
  )
}
