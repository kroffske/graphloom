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
  useGraphStore: Object.assign(vi.fn(() => mockStore), {
    getState: vi.fn(() => mockStore),
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useAppearanceManager', () => {
  it.skip('should update node appearances without infinite loops', () => {
    const { result } = renderHook(() => useAppearanceManager());
    
    const setNodeTypeAppearance = mockStore.setNodeTypeAppearance;
    
    act(() => {
      result.current.updateNodeTypeAppearance('person', { 
        icon: '👤',
        backgroundColor: '#ff0000', 
        size: 20 
      });
    });
    
    // Should call setNodeTypeAppearance
    expect(setNodeTypeAppearance).toHaveBeenCalledWith('person', { 
      icon: '👤',
      backgroundColor: '#ff0000', 
      size: 20 
    });
    
    // Test that preset is now dirty
    expect(result.current.isPresetDirty).toBe(true);
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