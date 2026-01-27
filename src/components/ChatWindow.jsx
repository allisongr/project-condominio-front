import { useState, useEffect, useRef } from 'react'
import { FiMoreVertical, FiSend } from 'react-icons/fi'
import axios from 'axios'
import './ChatWindow.css'
import MessageBubble from './MessageBubble'
import Avatar from './Avatar'

export default function ChatWindow({ contacto, usuarioActual }) {
  const [mensajes, setMensajes] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  axios.defaults.baseURL = 'http://localhost:8000'

  // Cargar mensajes desde localStorage o API
  useEffect(() => {
    if (contacto?.id) {
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
      // Limpiar listeners de WebSocket al desmontar
      if (window.Echo) {
        window.Echo.leave(`chat.${usuarioActual.id}`)
      }
    }
  }, [contacto?.id])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (mensajes.length > 0 && contacto?.id && usuarioActual?.id) {
      const storageKey = `chat_${usuarioActual.id}_${contacto.id}`
      localStorage.setItem(storageKey, JSON.stringify(mensajes))
    }
  }, [mensajes, contacto?.id, usuarioActual?.id])

  // Cargar mensajes desde la API
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
      console.log('Mensajes cargados desde API:', response.data)
      console.log('Primer mensaje:', response.data[0])
      if (response.data && Array.isArray(response.data)) {
        setMensajes(response.data)
      }
    } catch (error) {
      console.error('Error loading messages from API:', error)
      // No hacer nada, mantener los mensajes del localStorage
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Configurar WebSockets
  const setupWebSockets = () => {
    if (!window.Echo) return

    try {
      // Función para procesar mensajes recibidos
      const handleMessageReceived = (data) => {
        console.log('✅ Mensaje recibido vía WebSocket:', data)
        const nuevoMsg = {
          id: data.id,
          remitente_id: data.remitente_id,
          destinatario_id: data.destinatario_id,
          contenido: data.contenido,
          fecha: new Date(data.fecha),
          leido: data.leido || false,
        }
        setMensajes((prev) => [...prev, nuevoMsg])
        
        // Guardar en localStorage
        const storageKey = `chat_${usuarioActual.id}_${contacto.id}`
        setMensajes((prev) => {
          localStorage.setItem(storageKey, JSON.stringify(prev))
          return prev
        })
      }

      // Escuchar en canal directo: cuando yo envío un mensaje
      const channel1 = window.Echo.private(`chat.${usuarioActual.id}.${contacto.id}`)
      
      // Bind to the underlying Pusher channel to see ALL events
      channel1.subscription.bind_global((eventName, data) => {
        console.log('🌍 Global event received on channel 1:', eventName, data)
        if (eventName === 'mensaje-enviado' || eventName === '.mensaje-enviado') {
          handleMessageReceived(data)
        }
      })
      
      console.log(`✅ Subscribed to channel: private-chat.${usuarioActual.id}.${contacto.id}`)

      // Escuchar en canal inverso: cuando el otro usuario envía un mensaje
      const channel2 = window.Echo.private(`chat.${contacto.id}.${usuarioActual.id}`)
      
      // Bind to the underlying Pusher channel to see ALL events
      channel2.subscription.bind_global((eventName, data) => {
        console.log('🌍 Global event received on channel 2:', eventName, data)
        if (eventName === 'mensaje-enviado' || eventName === '.mensaje-enviado') {
          handleMessageReceived(data)
        }
      })
      
      console.log(`✅ Subscribed to channel: private-chat.${contacto.id}.${usuarioActual.id}`)

      console.log(`✅ WebSocket listeners set up for channels: chat.${usuarioActual.id}.${contacto.id} and chat.${contacto.id}.${usuarioActual.id}`)
    } catch (error) {
      console.error('❌ Error setting up WebSockets:', error)
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

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // TODO: Enviar indicador de escritura (disabled for now)
    // try {
    //   if (window.Echo && e.target.value.length > 0) {
    //     axios.post('/api/chat/typing', {
    //       usuario_id: usuarioActual.id,
    //       destinatario_id: contacto.id,
    //       id_depa: contacto.depa,
    //     })
    //   }
    // } catch (error) {
    //   console.error('Error sending typing indicator:', error)
    // }

    // Detener indicador después de 1 segundo de inactividad
    typingTimeoutRef.current = setTimeout(() => {
      // Indicador de "dejó de escribir"
    }, 1000)
  }

  const sendMessage = async () => {
    if (!nuevoMensaje.trim()) return

    try {
      setIsLoading(true)

      // Crear mensaje local optimista
      const newMsg = {
        id: Date.now().toString(),
        remitente_id: usuarioActual.id,
        destinatario_id: contacto.id,
        contenido: nuevoMensaje,
        fecha: new Date(),
        leido: false,
      }

      setMensajes([...mensajes, newMsg])
      setNuevoMensaje('')

      // Enviar al backend
      const response = await axios.post('/api/chat/send', {
        remitente_id: usuarioActual.id,
        destinatario_id: contacto.id,
        id_depa: contacto.depa,
        contenido: nuevoMensaje,
        tipo: 'personal',
      })

      // Actualizar con ID real del mensaje
      if (response.data?.id) {
        setMensajes((prev) =>
          prev.map((msg) =>
            msg.id === newMsg.id ? { ...msg, id: response.data.id } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Remover mensaje local en caso de error
      setMensajes((prev) => prev.slice(0, -1))
      setNuevoMensaje(nuevoMensaje) // Restaurar el texto
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
          <div className="loading-messages">Cargando mensajes...</div>
        ) : (
          <>
            {mensajes.length === 0 ? (
              <div className="no-messages">
                <p>No hay mensajes aún. ¡Inicia la conversación!</p>
              </div>
            ) : (
              mensajes.map((mensaje) => (
                <MessageBubble
                  key={mensaje.id}
                  mensaje={mensaje}
                  isOwn={mensaje.remitente_id === usuarioActual.id}
                />
              ))
            )}
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
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
            placeholder="Si tiene duda en algo mas avíseme"
            className="chat-textarea"
          />
          <button
            onClick={sendMessage}
            disabled={!nuevoMensaje.trim() || isLoading}
            className="send-btn"
            title="Enviar"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
