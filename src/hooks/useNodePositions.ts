import { useState, useEffect } from 'react';
import { graphEventBus } from '@/lib/graphEventBus';

interface Point {
  x: number;
  y: number;
}

export const useNodePositions = () => {
  const [positions, setPositions] = useState<Map<string, Point>>(new Map());

  useEffect(() => {
    const handlePositionUpdate = ({ nodeId, x, y }: { nodeId: string; x: number; y: number }) => {
      setPositions(prev => {
        const next = new Map(prev);
        next.set(nodeId, { x, y });
        return next;
      });
    };

    const handleSimulationTick = ({ positions: newPositions }: { positions: Map<string, Point> }) => {
      setPositions(newPositions);
    };

    graphEventBus.on('node:position', handlePositionUpdate);
    graphEventBus.on('simulation:tick', handleSimulationTick);

    return () => {
      graphEventBus.off('node:position', handlePositionUpdate);
      graphEventBus.off('simulation:tick', handleSimulationTick);
    };
  }, []);

  return positions;
};

export const useNodePosition = (nodeId: string): Point | undefined => {
  const [position, setPosition] = useState<Point | undefined>();

  useEffect(() => {
    const handlePositionUpdate = (data: { nodeId: string; x: number; y: number }) => {
      if (data.nodeId === nodeId) {
        setPosition({ x: data.x, y: data.y });
      }
    };

    const handleSimulationTick = ({ positions }: { positions: Map<string, Point> }) => {
      const pos = positions.get(nodeId);
      if (pos) {
        setPosition(pos);
      }
    };

    graphEventBus.on('node:position', handlePositionUpdate);
    graphEventBus.on('simulation:tick', handleSimulationTick);

    return () => {
      graphEventBus.off('node:position', handlePositionUpdate);
      graphEventBus.off('simulation:tick', handleSimulationTick);
    };
  }, [nodeId]);

  return position;
};