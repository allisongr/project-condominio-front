import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { FiCode, FiLoader, FiArrowRight } from 'react-icons/fi'
import { toast } from 'react-toastify'
import API_BASE_URL from '../config/api'
import './VerifyResetCode.css'

export default function VerifyResetCode({ email, onCodeVerified, onBackEdit }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutos en segundos
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleCodeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 6) value = value.slice(0, 6)
    
    setCode(value)

    // Si tiene 6 dígitos, enviar automáticamente
    if (value.length === 6) {
      handleVerifyCode(value)
    }
  }
  
  const displayCode = code.split('').join(' ') || '• • • • • •'

  const handleVerifyCode = async (codeValue) => {
    try {
      setLoading(true)
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-reset-code`, {
        email: email.toLowerCase(),
        code: codeValue || code,
      })

      if (response.data.success) {
        toast.success('Código verificado correctamente')
        onCodeVerified(email, response.data.reset_token)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Código inválido o expirado'
      toast.error(errorMessage)
      setCode('')
      inputRef.current?.focus()
      console.error('Error en verifyResetCode:', err)
    } finally {
      setLoading(false)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="verify-reset-code-container">
      <div className="verify-reset-code-box">
        <div className="verify-reset-code-header">
          <div className="verify-code-icon">
            <FiCode size={32} />
          </div>
          <h1>Ingresa el Código</h1>
          <p className="verify-subtitle">
            Hemos enviado un código de 6 dígitos a {email}
          </p>
        </div>

        <div className="code-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength="6"
            value={code}
            onChange={handleCodeChange}
            disabled={loading || timeLeft === 0}
            className="code-input"
            placeholder="000000"
            style={{
              letterSpacing: code.length > 0 ? '12px' : '0',
              fontSize: code.length > 0 ? '32px' : '28px'
            }}
          />
          <div className="timer">
            {timeLeft > 0 ? (
              <span className={minutes === 0 && seconds < 60 ? 'warning' : ''}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            ) : (
              <span className="expired">Código expirado</span>
            )}
          </div>
        </div>

        <p className="code-info">
          Ingresa el código que recibiste en tu correo. Se autenticará automáticamente al completar los 6 dígitos.
        </p>

        <div className="code-actions">
          <button
            onClick={onBackEdit}
            disabled={loading}
            className="btn-back-link"
          >
            Usar otro correo
          </button>
        </div>
      </div>
    </div>
  )
}
