import { useState, useEffect } from 'react'
import axios from 'axios'
import './ChatApp.css'
import ChatWindow from './ChatWindow'
import ContactList from './ContactList'
import NavBar from './NavBar'

export default function ChatApp() {
  const [contactos, setContactos] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [isLoadingContactos, setIsLoadingContactos] = useState(true)
  const [usuarioActual] = useState({
    id: 999,
    nombre: 'Laura',
    rol: 'Administrator',
    apellido: 'García',
  })

  axios.defaults.baseURL = 'http://localhost:8000'

  // Cargar contactos desde la API
  useEffect(() => {
    loadContactos()
  }, [])

  const loadContactos = async () => {
    try {
      setIsLoadingContactos(true)
      // Cargar contactos desde la API
      const response = await axios.get('/api/usuarios/contactos')
      const contactosData = response.data || []
      
      setContactos(contactosData)
      if (contactosData.length > 0) {
        setSelectedContact(contactosData[0])
      }
    } catch (error) {
      console.error('Error loading contactos:', error)
      // Fallback a datos de ejemplo en caso de error
      const mockContactos = [
        {
          id: 1,
          nombre: 'Fernando',
          apellido: 'Godoy',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: true,
          depa: 101,
          email: 'fernando@example.com',
        },
        {
          id: 2,
          nombre: 'Monica',
          apellido: 'Martinez',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: false,
          depa: 102,
          email: 'monica@example.com',
        },
        {
          id: 3,
          nombre: 'Lorenzo',
          apellido: 'Herrera',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: true,
          depa: 103,
          email: 'lorenzo@example.com',
        },
        {
          id: 4,
          nombre: 'Francisco',
          apellido: 'González',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: false,
          depa: 104,
          email: 'francisco@example.com',
        },
        {
          id: 5,
          nombre: 'Lucia',
          apellido: 'Castañeda',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: true,
          depa: 105,
          email: 'lucia@example.com',
        },
        {
          id: 6,
          nombre: 'Maria',
          apellido: 'Perez',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: false,
          depa: 106,
          email: 'maria@example.com',
        },
        {
          id: 7,
          nombre: 'Carlos',
          apellido: 'Guadalupe',
          mensaje: 'Non in semper nisl adipiscing s...',
          online: true,
          depa: 107,
          email: 'carlos@example.com',
        },
      ]
      setContactos(mockContactos)
      setSelectedContact(mockContactos[0])
    } finally {
      setIsLoadingContactos(false)
    }
  }

  return (
    <div className="chat-app">
      <NavBar usuario={usuarioActual} />
      
      <div className="chat-container-main">
        <div className="contacts-panel">
          {isLoadingContactos ? (
            <div className="loading">Cargando...</div>
          ) : (
            <ContactList
              contactos={contactos}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
            />
          )}
        </div>

        <div className="chat-panel">
          {selectedContact ? (
            <ChatWindow
              contacto={selectedContact}
              usuarioActual={usuarioActual}
            />
          ) : (
            <div className="no-contact-selected">
              <p>Selecciona un contacto para empezar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
