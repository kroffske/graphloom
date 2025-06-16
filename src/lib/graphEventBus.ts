// Simple EventEmitter implementation for browser
class SimpleEventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();
  
  emit(event: string, ...args: any[]): boolean {
    const handlers = this.events.get(event);
    if (!handlers) return false;
    handlers.forEach(handler => handler(...args));
    return true;
  }
  
  on(event: string, handler: (...args: any[]) => void): this {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
    return this;
  }
  
  off(event: string, handler: (...args: any[]) => void): this {
    const handlers = this.events.get(event);
    if (!handlers) return this;
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
    return this;
  }
  
  once(event: string, handler: (...args: any[]) => void): this {
    const wrappedHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };
    return this.on(event, wrappedHandler);
  }
}

export interface GraphEvents {
  'node:position': { nodeId: string; x: number; y: number };
  'node:dragstart': { nodeId: string };
  'node:dragend': { nodeId: string; x: number; y: number };
  'node:hover': { nodeId: string | null };
  'node:select': { nodeId: string };
  'node:contextmenu': { nodeId: string; x: number; y: number };
  'edge:hover': { edgeId: string | null };
  'edge:select': { edgeId: string };
  'edge:contextmenu': { edgeId: string; x: number; y: number };
  'transform:change': { k: number; x: number; y: number };
  'simulation:tick': { positions: Map<string, { x: number; y: number }> };
  'svg:dimensions': { svgScale: { x: number; y: number } };
  'simulation:reheat': {};
}

class TypedEventEmitter extends SimpleEventEmitter {
  emit<K extends keyof GraphEvents>(event: K, data: GraphEvents[K]): boolean {
    return super.emit(event, data);
  }

  on<K extends keyof GraphEvents>(
    event: K,
    handler: (data: GraphEvents[K]) => void
  ): this {
    return super.on(event, handler);
  }

  off<K extends keyof GraphEvents>(
    event: K,
    handler: (data: GraphEvents[K]) => void
  ): this {
    return super.off(event, handler);
  }

  once<K extends keyof GraphEvents>(
    event: K,
    handler: (data: GraphEvents[K]) => void
  ): this {
    return super.once(event, handler);
  }
}

// Singleton instance
export const graphEventBus = new TypedEventEmitter();

// Enable debugging in development
if (import.meta.env.DEV) {
  graphEventBus.on('node:position', (data) => {
    console.debug('[GraphEventBus] node:position', data);
  });
}