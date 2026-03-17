import axios from 'axios'
import API_BASE_URL from '../config/api'

class AuthMiddleware {
  /**
   * Valida que el token sea válido
   * @returns {Promise<boolean>}
   */
  static async isTokenValid() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false

      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.success
    } catch (error) {
      return false
    }
  }

  /**
   * Valida si el usuario es administrador
   * @returns {boolean}
   */
  static isAdmin() {
    try {
      const usuarioJson = localStorage.getItem('usuario')
      if (!usuarioJson) return false

      const usuario = JSON.parse(usuarioJson)
      return usuario.admin === 1 || usuario.admin === true
    } catch (error) {
      return false
    }
  }

  /**
   * Valida si el usuario es usuario regular
   * @returns {boolean}
   */
  static isRegularUser() {
    try {
      const usuarioJson = localStorage.getItem('usuario')
      if (!usuarioJson) return false

      const usuario = JSON.parse(usuarioJson)
      return usuario.admin !== 1 && usuario.admin !== true
    } catch (error) {
      return false
    }
  }

  /**
   * Valida permisos del usuario
   * @param {string|string[]} requiredPermissions - Permisos requeridos
   * @returns {boolean}
   */
  static hasPermission(requiredPermissions) {
    try {
      const usuarioJson = localStorage.getItem('usuario')
      if (!usuarioJson) return false

      const usuario = JSON.parse(usuarioJson)

      // Admin tiene todos los permisos
      if (usuario.admin === 1 || usuario.admin === true) return true

      if (!usuario.permisos || !Array.isArray(usuario.permisos)) return false

      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions]

      return permissions.some((perm) => usuario.permisos.includes(perm))
    } catch (error) {
      return false
    }
  }

  /**
   * Obtiene el usuario actual de localStorage
   * @returns {Object|null}
   */
  static getCurrentUser() {
    try {
      const usuarioJson = localStorage.getItem('usuario')
      return usuarioJson ? JSON.parse(usuarioJson) : null
    } catch (error) {
      return null
    }
  }

  /**
   * Obtiene el token de autenticación
   * @returns {string|null}
   */
  static getToken() {
    return localStorage.getItem('token')
  }

  /**
   * Valida sesión completa (token + usuario)
   * @returns {Promise<boolean>}
   */
  static async validateSession() {
    const token = this.getToken()
    const usuario = this.getCurrentUser()

    if (!token || !usuario) {
      return false
    }

    return await this.isTokenValid()
  }

  /**
   * Configura axios para incluir token automáticamente
   */
  static setupAxiosInterceptor() {
    axios.interceptors.request.use((config) => {
      const token = this.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si está no autorizado, limpiar sesión
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('usuario')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }
}

export default AuthMiddleware
