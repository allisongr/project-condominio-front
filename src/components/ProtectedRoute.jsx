import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Spinner from './Spinner'

/**
 * Componente que protege rutas requiriendo autenticación
 * @param {React.ReactNode} children - Componente a renderizar si está autenticado
 * @param {boolean} requireAdmin - Si true, requiere que el usuario sea admin
 * @param {string|string[]} requiredPermission - Permisos requeridos
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  requiredPermission = null,
}) {
  const { isAuthenticated, loading, isAdmin, hasPermission } = useAuth()

  // Mostrar spinner mientras valida la sesión
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spinner />
      </div>
    )
  }

  // No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Requiere admin pero no lo es
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/chat" replace />
  }

  // Verificar permisos específicos
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission]

    const hasRequiredPermission = permissions.some((perm) =>
      hasPermission(perm)
    )

    if (!hasRequiredPermission) {
      return <Navigate to="/chat" replace />
    }
  }

  return children
}
