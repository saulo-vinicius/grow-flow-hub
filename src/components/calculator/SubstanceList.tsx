
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { Substance, Element } from '@/types/calculator';

interface SubstanceListProps {
  substances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
}

export function SubstanceList({ substances, onSubstancesChange }: SubstanceListProps) {
  const [newSubstance, setNewSubstance] = useState<Partial<Substance>>({
    name: '',
    formula: '',
    elements: []
  });

  const [newElement, setNewElement] = useState<Partial<Element>>({
    symbol: '',
    percentage: 0
  });

  const addElement = () => {
    if (newElement.symbol && newElement.percentage !== undefined) {
      setNewSubstance(prev => ({
        ...prev,
        elements: [...(prev.elements || []), newElement as Element]
      }));
      setNewElement({ symbol: '', percentage: 0 });
    }
  };

  const removeElement = (index: number) => {
    setNewSubstance(prev => ({
      ...prev,
      elements: prev.elements?.filter((_, i) => i !== index) || []
    }));
  };

  const addSubstance = () => {
    if (newSubstance.name && newSubstance.formula && newSubstance.elements?.length) {
      const substance: Substance = {
        id: `substance_${Date.now()}`,
        name: newSubstance.name,
        formula: newSubstance.formula,
        elements: newSubstance.elements
      };
      onSubstancesChange([...substances, substance]);
      setNewSubstance({ name: '', formula: '', elements: [] });
    }
  };

  const removeSubstance = (id: string) => {
    onSubstancesChange(substances.filter(s => s.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Substâncias Disponíveis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de substâncias existentes */}
        <div className="space-y-2">
          {substances.map((substance) => (
            <div key={substance.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{substance.name}</div>
                <div className="text-sm text-gray-500">{substance.formula}</div>
                <div className="text-xs text-gray-400">
                  {substance.elements.map(el => `${el.symbol}: ${el.percentage}%`).join(', ')}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeSubstance(substance.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Formulário para nova substância */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium">Adicionar Nova Substância</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="substance-name">Nome</Label>
              <Input
                id="substance-name"
                value={newSubstance.name || ''}
                onChange={(e) => setNewSubstance(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Nitrato de Cálcio"
              />
            </div>
            <div>
              <Label htmlFor="substance-formula">Fórmula</Label>
              <Input
                id="substance-formula"
                value={newSubstance.formula || ''}
                onChange={(e) => setNewSubstance(prev => ({ ...prev, formula: e.target.value }))}
                placeholder="Ex: Ca(NO3)2"
              />
            </div>
          </div>

          {/* Elementos da substância */}
          <div className="space-y-2">
            <Label>Elementos</Label>
            {newSubstance.elements?.map((element, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm">{element.symbol}: {element.percentage}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeElement(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Input
                placeholder="Elemento (ex: N)"
                value={newElement.symbol || ''}
                onChange={(e) => setNewElement(prev => ({ ...prev, symbol: e.target.value }))}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="% (ex: 15.5)"
                value={newElement.percentage || ''}
                onChange={(e) => setNewElement(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                className="flex-1"
              />
              <Button onClick={addElement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={addSubstance} className="w-full">
            Adicionar Substância
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
