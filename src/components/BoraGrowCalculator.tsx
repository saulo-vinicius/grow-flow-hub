
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator as CalculatorIcon, Save, Download } from 'lucide-react';

import { SubstanceList } from './calculator/SubstanceList';
import { NutrientTargets } from './calculator/NutrientTargets';
import { CalculationResults } from './calculator/CalculationResults';
import { CalculatorEngine } from '@/utils/calculatorEngine';
import { Substance, NutrientTarget, CalculationResult } from '@/types/calculator';

// Substâncias pré-definidas comuns
const defaultSubstances: Substance[] = [
  {
    id: 'calcium_nitrate',
    name: 'Nitrato de Cálcio',
    formula: 'Ca(NO3)2·4H2O',
    elements: [
      { symbol: 'N', percentage: 15.5 },
      { symbol: 'Ca', percentage: 19.0 }
    ]
  },
  {
    id: 'potassium_nitrate',
    name: 'Nitrato de Potássio',
    formula: 'KNO3',
    elements: [
      { symbol: 'N', percentage: 13.0 },
      { symbol: 'K', percentage: 36.4 }
    ]
  },
  {
    id: 'magnesium_sulfate',
    name: 'Sulfato de Magnésio',
    formula: 'MgSO4·7H2O',
    elements: [
      { symbol: 'Mg', percentage: 9.8 },
      { symbol: 'S', percentage: 13.0 }
    ]
  },
  {
    id: 'monopotassium_phosphate',
    name: 'Fosfato Monopotássico',
    formula: 'KH2PO4',
    elements: [
      { symbol: 'P', percentage: 22.8 },
      { symbol: 'K', percentage: 28.7 }
    ]
  }
];

const defaultTargets: NutrientTarget = {
  N: 200,
  P: 50,
  K: 300,
  Ca: 200,
  Mg: 50,
  S: 100,
  Fe: 3,
  Mn: 0.5,
  Zn: 0.3,
  B: 0.5,
  Cu: 0.1,
  Mo: 0.05
};

export function BoraGrowCalculator() {
  const { t } = useTranslation();
  
  const [substances, setSubstances] = useState<Substance[]>(defaultSubstances);
  const [targets, setTargets] = useState<NutrientTarget>(defaultTargets);
  const [solutionVolume, setSolutionVolume] = useState(1000);
  const [volumeUnit, setVolumeUnit] = useState('mL');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [recipeName, setRecipeName] = useState('');

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    try {
      // Simular um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const engine = new CalculatorEngine(substances, targets, solutionVolume);
      const calculationResult = engine.calculate();
      
      setResult(calculationResult);
    } catch (error) {
      console.error('Erro no cálculo:', error);
      alert('Erro ao realizar o cálculo. Verifique os dados inseridos.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveRecipe = () => {
    if (!result || !recipeName.trim()) {
      alert('Por favor, insira um nome para a receita e realize o cálculo primeiro.');
      return;
    }

    // Aqui seria a integração com Supabase para salvar a receita
    const recipe = {
      name: recipeName,
      substances,
      targets,
      solutionVolume,
      volumeUnit,
      result,
      createdAt: new Date()
    };

    console.log('Receita a ser salva:', recipe);
    alert('Funcionalidade de salvar receita será implementada com Supabase!');
  };

  const handleExportResults = () => {
    if (!result) return;

    const exportData = {
      recipeName: recipeName || 'Receita sem nome',
      substances: substances.filter(s => result.substanceWeights[s.id] > 0),
      weights: result.substanceWeights,
      totalWeight: result.totalWeight,
      solutionVolume,
      volumeUnit,
      targets,
      achievedElements: result.achievedElements,
      deviation: result.deviation,
      calculatedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `receita_${recipeName.replace(/\s+/g, '_') || 'sem_nome'}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <CalculatorIcon className="h-8 w-8 text-green-600" />
          {t('calculator.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('calculator.subtitle')}
        </p>
      </div>

      {/* Configurações da Solução */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Solução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="recipe-name">Nome da Receita</Label>
              <Input
                id="recipe-name"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="Ex: Receita Vegetativa"
              />
            </div>
            <div>
              <Label htmlFor="solution-volume">Volume da Solução</Label>
              <Input
                id="solution-volume"
                type="number"
                value={solutionVolume}
                onChange={(e) => setSolutionVolume(parseFloat(e.target.value) || 1000)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="volume-unit">Unidade</Label>
              <select
                id="volume-unit"
                value={volumeUnit}
                onChange={(e) => setVolumeUnit(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="mL">mL</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de componentes principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Substâncias */}
        <SubstanceList 
          substances={substances} 
          onSubstancesChange={setSubstances} 
        />

        {/* Valores alvo */}
        <NutrientTargets 
          targets={targets} 
          onTargetsChange={setTargets} 
        />
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleCalculate} 
          disabled={isCalculating || substances.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          size="lg"
        >
          {isCalculating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Calculando...
            </>
          ) : (
            <>
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Calcular Receita
            </>
          )}
        </Button>

        {result && (
          <>
            <Button 
              onClick={handleSaveRecipe}
              variant="outline"
              disabled={!recipeName.trim()}
              className="px-6 py-3"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Receita
            </Button>

            <Button 
              onClick={handleExportResults}
              variant="outline"
              className="px-6 py-3"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </>
        )}
      </div>

      {/* Resultados */}
      {result && (
        <CalculationResults 
          result={result}
          substances={substances}
          solutionVolume={solutionVolume}
          volumeUnit={volumeUnit}
        />
      )}
    </div>
  );
}
