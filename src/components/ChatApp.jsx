import { useState, useEffect } from 'react'
import axios from 'axios'
import './ChatApp.css'
import ChatWindow from './ChatWindow'
import ContactList from './ContactList'
import NavBar from './NavBar'

export default function ChatApp({ usuario, onLogout }) {
  const [contactos, setContactos] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isLoadingContactos, setIsLoadingContactos] = useState(true)

  // Si no hay usuario, no renderizar
  if (!usuario) {
    return <div>Cargando...</div>
  }

  axios.defaults.baseURL = 'http://localhost:8000'

  // Cargar contactos desde la API
  useEffect(() => {
    loadContactos()
  }, [])

  const loadContactos = async () => {
    try {
      setIsLoadingContactos(true)
      // Cargar contactos desde la API, pasando el usuario actual
      const response = await axios.get('/api/usuarios/contactos', {
        params: {
          usuario_actual_id: usuario.id
        }
      })
      let contactosData = response.data || []
      
      // Filtrar para excluir al usuario actual (segunda capa de seguridad)
      contactosData = contactosData.filter(c => c.id !== usuario.id)
      
      setContactos(contactosData)
      if (contactosData.length > 0) {
        setSelectedContact(contactosData[0])
      }
    } catch (error) {
      console.error('Error loading contactos:', error)
      setContactos([])
    } finally {
      setIsLoadingContactos(false)
    }
  }

  return (
    <div className="chat-app">
      <NavBar usuario={usuario} onLogout={onLogout} />
      
      <div className="chat-container-main">
        <div className="contacts-panel">
          {isLoadingContactos ? (
            <div className="loading">Cargando...</div>
          ) : (
            <ContactList
              contactos={contactos}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          )}
        </div>

        <div className="chat-panel">
          {selectedContact ? (
            <ChatWindow
              contacto={selectedContact}
              usuarioActual={usuario}
            />
          ) : (
            <div className="no-contact-selected">
              <p>Selecciona un contacto para empezar</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="chat-footer">
        <span className="copyright">© 2026 Condominio Chat. All rights reserved.</span>
      </div>
    </div>
  )
}

