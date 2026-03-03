import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// IMPORTANTE: Cargar axiosConfig PRIMERO para activar interceptores globales
import './config/axiosConfig'

import './index.css'
import App from './App.jsx'
import API_BASE_URL from './config/api'

const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

if (usuario?.id) {
    console.log('✅ Usuario recuperado del localStorage:', usuario.id)
}

const wsHost = window.location.hostname
const wsPort = 8080

// Configure Pusher client for Laravel Reverb
window.Pusher = Pusher

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'websocket-key',
    cluster: 'mt1',
    wsHost: wsHost,
    wsPort: wsPort,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws'],
    authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`,
    auth: {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Usuario-Id': usuario?.id || '',
        }
    }
})

console.group('🔌 WebSocket Configuration')
console.log('WS Host:', wsHost)
console.log('WS Port:', wsPort)
console.log('WS URL:', `ws://${wsHost}:${wsPort}`)
console.groupEnd()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

