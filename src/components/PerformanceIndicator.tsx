import React from 'react';
import { Activity } from 'lucide-react';

interface PerformanceIndicatorProps {
  totalNodes: number;
  visibleNodes: number;
  zoom: number;
  simplified: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  totalNodes,
  visibleNodes,
  zoom,
  simplified
}) => {
  const performanceRatio = visibleNodes / totalNodes;
  const color = performanceRatio < 0.3 ? 'text-green-500' : 
                performanceRatio < 0.6 ? 'text-yellow-500' : 
                'text-red-500';
  
  return (
    <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2 text-xs space-y-1">
      <div className="flex items-center gap-2">
        <Activity className={`w-3 h-3 ${color}`} />
        <span className="font-medium">Performance</span>
      </div>
      <div className="text-muted-foreground">
        <div>Visible: {visibleNodes} / {totalNodes} nodes</div>
        <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
        {simplified && <div className="text-yellow-500">Simplified rendering</div>}
      </div>
    </div>
  );
};