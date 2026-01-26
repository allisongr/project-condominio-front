import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import './index.css'
import App from './App.jsx'

// Configure Pusher for WebSocket with HTTP fallback
window.Pusher = Pusher

// Disable WebSocket, use HTTP polling
Pusher.logToConsole = false

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'websocket-key',
    cluster: 'mt1',
    wsHost: 'localhost',
    wsPort: 6001,
    wssPort: 443,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['http_streaming', 'http_polling'],
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
