
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NutrientTarget } from '@/types/calculator';

interface NutrientTargetsProps {
  targets: NutrientTarget;
  onTargetsChange: (targets: NutrientTarget) => void;
}

export function NutrientTargets({ targets, onTargetsChange }: NutrientTargetsProps) {
  const macronutrients = [
    { key: 'N' as keyof NutrientTarget, label: 'Nitrogênio (N)', unit: 'ppm' },
    { key: 'P' as keyof NutrientTarget, label: 'Fósforo (P)', unit: 'ppm' },
    { key: 'K' as keyof NutrientTarget, label: 'Potássio (K)', unit: 'ppm' },
    { key: 'Ca' as keyof NutrientTarget, label: 'Cálcio (Ca)', unit: 'ppm' },
    { key: 'Mg' as keyof NutrientTarget, label: 'Magnésio (Mg)', unit: 'ppm' },
    { key: 'S' as keyof NutrientTarget, label: 'Enxofre (S)', unit: 'ppm' }
  ];

  const micronutrients = [
    { key: 'Fe' as keyof NutrientTarget, label: 'Ferro (Fe)', unit: 'ppm' },
    { key: 'Mn' as keyof NutrientTarget, label: 'Manganês (Mn)', unit: 'ppm' },
    { key: 'Zn' as keyof NutrientTarget, label: 'Zinco (Zn)', unit: 'ppm' },
    { key: 'B' as keyof NutrientTarget, label: 'Boro (B)', unit: 'ppm' },
    { key: 'Cu' as keyof NutrientTarget, label: 'Cobre (Cu)', unit: 'ppm' },
    { key: 'Mo' as keyof NutrientTarget, label: 'Molibdênio (Mo)', unit: 'ppm' }
  ];

  const handleChange = (key: keyof NutrientTarget, value: string) => {
    const numValue = parseFloat(value) || 0;
    onTargetsChange({
      ...targets,
      [key]: numValue
    });
  };

  const presetRecipes = {
    vegetativa: {
      N: 200, P: 50, K: 300, Ca: 200, Mg: 50, S: 100,
      Fe: 3, Mn: 0.5, Zn: 0.3, B: 0.5, Cu: 0.1, Mo: 0.05
    },
    floracao: {
      N: 150, P: 80, K: 350, Ca: 180, Mg: 60, S: 120,
      Fe: 3, Mn: 0.5, Zn: 0.3, B: 0.5, Cu: 0.1, Mo: 0.05
    },
    geral: {
      N: 180, P: 60, K: 320, Ca: 190, Mg: 55, S: 110,
      Fe: 3, Mn: 0.5, Zn: 0.3, B: 0.5, Cu: 0.1, Mo: 0.05
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valores Alvo dos Nutrientes</CardTitle>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
            onClick={() => onTargetsChange(presetRecipes.vegetativa)}
          >
            Vegetativa
          </button>
          <button
            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
            onClick={() => onTargetsChange(presetRecipes.floracao)}
          >
            Floração
          </button>
          <button
            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            onClick={() => onTargetsChange(presetRecipes.geral)}
          >
            Geral
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Macronutrientes */}
          <div>
            <h4 className="font-medium mb-3 text-green-700">Macronutrientes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {macronutrients.map(({ key, label, unit }) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id={key}
                      type="number"
                      value={targets[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="text-sm"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-500">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Micronutrientes */}
          <div>
            <h4 className="font-medium mb-3 text-blue-700">Micronutrientes</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {micronutrients.map(({ key, label, unit }) => (
                <div key={key}>
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      id={key}
                      type="number"
                      value={targets[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="text-sm"
                      step="0.01"
                    />
                    <span className="text-xs text-gray-500">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
