
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CreatePlantDialogProps {
  onPlantCreated: () => void;
}

export function CreatePlantDialog({ onPlantCreated }: CreatePlantDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [growthPhase, setGrowthPhase] = useState('vegetativa');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('plants')
        .insert({
          name,
          species,
          location,
          growth_phase: growthPhase,
          user_id: user.id,
          stats: {},
          applied_recipes: []
        });

      if (error) throw error;

      toast({
        title: "Planta adicionada!",
        description: "Nova planta registrada com sucesso."
      });

      setName('');
      setSpecies('');
      setLocation('');
      setGrowthPhase('vegetativa');
      setOpen(false);
      onPlantCreated();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Planta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Planta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Planta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tomate Cherry"
              required
            />
          </div>
          <div>
            <Label htmlFor="species">Espécie</Label>
            <Input
              id="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="Ex: Solanum lycopersicum"
            />
          </div>
          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Estufa 1, Bancada A"
            />
          </div>
          <div>
            <Label htmlFor="growth-phase">Fase de Crescimento</Label>
            <Select value={growthPhase} onValueChange={setGrowthPhase}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetativa">Vegetativa</SelectItem>
                <SelectItem value="floracao">Floração</SelectItem>
                <SelectItem value="frutificacao">Frutificação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Planta'}
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
