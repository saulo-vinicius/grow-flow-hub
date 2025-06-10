export interface Element {
  symbol: string;
  percentage: number;
  ppm: number;
  type?: 'elemental' | 'ionic'; // Add type to distinguish elemental vs ionic forms
}

export interface Substance {
  id: string;
  name: string;
  formula: string;
  elements: Element[];
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

export interface CalculationResult {
  substanceWeights: { [substanceId: string]: number };
  totalWeight: number;
  achievedElements: Element[];
  deviation: number;
  ecValue?: number;
}
