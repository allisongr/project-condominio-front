import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './ChatApp.css'
import ChatWindow from '../../components/ChatWindow'
import ContactList from '../../components/ContactList'
import NavBar from '../../components/NavBar'
import LoadingOverlay from '../../components/LoadingOverlay'

export default function ChatApp({ usuario, onLogout }) {
  const [contactos, setContactos] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isLoadingContactos, setIsLoadingContactos] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState([])
  const [dropdownOpened, setDropdownOpened] = useState(false)
  const [contactsWithNewMessages, setContactsWithNewMessages] = useState(new Set())
  const [lastMessageByContact, setLastMessageByContact] = useState({})
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

  useEffect(() => {
    if (Object.keys(lastMessageByContact).length > 0 && contactos.length > 0) {
      const sorted = sortContactsByLastMessage(contactos)
      if (JSON.stringify(sorted.map(c => c.id)) !== JSON.stringify(contactos.map(c => c.id))) {
        setContactos(sorted)
      }
    }
  }, [lastMessageByContact])

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
            
            setContactsWithNewMessages(prev => new Set([...prev, data.remitente_id]))
            
            setLastMessageByContact(prev => ({
              ...prev,
              [data.remitente_id]: {
                contenido: data.contenido,
                fecha: data.fecha,
                remitente_id: data.remitente_id
              }
            }))
            
            setContactos(prevContactos => {
              const contactoIndex = prevContactos.findIndex(c => c.id === data.remitente_id)
              if (contactoIndex > 0) {
                const newContactos = [...prevContactos]
                const [contactoMovido] = newContactos.splice(contactoIndex, 1)
                newContactos.unshift(contactoMovido)
                return newContactos
              }
              return prevContactos
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
    setContactsWithNewMessages(prev => {
      const newSet = new Set(prev)
      newSet.delete(contact.id)
      return newSet
    })
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

  const handleNotificationDropdownOpen = () => {
    setDropdownOpened(true)
    setHasUnreadMessages(false)
  }

  const handleMessageSent = (contactId, messageData) => {
    setLastMessageByContact(prev => ({
      ...prev,
      [contactId]: {
        contenido: messageData.contenido,
        fecha: messageData.fecha,
        remitente_id: usuario.id
      }
    }))
    
    setContactos(prevContactos => {
      const contactoIndex = prevContactos.findIndex(c => c.id === contactId)
      if (contactoIndex > 0) {
        const newContactos = [...prevContactos]
        const [contactoMovido] = newContactos.splice(contactoIndex, 1)
        newContactos.unshift(contactoMovido)
        return newContactos
      }
      return prevContactos
    })
  }

  const loadLastMessages = async (contactosData) => {
    const lastMessages = {}
    
    for (const contacto of contactosData) {
      try {
        const response = await axios.get('/api/chat/messages', {
          params: {
            id_depa: contacto.depa,
            contacto_id: contacto.id,
            usuario_id: usuario.id,
            per_page: 1
          }
        })
        
        if (response.data && response.data.length > 0) {
          const lastMsg = response.data[response.data.length - 1]
          lastMessages[contacto.id] = {
            contenido: lastMsg.contenido,
            fecha: lastMsg.fecha,
            remitente_id: lastMsg.remitente_id
          }
        }
      } catch (error) {
        console.error(`Error loading last message for contact ${contacto.id}:`, error)
      }
    }
    
    setLastMessageByContact(lastMessages)
  }

  const sortContactsByLastMessage = (contactsList) => {
    return [...contactsList].sort((a, b) => {
      const lastMsgA = lastMessageByContact[a.id]
      const lastMsgB = lastMessageByContact[b.id]
      
      if (!lastMsgA && !lastMsgB) return 0
      if (!lastMsgA) return 1
      if (!lastMsgB) return -1
      
      const dateA = new Date(lastMsgA.fecha)
      const dateB = new Date(lastMsgB.fecha)
      return dateB - dateA
    })
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
      
      await loadLastMessages(contactosData)
    } catch (error) {
      console.error('Error loading contactos:', error)
      setContactos([])
    } finally {
      setIsLoadingContactos(false)
    }
  }

  return (
    <div className="chat-app">
      <LoadingOverlay 
        isLoading={isLoadingContactos} 
        message="Cargando contactos..." 
      />
      
      <NavBar 
        usuario={usuario} 
        onLogout={onLogout} 
        hasUnreadMessages={hasUnreadMessages}
        unreadMessages={unreadMessages}
        onNotificationClick={handleNotificationClick}
        onNotificationDropdownOpen={handleNotificationDropdownOpen}
      />
      
      <div className="chat-container-main">
        <div className="contacts-panel">
          {isLoadingContactos ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <ContactList
              contactos={contactos}
              selectedContact={selectedContact}
              onSelectContact={handleSelectContact}
              contactsWithNewMessages={contactsWithNewMessages}
              lastMessageByContact={lastMessageByContact}
              currentUserId={usuario.id}
            />
          )}
        </div>

        <div className="chat-panel">
          {selectedContact ? (
            <ChatWindow
              contacto={selectedContact}
              usuarioActual={usuario}
              onMessageSent={handleMessageSent}
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

