import { useState } from 'react'
import axios from 'axios'
import logoPequeno from '../assets/imgs/logo-pequeno.jpg'
import './Login.css'

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password,
      })

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      localStorage.setItem('token', response.data.token)

      onLoginSuccess(response.data.usuario)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src={logoPequeno} alt="Logo" className="login-logo" />
          <h1>Condominio Chat</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="register-link"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
