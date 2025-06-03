
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Beaker } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PlantApplication {
  id: string;
  applied_at: string;
  notes: string | null;
  nutrient_recipes: {
    name: string;
    description: string | null;
  };
}

interface PlantDetailsDialogProps {
  plantId: string;
  plantName: string;
}

export function PlantDetailsDialog({ plantId, plantName }: PlantDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [applications, setApplications] = useState<PlantApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open]);

  const fetchApplications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plant_recipe_applications')
        .select(`
          id,
          applied_at,
          notes,
          nutrient_recipes (
            name,
            description
          )
        `)
        .eq('plant_id', plantId)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de nutrientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Nutrientes - {plantName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Carregando histórico...</div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <Beaker className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Nenhuma receita aplicada</p>
                  <p className="text-sm">Esta planta ainda não recebeu nenhuma aplicação de nutrientes.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {applications.length} aplicaç{applications.length === 1 ? 'ão' : 'ões'}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {application.nutrient_recipes.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(application.applied_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {application.nutrient_recipes.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {application.nutrient_recipes.description}
                        </p>
                      )}
                      {application.notes && (
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <strong>Observações:</strong> {application.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
