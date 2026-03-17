import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import AuthMiddleware from './middleware/authMiddleware'
import ChatApp from './pages/Chat'
import Login from './pages/Login'
import { AdminDashboard } from './pages/Admin'
import { VerifyEmail } from './pages/VerifyEmail'
import PasswordRecovery from './pages/PasswordRecovery'
import Toast from './components/Toast'
import Spinner from './components/Spinner'
import './App.css'

// Configurar interceptores de axios
AuthMiddleware.setupAxiosInterceptor()

function AppContent() {
  const { usuario, loading, isAuthenticated, isAdmin, login, logout } = useAuth()
  const navigate = useNavigate()

  const handleLoginSuccess = (usuarioData) => {
    // Actualizar contexto de autenticación
    login(usuarioData)
    // Redirigir según el rol
    if (usuarioData.admin === 1 || usuarioData.admin === true) {
      navigate('/admin')
    } else {
      navigate('/chat')
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner />
      </div>
    )
  }

  return (
    <div className="app">
      <Toast />
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin() ? '/admin' : '/chat'} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<PasswordRecovery />} />

        {/* Rutas protegidas - Usuario regular */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatApp usuario={usuario} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas - Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard usuario={usuario} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated ? (isAdmin() ? '/admin' : '/chat') : '/login'
              }
              replace
            />
          }
        />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
