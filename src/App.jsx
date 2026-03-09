import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import ChatApp from './pages/Chat'
import Login from './pages/Login'
import { AdminDashboard } from './pages/Admin'
import { VerifyEmail } from './pages/VerifyEmail'
import PasswordRecovery from './pages/PasswordRecovery'
import Toast from './components/Toast'
import './App.css'

function AppContent() {
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
    }
  }, [])

  const handleLoginSuccess = (usuarioData) => {
    setUsuario(usuarioData)
    // Redirigir según el rol
    if (usuarioData.admin) {
      navigate('/admin')
    } else {
      navigate('/chat')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    setUsuario(null)
    navigate('/login')
  }

  return (
    <div className="app">
      <Toast />
      <Routes>
        <Route
          path="/login"
          element={
            usuario ? (
              <Navigate to={usuario.admin ? '/admin' : '/chat'} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<PasswordRecovery />} />
        <Route
          path="/chat"
          element={
            usuario && !usuario.admin ? (
              <ChatApp usuario={usuario} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            usuario && usuario.admin ? (
              <AdminDashboard usuario={usuario} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            <Navigate
              to={usuario ? (usuario.admin ? '/admin' : '/chat') : '/login'}
              replace
            />
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
