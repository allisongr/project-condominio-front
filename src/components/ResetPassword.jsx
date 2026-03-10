import { useState } from 'react'
import axios from 'axios'
import { FiLock, FiLoader, FiCheck, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'react-toastify'
import API_BASE_URL from '../config/api'
import './ResetPassword.css'

export default function ResetPassword({ email, resetToken, onSuccess, onBack }) {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/
  const hasMinLength = password.length >= 8
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)
  const isPasswordValid = hasMinLength && hasNumber && hasSpecial
  const passwordsMatch = password === passwordConfirm && password

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !passwordConfirm) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (!isPasswordValid) {
      toast.error('La contraseña debe tener mínimo 8 caracteres, un número y un símbolo especial (!@#$%^&*)')
      return
    }

    if (password !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: email.toLowerCase(),
        reset_token: resetToken,
        new_password: password,
        new_password_confirmation: passwordConfirm,
      })

      if (response.data.success) {
        setSuccess(true)
        toast.success('¡Contraseña restablecida exitosamente!')
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al restablecer la contraseña'
      toast.error(errorMessage)
      console.error('Error en resetPassword:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <div className="reset-password-header">
          <div className="reset-password-icon">
            <FiLock size={32} />
          </div>
          <h1>Nueva Contraseña</h1>
          <p className="reset-subtitle">
            Crea una nueva contraseña para tu cuenta
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres, número y símbolo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password-btn"
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirmar Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  id="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={loading}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="toggle-password-btn"
                  disabled={loading}
                >
                  {showPasswordConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <p>
                {hasMinLength ? (
                  <>
                    <FiCheck size={16} className="check-icon" /> Mínimo 8 caracteres
                  </>
                ) : (
                  <>
                    <span className="circle" /> Mínimo 8 caracteres
                  </>
                )}
              </p>
              <p>
                {hasNumber ? (
                  <>
                    <FiCheck size={16} className="check-icon" /> Contiene un número
                  </>
                ) : (
                  <>
                    <span className="circle" /> Contiene un número
                  </>
                )}
              </p>
              <p>
                {hasSpecial ? (
                  <>
                    <FiCheck size={16} className="check-icon" /> Contiene símbolo especial
                  </>
                ) : (
                  <>
                    <span className="circle" /> Contiene símbolo especial (!@#$%^&*)
                  </>
                )}
              </p>
              <p>
                {passwordsMatch ? (
                  <>
                    <FiCheck size={16} className="check-icon" /> Las contraseñas coinciden
                  </>
                ) : (
                  <>
                    <span className="circle" /> Las contraseñas deben coincidir
                  </>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <FiLoader size={6} className="spinner" />
                  Procesando...
                </>
              ) : (
                <>
                  Cambiar Contraseña
                  <FiArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="btn-back-link"
            >
              Volver
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div className="success-icon">
              <FiCheck size={48} />
            </div>
            <h3>¡Listo!</h3>
            <p>Tu contraseña ha sido restablecida correctamente.</p>
            <p className="redirect-message">Serás redirigido al login en unos momentos...</p>
          </div>
        )}
      </div>
    </div>
  )
}
