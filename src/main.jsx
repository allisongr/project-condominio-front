import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Configure axios with token
const token = localStorage.getItem('token')
const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

if (usuario?.id) {
    axios.defaults.headers.common['X-Usuario-Id'] = usuario.id
}

// Configure Pusher client for Laravel Reverb
window.Pusher = Pusher

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'websocket-key',
    cluster: 'mt1',
    wsHost: '127.0.0.1',
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
    auth: {
        headers: {
            'X-Usuario-Id': usuario?.id || '',
        }
    }
})

console.log('Echo WebSocket client initialized with Reverb on localhost:8080')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

