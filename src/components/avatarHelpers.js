/**
 * Utilidades para la gestión de avatares
 */

export const getInitials = (nombre, apellido) => {
  return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase()
}

export const getAvatarColor = (id) => {
  const colors = ['#2d7a6a', '#4a9b7f', '#5fa896', '#3a8f73', '#2d6b5e', '#418069', '#5ba885']
  return colors[(id || 0) % colors.length]
}

export const formatTime = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
