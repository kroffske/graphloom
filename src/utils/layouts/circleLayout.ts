import { SimulationNodeDatum } from 'd3';

export interface CircleLayoutOptions {
  center: [number, number];
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  clockwise?: boolean;
}

export function applyCircleLayout<T extends SimulationNodeDatum>(
  nodes: T[],
  options: CircleLayoutOptions = { center: [450, 265] }
): void {
  const {
    center,
    radius = 200,
    startAngle = 0,
    endAngle = 2 * Math.PI,
    clockwise = true
  } = options;
  
  const n = nodes.length;
  if (n === 0) return;
  
  const angleStep = (endAngle - startAngle) / n;
  const direction = clockwise ? 1 : -1;
  
  nodes.forEach((node, i) => {
    const angle = startAngle + i * angleStep * direction;
    node.x = center[0] + radius * Math.cos(angle);
    node.y = center[1] + radius * Math.sin(angle);
  });
}