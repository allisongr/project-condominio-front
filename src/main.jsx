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

// Function to initialize Echo with token
const initializeEcho = () => {
    const token = localStorage.getItem('token')
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    
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
                'Authorization': token ? `Bearer ${token}` : '',
                'X-Usuario-Id': usuario?.id || '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
    })
    
    console.group('🔌 WebSocket Configuration')
    console.log('WS Host:', wsHost)
    console.log('WS Port:', wsPort)
    console.log('WS URL:', `ws://${wsHost}:${wsPort}`)
    console.log('Token Present:', !!token)
    console.groupEnd()
}

// Initialize Echo on load if token exists
if (localStorage.getItem('token')) {
    initializeEcho()
}

// Export function for re-initialization after login
window.reinitializeEcho = initializeEcho

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

