import React, { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronsDown, ChevronsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarSection {
  id: string;
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface CollapsibleRightSidebarProps {
  sections: SidebarSection[];
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleRightSidebar: React.FC<CollapsibleRightSidebarProps> = ({
  sections,
  defaultOpen = true,
  className
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    sections.reduce((acc, section) => ({
      ...acc,
      [section.id]: section.defaultOpen ?? true
    }), {})
  );

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className={cn("relative flex h-full", className)}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute top-4 -left-10 z-10 h-8 w-8 rounded-full border bg-background shadow-md transition-transform hover:scale-110",
          !isOpen && "translate-x-2"
        )}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar Content */}
      <div
        className={cn(
          "h-full border-l bg-card transition-all duration-300 ease-in-out",
          isOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        {isOpen && (
          <div className="h-full flex flex-col">
            {/* Header with expand/collapse all */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Settings</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const allExpanded = sections.reduce((acc, section) => ({
                        ...acc,
                        [section.id]: true
                      }), {});
                      setOpenSections(allExpanded);
                    }}
                    title="Expand all sections"
                  >
                    <ChevronsDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      const allCollapsed = sections.reduce((acc, section) => ({
                        ...acc,
                        [section.id]: false
                      }), {});
                      setOpenSections(allCollapsed);
                    }}
                    title="Collapse all sections"
                  >
                    <ChevronsUp className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id}>
                    <Collapsible
                      open={openSections[section.id]}
                      onOpenChange={() => toggleSection(section.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-2 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            {section.icon}
                            <span className="font-medium">{section.title}</span>
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openSections[section.id] && "rotate-90"
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-2 pt-2">
                        <div className="rounded-lg bg-muted/20 p-3">
                          {section.content}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    {index < sections.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};