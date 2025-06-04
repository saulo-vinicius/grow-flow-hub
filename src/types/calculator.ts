
export interface Element {
  symbol: string;
  percentage: number;
  ppm?: number;
}

export interface Substance {
  id: string;
  name: string;
  formula: string;
  elements: Element[];
  weight?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  substances: Substance[];
  targetElements: Element[];
  solutionVolume: number;
  volumeUnit: string;
  ecValue?: number;
  phValue?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CalculationResult {
  substanceWeights: { [substanceId: string]: number };
  totalWeight: number;
  achievedElements: Element[];
  deviation: number;
  predictedEC?: number;
}

export interface NutrientTarget {
  N: number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
  Fe: number;
  Mn: number;
  Zn: number;
  B: number;
  Cu: number;
  Mo: number;
  Si: number;
  Na: number;
  Cl: number;
}
