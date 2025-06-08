
import { SubstanceSelector } from './SubstanceSelector';
import { Substance } from '@/types/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface SubstanceListProps {
  substances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
}

export function SubstanceList({ substances, onSubstancesChange }: SubstanceListProps) {
  const removeSubstance = (substanceId: string) => {
    const updatedSubstances = substances.filter(s => s.id !== substanceId);
    onSubstancesChange(updatedSubstances);
  };

  return (
    <div className="space-y-6">
      <SubstanceSelector 
        selectedSubstances={substances}
        onSubstancesChange={onSubstancesChange}
      />
      
      {substances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Substâncias Selecionadas</CardTitle>
          </CardHeader>
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
        </Card>
      )}
    </div>
  );
}
