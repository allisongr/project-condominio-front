import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi'
import API_BASE_URL from '../../config/api'
import './VerifyEmail.css'
import logoCompleto from '../../assets/imgs/logo-completo.jpg'

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verificando tu correo electrónico...')
  const navigate = useNavigate()

  useEffect(() => {
    verifyEmail()
  }, [])

  const verifyEmail = async () => {
    try {
      // Obtener el token de la URL
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Token de verificación no encontrado')
        return
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
        token,
      })

      setStatus('success')
      setMessage('¡Tu correo ha sido verificado exitosamente!')

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Error al verificar el correo electrónico')
    }
  }

  return (
    <div className="verify-email-container">
      <div className="verify-email-box">
        <img src={logoCompleto} alt="Logo" className="verify-email-logo" />

        <div className={`verify-email-content ${status}`}>
          {status === 'verifying' && (
            <div className="verify-spinner">
              <FiLoader className="spinner-icon" />
            </div>
          )}

          {status === 'success' && (
            <div className="verify-icon success"><FiCheckCircle /></div>
          )}

          {status === 'error' && (
            <div className="verify-icon error"><FiXCircle /></div>
          )}

          <h1>{status === 'verifying' ? 'Verificando...' : status === 'success' ? '¡Éxito!' : 'Error'}</h1>
          <p>{message}</p>

          {status === 'success' && (
            <p className="verify-redirect">Serás redirigido al inicio de sesión...</p>
          )}

          {status === 'error' && (
            <button onClick={() => navigate('/login')} className="btn-back-login">
              Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
