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
  '#2d7a6a',
  '#4a9b7f',
  '#5fa896',
  '#3a8f73',
  '#2d6b5e',
  '#418069',
  '#5ba885',
  '#6eb699',
]

export const getAvatarColor = (id) => {
  return colors[id % colors.length]
}

// Función para obtener contactos desde la API
export const fetchContactos = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/101/messages?per_page=1`)
    if (!response.ok) throw new Error('Error fetching')
    return response.data
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}
