// Debug logger that sends logs to backend in development
const DEBUG_ENDPOINT = 'http://localhost:3001/debug-log';

export const debugLog = (...args: any[]) => {
  // Convert args to string format for console too
  const stringArgs = args.map(arg => {
    if (arg instanceof Map) {
      // Special handling for Map objects
      const obj: any = {};
      arg.forEach((value, key) => {
        obj[key] = value;
      });
      return JSON.stringify(obj, null, 2);
    } else if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg, null, 2);
    }
    return String(arg);
  });
  
  // Log as single string to console to prevent collapsing
  console.log(stringArgs.join(' '));
  
  // In development, also send to backend
  if (import.meta.env.DEV) {
    try {
      const message = stringArgs.join(' ');
      
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