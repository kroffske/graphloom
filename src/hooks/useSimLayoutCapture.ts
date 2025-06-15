
import { useCallback } from "react";

/**
 * @deprecated This hook is no longer needed as position capture
 * has been consolidated into useD3GraphState
 */
export function useSimLayoutCapture() {
  const capturePositions = useCallback(() => {
    // This is now handled in useD3GraphState
    console.warn("useSimLayoutCapture is deprecated - position capture is now handled in useD3GraphState");
  }, []);

  return { capturePositions };
}
