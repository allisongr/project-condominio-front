import { useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { CSSTransition } from 'react-transition-group'
import LoadingButton from '../../components/LoadingButton'
import logoCompleto from '../../assets/imgs/logo-completo.jpg'
import './Register.css'
import './RegisterTransitions.css'

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [apellido_p, setApellidoP] = useState('')
  const [apellido_m, setApellidoM] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nodeRef = useRef(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      const errorMessage = 'Las contraseñas no coinciden'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setLoading(true)
    const loadingToastId = toast.loading('Registrando usuario...')

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        nombre,
        apellido_p,
        apellido_m,
        celular,
        email,
        password,
      })

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      localStorage.setItem('token', response.data.token)

      toast.dismiss(loadingToastId)
      toast.success('¡Registro exitoso! Bienvenido...')
      
      // Pequeño delay para que se vea la animación de éxito
      setTimeout(() => {
        onRegisterSuccess(response.data.usuario)
      }, 500)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al registrarse'
      setError(errorMessage)
      toast.dismiss(loadingToastId)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <CSSTransition
        in={true}
        appear={true}
        timeout={500}
        classNames="register-box"
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="register-box">
        <div className="register-header">
          <img src={logoCompleto} alt="Logo" className="register-logo" />
          <p>Completa el formulario para registrarte</p>
        </div>

        {error && <div className="register-error-message">{error}</div>}

        <form className="register-form" onSubmit={handleRegister}>
          <div className="register-form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="apellido_p">Apellido Paterno</label>
            <input
              id="apellido_p"
              type="text"
              value={apellido_p}
              onChange={(e) => setApellidoP(e.target.value)}
              required
              placeholder="Apellido paterno"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="apellido_m">Apellido Materno</label>
            <input
              id="apellido_m"
              type="text"
              value={apellido_m}
              onChange={(e) => setApellidoM(e.target.value)}
              placeholder="Apellido materno"
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="celular">Celular</label>
            <input
              id="celular"
              type="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="Número de celular"
            />
          </div>

          <div className="register-form-group">
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

          <div className="register-form-group">
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

          <div className="register-form-group">
            <label htmlFor="passwordConfirm">Confirmar Contraseña</label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            className="register-btn"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </LoadingButton>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="login-link"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
        </div>
      </CSSTransition>
    </div>
  )
}
