import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FiX, FiSmartphone, FiLogOut } from 'react-icons/fi'
import API_BASE_URL from '../config/api'
import './DeviceManagement.css'

export default function DeviceManagement({ onClose }) {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/auth/devices`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        setDevices(response.data.devices)
      }
    } catch (error) {
      console.error('Error al cargar dispositivos:', error)
      toast.error('No se pudieron cargar los dispositivos')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    if (!window.confirm('¿Estás seguro? Se cerrará la sesión en todos los dispositivos.')) {
      return
    }

    try {
      setLoggingOutAll(true)
      const response = await axios.post(`${API_BASE_URL}/api/auth/logout-all-devices`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.data.success) {
        toast.success('Sesión cerrada en todos los dispositivos')
        // Redirigir al login
        localStorage.removeItem('usuario')
        localStorage.removeItem('token')
        localStorage.removeItem('loginTime')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión en todos los dispositivos')
    } finally {
      setLoggingOutAll(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="device-management-overlay">
      <div className="device-management-modal">
        <div className="device-management-header">
          <div className="header-title">
            <FiSmartphone size={24} />
            <h2>Mis Dispositivos</h2>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={loading}
            title="Cerrar"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="device-management-content">
          {loading ? (
            <div className="loading-state">
              <p>Cargando dispositivos...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="no-devices">
              <p>No hay dispositivos activos</p>
            </div>
          ) : (
            <>
              <p className="subtitle">Gestiona las sesiones activas en tus dispositivos</p>
              
              <div className="devices-list">
                {devices.map((device) => (
                  <div key={device.id} className={`device-item ${device.is_current ? 'current' : ''}`}>
                    <div className="device-icon">
                      <FiSmartphone size={20} />
                    </div>
                    <div className="device-info">
                      <div className="device-name">
                        {device.nombre}
                        {device.is_current && <span className="badge-current">Este dispositivo</span>}
                      </div>
                      <div className="device-dates">
                        <p className="date-login">
                          Conectado: {formatDate(device.created_at)}
                        </p>
                        {device.last_used_at && (
                          <p className="date-used">
                            Último uso: {formatDate(device.last_used_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {devices.length > 0 && (
          <div className="device-management-footer">
            <button 
              className="btn-logout-all" 
              onClick={handleLogoutAllDevices}
              disabled={loggingOutAll}
            >
              <FiLogOut size={16} />
              {loggingOutAll ? 'Procesando...' : 'Cerrar sesión en todos'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
