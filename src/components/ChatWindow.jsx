import { useState, useEffect, useRef } from 'react'
import { FiMoreVertical, FiSend } from 'react-icons/fi'
import axios from 'axios'
import './ChatWindow.css'

export default function ChatWindow({ contacto, usuarioActual }) {
  const [mensajes, setMensajes] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  axios.defaults.baseURL = 'http://localhost:8000'

  // Cargar mensajes cuando cambia el contacto
  useEffect(() => {
    if (contacto?.id) {
      loadMessages()
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

  // Cargar mensajes desde la API
  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const response = await axios.get('/api/chat/messages', {
        params: {
          id_depa: contacto.depa,
          contacto_id: contacto.id,
        },
      })
      setMensajes(response.data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
      // Si hay error, mostrar datos de ejemplo
      setMensajes([
        {
          id: '1',
          remitente_id: contacto.id,
          contenido: 'Hola!',
          fecha: new Date(Date.now() - 5 * 60000),
          leido: true,
        },
        {
          id: '2',
          remitente_id: usuarioActual.id,
          contenido: 'Hola',
          fecha: new Date(Date.now() - 4 * 60000),
          leido: true,
        },
      ])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Configurar WebSockets
  const setupWebSockets = () => {
    if (!window.Echo) return

    try {
      // Escuchar nuevos mensajes
      window.Echo.private(`chat.${usuarioActual.id}.${contacto.id}`).listen(
        'MensajeEnviado',
        (data) => {
          const nuevoMsg = {
            id: data.id,
            remitente_id: data.remitente_id,
            destinatario_id: data.destinatario_id,
            contenido: data.contenido,
            fecha: new Date(data.fecha),
            leido: data.leido || false,
          }
          setMensajes((prev) => [...prev, nuevoMsg])
        }
      )

      // Escuchar indicadores de escritura
      window.Echo.private(`typing.${usuarioActual.id}.${contacto.id}`).listen(
        'UsuarioEscribiendo',
        (data) => {
          if (data.usuario_id !== usuarioActual.id) {
            setIsTyping(true)
            // Limpiar el indicador después de 1 segundo
            setTimeout(() => setIsTyping(false), 1000)
          }
        }
      )
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
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
    return colors[id % colors.length]
  }

  // Manejar cambios de escritura con debounce
  const handleMessageChange = (e) => {
    setNuevoMensaje(e.target.value)

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Enviar indicador de escritura
    try {
      if (window.Echo && e.target.value.length > 0) {
        axios.post('/api/chat/typing', {
          usuario_id: usuarioActual.id,
          destinatario_id: contacto.id,
          id_depa: contacto.depa,
        })
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error)
    }

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
            <span className="contact-status">
              {contacto.online ? 'En línea' : 'Fuera de línea'}
            </span>
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
                <div
                  key={mensaje.id}
                  className={`message ${
                    mensaje.remitente_id === usuarioActual.id ? 'sent' : 'received'
                  }`}
                >
                  <div className="message-bubble">
                    <p className="message-text">{mensaje.contenido}</p>
                    <span className="message-time">{formatTime(mensaje.fecha)}</span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="message received">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
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
