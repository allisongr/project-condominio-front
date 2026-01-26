// Obtener iniciales de un nombre
export const getInitials = (nombre) => {
  if (!nombre) return '?'
  return nombre
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Colores para avatares
const colors = [
  '#667eea',
  '#764ba2',
  '#f093fb',
  '#4facfe',
  '#00f2fe',
  '#43e97b',
  '#fa709a',
  '#feca57',
]

export const getAvatarColor = (id) => {
  return colors[id % colors.length]
}

// Función para obtener contactos desde la API
export const fetchContactos = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/chat/101/messages?per_page=1')
    if (!response.ok) throw new Error('Error fetching')
    return response.data
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}
