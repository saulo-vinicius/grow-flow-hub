
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ShoppingCart, User, Beaker } from 'lucide-react';
import { Substance, Element } from '@/types/calculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubstanceSelectorProps {
  selectedSubstances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
}

const VALID_ELEMENTS = [
  "N (NO3-)", "N (NH4+)", "P", "P2O5", "K", "K2O", "Ca", "CaO", 
  "Mg", "MgO", "S", "Fe", "Mn", "Zn", "B", "Cu", "Si", "SiO2", "Mo", "Na", "Cl"
];

export function SubstanceSelector({ selectedSubstances, onSubstancesChange }: SubstanceSelectorProps) {
  const [availableSubstances, setAvailableSubstances] = useState<Substance[]>([]);
  const [filteredSubstances, setFilteredSubstances] = useState<Substance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    percentage: undefined
  });

  useEffect(() => {
    fetchSubstances();
  }, []);

  useEffect(() => {
    const filtered = availableSubstances.filter(substance =>
      substance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      substance.formula.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Ordenar: substâncias do usuário primeiro, depois as públicas
    const sorted = filtered.sort((a, b) => {
      const aIsUser = a.id.startsWith('user_');
      const bIsUser = b.id.startsWith('user_');
      if (aIsUser && !bIsUser) return -1;
      if (!aIsUser && bIsUser) return 1;
      return a.name.localeCompare(b.name);
    });
    
    setFilteredSubstances(sorted);
  }, [availableSubstances, searchTerm]);

  const fetchSubstances = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_substances')
        .select('*');

      if (error) throw error;

      const substances: Substance[] = data.map(item => ({
        id: item.user_id ? `user_${item.id}` : item.id,
        name: item.name,
        formula: item.formula || '',
        elements: (item.elements as any) || []
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

  const convertElement = (symbol: string, percentage: number): Element => {
    // Converter óxidos para elementos
    const conversions: { [key: string]: { symbol: string, factor: number } } = {
      'P2O5': { symbol: 'P', factor: 0.436 },
      'K2O': { symbol: 'K', factor: 0.830 },
      'CaO': { symbol: 'Ca', factor: 0.715 },
      'MgO': { symbol: 'Mg', factor: 0.603 },
      'SiO2': { symbol: 'Si', factor: 0.467 }
    };

    if (conversions[symbol]) {
      return {
        symbol: conversions[symbol].symbol,
        percentage: percentage * conversions[symbol].factor
      };
    }

    return { symbol, percentage };
  };

  const addSubstanceToSelected = () => {
    const substance = availableSubstances.find(s => s.id === selectedSubstanceId);
    if (substance && !selectedSubstances.find(s => s.id === substance.id)) {
      onSubstancesChange([...selectedSubstances, substance]);
      setSelectedSubstanceId('');
      setSearchTerm('');
    }
  };

  const removeSubstanceFromSelected = (id: string) => {
    onSubstancesChange(selectedSubstances.filter(s => s.id !== id));
  };

  const addElement = () => {
    if (!newElement.symbol || !VALID_ELEMENTS.includes(newElement.symbol)) {
      toast({
        title: "Elemento inválido",
        description: "Selecione um elemento da lista válida",
        variant: "destructive"
      });
      return;
    }

    if (newElement.percentage === undefined || newElement.percentage <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do elemento deve ser maior que 0%",
        variant: "destructive"
      });
      return;
    }

    const convertedElement = convertElement(newElement.symbol, newElement.percentage);
    
    setNewSubstance(prev => {
      const existingElements = prev.elements || [];
      const existingIndex = existingElements.findIndex(el => el.symbol === convertedElement.symbol);
      
      if (existingIndex >= 0) {
        // Somar se o elemento já existe (ex: diferentes formas de N)
        const updatedElements = [...existingElements];
        updatedElements[existingIndex].percentage += convertedElement.percentage;
        return { ...prev, elements: updatedElements };
      } else {
        return { ...prev, elements: [...existingElements, convertedElement] };
      }
    });
    
    setNewElement({ symbol: '', percentage: undefined });
  };

  const removeElement = (index: number) => {
    setNewSubstance(prev => ({
      ...prev,
      elements: prev.elements?.filter((_, i) => i !== index) || []
    }));
  };

  const deleteCustomSubstance = async (substanceId: string) => {
    if (!user || !substanceId.startsWith('user_')) return;

    const actualId = substanceId.replace('user_', '');
    
    try {
      const { error } = await supabase
        .from('custom_substances')
        .delete()
        .eq('id', actualId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Substância removida",
        description: "Substância personalizada removida com sucesso"
      });

      fetchSubstances();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao remover substância",
        variant: "destructive"
      });
    }
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
          elements: newSubstance.elements as any
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
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Banco de Substâncias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedSubstanceId} onValueChange={(value) => {
              setSelectedSubstanceId(value);
              setSearchTerm('');
            }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Buscar e selecionar substância..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Digite para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {filteredSubstances.map((substance) => (
                  <SelectItem key={substance.id} value={substance.id}>
                    <div className="flex items-center gap-2">
                      {substance.id.startsWith('user_') && <User className="h-3 w-3 text-yellow-500" />}
                      <span>{substance.name} ({substance.formula})</span>
                    </div>
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
            {selectedSubstanceId && selectedSubstanceId.startsWith('user_') && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteCustomSubstance(selectedSubstanceId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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
              Nenhuma substância selecionada.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedSubstances.map((substance) => (
                <div key={substance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      {substance.id.startsWith('user_') && <User className="h-3 w-3 text-yellow-500" />}
                      <span className="font-medium">{substance.name}</span>
                    </div>
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
                  <span className="text-sm">{element.symbol}: {element.percentage.toFixed(3)}%</span>
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
                <Select 
                  value={newElement.symbol || ''} 
                  onValueChange={(value) => setNewElement(prev => ({ ...prev, symbol: value }))}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione elemento" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_ELEMENTS.map(element => (
                      <SelectItem key={element} value={element}>
                        {element}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="% (ex: 15.5, 0.1, 0.05)"
                  value={newElement.percentage || ''}
                  onChange={(e) => setNewElement(prev => ({ ...prev, percentage: parseFloat(e.target.value) || undefined }))}
                  className="flex-1"
                  min="0.001"
                  step="0.001"
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
