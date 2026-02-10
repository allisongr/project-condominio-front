import { useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { CSSTransition } from 'react-transition-group'
import LoadingButton from '../../components/LoadingButton'
import logoCompleto from '../../assets/imgs/logo-completo.jpg'
import './Login.css'
import './LoginTransitions.css'

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nodeRef = useRef(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const loadingToastId = toast.loading('Iniciando sesión...')

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password,
      })

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      localStorage.setItem('token', response.data.token)

      toast.dismiss(loadingToastId)
      toast.success('¡Bienvenido! Iniciando sesión...')
      
      // Pequeño delay para que se vea la animación de éxito
      setTimeout(() => {
        onLoginSuccess(response.data.usuario)
      }, 500)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión'
      setError(errorMessage)
      toast.dismiss(loadingToastId)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <CSSTransition
        in={true}
        appear={true}
        timeout={500}
        classNames="login-box"
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="login-box">
        <div className="login-header">
          <img src={logoCompleto} alt="Logo" className="login-logo" />
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

          <LoadingButton
            type="submit"
            loading={loading}
            className="login-btn"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </LoadingButton>
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
      </CSSTransition>
    </div>
  )
}
