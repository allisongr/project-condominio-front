import { FiBell, FiLogOut, FiLock, FiSmartphone } from 'react-icons/fi'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import logoPequeno from '../assets/imgs/logo-pequeno.jpg'
import ChangePassword from './ChangePassword'
import DeviceManagement from './DeviceManagement'
import './NavBar.css'

export default function NavBar({ usuario, onLogout, hasUnreadMessages = false, unreadMessages = [], onNotificationClick, onNotificationDropdownOpen, isAdmin = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showDevices, setShowDevices] = useState(false)

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0)}${apellido?.charAt(0)}`.toUpperCase()
  }

  const handleLogout = () => {
    setShowDropdown(false)
    onLogout()
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleChangePasswordSuccess = () => {
    // El logout ya ocurre desde el componente ChangePassword
    // Solo asegurarse de que onLogout se ejecute
    setShowChangePassword(false)
    onLogout()
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo">
            <img src={logoPequeno} alt="Condominio Chat" className="logo-img" />
          </div>
        </div>

        <div className="navbar-center">
          <ul className="nav-menu">
            {isAdmin ? (
              <>
                <li className={location.pathname === '/admin' ? 'active' : ''}>
                  <button 
                    onClick={() => handleNavigation('/admin')}
                    className="nav-link"
                  >
                    Administración de Usuarios
                  </button>
                </li>
                <li className={location.pathname === '/chat' ? 'active' : ''}>
                  <button 
                    onClick={() => handleNavigation('/chat')}
                    className="nav-link"
                  >
                    Chat
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><a href="#terrenos">Terrenos</a></li>
                <li><a href="#usuarios">Usuarios</a></li>
                <li><a href="#pagos">Pagos</a></li>
                <li><a href="#avisos">Avisos</a></li>
                <li><a href="#chat">Chat</a></li>
              </>
            )}
          </ul>
        </div>

        <div className="navbar-right">
          <div className="notification-container">
            <button 
              className="notification-btn" 
              title="Notificaciones"
              onClick={() => {
                const newState = !showNotifications
                setShowNotifications(newState)
                if (newState && onNotificationDropdownOpen) {
                  onNotificationDropdownOpen()
                }
              }}
            >
              <FiBell size={20} />
              {hasUnreadMessages && <span className="notification-badge"></span>}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notificaciones</h3>
                  {unreadMessages.length > 0 && (
                    <span className="unread-count">{unreadMessages.length}</span>
                  )}
                </div>
                <div className="notifications-list">
                  {unreadMessages.length === 0 ? (
                    <div className="no-notifications">
                      <p>No hay mensajes nuevos</p>
                    </div>
                  ) : (
                    unreadMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className="notification-item"
                        onClick={() => {
                          setShowNotifications(false)
                          onNotificationClick?.(msg)
                        }}
                      >
                        <div className="notification-avatar">
                          {msg.remitente?.nombre?.charAt(0)}{msg.remitente?.apellido?.charAt(0)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-sender">{msg.remitente?.nombre}</div>
                          <div className="notification-message">{msg.contenido}</div>
                          <div className="notification-time">{msg.fecha}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="user-profile-container">
            <button 
              className="user-profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              title={usuario.nombre}
            >
              <div className="user-avatar" style={{ backgroundColor: '#2d7a6a' }}>
                {getInitials(usuario.nombre, usuario.apellido)}
              </div>
              <div className="user-info">
                <div className="user-rol">{usuario.rol}</div>
                <div className="user-name">{usuario.nombre}</div>
              </div>
            </button>
            
            {showDropdown && (
              <div className="user-dropdown">
                <button 
                  className="dropdown-btn"
                  onClick={() => {
                    setShowChangePassword(true)
                    setShowDropdown(false)
                  }}
                  title="Cambiar contraseña"
                >
                  <FiLock size={16} />
                  <span>Cambiar Contraseña</span>
                </button>
                <button 
                  className="dropdown-btn"
                  onClick={() => {
                    setShowDevices(true)
                    setShowDropdown(false)
                  }}
                  title="Gestionar dispositivos"
                >
                  <FiSmartphone size={16} />
                  <span>Mis Dispositivos</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="logout-btn" onClick={handleLogout}>
                  <FiLogOut size={16} />
                  <span>Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showChangePassword && (
        <ChangePassword 
          onClose={() => setShowChangePassword(false)}
          onSuccess={handleChangePasswordSuccess}
        />
      )}

      {showDevices && (
        <DeviceManagement 
          onClose={() => setShowDevices(false)}
        />
      )}
    </>
  )
}
