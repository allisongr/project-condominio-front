import { FiBell } from 'react-icons/fi'
import './NavBar.css'

export default function NavBar({ usuario }) {
  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0)}${apellido?.charAt(0)}`.toUpperCase()
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <span>🏢</span>
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
        </button>
        <div className="user-profile">
          <div className="user-avatar" style={{ backgroundColor: '#667eea' }}>
            {getInitials(usuario.nombre, usuario.apellido)}
          </div>
          <div className="user-info">
            <div className="user-rol">{usuario.rol}</div>
            <div className="user-name">{usuario.nombre}</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
