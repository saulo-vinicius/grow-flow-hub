
import { Substance, NutrientTarget, CalculationResult, Element } from '@/types/calculator';

// EC calculation constants - conductivity factors for ions (µS/cm per ppm)
const CONDUCTIVITY_FACTORS: { [key: string]: number } = {
  'N': 0.71,     // Average for NO3- and NH4+
  'NO3': 0.71,
  'NH4': 0.73,
  'P': 0.35,
  'K': 0.73,
  'Ca': 0.53,
  'Mg': 0.82,
  'S': 0.52,
  'Fe': 0.18,
  'Mn': 0.52,
  'Zn': 0.31,
  'B': 0.93,
  'Cu': 0.31,
  'Mo': 0.21,
  'Si': 0.13,
  'Na': 0.69,
  'Cl': 0.76
};

export class CalculatorEngine {
  private substances: Substance[];
  private targets: NutrientTarget;
  private solutionVolume: number;

  constructor(substances: Substance[], targets: NutrientTarget, solutionVolume: number) {
    this.substances = substances;
    this.targets = targets;
    this.solutionVolume = solutionVolume;
  }

  calculate(): CalculationResult {
    // Implementação do algoritmo de otimização
    const result = this.optimizeWeights();
    return result;
  }

  private calculateEC(concentrations: { [element: string]: number }): number {
    let totalEC = 0;
    
    // Calculate EC based on ionic conductivity
    Object.entries(concentrations).forEach(([element, ppm]) => {
      const factor = CONDUCTIVITY_FACTORS[element];
      if (factor && ppm > 0) {
        totalEC += ppm * factor;
      }
    });
    
    // Convert µS/cm to mS/cm (divide by 1000)
    return totalEC / 1000;
  }

  private optimizeWeights(): CalculationResult {
    const numSubstances = this.substances.length;
    const weights = new Array(numSubstances).fill(0);
    
    // Elementos que queremos calcular
    const targetElements = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
    
    // Algoritmo simplificado de otimização por tentativa e erro
    let bestWeights = [...weights];
    let bestDeviation = Infinity;
    
    // Múltiplas tentativas com diferentes combinações
    for (let iteration = 0; iteration < 1000; iteration++) {
      // Gerar pesos aleatórios pequenos
      for (let i = 0; i < numSubstances; i++) {
        weights[i] = Math.random() * 5; // até 5g por substância
      }
      
      const achievedConcentrations = this.calculateConcentrations(weights);
      const deviation = this.calculateDeviation(achievedConcentrations, this.targets);
      
      if (deviation < bestDeviation) {
        bestDeviation = deviation;
        bestWeights = [...weights];
      }
    }
    
    // Refinamento com hill climbing
    bestWeights = this.refineWeights(bestWeights);
    
    const finalConcentrations = this.calculateConcentrations(bestWeights);
    const finalDeviation = this.calculateDeviation(finalConcentrations, this.targets);
    const ecValue = this.calculateEC(finalConcentrations);
    
    // Converter para formato de resultado
    const substanceWeights: { [key: string]: number } = {};
    let totalWeight = 0;
    
    this.substances.forEach((substance, index) => {
      const weight = bestWeights[index];
      substanceWeights[substance.id] = weight;
      totalWeight += weight;
    });
    
    const achievedElements: Element[] = targetElements.map(symbol => ({
      symbol,
      percentage: 0,
      ppm: parseFloat((finalConcentrations[symbol] || 0).toFixed(2))
    }));
    
    return {
      substanceWeights,
      totalWeight,
      achievedElements,
      deviation: finalDeviation,
      ecValue
    };
  }
  
  private calculateConcentrations(weights: number[]): { [element: string]: number } {
    const concentrations: { [element: string]: number } = {};
    
    // Para cada elemento, somar a contribuição de cada substância
    this.substances.forEach((substance, substanceIndex) => {
      const weight = weights[substanceIndex]; // peso em gramas
      
      substance.elements.forEach(element => {
        let elementSymbol = element.symbol;
        
        // Map nitrogen variants to N
        if (elementSymbol === 'NO3' || elementSymbol === 'NH4' || elementSymbol.includes('N (')) {
          elementSymbol = 'N';
        }
        
        if (!concentrations[elementSymbol]) {
          concentrations[elementSymbol] = 0;
        }
        
        // Calcular concentração em ppm
        // weight (g) * percentage (%) / 100 = gramas do elemento
        // (gramas do elemento / volume em L) * 1000 = mg/L = ppm
        const elementWeight = (weight * element.percentage) / 100;
        const volumeInLiters = this.solutionVolume / (this.solutionVolume >= 1000 ? 1000 : 1); // Fix L/mL conversion
        const ppm = (elementWeight / volumeInLiters) * 1000;
        
        concentrations[elementSymbol] += ppm;
      });
    });
    
    return concentrations;
  }
  
  private calculateDeviation(achieved: { [element: string]: number }, targets: NutrientTarget): number {
    const elements = Object.keys(targets) as (keyof NutrientTarget)[];
    let totalDeviation = 0;
    let count = 0;
    
    elements.forEach(element => {
      const target = targets[element];
      const actual = achieved[element] || 0;
      
      if (target > 0) {
        const deviation = Math.abs(actual - target) / target * 100;
        totalDeviation += deviation;
        count++;
      }
    });
    
    return count > 0 ? totalDeviation / count : 0;
  }
  
  private refineWeights(weights: number[]): number[] {
    const refined = [...weights];
    const stepSize = 0.1;
    const maxIterations = 100;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let improved = false;
      
      for (let i = 0; i < refined.length; i++) {
        const originalWeight = refined[i];
        
        // Tentar aumentar
        refined[i] = originalWeight + stepSize;
        const increaseDeviation = this.calculateDeviation(
          this.calculateConcentrations(refined), 
          this.targets
        );
        
        // Tentar diminuir
        refined[i] = Math.max(0, originalWeight - stepSize);
        const decreaseDeviation = this.calculateDeviation(
          this.calculateConcentrations(refined), 
          this.targets
        );
        
        // Manter o original
        refined[i] = originalWeight;
        const originalDeviation = this.calculateDeviation(
          this.calculateConcentrations(refined), 
          this.targets
        );
        
        // Escolher a melhor opção
        if (increaseDeviation < originalDeviation && increaseDeviation <= decreaseDeviation) {
          refined[i] = originalWeight + stepSize;
          improved = true;
        } else if (decreaseDeviation < originalDeviation) {
          refined[i] = Math.max(0, originalWeight - stepSize);
          improved = true;
        }
      }
      
      if (!improved) break;
    }
    
    return refined;
  }
}
