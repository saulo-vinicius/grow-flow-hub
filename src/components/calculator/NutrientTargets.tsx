
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { NutrientTarget } from '@/types/calculator';

interface NutrientTargetsProps {
  targets: NutrientTarget;
  onTargetsChange: (targets: NutrientTarget) => void;
}

export function NutrientTargets({ targets, onTargetsChange }: NutrientTargetsProps) {
  const handleTargetChange = (element: keyof NutrientTarget, value: number) => {
    onTargetsChange({
      ...targets,
      [element]: value
    });
  };

  const resetTargets = () => {
    onTargetsChange({
      N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0,
      Fe: 0, Mn: 0, Zn: 0, B: 0, Cu: 0, Mo: 0,
      Si: 0, Na: 0, Cl: 0
    });
  };

  const macronutrients = [
    { key: 'N' as keyof NutrientTarget, label: 'Nitrogênio (N)', unit: 'ppm' },
    { key: 'P' as keyof NutrientTarget, label: 'Fósforo (P)', unit: 'ppm' },
    { key: 'K' as keyof NutrientTarget, label: 'Potássio (K)', unit: 'ppm' },
    { key: 'Ca' as keyof NutrientTarget, label: 'Cálcio (Ca)', unit: 'ppm' },
    { key: 'Mg' as keyof NutrientTarget, label: 'Magnésio (Mg)', unit: 'ppm' },
    { key: 'S' as keyof NutrientTarget, label: 'Enxofre (S)', unit: 'ppm' },
  ];

  const micronutrients = [
    { key: 'Fe' as keyof NutrientTarget, label: 'Ferro (Fe)', unit: 'ppm' },
    { key: 'Mn' as keyof NutrientTarget, label: 'Manganês (Mn)', unit: 'ppm' },
    { key: 'Zn' as keyof NutrientTarget, label: 'Zinco (Zn)', unit: 'ppm' },
    { key: 'B' as keyof NutrientTarget, label: 'Boro (B)', unit: 'ppm' },
    { key: 'Cu' as keyof NutrientTarget, label: 'Cobre (Cu)', unit: 'ppm' },
    { key: 'Mo' as keyof NutrientTarget, label: 'Molibdênio (Mo)', unit: 'ppm' },
    { key: 'Si' as keyof NutrientTarget, label: 'Silício (Si)', unit: 'ppm' },
    { key: 'Na' as keyof NutrientTarget, label: 'Sódio (Na)', unit: 'ppm' },
    { key: 'Cl' as keyof NutrientTarget, label: 'Cloro (Cl)', unit: 'ppm' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={resetTargets}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Zerar
        </Button>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-green-700">Macronutrientes</h4>
        <div className="grid grid-cols-2 gap-4">
          {macronutrients.map(({ key, label }) => (
            <div key={key}>
              <Label htmlFor={key} className="text-sm">{label}</Label>
              <Input
                id={key}
                type="number"
                value={targets[key]}
                onChange={(e) => handleTargetChange(key, parseFloat(e.target.value) || 0)}
                className="mt-1"
                min="0"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3 text-blue-700">Micronutrientes</h4>
        <div className="grid grid-cols-2 gap-4">
          {micronutrients.map(({ key, label }) => (
            <div key={key}>
              <Label htmlFor={key} className="text-sm">{label}</Label>
              <Input
                id={key}
                type="number"
                value={targets[key]}
                onChange={(e) => handleTargetChange(key, parseFloat(e.target.value) || 0)}
                className="mt-1"
                min="0"
                step="0.001"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
