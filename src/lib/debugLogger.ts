// Debug logger that sends logs to backend in development
const DEBUG_ENDPOINT = 'http://localhost:3001/debug-log';

export const debugLog = (...args: any[]) => {
  // Always log to browser console
  console.log(...args);
  
  // In development, also send to backend
  if (import.meta.env.DEV) {
    try {
      // Convert args to string format
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');
      
      // Send to backend
      fetch(DEBUG_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          timestamp: new Date().toISOString(),
          message 
        }),
      }).catch(() => {
        // Silently fail if backend is not running
      });
    } catch (e) {
      // Ignore serialization errors
    }
  }
};