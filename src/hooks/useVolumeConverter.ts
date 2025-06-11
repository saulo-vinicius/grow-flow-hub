
import { useState, useCallback } from 'react';

export type VolumeUnit = 'mL' | 'L' | 'gal';

interface VolumeConverter {
  internalValue: number; // Always in mL for calculations
  displayValue: number;
  unit: VolumeUnit;
  setVolume: (value: number, unit: VolumeUnit) => void;
  convertToUnit: (targetUnit: VolumeUnit) => void;
}

const CONVERSION_FACTORS = {
  'mL': 1,
  'L': 1000,
  'gal': 3785.41 // 1 US gallon = 3785.41 mL
};

export function useVolumeConverter(initialValueInML: number = 1000): VolumeConverter {
  const [internalValue, setInternalValue] = useState(initialValueInML);
  const [unit, setUnit] = useState<VolumeUnit>('L');

  const getDisplayValue = useCallback((valueInML: number, targetUnit: VolumeUnit): number => {
    return parseFloat((valueInML / CONVERSION_FACTORS[targetUnit]).toFixed(3));
  }, []);

  const setVolume = useCallback((value: number, newUnit: VolumeUnit) => {
    const newInternalValue = value * CONVERSION_FACTORS[newUnit];
    setInternalValue(newInternalValue);
    setUnit(newUnit);
  }, []);

  const convertToUnit = useCallback((targetUnit: VolumeUnit) => {
    setUnit(targetUnit);
  }, []);

  return {
    internalValue,
    displayValue: getDisplayValue(internalValue, unit),
    unit,
    setVolume,
    convertToUnit
  };
}
