import { useState } from 'react'
import axios from 'axios'

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [apellido_p, setApellidoP] = useState('')
  const [apellido_m, setApellidoM] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', {
        nombre,
        apellido_p,
        apellido_m,
        celular,
        email,
        password,
      })

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario))
      localStorage.setItem('token', response.data.token)

      onRegisterSuccess(response.data.usuario)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    marginTop: '5px', 
    boxSizing: 'border-box', 
    border: '1px solid #ddd', 
    borderRadius: '4px',
    color: '#333',
    fontSize: '14px'
  }
  
  const labelStyle = { 
    display: 'block', 
    marginBottom: '5px', 
    color: '#333', 
    fontWeight: 'bold',
    fontSize: '14px'
  }

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h2 style={{ color: '#333', marginBottom: '30px' }}>Registrarse</h2>
      {error && <p style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</p>}

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={inputStyle}
            placeholder="Tu nombre"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Apellido Paterno:</label>
          <input
            type="text"
            value={apellido_p}
            onChange={(e) => setApellidoP(e.target.value)}
            required
            style={inputStyle}
            placeholder="Apellido paterno"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Apellido Materno:</label>
          <input
            type="text"
            value={apellido_m}
            onChange={(e) => setApellidoM(e.target.value)}
            style={inputStyle}
            placeholder="Apellido materno"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Celular:</label>
          <input
            type="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            style={inputStyle}
            placeholder="Número de celular"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            placeholder="correo@example.com"
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle}>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Confirmar Contraseña:</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ 
            padding: '12px 20px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' }}
        >
          Inicia sesión aquí
        </button>
      </p>
    </div>
  )
}
