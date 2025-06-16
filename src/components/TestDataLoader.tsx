import React from 'react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/state/useGraphStore';
import { generateSmallTestGraph, generateMediumTestGraph, generateLargeTestGraph } from '@/utils/generateTestGraph';
import { Loader2, Shuffle } from 'lucide-react';
import { graphEventBus } from '@/lib/graphEventBus';

export const TestDataLoader: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const setNodes = useGraphStore(state => state.setNodes);
  const setEdges = useGraphStore(state => state.setEdges);
  const nodeCount = useGraphStore(state => state.nodes.length);
  const edgeCount = useGraphStore(state => state.edges.length);

  const loadTestData = async (size: 'small' | 'medium' | 'large') => {
    setLoading(true);
    
    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let testData;
    switch (size) {
      case 'small':
        testData = generateSmallTestGraph();
        break;
      case 'medium':
        testData = generateMediumTestGraph();
        break;
      case 'large':
        testData = generateLargeTestGraph();
        break;
    }
    
    console.log(`Loading ${testData.nodes.length} nodes and ${testData.edges.length} edges`);
    setNodes(testData.nodes);
    setEdges(testData.edges);
    setLoading(false);
  };

  return (
    <div className="flex gap-2 p-4 border-b items-center">
      <Button 
        onClick={() => loadTestData('small')} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load 50 Nodes'}
      </Button>
      <Button 
        onClick={() => loadTestData('medium')} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load 500 Nodes'}
      </Button>
      <Button 
        onClick={() => loadTestData('large')} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load 5000 Nodes'}
      </Button>
      {(nodeCount > 0 || edgeCount > 0) && (
        <>
          <div className="h-4 w-px bg-border mx-2" />
          <Button
            onClick={() => graphEventBus.emit('simulation:reheat', {})}
            variant="ghost"
            size="sm"
            title="Reorganize layout"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Reorganize
          </Button>
          <span className="text-sm text-muted-foreground ml-4">
            Current: {nodeCount} nodes, {edgeCount} edges
          </span>
        </>
      )}
    </div>
  );
};