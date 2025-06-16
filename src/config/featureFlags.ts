// Feature flags for controlling experimental features
export const FEATURE_FLAGS = {
  // Use portal-based rendering for graph nodes instead of D3 foreignObject
  USE_PORTAL_RENDERING: false,
  
  // Enable debug logging for graph events
  DEBUG_GRAPH_EVENTS: import.meta.env.DEV,
} as const;

// Helper to check feature flags from URL params (for testing)
export const getFeatureFlag = (flag: keyof typeof FEATURE_FLAGS): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlFlag = urlParams.get(`feature_${flag}`);
  
  if (urlFlag !== null) {
    return urlFlag === 'true';
  }
  
  return FEATURE_FLAGS[flag];
};

// Export individual flags for easier use
export const usePortalRendering = () => getFeatureFlag('USE_PORTAL_RENDERING');
export const debugGraphEvents = () => getFeatureFlag('DEBUG_GRAPH_EVENTS');