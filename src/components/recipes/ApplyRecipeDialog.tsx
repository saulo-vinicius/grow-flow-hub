
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Plant {
  id: string;
  name: string;
  species: string;
  growth_phase: string;
}

interface ApplyRecipeDialogProps {
  recipeId: string;
  recipeName: string;
  onRecipeApplied: () => void;
}

export function ApplyRecipeDialog({ recipeId, recipeName, onRecipeApplied }: ApplyRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchPlants();
    }
  }, [open]);

  const fetchPlants = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('plants')
        .select('id, name, species, growth_phase')
        .eq('user_id', user.id)
        .neq('growth_phase', 'colheita')
        .order('name');

      if (error) throw error;
      setPlants(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar plantas",
        variant: "destructive"
      });
    }
  };

  const handlePlantSelection = (plantId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlants([...selectedPlants, plantId]);
    } else {
      setSelectedPlants(selectedPlants.filter(id => id !== plantId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || selectedPlants.length === 0) return;

    setLoading(true);
    try {
      const applications = selectedPlants.map(plantId => ({
        plant_id: plantId,
        recipe_id: recipeId,
        user_id: user.id,
        notes: notes || null
      }));

      const { error } = await supabase
        .from('plant_recipe_applications')
        .insert(applications);

      if (error) throw error;

      toast({
        title: "Receita aplicada!",
        description: `Receita "${recipeName}" aplicada a ${selectedPlants.length} planta(s).`
      });

      setSelectedPlants([]);
      setNotes('');
      setOpen(false);
      onRecipeApplied();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'germinacao': return 'bg-yellow-100 text-yellow-800';
      case 'plantula': return 'bg-green-100 text-green-800';
      case 'vegetativa': return 'bg-green-100 text-green-800';
      case 'floracao': return 'bg-orange-100 text-orange-800';
      case 'frutificacao': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="outline">
          <Leaf className="h-4 w-4" />
          Aplicar à Planta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aplicar Receita: {recipeName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Selecione as plantas:</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
              {plants.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma planta disponível</p>
              ) : (
                plants.map((plant) => (
                  <div key={plant.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox
                      id={plant.id}
                      checked={selectedPlants.includes(plant.id)}
                      onCheckedChange={(checked) => handlePlantSelection(plant.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor={plant.id} className="text-sm font-medium cursor-pointer">
                        {plant.name}
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{plant.species}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPhaseColor(plant.growth_phase)}`}>
                          {plant.growth_phase}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a aplicação..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={loading || selectedPlants.length === 0}
              className="flex-1"
            >
              {loading ? 'Aplicando...' : 'Aplicar Receita'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
