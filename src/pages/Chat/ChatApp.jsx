import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './ChatApp.css'
import ChatWindow from '../../components/ChatWindow'
import ContactList from '../../components/ContactList'
import NavBar from '../../components/NavBar'

export default function ChatApp({ usuario, onLogout }) {
  const [contactos, setContactos] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isLoadingContactos, setIsLoadingContactos] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState([])
  const selectedContactRef = useRef(null)
  const contactosRef = useRef([])

  // Mantener la referencia actualizada
  useEffect(() => {
    selectedContactRef.current = selectedContact
  }, [selectedContact])

  // Mantener la referencia de contactos actualizada
  useEffect(() => {
    contactosRef.current = contactos
  }, [contactos])

  // Si no hay usuario, no renderizar
  if (!usuario) {
    return <div>Cargando...</div>
  }

  axios.defaults.baseURL = 'http://localhost:8000'

  // Cargar contactos desde la API
  useEffect(() => {
    loadContactos()
  }, [])

  // Configurar WebSocket después de cargar contactos
  useEffect(() => {
    if (contactos.length > 0) {
      setupWebSocketNotifications()
    }
  }, [contactos])

  const setupWebSocketNotifications = () => {
    if (!window.Echo || !usuario?.id) {
      return
    }

    contactos.forEach(contacto => {
      const channelName = `chat.${contacto.id}.${usuario.id}`
      const channel = window.Echo.private(channelName)
      
      channel.subscription.bind_global((eventName, data) => {
        if (eventName === 'mensaje-enviado' || eventName === '.mensaje-enviado') {
          const soyDestinatario = data.destinatario_id === usuario.id
          const esDiferenteAlChatActual = !selectedContactRef.current || selectedContactRef.current.id !== data.remitente_id
          
          if (soyDestinatario && esDiferenteAlChatActual) {
            const remitenteContacto = contactosRef.current.find(c => c.id === data.remitente_id)
            
            setUnreadMessages(prev => {
              const existe = prev.some(msg => msg.id === data.id)
              if (existe) {
                return prev
              }
              
              const nuevoMensaje = {
                ...data,
                remitente: remitenteContacto,
                fecha: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
              }
              
              return [...prev, nuevoMensaje]
            })
            
            setHasUnreadMessages(true)
          }
        }
      })
    })
  }

  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
    setUnreadMessages(prev => prev.filter(msg => msg.remitente_id !== contact.id))
    if (unreadMessages.length === 0 || unreadMessages.every(msg => msg.remitente_id === contact.id)) {
      setHasUnreadMessages(false)
    }
  }

  const handleNotificationClick = (message) => {
    const contact = contactos.find(c => c.id === message.remitente_id)
    if (contact) {
      handleSelectContact(contact)
    }
  }

  const loadContactos = async () => {
    try {
      setIsLoadingContactos(true)
      const response = await axios.get('/api/usuarios/contactos', {
        params: {
          usuario_actual_id: usuario.id
        }
      })
      let contactosData = response.data || []
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
      <NavBar 
        usuario={usuario} 
        onLogout={onLogout} 
        hasUnreadMessages={hasUnreadMessages}
        unreadMessages={unreadMessages}
        onNotificationClick={handleNotificationClick}
      />
      
      <div className="chat-container-main">
        <div className="contacts-panel">
          {isLoadingContactos ? (
            <div className="loading">Cargando...</div>
          ) : (
            <ContactList
              contactos={contactos}
              selectedContact={selectedContact}
              onSelectContact={handleSelectContact}
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

