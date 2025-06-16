import React from 'react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/state/useGraphStore';
import { generateSmallTestGraph, generateMediumTestGraph, generateLargeTestGraph } from '@/utils/generateTestGraph';
import { Loader2 } from 'lucide-react';

export const TestDataLoader: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const setNodes = useGraphStore(state => state.setNodes);
  const setEdges = useGraphStore(state => state.setEdges);

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
    
    setNodes(testData.nodes);
    setEdges(testData.edges);
    setLoading(false);
  };

  return (
    <div className="flex gap-2 p-4 border-b">
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
    </div>
  );
};