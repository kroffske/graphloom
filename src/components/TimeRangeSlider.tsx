import React, { useCallback, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { useGraphStore } from '@/state/useGraphStore';
import { formatTimestamp } from '@/utils/timestampUtils';
import { cn } from '@/lib/utils';
import { Edge } from '@/types/graph.types';

interface TimeRangeSliderProps {
  className?: string;
}

export const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({ className }) => {
  const timeRange = useGraphStore(state => state.timeRange);
  const selectedTimeRange = useGraphStore(state => state.selectedTimeRange);
  const setSelectedTimeRange = useGraphStore(state => state.setSelectedTimeRange);
  const edges = useGraphStore(state => state.edges);
  const nodes = useGraphStore(state => state.nodes);
  const timestampField = useGraphStore(state => state.timestampField);
  const showIsolatedNodes = useGraphStore(state => state.showIsolatedNodes);

  // Animation state
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const animationRef = React.useRef<number>();
  
  // Set initial range if not set
  React.useEffect(() => {
    if (!selectedTimeRange && timeRange) {
      setSelectedTimeRange({ start: timeRange.min, end: timeRange.max });
    }
  }, [selectedTimeRange, timeRange, setSelectedTimeRange]);
  
  // Cleanup animation on unmount
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Memoized values
  const { min, max, range } = React.useMemo(() => {
    if (!timeRange) return { min: 0, max: 0, range: 0 };
    return { 
      min: timeRange.min, 
      max: timeRange.max, 
      range: timeRange.max - timeRange.min 
    };
  }, [timeRange]);
  
  const currentRange = React.useMemo(() => {
    if (!selectedTimeRange) return { start: min, end: max };
    return selectedTimeRange;
  }, [selectedTimeRange, min, max]);

  const handleSliderChange = useCallback((value: number[]) => {
    if (value.length === 2) {
      setSelectedTimeRange({
        start: value[0],
        end: value[1]
      });
    }
  }, [setSelectedTimeRange]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      // Play
      setIsPlaying(true);
      const startTime = Date.now();
      const duration = 10000 / playbackSpeed; // 10 seconds at 1x speed
      const startRange = currentRange.start;
      const endRange = currentRange.end;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          const newEnd = startRange + (endRange - startRange) * progress;
          setSelectedTimeRange({
            start: startRange,
            end: newEnd
          });
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };
      
      animate();
    }
  }, [isPlaying, playbackSpeed, currentRange, setSelectedTimeRange]);

  const handleReset = useCallback(() => {
    setSelectedTimeRange({ start: min, end: max });
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [min, max, setSelectedTimeRange]);

  const handleSpeedChange = useCallback(() => {
    const speeds = [1, 2, 5, 10];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  }, [playbackSpeed]);

  // Calculate active edges and nodes - MUST be before any conditional returns
  const { activeEdges, activeNodes } = useMemo(() => {
    if (!selectedTimeRange || !timestampField) {
      return { activeEdges: edges.length, activeNodes: nodes.length };
    }
    
    const filteredEdges = edges.filter(edge => {
      const value = timestampField.includes('.') 
        ? timestampField.split('.').reduce((obj: any, key) => obj?.[key], edge)
        : (edge as any)[timestampField];
      
      if (!value) return true; // Include edges without timestamps
      
      const timestamp = new Date(value).getTime();
      return !isNaN(timestamp) && timestamp >= currentRange.start && timestamp <= currentRange.end;
    });
    
    // Calculate connected nodes
    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      connectedNodeIds.add(sourceId);
      connectedNodeIds.add(targetId);
    });
    
    // Calculate active nodes count based on showIsolatedNodes setting
    const activeNodesCount = showIsolatedNodes ? nodes.length : connectedNodeIds.size;
    
    return { 
      activeEdges: filteredEdges.length, 
      activeNodes: activeNodesCount 
    };
  }, [edges, nodes, timestampField, currentRange, selectedTimeRange, showIsolatedNodes]);
  
  // If no time range is set, don't render
  if (!timeRange || !timestampField) {
    return null;
  }

  return (
    <div className={cn("bg-card border rounded-lg p-4", className)}>
      <div className="space-y-3">
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="w-8 h-8 p-0"
              title={isPlaying ? "Pause animation" : "Play from current position (Reset to play from beginning)"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpeedChange}
              className="h-8 px-2"
            >
              <FastForward className="h-4 w-4 mr-1" />
              {playbackSpeed}x
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-8 h-8 p-0"
              title="Reset timeline to show all data"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <span>Nodes: {activeNodes} / {nodes.length}</span>
            <span className="mx-2">|</span>
            <span>Edges: {activeEdges} / {edges.length}</span>
          </div>
        </div>

        {/* Time labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTimestamp(currentRange.start, 'datetime')}</span>
          {currentRange.start > min && !isPlaying && (
            <span className="text-yellow-600 dark:text-yellow-500 text-xs italic">
              Timeline filtered - Reset to see full animation
            </span>
          )}
          <span>{formatTimestamp(currentRange.end, 'datetime')}</span>
        </div>

        {/* Slider */}
        <Slider
          min={min}
          max={max}
          step={Math.max(1, Math.floor(range / 1000))} // Max 1000 steps
          value={[currentRange.start, currentRange.end]}
          onValueChange={handleSliderChange}
          className="py-4"
          disabled={isPlaying}
        />

        {/* Min/Max labels */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {formatTimestamp(min, 'date')}</span>
          <span>Max: {formatTimestamp(max, 'date')}</span>
        </div>
      </div>
    </div>
  );
};