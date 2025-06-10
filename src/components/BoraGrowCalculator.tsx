
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NutrientTargets } from '@/components/calculator/NutrientTargets';
import { SubstanceList } from '@/components/calculator/SubstanceList';
import { CalculationResults } from '@/components/calculator/CalculationResults';
import { SaveRecipeDialog } from '@/components/calculator/SaveRecipeDialog';
import { CalculatorEngine } from '@/utils/calculatorEngine';
import { Substance, NutrientTarget, CalculationResult } from '@/types/calculator';
import { Calculator } from 'lucide-react';

export function BoraGrowCalculator() {
  const [substances, setSubstances] = useState<Substance[]>([]);
  const [activePreset, setActivePreset] = useState<'vegetative' | 'flowering' | null>('vegetative');

  const [targets, setTargets] = useState<NutrientTarget>({
    NO3_N: 180, NH4_N: 20, P: 50, K: 300, Ca: 200, Mg: 50, S: 100,
    Fe: 3, Mn: 0.5, Zn: 0.3, B: 0.5, Cu: 0.1, Mo: 0.05,
    Si: 0, Na: 0, Cl: 0
  });

  const [solutionVolume, setSolutionVolume] = useState(1000);
  const [volumeUnit, setVolumeUnit] = useState('mL');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const setVegetativeTargets = () => {
    setTargets({
      NO3_N: 180, NH4_N: 20, P: 50, K: 250, Ca: 200, Mg: 50, S: 100,
      Fe: 3, Mn: 0.5, Zn: 0.3, B: 0.5, Cu: 0.1, Mo: 0.05,
      Si: 0, Na: 0, Cl: 0
    });
    setActivePreset('vegetative');
  };

  const setFloweringTargets = () => {
    setTargets({
      NO3_N: 120, NH4_N: 30, P: 70, K: 350, Ca: 180, Mg: 60, S: 120,
      Fe: 3, Mn: 0.5, Zn: 0.3, B: 0.5, Cu: 0.1, Mo: 0.05,
      Si: 0, Na: 0, Cl: 0
    });
    setActivePreset('flowering');
  };

  const handleCalculate = () => {
    if (substances.length === 0) {
      alert('Adicione pelo menos uma substância para calcular.');
      return;
    }

    const engine = new CalculatorEngine(substances, targets, solutionVolume);
    const calculationResult = engine.calculate();
    setResult(calculationResult);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BoraGrow Calculator</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Calculadora avançada para formulação de soluções nutritivas hidropônicas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configurações da Solução */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Solução</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="volume">Volume da Solução</Label>
                  <Input
                    id="volume"
                    type="number"
                    value={solutionVolume}
                    onChange={(e) => setSolutionVolume(parseFloat(e.target.value) || 1000)}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={volumeUnit} onValueChange={setVolumeUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCalculate} className="flex-1">
                  Calcular Solução
                </Button>
                <SaveRecipeDialog 
                  substances={substances}
                  targets={targets}
                  solutionVolume={solutionVolume}
                  volumeUnit={volumeUnit}
                  hasCalculationResult={result !== null}
                  result={result}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="mb-4">Concentrações Alvo (ppm)</CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={setVegetativeTargets}
                  className={`${
                    activePreset === 'vegetative' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'text-green-500 border-green-500 hover:bg-green-50 dark:hover:bg-green-950'
                  }`}
                  variant={activePreset === 'vegetative' ? 'default' : 'outline'}
                  size="sm"
                >
                  Vegetativo
                </Button>
                <Button 
                  onClick={setFloweringTargets}
                  className={`${
                    activePreset === 'flowering' 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'text-purple-600 border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950'
                  }`}
                  variant={activePreset === 'flowering' ? 'default' : 'outline'}
                  size="sm"
                >
                  Floração
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <NutrientTargets 
                targets={targets} 
                onTargetsChange={(newTargets) => {
                  setTargets(newTargets);
                  setActivePreset(null); // Reset active preset when manually changing values
                }} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Substâncias e Resultados */}
        <div className="space-y-6">
          <SubstanceList 
            substances={substances} 
            onSubstancesChange={setSubstances} 
          />
          
          <CalculationResults 
            result={result}
            substances={substances}
            solutionVolume={solutionVolume}
            volumeUnit={volumeUnit}
          />
        </div>
      </div>
    </div>
  );
}
