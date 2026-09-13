import io from 'socket.io-client';
import { storage } from './api';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  async connect() {
    try {
      const token = await storage.getItem('token');
      const userStr = await storage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!token || !user) {
        console.log('❌ No auth token, skipping socket connection');
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token }
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket.id);
        // Join user-specific room
        this.socket.emit('join', user.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('notification', (notification) => {
        console.log('📩 Notification received:', notification);
        this.handleNotification(notification);
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  handleNotification(notification) {
    // Trigger all registered listeners
    this.listeners.forEach((callback) => {
      callback(notification);
    });
  }

  // Subscribe to notifications
  onNotification(id, callback) {
    this.listeners.set(id, callback);
  }

  // Unsubscribe
  offNotification(id) {
    this.listeners.delete(id);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
