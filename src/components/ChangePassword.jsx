import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi'
import API_BASE_URL from '../config/api'
import './ChangePassword.css'

export default function ChangePassword({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [showing, setShowing] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  const toggleShowPassword = (field) => {
    setShowing({
      ...showing,
      [field]: !showing[field],
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.current_password) {
      newErrors.current_password = 'La contraseña actual es requerida'
    }

    if (!formData.new_password) {
      newErrors.new_password = 'La nueva contraseña es requerida'
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Por favor confirma la nueva contraseña'
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Las contraseñas no coinciden'
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password = 'La nueva contraseña debe ser diferente a la actual'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        {
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response?.data?.success) {
        toast.success('✓ Contraseña actualizada. Sesiones cerradas.')
        
        // Limpiar TODO el localStorage inmediatamente
        localStorage.clear()
        sessionStorage.clear()
        
        // Limpiar headers de axios
        delete axios.defaults.headers.common['Authorization']
        
        console.log('Contraseña cambiada exitosamente - Limpieza completada')
        
        // Pequeño delay para mostrar toast
        setTimeout(() => {
          onSuccess()
          onClose()
          // Redirigir forzado
          window.location.href = '/login'
        }, 300)
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // El servidor rechazó - cambio de contraseña fallido
        toast.error('Cambio de contraseña rechazado. Verifique sus credenciales.')
      } else {
        const errorMessage = err.response?.data?.message || 'Error al cambiar la contraseña'
        toast.error(errorMessage)
      }
      console.error('Error changePassword:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        <div className="change-password-header">
          <h2>Cambiar Contraseña</h2>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={loading}
            title="Cerrar"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="current_password">Contraseña Actual</label>
            <div className="password-input-group">
              <input
                type={showing.current ? 'text' : 'password'}
                id="current_password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña actual"
                disabled={loading}
                className={errors.current_password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => toggleShowPassword('current')}
                disabled={loading}
              >
                {showing.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.current_password && (
              <span className="error-message">{errors.current_password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="new_password">Nueva Contraseña</label>
            <div className="password-input-group">
              <input
                type={showing.new ? 'text' : 'password'}
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Ingresa tu nueva contraseña"
                disabled={loading}
                className={errors.new_password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => toggleShowPassword('new')}
                disabled={loading}
              >
                {showing.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.new_password && (
              <span className="error-message">{errors.new_password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="new_password_confirmation">Confirmar Nueva Contraseña</label>
            <div className="password-input-group">
              <input
                type={showing.confirm ? 'text' : 'password'}
                id="new_password_confirmation"
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                placeholder="Confirma tu nueva contraseña"
                disabled={loading}
                className={errors.new_password_confirmation ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => toggleShowPassword('confirm')}
                disabled={loading}
              >
                {showing.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {errors.new_password_confirmation && (
              <span className="error-message">{errors.new_password_confirmation}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
