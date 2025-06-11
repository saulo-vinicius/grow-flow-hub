
import { SubstanceSelector } from './SubstanceSelector';
import { Substance } from '@/types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/collapsible-section';

interface SubstanceListProps {
  substances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
  collapsedSections: {
    substanceSelector: boolean;
    substanceList: boolean;
  };
  onToggleSection: (section: 'substanceSelector' | 'substanceList') => void;
}

export function SubstanceList({ 
  substances, 
  onSubstancesChange, 
  collapsedSections,
  onToggleSection 
}: SubstanceListProps) {
  const removeSubstance = (substanceId: string) => {
    const updatedSubstances = substances.filter(s => s.id !== substanceId);
    onSubstancesChange(updatedSubstances);
  };

  const substanceSelectorSummary = `${substances.length} substâncias disponíveis`;
  const substanceListSummary = `${substances.length} substâncias selecionadas`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CollapsibleSection
            title="Substâncias Disponíveis"
            isOpen={!collapsedSections.substanceSelector}
            onToggle={() => onToggleSection('substanceSelector')}
            summary={collapsedSections.substanceSelector ? substanceSelectorSummary : undefined}
          >
            <div />
          </CollapsibleSection>
        </CardHeader>
        {!collapsedSections.substanceSelector && (
          <CardContent>
            <SubstanceSelector 
              selectedSubstances={substances}
              onSubstancesChange={onSubstancesChange}
            />
          </CardContent>
        )}
      </Card>
      
      {substances.length > 0 && (
        <Card>
          <CardHeader>
            <CollapsibleSection
              title="Substâncias Selecionadas"
              isOpen={!collapsedSections.substanceList}
              onToggle={() => onToggleSection('substanceList')}
              summary={collapsedSections.substanceList ? substanceListSummary : undefined}
            >
              <div />
            </CollapsibleSection>
          </CardHeader>
          {!collapsedSections.substanceList && (
            <CardContent>
              <div className="space-y-2">
                {substances.map((substance) => (
                  <div key={substance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{substance.name}</div>
                      <div className="text-sm text-gray-500">{substance.formula}</div>
                      <div className="text-xs text-gray-400">
                        {substance.elements.map(el => `${el.symbol}: ${el.percentage}%`).join(', ')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubstance(substance.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
