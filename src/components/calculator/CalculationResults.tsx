
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculationResult, Substance } from '@/types/calculator';

interface CalculationResultsProps {
  result: CalculationResult | null;
  substances: Substance[];
  solutionVolume: number;
  volumeUnit: string;
}

export function CalculationResults({ result, substances, solutionVolume, volumeUnit }: CalculationResultsProps) {
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-700">Resultado do Cálculo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pesos das substâncias */}
        <div>
          <h4 className="font-medium mb-3">Pesos das Substâncias</h4>
          <div className="space-y-2">
            {Object.entries(result.substanceWeights).map(([substanceId, weight]) => {
              const substance = substances.find(s => s.id === substanceId);
              if (!substance || weight === 0) return null;
              
              return (
                <div key={substanceId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{substance.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({substance.formula})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{weight.toFixed(3)} g</div>
                    <div className="text-sm text-gray-500">
                      para {solutionVolume} {volumeUnit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Peso Total:</span>
              <span className="font-bold text-lg">{result.totalWeight.toFixed(3)} g</span>
            </div>
          </div>
        </div>

        {/* Elementos alcançados */}
        <div>
          <h4 className="font-medium mb-3">Concentrações Alcançadas</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {result.achievedElements.map((element) => (
              <div key={element.symbol} className="p-3 border rounded-lg text-center">
                <div className="font-medium text-lg">{element.symbol}</div>
                <div className="text-sm">
                  {element.ppm ? `${element.ppm.toFixed(2)} ppm` : `${element.percentage.toFixed(2)}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desvio */}
        <div className="p-3 bg-yellow-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Desvio Médio:</span>
            <span className={`font-bold ${result.deviation < 5 ? 'text-green-600' : result.deviation < 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {result.deviation.toFixed(2)}%
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {result.deviation < 5 && "Excelente precisão!"}
            {result.deviation >= 5 && result.deviation < 10 && "Boa precisão"}
            {result.deviation >= 10 && "Considere ajustar as substâncias"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
