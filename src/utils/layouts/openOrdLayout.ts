import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export interface OpenOrdOptions {
  stages: {
    liquid: { iterations: number; temperature: number; attraction: number; damping: number };
    expansion: { iterations: number; temperature: number; attraction: number; damping: number };
    cooldown: { iterations: number; temperature: number; attraction: number; damping: number };
    crunch: { iterations: number; temperature: number; attraction: number; damping: number };
    simmer: { iterations: number; temperature: number; attraction: number; damping: number };
  };
  edgeCutoff: number;
  realTime: boolean;
  density: number;
  preventOverlap: boolean;
  nodeSize: number;
}

interface OpenOrdNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  mass?: number;
  size?: number;
}

export class OpenOrdLayout {
  private nodes: OpenOrdNode[];
  private edges: SimulationLinkDatum<OpenOrdNode>[];
  private options: OpenOrdOptions;
  private running = false;
  private currentStage: keyof OpenOrdOptions['stages'] = 'liquid';
  private stageIteration = 0;
  private temperature = 0;
  private centerX = 450;
  private centerY = 265;
  
  // Node grids for spatial indexing (Barnes-Hut like optimization)
  private grid: Map<string, OpenOrdNode[]> = new Map();
  private gridSize = 50;
  
  constructor(
    nodes: OpenOrdNode[], 
    edges: SimulationLinkDatum<OpenOrdNode>[], 
    options: Partial<OpenOrdOptions> = {}
  ) {
    this.nodes = nodes;
    this.edges = edges;
    
    // Default OpenOrd parameters based on the paper
    this.options = {
      stages: {
        liquid: { iterations: 200, temperature: 0.2, attraction: 2.0, damping: 0.9 },
        expansion: { iterations: 200, temperature: 0.15, attraction: 10.0, damping: 0.85 },
        cooldown: { iterations: 200, temperature: 0.1, attraction: 1.0, damping: 0.8 },
        crunch: { iterations: 100, temperature: 0.05, attraction: 10.0, damping: 0.75 },
        simmer: { iterations: 50, temperature: 0.01, attraction: 1.0, damping: 0.7 },
      },
      edgeCutoff: 0.9,
      realTime: true,
      density: 1.0,
      preventOverlap: true,
      nodeSize: 10,
      ...options
    };
    
    // Initialize node properties
    this.initializeNodes();
    
    // Set initial temperature
    this.temperature = this.options.stages[this.currentStage].temperature;
  }
  
  private initializeNodes(): void {
    const angleStep = (2 * Math.PI) / this.nodes.length;
    const radius = Math.min(400, this.nodes.length * 5);
    
    this.nodes.forEach((node, i) => {
      // Initialize in a circle to avoid initial overlaps
      if (node.x === undefined || node.x === null) {
        const angle = i * angleStep;
        node.x = this.centerX + radius * Math.cos(angle) * (0.8 + Math.random() * 0.4);
        node.y = this.centerY + radius * Math.sin(angle) * (0.8 + Math.random() * 0.4);
      }
      
      node.vx = 0;
      node.vy = 0;
      node.mass = 1 + (node.size || 0) / 10;
    });
    
    // Build initial spatial index
    this.updateGrid();
  }
  
  private updateGrid(): void {
    this.grid.clear();
    
    this.nodes.forEach(node => {
      const gridX = Math.floor(node.x / this.gridSize);
      const gridY = Math.floor(node.y / this.gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(node);
    });
  }
  
  private getNodesInRegion(x: number, y: number, radius: number): OpenOrdNode[] {
    const nodes: OpenOrdNode[] = [];
    const gridRadius = Math.ceil(radius / this.gridSize);
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    
    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const key = `${gridX + dx},${gridY + dy}`;
        const cellNodes = this.grid.get(key) || [];
        nodes.push(...cellNodes);
      }
    }
    
