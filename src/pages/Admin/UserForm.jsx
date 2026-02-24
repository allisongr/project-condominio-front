import { useState, useEffect } from 'react'
import './UserForm.css'

export default function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_p: '',
    apellido_m: '',
    celular: '',
    email: '',
    password: '',
    admin: false,
    activo: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido_p: user.apellido_p || '',
        apellido_m: user.apellido_m || '',
        celular: user.celular || '',
        email: user.email || '',
        password: '',
        admin: user.admin || false,
        activo: user.activo ?? true,
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Si estamos editando y no hay password, no lo enviamos
      const dataToSend = { ...formData }
      if (user && !dataToSend.password) {
        delete dataToSend.password
      }

      if (user) {
        await onSubmit(user.id, dataToSend)
      } else {
        await onSubmit(dataToSend)
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-form-container">
      <div className="user-form-header">
        <h2>{user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
        <button onClick={onCancel} className="btn-close">
          ✖
        </button>
      </div>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Juan"
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellido_p">
              Apellido Paterno <span className="required">*</span>
            </label>
            <input
              type="text"
              id="apellido_p"
              name="apellido_p"
              value={formData.apellido_p}
              onChange={handleChange}
              required
              placeholder="Pérez"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="apellido_m">Apellido Materno</label>
            <input
              type="text"
              id="apellido_m"
              name="apellido_m"
              value={formData.apellido_m}
              onChange={handleChange}
              placeholder="García"
            />
          </div>

          <div className="form-group">
            <label htmlFor="celular">Teléfono</label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="1234567890"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña {!user && <span className="required">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              placeholder={user ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
              minLength="6"
            />
          </div>
        </div>

        <div className="form-row form-checkboxes">
          <div className="form-group-checkbox">
            <label>
              <input
                type="checkbox"
                name="admin"
                checked={formData.admin}
                onChange={handleChange}
              />
              <span className="checkbox-label">Administrador</span>
            </label>
          </div>

          <div className="form-group-checkbox">
            <label>
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <span className="checkbox-label">Activo</span>
            </label>
          </div>
        </div>

        <div className="form-info">
          <p>
            <strong>Nota:</strong> Se enviará un correo de verificación al usuario a la dirección
            proporcionada.
          </p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel" disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Guardando...' : user ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}
