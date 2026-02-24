import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import UserList from './UserList'
import UserForm from './UserForm'
import './AdminDashboard.css'

export default function AdminDashboard({ usuario, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:8000/api/admin/usuarios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUsers(response.data.usuarios)
    } catch (err) {
      toast.error('Error al cargar usuarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:8000/api/admin/usuarios', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success('Usuario creado exitosamente')
      setShowForm(false)
      loadUsers()
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear usuario'
      toast.error(errorMessage)
      throw err
    }
  }

  const handleUpdateUser = async (id, userData) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:8000/api/admin/usuarios/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success('Usuario actualizado exitosamente')
      setShowForm(false)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar usuario'
      toast.error(errorMessage)
      throw err
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:8000/api/admin/usuarios/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success('Usuario eliminado exitosamente')
      loadUsers()
    } catch (err) {
      toast.error('Error al eliminar usuario')
      console.error(err)
    }
  }

  const handleResendVerification = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `http://localhost:8000/api/admin/usuarios/${id}/resend-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success('Correo de verificación enviado')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al enviar correo'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true
    if (filter === 'verified') return user.email_verified
    if (filter === 'unverified') return !user.email_verified
    if (filter === 'admin') return user.admin
    return true
  })

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Panel de Administración</h1>
          <div className="admin-user-info">
            <span className="admin-user-name">
              {usuario.nombre} {usuario.apellido}
            </span>
            <button onClick={onLogout} className="admin-logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="admin-container">
        {!showForm && (
          <>
            <div className="admin-actions">
              <button onClick={() => setShowForm(true)} className="btn-create-user">
                + Crear Nuevo Usuario
              </button>

              <div className="admin-filters">
                <button
                  onClick={() => setFilter('all')}
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('verified')}
                  className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
                >
                  Verificados
                </button>
                <button
                  onClick={() => setFilter('unverified')}
                  className={`filter-btn ${filter === 'unverified' ? 'active' : ''}`}
                >
                  Sin Verificar
                </button>
                <button
                  onClick={() => setFilter('admin')}
                  className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
                >
                  Administradores
                </button>
              </div>
            </div>

            <UserList
              users={filteredUsers}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDeleteUser}
              onResendVerification={handleResendVerification}
            />
          </>
        )}

        {showForm && (
          <UserForm
            user={editingUser}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={handleCancelForm}
          />
        )}
      </div>
    </div>
  )
}
