import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config/backend';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(WS_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  sendAIMessage(roomId: string, message: string, bookContext: any) {
    if (this.socket) {
      this.socket.emit('ai-message', {
        roomId,
        message,
        bookContext
      });
    }
  }

  onAIResponse(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ai-response', callback);
    }
  }

  onAIError(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ai-error', callback);
    }
  }

  onAIThinking(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ai-thinking', callback);
    }
  }

  removeListener(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();