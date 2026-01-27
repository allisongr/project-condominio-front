import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './ChatComponent.css'

export default function ChatComponent() {
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('departamento')
  const [usuarioId] = useState(1)
  const [usuarioNombre] = useState('Juan Pérez')
  const [selectedDepa] = useState(101)
  const [unreadCount, setUnreadCount] = useState(0)
  const [usuarioEscribiendo, setUsuarioEscribiendo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Configure axios
  axios.defaults.baseURL = 'http://localhost:8000'

  // Load initial messages
  useEffect(() => {
    loadMessages()
    getUnreadCount()

    // Subscribe to WebSocket channels if Echo is available
    subscribeToChannel()

    // Refresh messages periodically (fallback)
    const interval = setInterval(() => {
      loadMessages()
      getUnreadCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/${selectedDepa}/messages`, {
        params: {
          page: 1,
          per_page: 50,
          usuario_id: tipoMensaje === 'personal' ? usuarioId : null,
        }
      })

      setMensajes(response.data.data)
      markAllAsRead()
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!nuevoMensaje.trim()) return

    try {
      setIsLoading(true)
      await axios.post('/api/chat/send', {
        remitente_id: usuarioId,
        destinatario_id: tipoMensaje === 'personal' ? 2 : null,
        id_depa: selectedDepa,
        contenido: nuevoMensaje,
        tipo: tipoMensaje,
      })

      setNuevoMensaje('')
      stopTyping()
      loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje')
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToChannel = () => {
    if (!window.Echo) {
      console.warn('Laravel Echo not configured')
      return
    }

    try {
      window.Echo
        .private(`chat.departamento.${selectedDepa}`)
        .listen('mensaje-enviado', (evento) => {
          console.log('Nuevo mensaje recibido:', evento)
          setMensajes(prev => [...prev, evento])
          scrollToBottom()
        })
        .listen('usuario-escribiendo', (evento) => {
          console.log('Usuario escribiendo:', evento)
          setUsuarioEscribiendo(evento.nombre_usuario)
          
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => {
            setUsuarioEscribiendo(null)
          }, 2000)
        })
    } catch (error) {
      console.error('Error subscribing to channel:', error)
    }
  }

  const handleTyping = () => {
    clearTimeout(typingTimeoutRef.current)
    
    // Send typing indicator
    axios.post('/api/chat/typing', {
      usuario_id: usuarioId,
      id_depa: selectedDepa,
      nombre_usuario: usuarioNombre,
    }).catch(err => console.error('Error sending typing indicator:', err))

    // Auto-stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 2000)
  }

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current)
  }

  const markAllAsRead = async () => {
    const unreadMensajes = mensajes.filter(m => !m.leido && m.destinatario_id === usuarioId)
    
    for (const mensaje of unreadMensajes) {
      try {
        await axios.put(`/api/chat/${mensaje.id}/read`)
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  const getUnreadCount = async () => {
    try {
      const response = await axios.get(`/api/chat/${usuarioId}/unread`, {
        params: { id_depa: selectedDepa }
      })
      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error('Error getting unread count:', error)
    }
  }

  const formatTime = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const getNombreUsuario = (usuarioId) => {
    const usuarios = {
      1: 'Juan Pérez',
      2: 'María García',
      3: 'Carlos López',
    }
    return usuarios[usuarioId] || `Usuario ${usuarioId}`
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <h2>Chat Departamento {selectedDepa}</h2>
        {usuarioEscribiendo && (
          <div className="user-status">
            <span className="typing-indicator">{usuarioEscribiendo} está escribiendo...</span>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="messages-list">
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={`mensaje ${
              mensaje.remitente_id === usuarioId ? 'sent' : 'received'
            }`}
          >
            <div className="mensaje-content">
              <p className="sender">{getNombreUsuario(mensaje.remitente_id)}</p>
              <p className="text">{mensaje.contenido}</p>
              <span className="time">{formatTime(mensaje.fecha)}</span>
              {mensaje.leido && <span className="leido">✓✓</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Unread Messages Count */}
      {unreadCount > 0 && (
        <div className="unread-badge">
          {unreadCount} mensajes sin leer
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <textarea
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyUp={handleTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              sendMessage()
            }
          }}
          placeholder="Escribe un mensaje... (Ctrl+Enter para enviar)"
          className="message-input"
        ></textarea>

        <div className="message-type">
          <label>
            <input
              type="radio"
              value="personal"
              checked={tipoMensaje === 'personal'}
              onChange={(e) => setTipoMensaje(e.target.value)}
            />
            Personal
          </label>
          <label>
            <input
              type="radio"
              value="departamento"
              checked={tipoMensaje === 'departamento'}
              onChange={(e) => setTipoMensaje(e.target.value)}
            />
            Departamento
          </label>
        </div>

        <button
          onClick={sendMessage}
          className="send-btn"
          disabled={!nuevoMensaje.trim() || isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
