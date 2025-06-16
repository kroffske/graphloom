import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Circle, 
  GitBranch, 
  Layers,
  Zap
} from 'lucide-react';
import { graphEventBus } from '@/lib/graphEventBus';

export type LayoutType = 'force' | 'forceatlas2' | 'openord' | 'circle' | 'hierarchy' | 'radial';

interface LayoutSelectorProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ 
  currentLayout, 
  onLayoutChange 
}) => {
  const layouts = [
    { 
      type: 'force' as LayoutType, 
      label: 'Force', 
      icon: Activity,
      description: 'D3 force-directed layout'
    },
    { 
      type: 'forceatlas2' as LayoutType, 
      label: 'ForceAtlas2', 
      icon: Zap,
      description: 'Gephi-style layout for communities'
    },
    { 
      type: 'openord' as LayoutType, 
      label: 'OpenOrd', 
      icon: Layers,
      description: 'Multi-stage layout for large graphs'
    },
    { 
      type: 'circle' as LayoutType, 
      label: 'Circle', 
      icon: Circle,
      description: 'Nodes arranged in a circle'
    },
    { 
      type: 'hierarchy' as LayoutType, 
      label: 'Hierarchy', 
      icon: GitBranch,
      description: 'Tree-like hierarchical layout'
    },
    { 
      type: 'radial' as LayoutType, 
      label: 'Radial', 
      icon: Activity,
      description: 'Radial tree layout'
    }
  ];

  const handleLayoutChange = (layout: LayoutType) => {
    console.log('[LayoutSelector] Changing layout to:', layout);
    onLayoutChange(layout);
    // Emit event to trigger layout recalculation
    graphEventBus.emit('layout:change', { layout });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card border rounded-lg">
      <span className="text-sm font-medium mr-2">Layout:</span>
      {layouts.map(({ type, label, icon: Icon, description }) => (
        <Button
          key={type}
          variant={currentLayout === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLayoutChange(type)}
          title={description}
          className="gap-1"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};