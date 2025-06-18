import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollapsibleSubsectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const CollapsibleSubsection: React.FC<CollapsibleSubsectionProps> = ({
  title,
  children,
  defaultOpen = true,
  className,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "border rounded-lg overflow-hidden transition-all duration-200",
        isOpen ? "bg-muted/10 border-muted/50" : "bg-transparent border-muted/30",
        className
      )}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-between p-2 transition-all duration-200",
            isOpen ? "hover:bg-muted/30" : "hover:bg-muted/20"
          )}
        >
          <div className="flex items-center gap-2">
            <div className={cn(
              "transition-all duration-200",
              isOpen ? "text-primary" : "text-muted-foreground"
            )}>
              {icon}
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors duration-200",
              isOpen ? "text-foreground" : "text-muted-foreground"
            )}>
              {title}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="animate-collapsible-down">
        <div className="px-2 pb-2 pt-1">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};