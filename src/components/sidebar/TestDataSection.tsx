import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/state/useGraphStore';
import { 
  generateSmallTestGraph, 
  generateMediumTestGraph, 
  generateLargeTestGraph 
} from '@/utils/generateTestGraph';
import { generateTransparentTestGraph } from '@/utils/generateTransparentTestGraph';
import { Loader2, Shuffle, Circle, Database, Activity, Info } from 'lucide-react';
import { graphEventBus } from '@/lib/graphEventBus';
import { analyzeTimestampFields, findTimeRange } from '@/utils/timestampUtils';
import { Label } from '@/components/ui/label';
import { CollapsibleSubsection } from './CollapsibleSubsection';

export const TestDataSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setNodes, setEdges, nodes, edges } = useGraphStore();
  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  const loadTestData = async (size: 'small' | 'medium' | 'large' | 'transparent') => {
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
      case 'transparent':
        testData = generateTransparentTestGraph(50);
        break;
    }
    
    setNodes(testData.nodes);
    setEdges(testData.edges);
    
    // Analyze timestamps in edges
    const timestampFields = analyzeTimestampFields(testData.edges);
    if (timestampFields.length > 0) {
      const bestField = timestampFields[0];
      useGraphStore.getState().setTimestampField(bestField.field);
      
      const timeRange = findTimeRange(testData.edges, bestField.field);
      if (timeRange) {
        useGraphStore.getState().setTimeRange(timeRange);
      }
    } else {
      // Clear time range if no timestamps found
      useGraphStore.getState().setTimestampField(null);
      useGraphStore.getState().setTimeRange(null);
      useGraphStore.getState().setSelectedTimeRange(null);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {/* Test Data Loading Subsection */}
      <CollapsibleSubsection
        title="Load Test Data"
        icon={<Database className="h-4 w-4" />}
        defaultOpen={true}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => loadTestData('small')} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            50 Nodes
          </Button>
          <Button 
            onClick={() => loadTestData('medium')} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            500 Nodes
          </Button>
          <Button 
            onClick={() => loadTestData('large')} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            5000 Nodes
          </Button>
          <Button 
            onClick={() => loadTestData('transparent')} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="justify-start"
            title="Load nodes with transparent backgrounds"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Circle className="h-4 w-4 mr-2" />
            )}
            Transparent
          </Button>
        </div>
      </CollapsibleSubsection>

      {(nodeCount > 0 || edgeCount > 0) && (
        <CollapsibleSubsection
          title="Graph Actions"
          icon={<Activity className="h-4 w-4" />}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <Button
              onClick={() => graphEventBus.emit('simulation:reheat', {})}
              variant="outline"
              size="sm"
              className="w-full justify-start"
              title="Reorganize layout"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Reorganize Layout
            </Button>
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
              <Info className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                Current: {nodeCount} nodes, {edgeCount} edges
              </div>
            </div>
          </div>
        </CollapsibleSubsection>
      )}
    </div>
  );
};