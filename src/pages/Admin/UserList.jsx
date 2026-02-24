import { FiMail, FiEdit, FiTrash2 } from 'react-icons/fi'
import './UserList.css'

export default function UserList({ users, loading, onEdit, onDelete, onResendVerification }) {
  if (loading) {
    return (
      <div className="user-list-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="user-list-empty">
        <p>No hay usuarios para mostrar</p>
      </div>
    )
  }

  return (
    <div className="user-list">
      <table className="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Verificado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={!user.activo ? 'user-inactive' : ''}>
              <td>
                <div className="user-name-cell">
                  <span className="user-name">
                    {user.nombre} {user.apellido_p} {user.apellido_m}
                  </span>
                  {user.admin && <span className="badge badge-admin">Admin</span>}
                </div>
              </td>
              <td>{user.email}</td>
              <td>{user.celular || 'N/A'}</td>
              <td>
                <span className={`badge badge-role ${user.admin ? 'admin' : 'user'}`}>
                  {user.admin ? 'Administrador' : 'Usuario'}
                </span>
              </td>
              <td>
                <span className={`badge badge-status ${user.activo ? 'active' : 'inactive'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="verification-cell">
                  <span
                    className={`badge badge-verification ${
                      user.email_verified ? 'verified' : 'unverified'
                    }`}
                  >
                    {user.email_verified ? 'Verificado' : 'Sin Verificar'}
                  </span>
                  {!user.email_verified && (
                    <button
                      onClick={() => onResendVerification(user.id)}
                      className="btn-resend"
                      title="Reenviar correo de verificación"
                    >
                      <FiMail />
                    </button>
                  )}
                </div>
              </td>
              <td>
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td>
                <div className="user-actions">
                  <button onClick={() => onEdit(user)} className="btn-edit" title="Editar">
                    <FiEdit />
                  </button>
                  <button onClick={() => onDelete(user.id)} className="btn-delete" title="Eliminar">
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
