import { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit3, X, User } from 'lucide-react';
import { Substance, Element } from '@/types/calculator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubstanceSelectorProps {
  selectedSubstances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
}

// Valid elements that can be added to custom substances
const VALID_ELEMENTS = [
  'N', 'NO3', 'NH4', 'P', 'P2O5', 'K', 'K2O', 'Ca', 'CaO', 'Mg', 'MgO', 'S', 'SO3',
  'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo', 'Si', 'Na', 'Cl'
];

// Conversion factors for oxide forms to elemental forms
const CONVERSION_FACTORS = {
  'P2O5': { element: 'P', factor: 0.436 },
  'K2O': { element: 'K', factor: 0.830 },
  'CaO': { element: 'Ca', factor: 0.715 },
  'MgO': { element: 'Mg', factor: 0.603 },
  'SO3': { element: 'S', factor: 0.400 }
};

// Database element interface for proper typing
interface DbElement {
  symbol: string;
  percentage: number;
}

const PRE_DEFINED_SUBSTANCES: Substance[] = [
  {
    id: 'calcium-nitrate',
    name: 'Nitrato de Cálcio',
    formula: 'Ca(NO3)2·4H2O',
    elements: [
      { symbol: 'NO3', percentage: 11.86, ppm: 0, type: 'ionic' },
      { symbol: 'Ca', percentage: 16.97, ppm: 0, type: 'elemental' }
    ]
  },
  {
    id: 'potassium-nitrate',
    name: 'Nitrato de Potássio',
    formula: 'KNO3',
    elements: [
      { symbol: 'NO3', percentage: 13.85, ppm: 0, type: 'ionic' },
      { symbol: 'K', percentage: 38.67, ppm: 0, type: 'elemental' }
    ]
  },
  {
    id: 'magnesium-sulfate',
    name: 'Sulfato de Magnésio',
    formula: 'MgSO4·7H2O',
    elements: [
      { symbol: 'Mg', percentage: 9.86, ppm: 0, type: 'elemental' },
      { symbol: 'S', percentage: 13.01, ppm: 0, type: 'elemental' }
    ]
  },
  {
    id: 'monoammonium-phosphate',
    name: 'Fosfato Monoamônico',
    formula: 'NH4H2PO4',
    elements: [
      { symbol: 'NH4', percentage: 12.17, ppm: 0, type: 'ionic' },
      { symbol: 'P', percentage: 26.95, ppm: 0, type: 'elemental' }
    ]
  },
  {
    id: 'monopotassium-phosphate',
    name: 'Fosfato Monopotássico',
    formula: 'KH2PO4',
    elements: [
      { symbol: 'P', percentage: 22.76, ppm: 0, type: 'elemental' },
      { symbol: 'K', percentage: 28.73, ppm: 0, type: 'elemental' }
    ]
  },
  {
    id: 'potassium-sulfate',
    name: 'Sulfato de Potássio',
    formula: 'K2SO4',
    elements: [
      { symbol: 'K', percentage: 44.87, ppm: 0, type: 'elemental' },
      { symbol: 'S', percentage: 18.40, ppm: 0, type: 'elemental' }
    ]
  }
];

