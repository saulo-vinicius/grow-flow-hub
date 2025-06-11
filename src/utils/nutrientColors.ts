
export type NutrientCategory = 'primary' | 'secondary' | 'micronutrient';

export interface NutrientColorConfig {
  text: string;
  bg: string;
  border: string;
  category: NutrientCategory;
}

const NUTRIENT_CATEGORIES: Record<string, NutrientColorConfig> = {
  // Primários - Verde
  'NO3_N': { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', category: 'primary' },
  'NH4_N': { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', category: 'primary' },
  'N': { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', category: 'primary' },
  'P': { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', category: 'primary' },
  'K': { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', category: 'primary' },
  
  // Secundários - Azul
  'Ca': { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', category: 'secondary' },
  'Mg': { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', category: 'secondary' },
  'S': { text: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300', category: 'secondary' },
  
  // Micronutrientes - Cinza
  'Fe': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Mn': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Zn': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'B': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Cu': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Mo': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Si': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Na': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' },
  'Cl': { text: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', category: 'micronutrient' }
};

export function getNutrientColors(nutrient: string): NutrientColorConfig {
  return NUTRIENT_CATEGORIES[nutrient] || NUTRIENT_CATEGORIES['Fe']; // Default to micronutrient colors
}

export function getNutrientBadgeClasses(nutrient: string): string {
  const colors = getNutrientColors(nutrient);
  return `${colors.text} ${colors.bg} ${colors.border} border rounded-full px-2 py-1 text-xs font-medium`;
}
