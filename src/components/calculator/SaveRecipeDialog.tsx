
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Substance, NutrientTarget } from '@/types/calculator';

interface SaveRecipeDialogProps {
  substances: Substance[];
  targets: NutrientTarget;
  solutionVolume: number;
  volumeUnit: string;
  hasCalculationResult: boolean;
}

export function SaveRecipeDialog({ substances, targets, solutionVolume, volumeUnit, hasCalculationResult }: SaveRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!hasCalculationResult) {
      toast({
        title: "Erro",
        description: "Realize o cálculo antes de salvar a receita",
        variant: "destructive"
      });
      return;
    }

    if (substances.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma substância antes de salvar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('nutrient_recipes')
        .insert({
          name,
          description,
          user_id: user.id,
          substances: substances as any,
          elements: targets as any,
          solution_volume: solutionVolume,
          volume_unit: volumeUnit
        });

      if (error) throw error;

      toast({
        title: "Receita salva!",
        description: "Receita salva com sucesso."
      });

      setName('');
      setDescription('');
      setOpen(false);
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
        <Button className="gap-2" variant="outline" disabled={!hasCalculationResult || substances.length === 0}>
          <Save className="h-4 w-4" />
          Salvar Receita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar Receita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Receita</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Receita Vegetativa Custom"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da receita..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
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
