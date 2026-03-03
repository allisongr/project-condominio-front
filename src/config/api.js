/**
 * Configuración centralizada de la API
 * Usa variables de entorno de Vite
 * 
 * Soporta:
 * 1. Variable de entorno VITE_API_URL
 * 2. Detección automática del mismo host (para cambios de red)
 * 3. Fallback a localhost para desarrollo
 */

let API_BASE_URL = import.meta.env.VITE_API_URL

// Si no hay variable de entorno, detectar automáticamente
if (!API_BASE_URL || API_BASE_URL === 'undefined') {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = 8000
  
  // Construir URL automáticamente
  API_BASE_URL = `${protocol}//${hostname}:${port}`
  
  // Debug info
  console.group('🔌 API Configuration (Auto-Detect)')
  console.log('Protocol:', protocol)
  console.log('Hostname:', hostname)
  console.log('Backend Port:', port)
  console.log('Frontend URL:', window.location.origin)
  console.log('API Backend URL:', API_BASE_URL)
  console.groupEnd()
} else {
  console.group('🔌 API Configuration (.env)')
  console.log('Using VITE_API_URL from .env:', API_BASE_URL)
  console.groupEnd()
}

// Verificar que es válido
if (!API_BASE_URL || API_BASE_URL.includes('undefined')) {
  console.error('❌ ERROR: API_BASE_URL no está configurada correctamente')
  API_BASE_URL = 'http://localhost:8000'
  console.warn('⚠️  Usando fallback:', API_BASE_URL)
}

export default API_BASE_URL

/**
 * Ejemplo de uso:
 * 
 * import API_BASE_URL from '@/config/api'
 * 
 * // Uso en fetch
 * fetch(`${API_BASE_URL}/api/auth/login`)
 * 
 * // Uso en axios
 * axios.post(`${API_BASE_URL}/api/admin/usuarios`, data)
 * 
 * VENTAJAS DE LA DETECCIÓN AUTOMÁTICA:
 * - Si la red cambia, detecta automáticamente la nueva IP
 * - Si estás en localhost, siempre usa localhost
 * - Si accedes desde otra máquina, usa esa dirección
 * - No requiere cambiar .env manualmente
 */


