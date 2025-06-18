import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { graphEventBus } from '@/lib/graphEventBus';
import { 
  Activity, 
  Circle, 
  GitBranch, 
  Layers,
  Zap,
  Layout,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CollapsibleSubsection } from './CollapsibleSubsection';

export type LayoutType = 'force' | 'forceatlas2' | 'openord' | 'circle' | 'hierarchy' | 'radial' | 'fast';

interface LayoutOption {
  type: LayoutType;
  label: string;
  icon: React.ElementType;
  description: string;
}

export const LayoutSettingsSection: React.FC = () => {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('force');

  const layouts: LayoutOption[] = [
    { 
      type: 'force', 
      label: 'Force', 
      icon: Activity,
      description: 'D3 force-directed layout'
    },
    { 
      type: 'forceatlas2', 
      label: 'ForceAtlas2', 
      icon: Zap,
      description: 'Gephi-style layout for communities'
    },
    { 
      type: 'openord', 
      label: 'OpenOrd', 
      icon: Layers,
      description: 'Multi-stage layout for large graphs'
    },
    { 
      type: 'circle', 
      label: 'Circle', 
      icon: Circle,
      description: 'Nodes arranged in a circle'
    },
    { 
      type: 'hierarchy', 
      label: 'Hierarchy', 
      icon: GitBranch,
      description: 'Tree-like hierarchical layout'
    },
    { 
      type: 'radial', 
      label: 'Radial', 
      icon: Activity,
      description: 'Radial tree layout'
    },
    { 
      type: 'fast', 
      label: 'Fast', 
      icon: Zap,
      description: 'Quick layout for large graphs'
    }
  ];

  const handleLayoutChange = (layout: LayoutType) => {
    console.log('[LayoutSettingsSection] Changing layout to:', layout);
    setCurrentLayout(layout);
    // Emit event to trigger layout recalculation
    graphEventBus.emit('layout:change', { layout });
  };

  return (
    <div className="space-y-3">
      {/* Layout Algorithms Subsection */}
      <CollapsibleSubsection
        title="Layout Algorithms"
        icon={<Layout className="h-4 w-4" />}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* Standard Layouts */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Standard Layouts</Label>
            <div className="grid grid-cols-2 gap-2">
              {layouts.slice(0, 4).map(({ type, label, icon: Icon, description }) => (
                <Button
                  key={type}
                  variant={currentLayout === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange(type)}
                  title={description}
                  className="justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Advanced Layouts */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Advanced Layouts</Label>
            <div className="grid grid-cols-2 gap-2">
              {layouts.slice(4).map(({ type, label, icon: Icon, description }) => (
                <Button
                  key={type}
                  variant={currentLayout === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange(type)}
                  title={description}
                  className="justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSubsection>
      
      {/* Layout Settings Subsection (for future use) */}
      <CollapsibleSubsection
        title="Layout Settings"
        icon={<Settings className="h-4 w-4" />}
        defaultOpen={false}
      >
        <div className="text-xs text-muted-foreground text-center p-4">
          Layout-specific settings will appear here
        </div>
      </CollapsibleSubsection>
    </div>
  );
};