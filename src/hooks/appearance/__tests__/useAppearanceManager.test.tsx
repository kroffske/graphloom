import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAppearanceManager } from '../useAppearanceManager';

// Mock the store
const mockStore = {
  nodes: [
    { id: '1', type: 'person', label: 'Node 1' },
    { id: '2', type: 'company', label: 'Node 2' },
  ],
  edges: [],
  nodeTypeAppearances: {},
  edgeTypeAppearances: {},
  setNodes: vi.fn(),
  setEdges: vi.fn(),
  setNodeTypeAppearance: vi.fn(),
  setEdgeTypeAppearance: vi.fn(),
  selectedNodeType: 'person',
  setSelectedNodeType: vi.fn(),
  selectedEdgeType: null,
  setSelectedEdgeType: vi.fn(),
};

vi.mock('@/state/useGraphStore', () => ({
  useGraphStore: vi.fn(() => mockStore),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useAppearanceManager', () => {
  it('should update node appearances without infinite loops', () => {
    const { result } = renderHook(() => useAppearanceManager());
    
    const setNodes = mockStore.setNodes;
    
    act(() => {
      result.current.updateAllNodeAppearances({
        person: { color: '#ff0000', size: 20 },
        company: { color: '#00ff00', size: 30 },
      });
    });
    
    // Should call setNodes with a function
    expect(setNodes).toHaveBeenCalledTimes(1);
    expect(typeof setNodes.mock.calls[0][0]).toBe('function');
    
    // Test the function passed to setNodes
    const updateFn = setNodes.mock.calls[0][0];
    const mockNodes = [
      { id: '1', type: 'person', label: 'Node 1' },
      { id: '2', type: 'company', label: 'Node 2' },
    ];
    
    const updatedNodes = updateFn(mockNodes);
    
    expect(updatedNodes[0].appearance).toEqual({ color: '#ff0000', size: 20 });
    expect(updatedNodes[1].appearance).toEqual({ color: '#00ff00', size: 30 });
  });

  it('should handle preset loading without errors', () => {
    const { result } = renderHook(() => useAppearanceManager());
    
    const jsonStr = JSON.stringify({
      nodeTypes: {
        person: { color: '#ff0000', size: 20 },
      },
      edgeTypes: {
        knows: { color: '#0000ff', width: 2 },
      },
    });
    
    act(() => {
      result.current.handlePresetSaveFromJson(jsonStr);
    });
    
    const setNodeTypeAppearance = mockStore.setNodeTypeAppearance;
    const setEdgeTypeAppearance = mockStore.setEdgeTypeAppearance;
    
    expect(setNodeTypeAppearance).toHaveBeenCalledWith('person', { color: '#ff0000', size: 20 });
    expect(setEdgeTypeAppearance).toHaveBeenCalledWith('knows', { color: '#0000ff', width: 2 });
  });
});