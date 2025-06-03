
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ShoppingCart } from 'lucide-react';
import { Substance, Element } from '@/types/calculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubstanceSelectorProps {
  selectedSubstances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
}

export function SubstanceSelector({ selectedSubstances, onSubstancesChange }: SubstanceSelectorProps) {
  const [availableSubstances, setAvailableSubstances] = useState<Substance[]>([]);
  const [selectedSubstanceId, setSelectedSubstanceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Estado para nova substância
  const [newSubstance, setNewSubstance] = useState<Partial<Substance>>({
    name: '',
    formula: '',
    elements: []
  });

  const [newElement, setNewElement] = useState<Partial<Element>>({
    symbol: '',
    percentage: 0
  });

  useEffect(() => {
    fetchSubstances();
  }, []);

  const fetchSubstances = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_substances')
        .select('*');

      if (error) throw error;

      const substances: Substance[] = data.map(item => ({
        id: item.id,
        name: item.name,
        formula: item.formula || '',
        elements: item.elements as Element[] || []
      }));

      setAvailableSubstances(substances);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar substâncias",
        variant: "destructive"
      });
    }
  };

  const addSubstanceToSelected = () => {
    const substance = availableSubstances.find(s => s.id === selectedSubstanceId);
    if (substance && !selectedSubstances.find(s => s.id === substance.id)) {
      onSubstancesChange([...selectedSubstances, substance]);
      setSelectedSubstanceId('');
    }
  };

  const removeSubstanceFromSelected = (id: string) => {
    onSubstancesChange(selectedSubstances.filter(s => s.id !== id));
  };

  const addElement = () => {
    if (newElement.symbol && newElement.percentage !== undefined && newElement.percentage > 0) {
      setNewSubstance(prev => ({
        ...prev,
        elements: [...(prev.elements || []), newElement as Element]
      }));
      setNewElement({ symbol: '', percentage: 0 });
    } else if (newElement.percentage !== undefined && newElement.percentage <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do elemento deve ser maior que 0%",
        variant: "destructive"
      });
    }
  };

  const removeElement = (index: number) => {
    setNewSubstance(prev => ({
      ...prev,
      elements: prev.elements?.filter((_, i) => i !== index) || []
    }));
  };

  const saveCustomSubstance = async () => {
    if (!user || !newSubstance.name || !newSubstance.formula || !newSubstance.elements?.length) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos da substância",
        variant: "destructive"
      });
      return;
    }

    // Verificar se algum elemento tem valor zero
    const hasZeroElement = newSubstance.elements.some(el => el.percentage <= 0);
    if (hasZeroElement) {
      toast({
        title: "Valor inválido",
        description: "Não é possível salvar uma substância com elemento igual a zero. O valor deve ser maior que 0.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('custom_substances')
        .insert({
          user_id: user.id,
          name: newSubstance.name,
          formula: newSubstance.formula,
          elements: newSubstance.elements
        });

      if (error) throw error;

      toast({
        title: "Substância criada!",
        description: "Nova substância adicionada com sucesso."
      });

      setNewSubstance({ name: '', formula: '', elements: [] });
      setShowCreateForm(false);
      fetchSubstances();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de substâncias */}
      <Card>
        <CardHeader>
          <CardTitle>Banco de Substâncias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedSubstanceId} onValueChange={setSelectedSubstanceId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma substância" />
              </SelectTrigger>
              <SelectContent>
                {availableSubstances.map((substance) => (
                  <SelectItem key={substance.id} value={substance.id}>
                    {substance.name} ({substance.formula})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={addSubstanceToSelected} 
              disabled={!selectedSubstanceId}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Substância Personalizada
          </Button>
        </CardContent>
      </Card>

      {/* Substâncias selecionadas */}
      <Card>
        <CardHeader>
          <CardTitle>Substâncias Selecionadas</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSubstances.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma substância selecionada
            </p>
          ) : (
            <div className="space-y-2">
              {selectedSubstances.map((substance) => (
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
                    onClick={() => removeSubstanceFromSelected(substance.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário para criar substância personalizada */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Substância</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  min="0.01"
                  step="0.01"
                />
                <Button onClick={addElement} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveCustomSubstance} disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar Substância'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
