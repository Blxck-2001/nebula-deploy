type MessageHandler = (data: unknown) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = (event: CloseEvent) => void;

export interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  onMessage?: MessageHandler;
  onError?: ErrorHandler;
  onClose?: CloseHandler;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class RealtimeWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private options: WebSocketOptions;

  constructor(options: WebSocketOptions) {
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }

  connect(): void {
    if (typeof window === "undefined") return;

    this.ws = new WebSocket(this.options.url, this.options.protocols);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.options.onMessage?.(data);
      } catch {
        this.options.onMessage?.(event.data);
      }
    };

    this.ws.onerror = (error) => {
      this.options.onError?.(error);
    };

    this.ws.onclose = (event) => {
      this.options.onClose?.(event);
      if (this.options.reconnect) {
        this.scheduleReconnect();
      }
    };
  }

  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === "string" ? data : JSON.stringify(data));
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.options.reconnect = false;
    this.ws?.close();
    this.ws = null;
  }

  private scheduleReconnect(): void {
    const max = this.options.maxReconnectAttempts ?? 5;
    if (this.reconnectAttempts >= max) return;

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.options.reconnectInterval);
  }
}

export interface SSEOptions {
  url: string;
  onMessage?: MessageHandler;
  onError?: ErrorHandler;
  withCredentials?: boolean;
}

export class RealtimeSSE {
  private eventSource: EventSource | null = null;
  private options: SSEOptions;

  constructor(options: SSEOptions) {
    this.options = options;
  }

  connect(): void {
    if (typeof window === "undefined") return;

    this.eventSource = new EventSource(this.options.url, {
      withCredentials: this.options.withCredentials,
    });

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.options.onMessage?.(data);
      } catch {
        this.options.onMessage?.(event.data);
      }
    };

    this.eventSource.onerror = (error) => {
      this.options.onError?.(error);
    };
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
  }
}
