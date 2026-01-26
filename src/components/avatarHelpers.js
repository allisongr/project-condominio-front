/**
 * Utilidades para la gestión de avatares
 */

export const getInitials = (nombre, apellido) => {
  return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase()
}

export const getAvatarColor = (id) => {
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a']
  return colors[(id || 0) % colors.length]
}

export const formatTime = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
