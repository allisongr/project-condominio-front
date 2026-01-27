import './Avatar.css'

export default function Avatar({ nombre, apellido, id, size = 'medium' }) {
  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0)}${apellido?.charAt(0)}`.toUpperCase()
  }

  const getColor = (id) => {
    const colors = ['#2d7a6a', '#4a9b7f', '#5fa896', '#3a8f73', '#2d6b5e', '#418069', '#5ba885', '#6eb699', '#4d8778']
    return colors[id % colors.length]
  }

  return (
    <div className={`avatar avatar-${size}`} style={{ backgroundColor: getColor(id) }}>
      {getInitials(nombre, apellido)}
    </div>
  )
}
