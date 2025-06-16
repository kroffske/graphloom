import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface ForceAtlas2Options {
  gravity: number;
  scalingRatio: number;
  slowDown: number;
  barnesHut: boolean;
  barnesHutTheta: number;
  edgeWeightInfluence: number;
  linLogMode: boolean;
  preventOverlap: boolean;
  nodeSize: number;
}

interface FA2Node extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  mass?: number;
  size?: number;
}

export class ForceAtlas2Layout {
  private nodes: FA2Node[];
  private edges: SimulationLinkDatum<FA2Node>[];
  private options: ForceAtlas2Options;
  private running = false;
  private iterations = 0;
  
  constructor(
    nodes: FA2Node[], 
    edges: SimulationLinkDatum<FA2Node>[], 
    options: Partial<ForceAtlas2Options> = {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.options = {
      gravity: 1.0,
      scalingRatio: 2.0,
      slowDown: 1.0,
      barnesHut: true,
      barnesHutTheta: 0.5,
      edgeWeightInfluence: 1.0,
      linLogMode: false,
      preventOverlap: true,
      nodeSize: 10,
      ...options
    };
    
    // Initialize node positions if needed
    this.nodes.forEach(node => {
      if (node.x === undefined) node.x = Math.random() * 1000 - 500;
      if (node.y === undefined) node.y = Math.random() * 1000 - 500;
      if (!node.vx) node.vx = 0;
      if (!node.vy) node.vy = 0;
      if (!node.mass) node.mass = 1 + (node.size || 0) / 10;
    });
  }
  
  tick(): void {
    if (!this.running) return;
    
    // Reset forces
    this.nodes.forEach(node => {
      node.vx = 0;
      node.vy = 0;
    });
    
    // Apply gravity (attraction to center)
    this.applyGravity();
    
    // Apply repulsion between nodes
    if (this.options.barnesHut) {
      this.applyBarnesHutRepulsion();
    } else {
      this.applyRepulsion();
    }
    
    // Apply attraction along edges
    this.applyAttraction();
    
    // Apply forces to update positions
    this.applyForces();
    
    // Prevent overlap if enabled
    if (this.options.preventOverlap) {
      this.preventOverlap();
    }
    
    this.iterations++;
  }
  
  private applyGravity(): void {
    const { gravity, scalingRatio } = this.options;
    
    this.nodes.forEach(node => {
      if (node.fx !== null && node.fx !== undefined) return;
      
      const distance = Math.sqrt(node.x * node.x + node.y * node.y);
      if (distance > 0) {
        const force = gravity * node.mass! * scalingRatio / distance;
        node.vx! -= node.x * force;
        node.vy! -= node.y * force;
      }
    });
  }
  
  private applyRepulsion(): void {
    const { scalingRatio, linLogMode } = this.options;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      if (n1.fx !== null && n1.fx !== undefined) continue;
      
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          let force: number;
          if (linLogMode) {
            // LinLog mode: logarithmic repulsion
            force = scalingRatio * n1.mass! * n2.mass! / distance;
          } else {
            // Default mode: quadratic repulsion
            force = scalingRatio * n1.mass! * n2.mass! / (distance * distance);
          }
          
          const fx = dx / distance * force;
          const fy = dy / distance * force;
          
          if (n1.fx === null || n1.fx === undefined) {
            n1.vx! += fx;
            n1.vy! += fy;
          }
          
          if (n2.fx === null || n2.fx === undefined) {
            n2.vx! -= fx;
            n2.vy! -= fy;
          }
        }
      }
    }
  }
  
  private applyBarnesHutRepulsion(): void {
    // Simplified Barnes-Hut implementation
    // In a real implementation, this would use a quadtree
    // For now, we'll use a distance cutoff approximation
    const { scalingRatio, barnesHutTheta, linLogMode } = this.options;
    const theta2 = barnesHutTheta * barnesHutTheta;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      if (n1.fx !== null && n1.fx !== undefined) continue;
      
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distance2 = dx * dx + dy * dy;
        
        // Skip if nodes are too far (Barnes-Hut approximation)
        if (distance2 > 10000 * theta2) continue;
        
        const distance = Math.sqrt(distance2);
        if (distance > 0) {
          let force: number;
          if (linLogMode) {
            force = scalingRatio * n1.mass! * n2.mass! / distance;
          } else {
            force = scalingRatio * n1.mass! * n2.mass! / distance2;
          }
          
          const fx = dx / distance * force;
          const fy = dy / distance * force;
          
          if (n1.fx === null || n1.fx === undefined) {
            n1.vx! += fx;
            n1.vy! += fy;
          }
          
          if (n2.fx === null || n2.fx === undefined) {
            n2.vx! -= fx;
            n2.vy! -= fy;
          }
        }
      }
    }
  }
  
  private applyAttraction(): void {
    const { edgeWeightInfluence, linLogMode } = this.options;
    
    this.edges.forEach(edge => {
      const source = typeof edge.source === 'object' ? edge.source : 
        this.nodes.find(n => n.id === edge.source);
      const target = typeof edge.target === 'object' ? edge.target : 
        this.nodes.find(n => n.id === edge.target);
        
      if (!source || !target) return;
      
      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const edgeWeight = 1; // Could be customized per edge
        let force: number;
        
        if (linLogMode) {
          // LinLog mode: logarithmic attraction
          force = Math.log(1 + distance) * edgeWeight * edgeWeightInfluence;
        } else {
          // Default mode: linear attraction
          force = distance * edgeWeight * edgeWeightInfluence;
        }
        
        const fx = dx / distance * force;
        const fy = dy / distance * force;
        
        if (source.fx === null || source.fx === undefined) {
          source.vx! -= fx / source.mass!;
          source.vy! -= fy / source.mass!;
        }
        
        if (target.fx === null || target.fx === undefined) {
          target.vx! += fx / target.mass!;
          target.vy! += fy / target.mass!;
        }
      }
    });
  }
  
  private applyForces(): void {
    const { slowDown } = this.options;
    const maxDisplacement = 10;
    
    this.nodes.forEach(node => {
      if (node.fx !== null && node.fx !== undefined) {
        node.x = node.fx;
      } else {
        // Apply velocity with damping
        const displacement = Math.sqrt(node.vx! * node.vx! + node.vy! * node.vy!);
        if (displacement > maxDisplacement) {
          const scale = maxDisplacement / displacement;
          node.vx! *= scale;
          node.vy! *= scale;
        }
        
        node.x += node.vx! * slowDown;
        node.y += node.vy! * slowDown;
      }
      
      if (node.fy !== null && node.fy !== undefined) {
        node.y = node.fy;
      }
    });
  }
  
  private preventOverlap(): void {
    const { nodeSize } = this.options;
    const padding = nodeSize * 2;
    
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < padding && distance > 0) {
          const overlap = padding - distance;
          const fx = dx / distance * overlap * 0.5;
          const fy = dy / distance * overlap * 0.5;
          
          if (n1.fx === null || n1.fx === undefined) {
            n1.x += fx;
            n1.y += fy;
          }
          
          if (n2.fx === null || n2.fx === undefined) {
            n2.x -= fx;
            n2.y -= fy;
          }
        }
      }
    }
  }
  
  start(): void {
    this.running = true;
  }
  
  stop(): void {
    this.running = false;
  }
  
  isRunning(): boolean {
    return this.running;
  }
}