import './MessageBubble.css'

export default function MessageBubble({ mensaje, isOwn }) {
  const formatTime = (fecha) => {
    const date = new Date(fecha)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        <p>{mensaje.contenido}</p>
      </div>
      <span className="message-time">{formatTime(mensaje.fecha)}</span>
    </div>
  )
}
