import { useState, useEffect } from 'react';
import { graphEventBus } from '@/lib/graphEventBus';

interface Transform {
  k: number; // scale
  x: number; // translateX
  y: number; // translateY
}

export const useGraphTransform = () => {
  const [transform, setTransform] = useState<Transform>({ k: 1, x: 0, y: 0 });

  useEffect(() => {
    const handleTransformChange = (newTransform: Transform) => {
      setTransform(newTransform);
    };

    graphEventBus.on('transform:change', handleTransformChange);

    return () => {
      graphEventBus.off('transform:change', handleTransformChange);
    };
  }, []);

  return transform;
};

// Helper to apply transform to a point
export const applyTransform = (point: { x: number; y: number }, transform: Transform) => {
  return {
    x: point.x * transform.k + transform.x,
    y: point.y * transform.k + transform.y,
  };
};

// Helper to create CSS transform string
export const getTransformStyle = (position: { x: number; y: number }, transform: Transform) => {
  const transformed = applyTransform(position, transform);
  return `translate(${transformed.x}px, ${transformed.y}px) scale(${transform.k})`;
};