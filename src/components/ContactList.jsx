import { FiEdit2 } from 'react-icons/fi'
import './ContactList.css'

export default function ContactList({ contactos, selectedContact, onSelectContact }) {
  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0)}${apellido?.charAt(0)}`.toUpperCase()
  }

  const getAvatarColor = (id) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    return colors[id % colors.length]
  }

  return (
    <div className="contact-list">
      <div className="contacts-header">
        <h3>Mensajes</h3>
      </div>

      <div className="contacts-scroll">
        {contactos.map((contacto) => (
          <div
            key={contacto.id}
            className={`contact-item ${selectedContact?.id === contacto.id ? 'active' : ''}`}
            onClick={() => onSelectContact(contacto)}
          >
            <div className="contact-avatar-wrapper">
              <div
                className="contact-avatar"
                style={{ backgroundColor: getAvatarColor(contacto.id) }}
              >
                {getInitials(contacto.nombre, contacto.apellido)}
              </div>
              {contacto.online && <span className="online-badge"></span>}
            </div>

            <div className="contact-info">
              <div className="contact-name">{`${contacto.nombre} ${contacto.apellido}`}</div>
              <div className="contact-preview">{contacto.mensaje}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="new-chat-btn" title="Nuevo mensaje">
        <FiEdit2 size={20} />
      </button>
    </div>
  )
}
