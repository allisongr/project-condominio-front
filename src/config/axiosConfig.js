import axios from 'axios'
import { toast } from 'react-toastify'
import API_BASE_URL from './api'

/**
 * Configuración global de axios con interceptores
 * Maneja errores de autenticación y redirige a login automáticamente
 */

// Crear instancia custom
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

// Función para hacer logout por 401
const executeLogout = (reason = 'Sesión expirada') => {
  console.error('🔔 LOGOUT TRIGGER:', reason)
  
  // 1. Limpiar localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  localStorage.removeItem('loginTime')
  
  // 2. Limpiar sessionStorage
  sessionStorage.clear()
  
  // 3. Limpiar headers
  delete axios.defaults.headers.common['Authorization']
  delete axiosInstance.defaults.headers.common['Authorization']
  
  // 4. Mostrar notificación (pero no en login)
  if (!window.location.pathname.includes('/login')) {
    toast.error('Tu sesión ha expirado. Inicia sesión de nuevo.')
    
    // 5. Redirigir inmediatamente
    window.location.replace('/login')
  }
}

// **REQUEST INTERCEPTOR** - Agregar token a CADA solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token agregado al request:', config.url)
    } else {
      console.warn('⚠️ No hay token disponible para:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// **RESPONSE INTERCEPTOR** - Manejo de errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Error en request:', error.response?.status, error.config?.url)
    if (error.response?.status === 401) {
      executeLogout('401 en axiosInstance: ' + error.config?.url)
    }
    return Promise.reject(error)
  }
)

// Interceptor en axios global
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      executeLogout('401 en axios global: ' + error.config?.url)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
export { executeLogout }

