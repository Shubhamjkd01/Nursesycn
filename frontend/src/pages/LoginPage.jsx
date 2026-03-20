import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, error, loading } = useAuth()
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    login(staffId, password)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="logo-icon">🏥</span>
          <h2>NurseSync</h2>
          <p>Hospital Task Management System</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Staff ID</label>
            <input
              type="text"
              placeholder="e.g. N001"
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? '⏳ Logging in...' : '🔐 Login to Dashboard'}
          </button>
          {error && <div className="login-error">❌ {error}</div>}
        </form>
        <div className="demo-hint">
          <b>Demo Accounts:</b>
          N001 / nurse123 &nbsp;|&nbsp; N002 / nurse123 &nbsp;|&nbsp; N003 / nurse123
        </div>
      </div>
    </div>
  )
}
