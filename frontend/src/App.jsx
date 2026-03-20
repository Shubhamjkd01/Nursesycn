import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import LoginPage from './pages/LoginPage'
import AppShell  from './components/AppShell'

function Inner() {
  const { nurse } = useAuth()
  return nurse ? <AppShell /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Inner />
      </ToastProvider>
    </AuthProvider>
  )
}
