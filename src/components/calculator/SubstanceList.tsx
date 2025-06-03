
import { SubstanceSelector } from './SubstanceSelector';
import { Substance } from '@/types/calculator';

interface SubstanceListProps {
  substances: Substance[];
  onSubstancesChange: (substances: Substance[]) => void;
}

export function SubstanceList({ substances, onSubstancesChange }: SubstanceListProps) {
  return (
    <SubstanceSelector 
      selectedSubstances={substances}
      onSubstancesChange={onSubstancesChange}
    />
  );
}
