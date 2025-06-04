
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Beaker, Trash2, Flask, Eye } from 'lucide-react';
import { CreateRecipeDialog } from '@/components/recipes/CreateRecipeDialog';
import { ApplyRecipeDialog } from '@/components/recipes/ApplyRecipeDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Recipe {
  id: string;
  name: string;
  description: string;
  solution_volume: number;
  volume_unit: string;
  created_at: string;
  substances: any[];
  elements: any;
}

export function Recipes() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecipes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutrient_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar receitas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrient_recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Receita removida",
        description: "Receita removida com sucesso"
      });

      fetchRecipes();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao remover receita",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando receitas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Flask className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('recipes.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('recipes.subtitle')}
            </p>
          </div>
        </div>
        <CreateRecipeDialog onRecipeCreated={fetchRecipes} />
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Suas Receitas</CardTitle>
            <CardDescription>
              Gerencie suas receitas personalizadas de nutrientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Plus className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma receita criada</p>
              <p>Comece criando sua primeira receita de nutrientes!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {recipe.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecipe(recipe.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Beaker className="h-4 w-4" />
                    <span>{recipe.solution_volume} {recipe.volume_unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(recipe.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Composição
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Composição da Receita: {recipe.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Substâncias:</h4>
                            {recipe.substances && recipe.substances.length > 0 ? (
                              <div className="space-y-2">
                                {recipe.substances.map((substance: any, index: number) => (
                                  <div key={index} className="p-2 border rounded">
                                    <div className="font-medium">{substance.name}</div>
                                    <div className="text-sm text-gray-500">{substance.formula}</div>
                                    <div className="text-xs text-gray-400">
                                      {substance.elements?.map((el: any) => `${el.symbol}: ${el.percentage}%`).join(', ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Nenhuma substância registrada</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Concentrações Alvo (ppm):</h4>
                            {recipe.elements ? (
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                {Object.entries(recipe.elements).map(([element, value]: [string, any]) => (
                                  <div key={element}>
                                    <span className="font-medium">{element}:</span> {value}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">Nenhuma concentração definida</p>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <ApplyRecipeDialog 
                      recipeId={recipe.id}
                      recipeName={recipe.name}
                      onRecipeApplied={fetchRecipes}
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
