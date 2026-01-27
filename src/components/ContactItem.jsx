import Avatar from './Avatar'
import './ContactItem.css'

export default function ContactItem({ contacto, isSelected, onClick }) {
  return (
    <div
      className={`contact-item ${isSelected ? 'active' : ''}`}
      onClick={onClick}
    >
      <Avatar nombre={contacto.nombre} apellido={contacto.apellido} id={contacto.id} size="medium" />
      
      <div className="contact-info">
        <div className="contact-header">
          <h3 className="contact-name">{contacto.nombre} {contacto.apellido}</h3>
          {contacto.online && <span className="online-indicator"></span>}
        </div>
        <p className="contact-preview">{contacto.mensaje}</p>
      </div>
    </div>
  )
}
