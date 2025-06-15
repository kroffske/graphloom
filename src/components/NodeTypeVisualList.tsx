
import React from 'react';
import { NodeTypeAppearanceMap } from '@/types/appearance';
import NodeTypePreview from './NodeTypePreview';

type NodeTypeVisualListProps = {
  nodeTypeKeys: string[];
  nodeTypeLabels: Record<string, string>;
  nodeTypeAppearances: NodeTypeAppearanceMap;
  selectedNodeType: string;
  onSelectedNodeTypeChange: (type: string) => void;
};

const NodeTypeVisualList: React.FC<NodeTypeVisualListProps> = ({
  nodeTypeKeys,
  nodeTypeLabels,
  nodeTypeAppearances,
  selectedNodeType,
  onSelectedNodeTypeChange,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-semibold text-base mt-1 mb-0.5">
        Node Types
      </span>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 p-2 rounded-lg bg-background border">
        {nodeTypeKeys.map((typeKey) => (
          <NodeTypePreview
            key={typeKey}
            nodeType={typeKey}
            label={nodeTypeLabels[typeKey] || typeKey}
            appearance={nodeTypeAppearances[typeKey] || {}}
            isSelected={selectedNodeType === typeKey}
            onClick={onSelectedNodeTypeChange}
          />
        ))}
      </div>
    </div>
  );
};

export default NodeTypeVisualList;
