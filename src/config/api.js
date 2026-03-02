/**
 * Configuración centralizada de la API
 * Usa variables de entorno de Vite
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_BASE_URL;

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
 */
