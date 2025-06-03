
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Leaf, Calendar, Trash2 } from 'lucide-react';
import { CreatePlantDialog } from '@/components/plants/CreatePlantDialog';
import { PlantDetailsDialog } from '@/components/plants/PlantDetailsDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Plant {
  id: string;
  name: string;
  species: string;
  location: string;
  growth_phase: string;
  added_on: string;
}

export function Plants() {
  const { t } = useTranslation();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPlants = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('added_on', { ascending: false });

      if (error) throw error;
      setPlants(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar plantas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePlant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Planta removida",
        description: "Planta removida com sucesso"
      });

      fetchPlants();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao remover planta",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchPlants();
  }, [user]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'germinacao': return 'bg-yellow-100 text-yellow-800';
      case 'plantula': return 'bg-green-100 text-green-800';
      case 'vegetativa': return 'bg-green-100 text-green-800';
      case 'floracao': return 'bg-orange-100 text-orange-800';
      case 'frutificacao': return 'bg-red-100 text-red-800';
      case 'colheita': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'germinacao': return 'Germinação';
      case 'plantula': return 'Plântula';
      case 'vegetativa': return 'Vegetativa';
      case 'floracao': return 'Floração';
      case 'frutificacao': return 'Frutificação';
      case 'colheita': return 'Colheita';
      default: return phase;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando plantas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('plants.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('plants.subtitle')}
          </p>
        </div>
        <CreatePlantDialog onPlantCreated={fetchPlants} />
      </div>

      {plants.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Suas Plantas</CardTitle>
            <CardDescription>
              Acompanhe o crescimento e cuidados das suas plantas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Plus className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma planta registrada</p>
              <p>Adicione sua primeira planta para começar o acompanhamento!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <Card key={plant.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{plant.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {plant.species || 'Espécie não informada'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlant(plant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{plant.location || 'Local não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(plant.growth_phase)}`}>
                      {getPhaseLabel(plant.growth_phase)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Adicionada em {new Date(plant.added_on).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="pt-2">
                    <PlantDetailsDialog 
                      plantId={plant.id}
                      plantName={plant.name}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
