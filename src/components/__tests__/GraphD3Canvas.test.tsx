import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import GraphD3Canvas from '../GraphD3Canvas';

// Mock the store
const mockStore = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  nodeAppearances: {},
  edgeAppearances: {},
  nodeTypeAppearances: {},
  edgeTypeAppearances: {},
  hiddenNodeIds: new Set(),
  hiddenNodeTypes: new Set(),
  hiddenEdgeTypes: new Set(),
  appearance: {
    showEdgeLabels: true,
    showNodeLabels: true,
  },
  layout: {
    algorithm: 'force' as const,
    forceSettings: {
      nodeRepulsion: 100,
      linkDistance: 50,
      linkStrength: 1,
      centerStrength: 0.1,
      alphaDecay: 0.01,
    },
  },
  selectNode: vi.fn(),
  selectEdge: vi.fn(),
  setTimeRange: vi.fn(),
  onNodeContextMenu: vi.fn(),
  onEdgeContextMenu: vi.fn(),
  timeRange: null,
};

vi.mock('@/state/useGraphStore', () => ({
  useGraphStore: vi.fn(() => mockStore),
}));

// Mock D3 with more complete implementation
const mockD3Selection = {
  append: vi.fn().mockReturnThis(),
  attr: vi.fn().mockReturnThis(),
  call: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  node: vi.fn(() => document.createElement('svg')),
  selectAll: vi.fn().mockReturnThis(),
  data: vi.fn().mockReturnThis(),
  join: vi.fn().mockReturnThis(),
  remove: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  style: vi.fn().mockReturnThis(),
  each: vi.fn().mockReturnThis(),
  html: vi.fn().mockReturnThis(),
};

vi.mock('d3', () => ({
  select: vi.fn(() => mockD3Selection),
  selectAll: vi.fn(() => mockD3Selection),
  zoom: vi.fn(() => ({
    scaleExtent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  })),
  zoomIdentity: { k: 1, x: 0, y: 0 },
  forceSimulation: vi.fn(() => ({
    force: vi.fn().mockReturnThis(),
    nodes: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    alpha: vi.fn().mockReturnThis(),
    alphaTarget: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnThis(),
    strength: vi.fn().mockReturnThis(),
    links: vi.fn().mockReturnThis(),
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceCenter: vi.fn(() => ({})),
  forceCollide: vi.fn(() => ({
    radius: vi.fn().mockReturnThis(),
  })),
  drag: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
  })),
  pointer: vi.fn(() => [0, 0]),
}));

describe('GraphD3Canvas', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
    // Reset mockStore to default state
    Object.assign(mockStore, {
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      nodeAppearances: {},
      edgeAppearances: {},
      nodeTypeAppearances: {},
      edgeTypeAppearances: {},
      hiddenNodeIds: new Set(),
      hiddenNodeTypes: new Set(),
      hiddenEdgeTypes: new Set(),
      appearance: {
        showEdgeLabels: true,
        showNodeLabels: true,
      },
      layout: {
        algorithm: 'force' as const,
        forceSettings: {
          nodeRepulsion: 100,
          linkDistance: 50,
          linkStrength: 1,
          centerStrength: 0.1,
          alphaDecay: 0.01,
        },
      },
      selectNode: vi.fn(),
      selectEdge: vi.fn(),
      setTimeRange: vi.fn(),
      onNodeContextMenu: vi.fn(),
      onEdgeContextMenu: vi.fn(),
      timeRange: null,
    });
  });

  it.skip('should render without infinite loops', async () => {
    const { container } = render(<GraphD3Canvas />);
    
    // Wait for any effects to settle
    await waitFor(() => {
      expect(container.querySelector('.graph-d3-canvas')).toBeInTheDocument();
    });
    
    // Component should render without errors
    expect(container).toBeTruthy();
  });

  it.skip('should not cause re-renders when time range is initialized', async () => {
    const setTimeRange = vi.fn();
    
    // Update mock store with time-based edges
    Object.assign(mockStore, {
      edges: [
        { id: '1', source: 'a', target: 'b', timestamp: 1000 },
        { id: '2', source: 'b', target: 'c', timestamp: 2000 },
      ],
      setTimeRange,
    });

    render(<GraphD3Canvas />);
    
    // Wait for effect to run
    await waitFor(() => {
      // setTimeRange should be called only once
      expect(setTimeRange).toHaveBeenCalledTimes(1);
      expect(setTimeRange).toHaveBeenCalledWith([1000, 2000]);
    });
  });
});