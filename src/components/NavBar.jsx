import { FiBell, FiLogOut } from 'react-icons/fi'
import { useState } from 'react'
import logoPequeno from '../assets/imgs/logo-pequeno.jpg'
import './NavBar.css'

export default function NavBar({ usuario, onLogout, hasUnreadMessages = false }) {
  const [showDropdown, setShowDropdown] = useState(false)

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
        <button className="notification-btn" title="Notificaciones">
          <FiBell size={20} />
          {hasUnreadMessages && <span className="notification-badge"></span>}
        </button>
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
