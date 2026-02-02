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
    console.log('🔍 useEffect notificaciones ejecutado', { contactosLength: contactos.length, contactos })
    if (contactos.length > 0) {
      console.log('✅ Llamando a setupWebSocketNotifications')
      setupWebSocketNotifications()
    } else {
      console.log('❌ No hay contactos para configurar notificaciones')
    }
  }, [contactos])

  const setupWebSocketNotifications = () => {
    if (!window.Echo || !usuario?.id) {
      console.log('❌ No se puede configurar notificaciones - Echo o usuario no disponible')
      return
    }

    console.log(`🔔 Configurando notificaciones para usuario ${usuario.id}`)
    console.log(`🔔 Contactos a escuchar:`, contactos.map(c => c.id))

    // Escuchar mensajes en canales privados para este usuario
    contactos.forEach(contacto => {
      const channelName = `chat.${contacto.id}.${usuario.id}`
      console.log(`🔔 Suscribiendo a canal de notificación: ${channelName}`)
      
      // Canal para mensajes que me envían
      const channel = window.Echo.private(channelName)
      
      // Usar bind_global para capturar todos los eventos
      channel.subscription.bind_global((eventName, data) => {
        console.log(`🔔 Evento global recibido en ${channelName}:`, eventName, data)
        
        if (eventName === 'mensaje-enviado' || eventName === '.mensaje-enviado') {
          console.log('📩 Nuevo mensaje recibido (notificación):', data)
          console.log('Contacto seleccionado actual:', selectedContactRef.current?.id)
          console.log('Remitente del mensaje:', data.remitente_id)
          console.log('Destinatario del mensaje:', data.destinatario_id)
          console.log('Usuario actual:', usuario.id)
          
          // Solo mostrar notificación si:
          // 1. YO soy el destinatario del mensaje (no el remitente)
          // 2. El mensaje NO es del contacto actualmente seleccionado
          const soyDestinatario = data.destinatario_id === usuario.id
          const esDiferenteAlChatActual = !selectedContactRef.current || selectedContactRef.current.id !== data.remitente_id
          
          if (soyDestinatario && esDiferenteAlChatActual) {
            console.log('✅ Mostrando notificación - mensaje de otro contacto')
            
            // Agregar mensaje a la lista de no leídos (evitar duplicados)
            const remitenteContacto = contactosRef.current.find(c => c.id === data.remitente_id)
            console.log('📋 Agregando a notificaciones:', {
              remitente: remitenteContacto?.nombre,
              contenido: data.contenido
            })
            
            setUnreadMessages(prev => {
              // Verificar si el mensaje ya existe
              const existe = prev.some(msg => msg.id === data.id)
              if (existe) {
                console.log('⏭️ Mensaje duplicado en notificaciones, ignorando')
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
          } else {
            console.log('⏭️ No mostrar notificación:', { soyDestinatario, esDiferenteAlChatActual })
          }
        }
      })
    })

    console.log(`✅ Escuchando notificaciones para usuario ${usuario.id}`)
  }

  const handleSelectContact = (contact) => {
    setSelectedContact(contact)
    // Al seleccionar un contacto, quitar la notificación y limpiar mensajes no leídos de ese contacto
    setUnreadMessages(prev => prev.filter(msg => msg.remitente_id !== contact.id))
    if (unreadMessages.length === 0 || unreadMessages.every(msg => msg.remitente_id === contact.id)) {
      setHasUnreadMessages(false)
    }
  }

  const handleNotificationClick = (message) => {
    // Buscar el contacto del remitente y seleccionarlo
    const contact = contactos.find(c => c.id === message.remitente_id)
    if (contact) {
      handleSelectContact(contact)
    }
  }

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
      
      console.log(`👥 Contactos cargados para usuario ${usuario.id}:`, contactosData.map(c => `${c.nombre} (ID: ${c.id})`))
      
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

