import { io, Socket } from 'socket.io-client';

export interface WebSocketEvents {
  notification_received: (data: { notification: any; timestamp: string }) => void;
  order_status_updated: (data: { orderId: string; status: string; timestamp: string }) => void;
  delivery_updated: (data: { orderId: string; driverId: string; status: string; location: any; timestamp: string }) => void;
  payment_updated: (data: { orderId: string; status: string; timestamp: string }) => void;
  driver_location_updated: (data: { driverId: string; orderId: string; location: any; timestamp: string }) => void;
  stock_alert_received: (data: { productName: string; currentStock: number; timestamp: string }) => void;
  admin_broadcast_received: (data: { message: string; timestamp: string }) => void;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found, WebSocket connection skipped');
        return;
      }

      this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnected = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
        console.log(`🔌 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`);
      }
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔌 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 WebSocket reconnection failed');
      this.isConnected = false;
    });
  }

  // Subscribe to events
  public on<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Unsubscribe from events
  public off<T extends keyof WebSocketEvents>(event: T, callback?: WebSocketEvents[T]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Emit events
  public emit(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  // Check connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Manually reconnect
  public reconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connect();
  }

  // Disconnect
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // Get socket instance (for advanced usage)
  public getSocket(): Socket | null {
    return this.socket;
  }

  // Send order status update
  public sendOrderStatusUpdate(orderId: string, status: string, userId: string) {
    this.emit('order_status_update', { orderId, status, userId });
  }

  // Send delivery update
  public sendDeliveryUpdate(orderId: string, driverId: string, status: string, location: any) {
    this.emit('delivery_update', { orderId, driverId, status, location });
  }

  // Send payment update
  public sendPaymentUpdate(orderId: string, status: string, userId: string) {
    this.emit('payment_update', { orderId, status, userId });
  }

  // Send driver location update
  public sendDriverLocationUpdate(driverId: string, orderId: string, location: any) {
    this.emit('driver_location_update', { driverId, orderId, location });
  }

  // Send stock alert
  public sendStockAlert(vendorId: string, productName: string, currentStock: number) {
    this.emit('stock_alert', { vendorId, productName, currentStock });
  }

  // Send admin broadcast
  public sendAdminBroadcast(message: string, targetRoles?: string[]) {
    this.emit('admin_broadcast', { message, targetRoles });
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService; 