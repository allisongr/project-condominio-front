import { FiEdit2 } from 'react-icons/fi'
import './ContactList.css'
import ContactItem from './ContactItem'

export default function ContactList({ contactos, selectedContact, onSelectContact }) {
  return (
    <div className="contact-list">
      <div className="contacts-header">
        <h3>Mensajes</h3>
      </div>

      <div className="contacts-scroll">
        {contactos.map((contacto) => (
          <ContactItem
            key={contacto.id}
            contacto={contacto}
            isSelected={selectedContact?.id === contacto.id}
            onClick={() => onSelectContact(contacto)}
          />
        ))}
      </div>

      <button className="new-chat-btn" title="Nuevo mensaje">
        <FiEdit2 size={20} />
      </button>
    </div>
  )
}
