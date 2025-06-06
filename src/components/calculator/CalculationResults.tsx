
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
        <CardTitle className="text-green-700 dark:text-green-400">Resultado do Cálculo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pesos das substâncias */}
        <div>
          <h4 className="font-medium mb-3 dark:text-white">Pesos das Substâncias</h4>
          <div className="space-y-2">
            {Object.entries(result.substanceWeights).map(([substanceId, weight]) => {
              const substance = substances.find(s => s.id === substanceId);
              if (!substance || weight === 0) return null;
              
              return (
                <div key={substanceId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium dark:text-white">{substance.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({substance.formula})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium dark:text-white">{weight.toFixed(3)} g</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      para {solutionVolume} {volumeUnit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium dark:text-white">Peso Total:</span>
              <span className="font-bold text-lg dark:text-white">{result.totalWeight.toFixed(3)} g</span>
            </div>
          </div>
        </div>

        {/* Elementos alcançados */}
        <div>
          <h4 className="font-medium mb-3 dark:text-white">Concentrações Alcançadas</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {result.achievedElements.map((element) => (
              <div key={element.symbol} className="p-3 border dark:border-gray-700 rounded-lg text-center bg-white dark:bg-gray-800">
                <div className="font-medium text-lg dark:text-white">{element.symbol}</div>
                <div className="text-sm dark:text-gray-300">
                  {element.ppm ? `${element.ppm.toFixed(2)} ppm` : `${element.percentage.toFixed(2)}%`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desvio */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border dark:border-yellow-800">
          <div className="flex justify-between items-center">
            <span className="font-medium dark:text-white">Desvio Médio:</span>
            <span className={`font-bold ${result.deviation < 5 ? 'text-green-600 dark:text-green-400' : result.deviation < 10 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.deviation.toFixed(2)}%
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {result.deviation < 5 && "Excelente precisão!"}
            {result.deviation >= 5 && result.deviation < 10 && "Boa precisão"}
            {result.deviation >= 10 && "Considere ajustar as substâncias"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
