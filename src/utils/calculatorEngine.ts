
import { Substance, NutrientTarget, CalculationResult, Element } from '@/types/calculator';

// Molar conductivity constants from HydroBuddy (S·cm²/mol)
const MOLAR_CONDUCTIVITY: { [key: string]: number } = {
  'NO3': 71.4,    // Nitrate
  'NH4': 73.4,    // Ammonium
  'K': 73.5,      // Potassium
  'Ca': 119.0,    // Calcium
  'Mg': 106.1,    // Magnesium
  'H2PO4': 36.0,  // Dihydrogen phosphate
  'HPO4': 57.0,   // Hydrogen phosphate
  'SO4': 160.0,   // Sulfate
  'Fe': 68.0,     // Iron (Fe3+)
  'Mn': 53.5,     // Manganese
  'Zn': 52.8,     // Zinc
  'B': 21.0,      // Boron (as borate)
  'Cu': 53.6,     // Copper
  'Mo': 74.5,     // Molybdenum (as molybdate)
  'Si': 31.0,     // Silicon (as silicate)
  'Na': 50.1,     // Sodium
  'Cl': 76.3      // Chloride
};

// Molar masses (g/mol)
const MOLAR_MASSES: { [key: string]: number } = {
  'NO3': 62.0,    // NO3-
  'NH4': 18.0,    // NH4+
  'K': 39.1,      // K+
  'Ca': 40.1,     // Ca2+
  'Mg': 24.3,     // Mg2+
  'H2PO4': 97.0,  // H2PO4-
  'HPO4': 96.0,   // HPO42-
  'SO4': 96.1,    // SO42-
  'Fe': 55.8,     // Fe3+
  'Mn': 54.9,     // Mn2+
  'Zn': 65.4,     // Zn2+
  'B': 10.8,      // B (as borate)
  'Cu': 63.5,     // Cu2+
  'Mo': 95.9,     // Mo (as molybdate)
  'Si': 28.1,     // Si
  'Na': 23.0,     // Na+
  'Cl': 35.5,     // Cl-
  'P': 31.0,      // P (for conversion)
  'N': 14.0       // N (for conversion)
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
    const result = this.optimizeWeights();
    return result;
  }

  private calculateEC(concentrations: { [element: string]: number }): number {
    let totalEC = 0;
    
    console.log('=== EC Calculation ===');
    console.log('PPM concentrations:', concentrations);
    
    // Calculate EC using proper molar conductivity formula
    Object.entries(concentrations).forEach(([element, ppm]) => {
      let ionSymbol = element;
      
      // Map elements to their ionic forms for EC calculation
      if (element === 'NO3_N' || element === 'NH4_N') {
        // Skip individual N forms for EC - we calculate NO3 and NH4 separately
        return;
      } else if (element === 'P') {
        ionSymbol = 'H2PO4'; // Assume phosphate as dihydrogen phosphate
      } else if (element === 'S') {
        ionSymbol = 'SO4'; // Sulfur as sulfate
      }
      
      const molarMass = MOLAR_MASSES[ionSymbol];
      const molarConductivity = MOLAR_CONDUCTIVITY[ionSymbol];
      
      if (molarMass && molarConductivity && ppm > 0) {
        // Convert ppm to mol/L: ppm / (molar_mass * 1000)
        const molPerL = ppm / (molarMass * 1000);
        
        // EC contribution: molar_conductivity * concentration_mol/L
        const ecContribution = molarConductivity * molPerL;
        totalEC += ecContribution;
        
        console.log(`${ionSymbol}: ${ppm.toFixed(2)} ppm → ${molPerL.toFixed(6)} mol/L → EC: ${ecContribution.toFixed(4)} mS/cm`);
      }
    });
    
    // Convert from S/cm to mS/cm (already in correct units with our constants)
    const finalEC = totalEC;
    console.log(`Total EC: ${finalEC.toFixed(3)} mS/cm`);
    
    return parseFloat(finalEC.toFixed(3));
  }

  private optimizeWeights(): CalculationResult {
    const numSubstances = this.substances.length;
    const weights = new Array(numSubstances).fill(0);
    
    // Target elements for optimization - now using separate N forms
    const targetElements = ['NO3_N', 'NH4_N', 'P', 'K', 'Ca', 'Mg', 'S', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
    
    // Simple optimization algorithm
    let bestWeights = [...weights];
    let bestDeviation = Infinity;
    
    // Multiple attempts with different combinations
    for (let iteration = 0; iteration < 1000; iteration++) {
      // Generate small random weights
      for (let i = 0; i < numSubstances; i++) {
        weights[i] = Math.random() * 5; // up to 5g per substance
      }
      
      const achievedConcentrations = this.calculateConcentrations(weights);
      const deviation = this.calculateDeviation(achievedConcentrations, this.targets);
      
      if (deviation < bestDeviation) {
        bestDeviation = deviation;
        bestWeights = [...weights];
      }
    }
    
    // Refinement with hill climbing
    bestWeights = this.refineWeights(bestWeights);
    
    const finalConcentrations = this.calculateConcentrations(bestWeights);
    const finalDeviation = this.calculateDeviation(finalConcentrations, this.targets);
    const ecValue = this.calculateEC(finalConcentrations);
    
    // Convert to result format
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
    const ionConcentrations: { [element: string]: number } = {};
    
    console.log('=== Concentration Calculation ===');
    console.log('Solution volume:', this.solutionVolume, 'mL');
    
    // Convert volume to liters for calculations
    const volumeInLiters = this.solutionVolume / 1000;
    console.log('Volume in liters:', volumeInLiters);
    
    // Calculate concentrations for each substance
    this.substances.forEach((substance, substanceIndex) => {
      const weight = weights[substanceIndex]; // weight in grams
      
      if (weight > 0) {
        console.log(`\n--- ${substance.name} (${weight.toFixed(3)}g) ---`);
      }
      
      substance.elements.forEach(element => {
        const elementSymbol = element.symbol;
        const elementType = element.type || this.inferElementType(elementSymbol);
        
        console.log(`Processing ${elementSymbol} (type: ${elementType}, ${element.percentage}%)`);
        
        if (elementType === 'ionic') {
          // Handle ionic forms (NO3, NH4, SO4, etc.)
          this.processIonicElement(element, weight, volumeInLiters, concentrations, ionConcentrations);
        } else {
          // Handle elemental forms (N, P, K, Ca, Mg, S, etc.)
          this.processElementalForm(element, weight, volumeInLiters, concentrations);
        }
      });
    });
    
    // Add ion concentrations for EC calculation
    Object.entries(ionConcentrations).forEach(([ion, ppm]) => {
      concentrations[ion] = ppm;
    });
    
    console.log('\n=== Final Concentrations ===');
    Object.entries(concentrations).forEach(([element, ppm]) => {
      if (ppm > 0.01) {
        console.log(`${element}: ${ppm.toFixed(3)} ppm`);
      }
    });
    
    return concentrations;
  }

  private inferElementType(symbol: string): 'elemental' | 'ionic' {
    // Ionic forms
    if (['NO3', 'NH4', 'SO4', 'PO4', 'H2PO4', 'HPO4'].includes(symbol) || 
        symbol.includes('NO3') || symbol.includes('NH4')) {
      return 'ionic';
    }
    // Default to elemental for basic elements
    return 'elemental';
  }

  private processIonicElement(
    element: Element, 
    weight: number, 
    volumeInLiters: number, 
    concentrations: { [element: string]: number },
    ionConcentrations: { [element: string]: number }
  ) {
    const elementSymbol = element.symbol;
    const elementWeight = (weight * element.percentage) / 100;
    const ionPpm = (elementWeight / volumeInLiters) * 1000;
    
    if (elementSymbol === 'NO3' || elementSymbol.includes('NO3')) {
      if (!ionConcentrations['NO3']) ionConcentrations['NO3'] = 0;
      ionConcentrations['NO3'] += ionPpm;
      
      // Convert NO3- to N: N = NO3- × (14/62) and store as NO3_N
      const nFromNO3 = ionPpm * (14.0 / 62.0);
      if (!concentrations['NO3_N']) concentrations['NO3_N'] = 0;
      concentrations['NO3_N'] += nFromNO3;
      
      if (weight > 0) {
        console.log(`  ${elementSymbol}: ${element.percentage}% → ${ionPpm.toFixed(3)} ppm NO3- → ${nFromNO3.toFixed(3)} ppm N(NO3-)`);
      }
    } else if (elementSymbol === 'NH4' || elementSymbol.includes('NH4')) {
      if (!ionConcentrations['NH4']) ionConcentrations['NH4'] = 0;
      ionConcentrations['NH4'] += ionPpm;
      
      // Convert NH4+ to N: N = NH4+ × (14/18) and store as NH4_N
      const nFromNH4 = ionPpm * (14.0 / 18.0);
      if (!concentrations['NH4_N']) concentrations['NH4_N'] = 0;
      concentrations['NH4_N'] += nFromNH4;
      
      if (weight > 0) {
        console.log(`  ${elementSymbol}: ${element.percentage}% → ${ionPpm.toFixed(3)} ppm NH4+ → ${nFromNH4.toFixed(3)} ppm N(NH4+)`);
      }
    }
  }

  private processElementalForm(
    element: Element, 
    weight: number, 
    volumeInLiters: number, 
    concentrations: { [element: string]: number }
  ) {
    let elementSymbol = element.symbol;
    
    // Clean up element symbol variations
    if (elementSymbol.includes('N (') || elementSymbol === 'N') {
      elementSymbol = 'N';
    }
    
    if (!concentrations[elementSymbol]) {
      concentrations[elementSymbol] = 0;
    }
    
    // Calculate concentration in ppm using correct formula
    const elementWeight = (weight * element.percentage) / 100; // grams of element
    const ppm = (elementWeight / volumeInLiters) * 1000; // mg/L = ppm
    
    concentrations[elementSymbol] += ppm;
    
    if (weight > 0 && ppm > 0.01) {
      console.log(`  ${elementSymbol}: ${element.percentage}% → ${ppm.toFixed(3)} ppm (elemental)`);
    }
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
        
        // Try increasing
        refined[i] = originalWeight + stepSize;
        const increaseDeviation = this.calculateDeviation(
          this.calculateConcentrations(refined), 
          this.targets
        );
        
        // Try decreasing
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
        
        // Choose the best option
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
