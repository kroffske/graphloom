
import React from 'react';
import { NodeTypeAppearanceMap } from '@/types/appearance';
import NodeTypeDisplay from './NodeTypeDisplay';

type NodeTypeVisualListProps = {
  nodeTypeKeys: string[];
  nodeTypeLabels: Record<string, string>;
  nodeTypeAppearances: NodeTypeAppearanceMap;
};

const NodeTypeVisualList: React.FC<NodeTypeVisualListProps> = ({
  nodeTypeKeys,
  nodeTypeLabels,
  nodeTypeAppearances,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-semibold text-base mt-1 mb-0.5">
        Node Types
      </span>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-2 rounded-lg bg-background border">
        {nodeTypeKeys.map((typeKey) => (
          <NodeTypeDisplay
            key={typeKey}
            nodeType={typeKey}
            label={nodeTypeLabels[typeKey] || typeKey}
            appearance={nodeTypeAppearances[typeKey] || {}}
          />
        ))}
      </div>
    </div>
  );
};

export default NodeTypeVisualList;
