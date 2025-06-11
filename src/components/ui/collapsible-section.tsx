
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summary?: string;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  isOpen, 
  onToggle, 
  children, 
  summary,
  className = ""
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex w-full justify-between items-center p-0 h-auto font-medium text-left hover:bg-transparent"
          onClick={onToggle}
        >
          <div className="flex flex-col items-start">
            <span>{title}</span>
            {!isOpen && summary && (
              <span className="text-sm text-gray-500 font-normal">{summary}</span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="pt-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