export function SubstanceSelector({ selectedSubstances, onSubstancesChange }: SubstanceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customSubstances, setCustomSubstances] = useState<Substance[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubstance, setEditingSubstance] = useState<Substance | null>(null);
  
  // Custom substance form
  const [customName, setCustomName] = useState('');
  const [customFormula, setCustomFormula] = useState('');
  const [customElements, setCustomElements] = useState<Element[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Get available elements (filtered out already added ones)
  const getAvailableElements = () => {
    const usedElements = customElements.map(el => el.symbol);
    return VALID_ELEMENTS.filter(element => !usedElements.includes(element));
  };

  // Fetch custom substances from database
  const fetchCustomSubstances = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('custom_substances')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const substances: Substance[] = (data || []).map(item => {
        // Properly type cast the elements from database with validation
        let elements: Element[] = [];
        
        if (Array.isArray(item.elements)) {
          elements = (item.elements as unknown as DbElement[]).map(el => ({
            symbol: el.symbol,
            percentage: parseFloat(el.percentage.toFixed(2)),
            ppm: 0
          }));
        }

        return {
          id: item.id,
          name: item.name,
          formula: item.formula || '',
          elements
        };
      });

      setCustomSubstances(substances);
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: "Erro ao carregar substâncias personalizadas",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCustomSubstances();
  }, [fetchCustomSubstances]);

  // Filter and prioritize substances based on search term
  const filteredSubstances = useMemo(() => {
    const allSubstances = [...PRE_DEFINED_SUBSTANCES, ...customSubstances];
    
    let filtered = allSubstances;
    if (searchTerm.trim()) {
      filtered = allSubstances.filter(substance =>
        substance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        substance.formula.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Prioritize custom substances
    const customFiltered = filtered.filter(s => customSubstances.some(cs => cs.id === s.id));
    const preDefinedFiltered = filtered.filter(s => !customSubstances.some(cs => cs.id === s.id));
    
    // Sort custom alphabetically, then pre-defined alphabetically
    customFiltered.sort((a, b) => a.name.localeCompare(b.name));
    preDefinedFiltered.sort((a, b) => a.name.localeCompare(b.name));
    
    return [...customFiltered, ...preDefinedFiltered];
  }, [searchTerm, customSubstances]);

  const convertOxideToElement = (elements: Element[]): Element[] => {
    const converted: Element[] = [];
    
    elements.forEach(element => {
      const conversion = CONVERSION_FACTORS[element.symbol as keyof typeof CONVERSION_FACTORS];
      if (conversion) {
        // Convert oxide to elemental form
        converted.push({
          symbol: conversion.element,
          percentage: parseFloat((element.percentage * conversion.factor).toFixed(2)),
          ppm: 0
        });
      } else {
        converted.push({
          ...element,
          percentage: parseFloat(element.percentage.toFixed(2))
        });
      }
    });
    
    return converted;
  };

  // Convert Element[] to database-compatible Json format
  const convertElementsToJsonFormat = (elements: Element[]) => {
    return elements.map(el => ({
      symbol: el.symbol,
      percentage: parseFloat(el.percentage.toFixed(2))
    }));
  };

  const validateCustomSubstance = () => {
    const errors: {[key: string]: string} = {};
    
    if (!customName.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (customElements.length === 0) {
      errors.elements = 'Adicione pelo menos um elemento';
    }
    
    customElements.forEach((element, index) => {
      if (element.percentage <= 0) {
        errors[`element_${index}`] = 'Percentual deve ser maior que zero';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveCustomSubstance = async () => {
    if (!user || !validateCustomSubstance()) {
      return;
    }

    // Convert oxide forms to elemental forms before saving
    const convertedElements = convertOxideToElement(customElements);
    const jsonElements = convertElementsToJsonFormat(convertedElements);

    try {
      if (editingSubstance) {
        // Update existing substance
        const { error } = await supabase
          .from('custom_substances')
          .update({
            name: customName,
            formula: customFormula || null,
            elements: jsonElements as any
          })
          .eq('id', editingSubstance.id);

        if (error) throw error;

        toast({
          title: "Substância atualizada",
          description: "Substância personalizada atualizada com sucesso"
        });
      } else {
        // Create new substance
        const { error } = await supabase
          .from('custom_substances')
          .insert({
            name: customName,
            formula: customFormula || null,
            elements: jsonElements as any,
            user_id: user.id
          });

        if (error) throw error;

        toast({
          title: "Substância criada",
          description: "Substância personalizada criada com sucesso"
        });
      }

      // Reset form
      setCustomName('');
      setCustomFormula('');
      setCustomElements([]);
      setEditingSubstance(null);
      setValidationErrors({});
      setIsDialogOpen(false);
      
      // Refresh list
      fetchCustomSubstances();
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: "Erro ao salvar substância personalizada",
        variant: "destructive"
      });
    }
  };

  const deleteCustomSubstance = async (id: string) => {
    if (!confirm("Atenção! Você perderá todos os dados desta substância. Deseja realmente excluir?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_substances')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Substância removida",
        description: "Substância personalizada removida com sucesso"
      });

      fetchCustomSubstances();
    } catch (error: unknown) {
      toast({
        title: "Erro",
        description: "Erro ao remover substância personalizada",
        variant: "destructive"
      });
    }
  };

  const editCustomSubstance = (substance: Substance) => {
    setEditingSubstance(substance);
    setCustomName(substance.name);
    setCustomFormula(substance.formula);
    setCustomElements([...substance.elements]);
    setValidationErrors({});
    setIsDialogOpen(true);
  };

  const addElement = () => {
    const availableElements = getAvailableElements();
    if (availableElements.length > 0) {
      setCustomElements([...customElements, { 
        symbol: availableElements[0], 
        percentage: 0, 
        ppm: 0, 
        type: 'elemental' 
      }]);
    }
  };

  const updateElement = (index: number, field: keyof Element, value: string | number) => {
    const updated = [...customElements];
    if (field === 'percentage') {
      const numValue = parseFloat(value as string);
      updated[index][field] = isNaN(numValue) ? 0 : parseFloat(numValue.toFixed(2));
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setCustomElements(updated);
    
    // Clear validation error for this element
    const errorKey = `element_${index}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const removeElement = (index: number) => {
    setCustomElements(customElements.filter((_, i) => i !== index));
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSubstanceAdd = (substance: Substance) => {
    const newSubstances = [...selectedSubstances, substance];
    onSubstancesChange(newSubstances);
  };

  const availableElementsForNewElement = getAvailableElements();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Substâncias Disponíveis</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => {
                  setEditingSubstance(null);
                  setCustomName('');
                  setCustomFormula('');
                  setCustomElements([]);
                  setValidationErrors({});
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Nova Substância
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingSubstance ? 'Editar Substância' : 'Criar Nova Substância'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-name">Nome da Substância</Label>
                    <Input
                      id="custom-name"
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        if (validationErrors.name) {
                          setValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.name;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Ex: Fertilizante Especial"
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="custom-formula">Fórmula ou Marca (opcional)</Label>
                    <Input
                      id="custom-formula"
                      value={customFormula}
                      onChange={(e) => setCustomFormula(e.target.value)}
                      placeholder="Ex: Ca(NO3)2 ou Marca XYZ"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Composição de Elementos</Label>
                      <Button 
                        type="button" 
                        onClick={addElement} 
                        size="sm"
                        disabled={availableElementsForNewElement.length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Elemento
                      </Button>
                    </div>
                    
                    {validationErrors.elements && (
                      <p className="text-red-500 text-sm mb-2">{validationErrors.elements}</p>
                    )}
                    
                    <div className="space-y-2">
                      {customElements.map((element, index) => {
                        const errorKey = `element_${index}`;
                        const hasError = validationErrors[errorKey];
                        const availableForThisElement = [element.symbol, ...getAvailableElements()];
                        
                        return (
                          <div key={index} className="flex gap-2 items-center">
                            <Select
                              value={element.symbol}
                              onValueChange={(value) => updateElement(index, 'symbol', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableForThisElement.map(sym => (
                                  <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex-1">
                              <Input
                                type="number"
                                value={element.percentage || ''}
                                onChange={(e) => updateElement(index, 'percentage', e.target.value)}
                                placeholder="% do elemento"
                                className={hasError ? 'border-red-500' : ''}
                                min="0"
                                step="0.01"
                              />
                              {hasError && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors[errorKey]}</p>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">%</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeElement(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Button onClick={saveCustomSubstance} className="w-full">
                    {editingSubstance ? 'Atualizar Substância' : 'Salvar Substância'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar substâncias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredSubstances.map((substance) => {
              const isCustom = customSubstances.some(cs => cs.id === substance.id);
              
              return (
                <div key={substance.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{substance.name}</div>
                      {isCustom && (
                        <User className="h-4 w-4 text-blue-500" title="Substância personalizada" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{substance.formula}</div>
                    <div className="text-xs text-gray-400">
                      {substance.elements.map(el => `${el.symbol}: ${el.percentage}%`).join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isCustom && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editCustomSubstance(substance)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomSubstance(substance.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button onClick={() => handleSubstanceAdd(substance)} size="sm">
                      Adicionar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
