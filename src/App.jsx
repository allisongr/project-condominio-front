import { useState, useEffect } from 'react'
import ChatApp from './components/ChatApp'
import Login from './components/Login'
import Register from './components/Register'
import './App.css'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [view, setView] = useState('login') // 'login', 'register', or 'chat'

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const usuarioGuardado = localStorage.getItem('usuario')
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado))
      setView('chat')
    }
  }, [])

  const handleLoginSuccess = (usuarioData) => {
    setUsuario(usuarioData)
    setView('chat')
  }

  const handleLogout = () => {
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
    setUsuario(null)
    setView('login')
  }

  if (!usuario) {
    return (
      <div className="app">
        {view === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setView('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <ChatApp usuario={usuario} onLogout={handleLogout} />
    </div>
  )
}

export default App
