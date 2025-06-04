
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  growth_phase: string;
  cultivation_medium?: string;
  soil_composition?: any;
}

interface EditPlantDialogProps {
  plant: Plant;
  onPlantUpdated: () => void;
}

export function EditPlantDialog({ plant, onPlantUpdated }: EditPlantDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(plant.name);
  const [species, setSpecies] = useState(plant.species || '');
  const [location, setLocation] = useState(plant.location || '');
  const [cultivationMedium, setCultivationMedium] = useState(plant.cultivation_medium || 'soil');
  const [soilComposition, setSoilComposition] = useState(
    plant.soil_composition || { sand: 0, clay: 0, silt: 0, organic: 0 }
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validar composição do solo se for cultivo em solo
    if (cultivationMedium === 'soil') {
      const total = soilComposition.sand + soilComposition.clay + soilComposition.silt + soilComposition.organic;
      if (total > 100) {
        toast({
          title: "Erro",
          description: "A composição do solo não pode ultrapassar 100%",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    try {
      const updateData: any = {
        name,
        species,
        location,
        cultivation_medium: cultivationMedium,
      };

      if (cultivationMedium === 'soil') {
        updateData.soil_composition = soilComposition;
      } else {
        updateData.soil_composition = null;
      }

      const { error } = await supabase
        .from('plants')
        .update(updateData)
        .eq('id', plant.id);

      if (error) throw error;

      toast({
        title: "Planta atualizada!",
        description: "Informações da planta atualizadas com sucesso."
      });

      setOpen(false);
      onPlantUpdated();
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

  const handleSoilCompositionChange = (type: string, value: string) => {
    setSoilComposition(prev => ({
      ...prev,
      [type]: parseFloat(value) || 0
    }));
  };

  const totalSoilComposition = soilComposition.sand + soilComposition.clay + soilComposition.silt + soilComposition.organic;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Planta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nome da Planta</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-species">Espécie</Label>
            <Input
              id="edit-species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-location">Localização</Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-cultivation-medium">Meio de Cultivo</Label>
            <Select value={cultivationMedium} onValueChange={setCultivationMedium}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soil">Solo</SelectItem>
                <SelectItem value="hydroponic">Hidroponia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {cultivationMedium === 'soil' && (
            <div className="space-y-3">
              <Label>Composição do Solo (%) - Optional</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="sand" className="text-sm">Areia</Label>
                  <Input
                    id="sand"
                    type="number"
                    min="0"
                    max="100"
                    value={soilComposition.sand}
                    onChange={(e) => handleSoilCompositionChange('sand', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="clay" className="text-sm">Argila</Label>
                  <Input
                    id="clay"
                    type="number"
                    min="0"
                    max="100"
                    value={soilComposition.clay}
                    onChange={(e) => handleSoilCompositionChange('clay', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="silt" className="text-sm">Silte</Label>
                  <Input
                    id="silt"
                    type="number"
                    min="0"
                    max="100"
                    value={soilComposition.silt}
                    onChange={(e) => handleSoilCompositionChange('silt', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="organic" className="text-sm">Matéria Orgânica</Label>
                  <Input
                    id="organic"
                    type="number"
                    min="0"
                    max="100"
                    value={soilComposition.organic}
                    onChange={(e) => handleSoilCompositionChange('organic', e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Total: {totalSoilComposition}% {totalSoilComposition > 100 && <span className="text-red-500">(Máximo 100%)</span>}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
