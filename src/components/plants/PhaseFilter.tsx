
import { Button } from '@/components/ui/button';

interface PhaseFilterProps {
  selectedPhase: string | null;
  onPhaseChange: (phase: string | null) => void;
  plantCounts: { [key: string]: number };
}

const phases = [
  { key: null, label: 'Todas as Plantas', color: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700' },
  { key: 'germinacao', label: 'Germinação', color: 'bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800' },
  { key: 'plantula', label: 'Plântula', color: 'bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700' },
  { key: 'vegetativa', label: 'Vegetativo', color: 'bg-green-300 hover:bg-green-400 dark:bg-green-700 dark:hover:bg-green-600' },
  { key: 'pre-floracao', label: 'Pré-Floração', color: 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800' },
  { key: 'floracao', label: 'Floração', color: 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800' },
  { key: 'colheita', label: 'Colheita', color: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700' }
];

export function PhaseFilter({ selectedPhase, onPhaseChange, plantCounts }: PhaseFilterProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filtrar por fase:</h3>
      <div className="flex flex-wrap gap-2">
        {phases.map((phase) => {
          const count = phase.key ? plantCounts[phase.key] || 0 : Object.values(plantCounts).reduce((a, b) => a + b, 0);
          const isSelected = selectedPhase === phase.key;
          
          return (
            <Button
              key={phase.key || 'all'}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPhaseChange(phase.key)}
              className={`${!isSelected ? phase.color : ''} ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            >
              {phase.label} ({count})
            </Button>
          );
        })}
      </div>
    </div>
  );
}
