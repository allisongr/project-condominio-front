import { useState, useEffect, useRef } from 'react'
import { FiMoreVertical, FiSend } from 'react-icons/fi'
import axios from 'axios'
import { toast } from 'react-toastify'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import './ChatWindow.css'
import './ChatWindowTransitions.css'
import MessageBubble from './MessageBubble'
import Avatar from './Avatar'

export default function ChatWindow({ contacto, usuarioActual, onMessageSent }) {
  const [mensajes, setMensajes] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const contactoRef = useRef(contacto)
  const loadingRef = useRef(null)
  const noMessagesRef = useRef(null)
  const typingRef = useRef(null)
  const messageRefs = useRef({})

  // Mantener la referencia del contacto actualizada
  useEffect(() => {
    contactoRef.current = contacto
  }, [contacto])

  axios.defaults.baseURL = 'http://localhost:8000'

  // Cargar mensajes desde localStorage o API
  useEffect(() => {
    if (contacto?.id) {
      // Limpiar mensajes anteriores
      setMensajes([])
      
      // Primero, intentar cargar desde localStorage
      const storageKey = `chat_${usuarioActual.id}_${contacto.id}`
      const storedMensajes = localStorage.getItem(storageKey)
      if (storedMensajes) {
        try {
          setMensajes(JSON.parse(storedMensajes))
        } catch (e) {
          console.error('Error parsing stored messages:', e)
        }
      }
      
      // Luego, intentar actualizar desde la API
      loadMessages()
      
      // Escuchar eventos en tiempo real con WebSocket
      setupWebSockets()
    }

    return () => {
    }
  }, [contacto?.id])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  useEffect(() => {
    if (mensajes.length > 0 && contacto?.id && usuarioActual?.id) {
      const storageKey = `chat_${usuarioActual.id}_${contacto.id}`
      localStorage.setItem(storageKey, JSON.stringify(mensajes))
    }
    
    // Limpiar referencias de mensajes que ya no existen
    const currentMessageIds = new Set(mensajes.map(m => m.id))
    Object.keys(messageRefs.current).forEach(id => {
      if (!currentMessageIds.has(id)) {
        delete messageRefs.current[id]
      }
    })
  }, [mensajes, contacto?.id, usuarioActual?.id])

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const response = await axios.get('/api/chat/messages', {
        params: {
          id_depa: contacto.depa,
          contacto_id: contacto.id,
          usuario_id: usuarioActual.id,
          per_page: 200,
        },
        timeout: 5000,
      })
      if (response.data && Array.isArray(response.data)) {
        setMensajes(response.data)
      }
    } catch (error) {
      console.error('Error loading messages from API:', error)
      if (error.code === 'ECONNABORTED') {
        toast.error('Tiempo de espera agotado al cargar mensajes')
      }
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const setupWebSockets = () => {
    if (!window.Echo) return

    try {
      const handleMessageReceived = (data) => {
        if (data.remitente_id === usuarioActual.id) {
          return
        }

        if (data.remitente_id !== contactoRef.current?.id || data.destinatario_id !== usuarioActual.id) {
          return
        }
        
        const nuevoMsg = {
          id: data.id,
          remitente_id: data.remitente_id,
          destinatario_id: data.destinatario_id,
          contenido: data.contenido,
          fecha: new Date(data.fecha),
          leido: data.leido || false,
        }
        
        setMensajes((prev) => {
          const existe = prev.some(msg => msg.id === data.id)
          if (existe) {
            return prev
          }
          return [...prev, nuevoMsg]
        })
      }

      const channel1 = window.Echo.private(`chat.${usuarioActual.id}.${contacto.id}`)
      channel1.listen('.mensaje-enviado', (data) => {
        handleMessageReceived(data)
      })

      const channel2 = window.Echo.private(`chat.${contacto.id}.${usuarioActual.id}`)
      channel2.listen('.mensaje-enviado', (data) => {
        handleMessageReceived(data)
      })
    } catch (error) {
      console.error('Error setting up WebSockets:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0)}${apellido?.charAt(0)}`.toUpperCase()
  }

  const getAvatarColor = (id) => {
    const colors = ['#2d7a6a', '#4a9b7f', '#5fa896', '#3a8f73', '#2d6b5e', '#418069', '#5ba885']
    return colors[id % colors.length]
  }

  // Manejar cambios de escritura con debounce
  const handleMessageChange = (e) => {
    setNuevoMensaje(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
    }, 1000)
  }

  const sendMessage = async () => {
    if (!nuevoMensaje.trim()) return

    const mensajeTexto = nuevoMensaje
    setNuevoMensaje('')

    try {
      setIsLoading(true)

      // Crear mensaje local optimista con ID temporal
      const tempId = `temp-${Date.now()}-${Math.random()}`
      const newMsg = {
        id: tempId,
        remitente_id: usuarioActual.id,
        destinatario_id: contacto.id,
        contenido: mensajeTexto,
        fecha: new Date(),
        leido: false,
      }

      setMensajes((prev) => [...prev, newMsg])

      // Enviar al backend
      const response = await axios.post('/api/chat/send', {
        remitente_id: usuarioActual.id,
        destinatario_id: contacto.id,
        id_depa: contacto.depa,
        contenido: mensajeTexto,
        tipo: 'personal',
      })

      // Actualizar con ID real del mensaje de MongoDB
      if (response.data?.data?.id) {
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...msg, id: response.data.data.id } : msg
          )
        )
        
        if (onMessageSent) {
          onMessageSent(contacto.id, {
            contenido: mensajeTexto,
            fecha: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error al enviar el mensaje')
      // Remover mensaje local en caso de error
      setMensajes((prev) => prev.filter(msg => !msg.id.toString().startsWith('temp-')))
      setNuevoMensaje(mensajeTexto) // Restaurar el texto
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-window-header">
        <div className="contact-header-info">
          <div
            className="contact-header-avatar"
            style={{ backgroundColor: getAvatarColor(contacto.id) }}
          >
            {getInitials(contacto.nombre, contacto.apellido)}
          </div>
          <div className="contact-header-details">
            <h2>{`${contacto.nombre} ${contacto.apellido}`}</h2>
            <div className="contact-header-meta">
              {contacto.rol && <span className="contact-rol">{contacto.rol}</span>}
              <span className="contact-status">
                {contacto.online ? 'En línea' : 'Fuera de línea'}
              </span>
            </div>
          </div>
        </div>
        <button className="chat-menu-btn" title="Más opciones">
          <FiMoreVertical size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {isLoadingMessages ? (
          <CSSTransition
            in={isLoadingMessages}
            timeout={300}
            classNames="fade"
            unmountOnExit
            nodeRef={loadingRef}
          >
            <div ref={loadingRef} className="loading-messages">
              Cargando mensajes...
            </div>
          </CSSTransition>
        ) : (
          <>
            {mensajes.length === 0 ? (
              <CSSTransition
                in={mensajes.length === 0}
                timeout={300}
                classNames="slide-up"
                appear
                nodeRef={noMessagesRef}
              >
                <div ref={noMessagesRef} className="no-messages">
                  <p>No hay mensajes aún. ¡Inicia la conversación!</p>
                </div>
              </CSSTransition>
            ) : (
              <TransitionGroup>
                {mensajes.map((mensaje) => {
                  if (!messageRefs.current[mensaje.id]) {
                    messageRefs.current[mensaje.id] = { current: null }
                  }
                  const nodeRef = messageRefs.current[mensaje.id]
                  
                  return (
                    <CSSTransition
                      key={mensaje.id}
                      timeout={300}
                      classNames="message"
                      nodeRef={nodeRef}
                    >
                      <div ref={nodeRef}>
                        <MessageBubble
                          mensaje={mensaje}
                          isOwn={mensaje.remitente_id === usuarioActual.id}
                        />
                      </div>
                    </CSSTransition>
                  )
                })}
              </TransitionGroup>
            )}
            {isTyping && (
              <CSSTransition
                in={isTyping}
                timeout={200}
                classNames="fade"
                unmountOnExit
                nodeRef={typingRef}
              >
                <div ref={typingRef} className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </CSSTransition>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            value={nuevoMensaje}
            onChange={handleMessageChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                sendMessage()
              }
            }}
            placeholder="Escribe un mensaje..."
            className="chat-textarea"
          />
          <button
            onClick={sendMessage}
            disabled={!nuevoMensaje.trim() || isLoading}
            className={`send-btn ${isLoading ? 'loading' : ''}`}
            title="Enviar"
          >
            {isLoading ? (
              <div className="send-btn-spinner">
                <FiSend size={18} />
              </div>
            ) : (
              <FiSend size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