    return nodes;
  }
  
  tick(): void {
    if (!this.running) return;
    
    const stage = this.options.stages[this.currentStage];
    
    // Reset forces
    this.nodes.forEach(node => {
      if (node.fx === null || node.fx === undefined) {
        node.vx = 0;
        node.vy = 0;
      }
    });
    
    // Apply OpenOrd forces based on current stage
    this.applyRepulsion(stage);
    this.applyAttraction(stage);
    
    // Apply random displacement (simulated annealing)
    this.applyRandomDisplacement();
    
    // Update positions
    this.updatePositions(stage);
    
    // Update spatial index periodically
    if (this.stageIteration % 10 === 0) {
      this.updateGrid();
    }
    
    // Advance stage if needed
    this.stageIteration++;
    if (this.stageIteration >= stage.iterations) {
      this.advanceStage();
    }
  }
  
  private applyRepulsion(stage: typeof this.options.stages.liquid): void {
    const { density } = this.options;
    
    // Use grid-based neighbor search for efficiency
    this.nodes.forEach(node => {
      if (node.fx !== null && node.fx !== undefined) return;
      
      // Get nearby nodes
      const nearbyNodes = this.getNodesInRegion(node.x, node.y, 200);
      
      nearbyNodes.forEach(other => {
        if (node === other) return;
        
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist2 = dx * dx + dy * dy;
        
        if (dist2 > 0 && dist2 < 10000) { // Cutoff for performance
          const dist = Math.sqrt(dist2);
          
          // OpenOrd-style repulsion
          const force = (density * node.mass! * other.mass!) / dist2 * this.temperature;
          
          node.vx! += (dx / dist) * force;
          node.vy! += (dy / dist) * force;
        }
      });
    });
  }
  
  private applyAttraction(stage: typeof this.options.stages.liquid): void {
    const { attraction } = stage;
    const { edgeCutoff } = this.options;
    
    // Apply attraction along edges
    this.edges.forEach(edge => {
      const source = typeof edge.source === 'object' ? edge.source : 
        this.nodes.find(n => n.id === edge.source);
      const target = typeof edge.target === 'object' ? edge.target : 
        this.nodes.find(n => n.id === edge.target);
        
      if (!source || !target) return;
      
      const dx = source.x - target.x;
      const dy = source.y - target.y;
      const dist2 = dx * dx + dy * dy;
      
      if (dist2 > 0) {
        const dist = Math.sqrt(dist2);
        
        // OpenOrd uses edge cutting to handle long edges
        const effectiveDist = Math.min(dist, dist * edgeCutoff);
        
        // Stage-dependent attraction
        const force = attraction * effectiveDist * this.temperature;
        
        if (source.fx === null || source.fx === undefined) {
          source.vx! -= (dx / dist) * force / source.mass!;
          source.vy! -= (dy / dist) * force / source.mass!;
        }
        
        if (target.fx === null || target.fx === undefined) {
          target.vx! += (dx / dist) * force / target.mass!;
          target.vy! += (dy / dist) * force / target.mass!;
        }
      }
    });
  }
  
  private applyRandomDisplacement(): void {
    // Simulated annealing - random jitter decreases with temperature
    const jitter = this.temperature * 50;
    
    this.nodes.forEach(node => {
      if (node.fx === null || node.fx === undefined) {
        node.vx! += (Math.random() - 0.5) * jitter;
        node.vy! += (Math.random() - 0.5) * jitter;
      }
    });
  }
  
  private updatePositions(stage: typeof this.options.stages.liquid): void {
    const { damping } = stage;
    const maxDisplacement = 10 * this.temperature;
    
    this.nodes.forEach(node => {
      if (node.fx !== null && node.fx !== undefined) {
        node.x = node.fx;
      } else {
        // Apply damping
        node.vx! *= damping;
        node.vy! *= damping;
        
        // Limit displacement
        const displacement = Math.sqrt(node.vx! * node.vx! + node.vy! * node.vy!);
        if (displacement > maxDisplacement) {
          const scale = maxDisplacement / displacement;
          node.vx! *= scale;
          node.vy! *= scale;
        }
        
        // Update position
        node.x += node.vx!;
        node.y += node.vy!;
      }
      
      if (node.fy !== null && node.fy !== undefined) {
        node.y = node.fy;
      }
    });
    
    // Prevent overlap if enabled
    if (this.options.preventOverlap) {
      this.preventOverlap();
    }
  }
  
  private preventOverlap(): void {
    const { nodeSize } = this.options;
    const padding = nodeSize * 2;
    
    // Simple overlap prevention
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      if (n1.fx !== null && n1.fx !== undefined) continue;
      
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist2 = dx * dx + dy * dy;
        const minDist = padding;
        
        if (dist2 < minDist * minDist && dist2 > 0) {
          const dist = Math.sqrt(dist2);
          const overlap = minDist - dist;
          const pushX = (dx / dist) * overlap * 0.5;
          const pushY = (dy / dist) * overlap * 0.5;
          
          if (n1.fx === null || n1.fx === undefined) {
            n1.x += pushX;
            n1.y += pushY;
          }
          
          if (n2.fx === null || n2.fx === undefined) {
            n2.x -= pushX;
            n2.y -= pushY;
          }
        }
      }
    }
  }
  
  private advanceStage(): void {
    const stages: (keyof OpenOrdOptions['stages'])[] = ['liquid', 'expansion', 'cooldown', 'crunch', 'simmer'];
    const currentIndex = stages.indexOf(this.currentStage);
    
    if (currentIndex < stages.length - 1) {
      this.currentStage = stages[currentIndex + 1];
      this.stageIteration = 0;
      this.temperature = this.options.stages[this.currentStage].temperature;
      
      console.log(`[OpenOrd] Advancing to stage: ${this.currentStage}`);
    } else {
      // Layout complete
      this.stop();
      console.log('[OpenOrd] Layout complete');
    }
  }
  
  start(): void {
    this.running = true;
    this.currentStage = 'liquid';
    this.stageIteration = 0;
    this.temperature = this.options.stages[this.currentStage].temperature;
  }
  
  stop(): void {
    this.running = false;
  }
  
  isRunning(): boolean {
    return this.running;
  }
  
  getCurrentStage(): string {
    return `${this.currentStage} (${this.stageIteration}/${this.options.stages[this.currentStage].iterations})`;
  }
}