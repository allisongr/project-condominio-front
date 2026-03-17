import { createContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Validar token al cargar
  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      // Verificar si el token es válido llamando al endpoint /me
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success && response.data.usuario) {
        setUsuario(response.data.usuario)
        setIsAuthenticated(true)
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
        
        // Reinitialize Echo after successful session validation
        if (window.reinitializeEcho) {
          setTimeout(() => {
            window.reinitializeEcho()
          }, 100)
        }
      } else {
        clearAuth()
      }
    } catch (error) {
      console.error('Error validando sesión:', error)
      clearAuth()
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback((usuarioData, token) => {
    // Si solo se pasa usuarioData, obtener token de localStorage
    const authToken = token || localStorage.getItem('token')
    
    setUsuario(usuarioData)
    setIsAuthenticated(true)
    localStorage.setItem('usuario', JSON.stringify(usuarioData))
    
    if (token) {
      localStorage.setItem('token', token)
    }
    
    // Reinitialize Echo connection with new token
    if (window.reinitializeEcho) {
      setTimeout(() => {
        window.reinitializeEcho()
      }, 100)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
  }, [])

  const clearAuth = useCallback(() => {
    setUsuario(null)
    setIsAuthenticated(false)
    localStorage.removeItem('usuario')
    localStorage.removeItem('token')
  }, [])

  const isAdmin = useCallback(() => {
    return usuario?.admin === 1 || usuario?.admin === true
  }, [usuario])

  const isUser = useCallback(() => {
    return usuario && !isAdmin()
  }, [usuario, isAdmin])

  const hasPermission = useCallback((permission) => {
    if (!usuario) return false

    // Admin tiene todos los permisos
    if (isAdmin()) return true

    // Verificar permisos específicos del usuario
    if (usuario.permisos && Array.isArray(usuario.permisos)) {
      return usuario.permisos.includes(permission)
    }

    return false
  }, [usuario, isAdmin])

  const value = {
    usuario,
    loading,
    isAuthenticated,
    login,
    logout,
    validateSession,
    isAdmin,
    isUser,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
