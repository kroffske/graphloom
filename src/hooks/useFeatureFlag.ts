import { useEffect, useState } from 'react';

/**
 * Hook to check if a feature flag is enabled via URL query parameters
 * Example: ?feature_USE_REACT_FIRST_GRAPH=true
 */
export function useFeatureFlag(flagName: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const checkFlag = () => {
      const params = new URLSearchParams(window.location.search);
      const flagValue = params.get(`feature_${flagName}`);
      setIsEnabled(flagValue === 'true');
    };

    // Check on mount
    checkFlag();

    // Listen for URL changes
    window.addEventListener('popstate', checkFlag);
    
    return () => {
      window.removeEventListener('popstate', checkFlag);
    };
  }, [flagName]);

  return isEnabled;
}