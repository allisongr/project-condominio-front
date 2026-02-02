import { FiBell, FiLogOut } from 'react-icons/fi'
import { useState } from 'react'
import logoPequeno from '../assets/imgs/logo-pequeno.jpg'
import './NavBar.css'

export default function NavBar({ usuario, onLogout, hasUnreadMessages = false, unreadMessages = [], onNotificationClick }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0)}${apellido?.charAt(0)}`.toUpperCase()
  }

  const handleLogout = () => {
    setShowDropdown(false)
    onLogout()
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <img src={logoPequeno} alt="Condominio Chat" className="logo-img" />
        </div>
      </div>

      <div className="navbar-center">
        <ul className="nav-menu">
          <li><a href="#terrenos">Terrenos</a></li>
          <li><a href="#usuarios">Usuarios</a></li>
          <li><a href="#pagos">Pagos</a></li>
          <li><a href="#avisos">Avisos</a></li>
          <li className="active"><a href="#chat">Chat</a></li>
        </ul>
      </div>

      <div className="navbar-right">
        <div className="notification-container">
          <button 
            className="notification-btn" 
            title="Notificaciones"
            onClick={() => setShowNotifications(!showNotifications)}
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
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
