import Avatar from './Avatar'
import './ContactItem.css'

export default function ContactItem({ contacto, isSelected, onClick, hasNewMessage = false, lastMessage, currentUserId }) {
  const getPreviewText = () => {
    if (!lastMessage) return 'Sin mensajes'
    
    const prefix = lastMessage.remitente_id === currentUserId ? 'Tú: ' : ''
    return prefix + lastMessage.contenido
  }
  
  return (
    <div
      className={`contact-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
    >
      <Avatar nombre={contacto.nombre} apellido={contacto.apellido} id={contacto.id} size="medium" />
      
      <div className="contact-info">
        <div className="contact-header">
          <h3 className="contact-name">{contacto.nombre} {contacto.apellido}</h3>
          <div className="contact-status">
            {hasNewMessage && <span className="new-message-indicator"></span>}
            {contacto.online && <span className="online-indicator"></span>}
          </div>
        </div>
        <p className="contact-preview">{getPreviewText()}</p>
      </div>
    </div>
  )
}
