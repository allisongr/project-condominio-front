import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import API_BASE_URL from '../config/api'
import './DeviceManagement.css'

export default function DeviceManagement() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionToken, setSessionToken] = useState(null)

  useEffect(() => {
    loadDevices()
    setSessionToken(localStorage.getItem('token'))
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

  if (loading) {
    return <div className="device-management loading">Cargando dispositivos...</div>
  }

  return (
    <div className="device-management">
      <div className="device-management-header">
        <h2>Dispositivos activos</h2>
        <p className="subtitle">Gestiona las sesiones activas en tus dispositivos</p>
      </div>

      {devices.length === 0 ? (
        <div className="no-devices">No hay dispositivos activos</div>
      ) : (
        <>
          <div className="devices-list">
            {devices.map((device) => (
              <div key={device.id} className={`device-item ${device.is_current ? 'current' : ''}`}>
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

          <div className="device-actions">
            <button 
              className="btn-logout-all" 
              onClick={handleLogoutAllDevices}
            >
              Cerrar sesión en todos los dispositivos
            </button>
          </div>
        </>
      )}
    </div>
  )
}
