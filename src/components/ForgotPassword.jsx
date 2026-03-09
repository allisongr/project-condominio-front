import { useState } from 'react'
import axios from 'axios'
import { FiMail, FiArrowRight, FiLoader } from 'react-icons/fi'
import { toast } from 'react-toastify'
import API_BASE_URL from '../config/api'
import './ForgotPassword.css'

export default function ForgotPassword({ onCodeSent, onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu correo electrónico')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: email.toLowerCase(),
      })

      if (response.data.success) {
        setSubmitted(true)
        toast.success('Se ha enviado un código a tu correo electrónico')
        setTimeout(() => {
          onCodeSent(email)
        }, 1500)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al procesar la solicitud'
      toast.error(errorMessage)
      console.error('Error en forgotPassword:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="forgot-password-header">
          <div className="forgot-password-icon">
            <FiMail size={32} />
          </div>
          <h1>Recuperar Contraseña</h1>
          <p className="forgot-password-subtitle">
            Ingresa tu correo electrónico para recibir un código de recuperación
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-send-code"
            >
              {loading ? (
                <>
                  <FiLoader size={2} className="spinner" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar Código
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
              Volver al Login
            </button>
          </form>
        ) : (
          <div className="submitted-message">
            <div className="checkmark">✓</div>
            <p>Hemos enviado un código a <strong>{email}</strong></p>
            <p className="code-info">El código expirará en 15 minutos</p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn-resend"
            >
              Cambiar correo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
