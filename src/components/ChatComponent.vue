<template>
  <div class="chat-container">
    <!-- Chat Header -->
    <div class="chat-header">
      <h2>Chat Departamento {{ selectedDepa }}</h2>
      <div class="user-status" v-if="usuarioEscribiendo">
        <span class="typing-indicator">{{ usuarioEscribiendo }} está escribiendo...</span>
      </div>
    </div>

    <!-- Messages List -->
    <div class="messages-list">
      <div
        v-for="mensaje in mensajes"
        :key="mensaje.id"
        class="mensaje"
        :class="{ 'sent': mensaje.remitente_id === usuarioId, 'received': mensaje.remitente_id !== usuarioId }"
      >
        <div class="mensaje-content">
          <p class="sender">{{ getNombreUsuario(mensaje.remitente_id) }}</p>
          <p class="text">{{ mensaje.contenido }}</p>
          <span class="time">{{ formatTime(mensaje.fecha) }}</span>
          <span v-if="mensaje.leido" class="leido">✓✓</span>
        </div>
      </div>
    </div>

    <!-- Unread Messages Count -->
    <div class="unread-badge" v-if="unreadCount > 0">
      {{ unreadCount }} mensajes sin leer
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <textarea
        v-model="nuevoMensaje"
        @keyup="handleTyping"
        @keydown.enter.ctrl="sendMessage"
        placeholder="Escribe un mensaje... (Ctrl+Enter para enviar)"
        class="message-input"
      ></textarea>

      <div class="message-type">
        <label>
          <input v-model="tipoMensaje" type="radio" value="personal" />
          Personal
        </label>
        <label>
          <input v-model="tipoMensaje" type="radio" value="departamento" />
          Departamento
        </label>
      </div>

      <button @click="sendMessage" class="send-btn" :disabled="!nuevoMensaje.trim()">
        Enviar
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatComponent',
  data() {
    return {
      mensajes: [],
      nuevoMensaje: '',
      tipoMensaje: 'departamento',
      usuarioId: 1, // TODO: Get from auth
      usuarioNombre: 'Juan Pérez', // TODO: Get from auth
      selectedDepa: 101, // TODO: Get from props
      unreadCount: 0,
      usuarioEscribiendo: null,
      typingTimeout: null,
      isLoading: false,
    };
  },
  mounted() {
    // Load initial messages
    this.loadMessages();
    this.getUnreadCount();

    // Subscribe to WebSocket channels
    this.subscribeToChannel();

    // Refresh messages periodically (as fallback)
    setInterval(() => {
      this.loadMessages();
      this.getUnreadCount();
    }, 5000);
  },
  methods: {
    /**
     * Load messages from backend
     */
    async loadMessages() {
      try {
        const response = await axios.get(`/api/chat/${this.selectedDepa}/messages`, {
          params: {
            page: 1,
            per_page: 50,
            usuario_id: this.tipoMensaje === 'personal' ? this.usuarioId : null,
          }
        });

        this.mensajes = response.data.data;
        // Mark messages as read
        this.markAllAsRead();
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    },

    /**
     * Send a new message
     */
    async sendMessage() {
      if (!this.nuevoMensaje.trim()) return;

      try {
        this.isLoading = true;
        await axios.post('/api/chat/send', {
          remitente_id: this.usuarioId,
          destinatario_id: this.tipoMensaje === 'personal' ? 2 : null, // TODO: Get from UI
          id_depa: this.selectedDepa,
          contenido: this.nuevoMensaje,
          tipo: this.tipoMensaje,
        });

        this.nuevoMensaje = '';
        this.stopTyping();
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Error al enviar el mensaje');
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Subscribe to WebSocket channel
     */
    subscribeToChannel() {
      if (!window.Echo) {
        console.error('Laravel Echo not configured');
        return;
      }

      window.Echo
        .private(`chat.departamento.${this.selectedDepa}`)
        .listen('mensaje-enviado', (evento) => {
          console.log('Nuevo mensaje recibido:', evento);
          this.mensajes.push(evento);
          this.scrollToBottom();
        })
        .listen('usuario-escribiendo', (evento) => {
          console.log('Usuario escribiendo:', evento);
          this.usuarioEscribiendo = evento.nombre_usuario;
          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.usuarioEscribiendo = null;
          }, 2000);
        });
    },

    /**
     * Handle typing indicator
     */
    handleTyping() {
      clearTimeout(this.typingTimeout);
      
      // Send typing indicator
      axios.post('/api/chat/typing', {
        usuario_id: this.usuarioId,
        id_depa: this.selectedDepa,
        nombre_usuario: this.usuarioNombre,
      }).catch(err => console.error('Error sending typing indicator:', err));

      // Auto-stop typing after 2 seconds of inactivity
      this.typingTimeout = setTimeout(() => {
        this.stopTyping();
      }, 2000);
    },

    /**
     * Stop typing indicator
     */
    stopTyping() {
      clearTimeout(this.typingTimeout);
    },

    /**
     * Mark all messages as read
     */
    async markAllAsRead() {
      const unreadMensajes = this.mensajes.filter(m => !m.leido && m.destinatario_id === this.usuarioId);
      
      for (const mensaje of unreadMensajes) {
        try {
          await axios.put(`/api/chat/${mensaje.id}/read`);
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    },

    /**
     * Get unread message count
     */
    async getUnreadCount() {
      try {
        const response = await axios.get(`/api/chat/${this.usuarioId}/unread`, {
          params: { id_depa: this.selectedDepa }
        });
        this.unreadCount = response.data.unread_count;
      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    },

    /**
     * Format timestamp
     */
    formatTime(fecha) {
      const date = new Date(fecha);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Get user name (mock - TODO: Connect to user database)
     */
    getNombreUsuario(usuarioId) {
      const usuarios = {
        1: 'Juan Pérez',
        2: 'María García',
        3: 'Carlos López',
      };
      return usuarios[usuarioId] || `Usuario ${usuarioId}`;
    },

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$el.querySelector('.messages-list');
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    }
  },
  beforeUnmount() {
    // Unsubscribe from channel
    if (window.Echo) {
      window.Echo.leave(`chat.departamento.${this.selectedDepa}`);
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-header h2 {
  margin: 0 0 5px 0;
  font-size: 20px;
}

.user-status {
  font-size: 12px;
  opacity: 0.9;
}

.typing-indicator {
  display: inline-block;
  animation: blink 1.4s infinite;
}

@keyframes blink {
  0%, 20%, 50%, 80%, 100% { opacity: 1; }
  40% { opacity: 0.5; }
  60% { opacity: 0.7; }
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mensaje {
  display: flex;
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mensaje.sent {
  justify-content: flex-end;
}

.mensaje.received {
  justify-content: flex-start;
}

.mensaje-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  word-wrap: break-word;
}

.mensaje.sent .mensaje-content {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.mensaje.received .mensaje-content {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sender {
  font-weight: 600;
  font-size: 12px;
  margin: 0 0 4px 0;
  opacity: 0.8;
}

.text {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.time {
  display: block;
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.leido {
  display: inline-block;
  margin-left: 4px;
  font-size: 10px;
}

.unread-badge {
  background: #ff6b6b;
  color: white;
  padding: 8px 12px;
  margin: 0 20px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 50px;
  max-height: 120px;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-type {
  display: flex;
  gap: 15px;
}

.message-type label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.message-type input {
  cursor: pointer;
}

.send-btn {
  align-self: flex-end;
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #764ba2;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .mensaje-content {
    max-width: 90%;
  }

  .chat-container {
    height: auto;
  }

  .messages-list {
    max-height: 400px;
  }
}
</style>
