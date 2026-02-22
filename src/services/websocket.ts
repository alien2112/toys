class WebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private userId: number | null = null;
  private isAgent: boolean = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private isConnecting = false;
  private usePolling = false;
  private pollingInterval: number | null = null;
  private pollingDelay = 3000; // 3 seconds

  constructor() {
    this.listeners = {
      open: [],
      message: [],
      error: [],
      close: [],
      typing: [],
      userJoined: [],
      userLeft: [],
      newMessage: []
    };
  }

  connect(sessionId: string, userId: number | null = null, isAgent: boolean = false) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.sessionId = sessionId;
    this.userId = userId;
    this.isAgent = isAgent;
    this.isConnecting = true;
    this.usePolling = false;

    const wsUrl = `ws://localhost:8080`;
    
    try {
      this.ws = new WebSocket(wsUrl);

      // Set a timeout for WebSocket connection
      let connectionTimeout: number | null = setTimeout(() => {
        if (this.isConnecting) {
          console.log('WebSocket connection timeout, falling back to polling');
          this.isConnecting = false;
          this.fallbackToPolling();
        }
      }, 5000);

      this.ws.onopen = () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.stopPolling(); // Stop polling if it was active
        
        // Join the chat session
        this.send({
          type: 'join_session',
          session_id: sessionId,
          user_id: userId,
          is_agent: isAgent
        });

        this.emit('open', { connected: true, usingWebSockets: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.fallbackToPolling();
      };

      this.ws.onclose = () => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.emit('close', { connected: false });
        
        // Attempt to reconnect a few times, then fallback to polling
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        } else {
          console.log('Max reconnection attempts reached, falling back to polling');
          this.fallbackToPolling();
        }
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.fallbackToPolling();
    }
  }

  private fallbackToPolling() {
    this.usePolling = true;
    this.emit('open', { connected: true, usingWebSockets: false });
    this.startPolling();
  }

  private startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    // Load initial messages
    this.loadMessagesFromAPI();

    // Set up polling interval
    this.pollingInterval = window.setInterval(() => {
      this.loadMessagesFromAPI();
    }, this.pollingDelay);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async loadMessagesFromAPI() {
    if (!this.sessionId) return;

    try {
      const response = await fetch(`/api/chat/sessions/${this.sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const messages = await response.json();
        this.emit('messagesLoaded', messages);
      }
    } catch (error) {
      console.error('Error loading messages via polling:', error);
      this.emit('error', { message: 'Failed to load messages' });
    }
  }

  private async sendMessageViaAPI(message: string) {
    if (!this.sessionId) return;

    try {
      const response = await fetch(`/api/chat/sessions/${this.sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          is_agent: this.isAgent,
          sender_id: this.userId
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.emit('messageSent', result);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message via API:', error);
      this.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'session_joined':
        this.emit('sessionJoined', data);
        break;
      case 'new_message':
        this.emit('newMessage', data.message);
        break;
      case 'typing_status':
        this.emit('typing', data);
        break;
      case 'user_joined':
        this.emit('userJoined', data.user_info);
        break;
      case 'user_left':
        this.emit('userLeft', data);
        break;
      case 'error':
        this.emit('error', { message: data.message });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private reconnect() {
    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(() => {
      if (this.sessionId) {
        this.connect(this.sessionId, this.userId, this.isAgent);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  sendMessage(message: string) {
    if (this.usePolling) {
      // Send via HTTP API when using polling
      this.sendMessageViaAPI(message);
    } else if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Send via WebSocket when connected
      this.send({
        type: 'chat_message',
        message: message,
        is_agent: this.isAgent,
        sender_id: this.userId
      });
    } else {
      console.error('Not connected (WebSocket failed and polling not active)');
      this.emit('error', { message: 'Not connected to chat server' });
    }
  }

  sendTyping(isTyping: boolean) {
    if (this.usePolling) {
      // Typing indicators not supported with polling
      return;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'typing',
        typing: isTyping
      });
    }
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.stopPolling();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    if (this.usePolling) {
      return true; // Considered connected when using polling
    }
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  isUsingWebSockets(): boolean {
    return !this.usePolling && this.isConnected();
  }

  // Event listener methods
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
