
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Beaker, Trash2, TestTube, Eye, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { ApplyRecipeDialog } from '@/components/recipes/ApplyRecipeDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Json } from '@/integrations/supabase/types';

interface Recipe {
  id: string;
  name: string;
  description: string;
  solution_volume: number;
  volume_unit: string;
  created_at: string;
  substances: Json;
  elements: Json;
}

export function Recipes() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTargetConcentrations, setShowTargetConcentrations] = useState<{ [key: string]: boolean }>({});
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
      
      // Safely cast the data to match our Recipe interface
      const typedData: Recipe[] = (data || []).map(recipe => ({
        ...recipe,
        substances: recipe.substances || [],
        elements: recipe.elements || {}
      }));
      
      setRecipes(typedData);
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

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle target concentrations visibility for a specific recipe
  const toggleTargetConcentrations = (recipeId: string) => {
    setShowTargetConcentrations(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
  };

  // Helper function to safely parse and render substances with weights
  const renderSubstances = (substances: Json) => {
    try {
      const substanceArray = Array.isArray(substances) ? substances : [];
      return substanceArray.length > 0 ? (
        <div className="space-y-2">
          {substanceArray.map((substance: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {substance.name || 'Nome não disponível'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {substance.formula || 'Fórmula não disponível'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {substance.elements?.map((el: any) => `${el.symbol}: ${el.percentage}%`).join(', ') || 'Elementos não disponíveis'}
                  </div>
                </div>
                {substance.weight && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {substance.weight.toFixed(3)}g
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Nenhuma substância registrada</p>
      );
    } catch {
      return <p className="text-gray-500 dark:text-gray-400">Erro ao carregar substâncias</p>;
    }
  };

  // Helper function to safely parse and render elements in organized order
  const renderElements = (elements: Json) => {
    try {
      if (typeof elements === 'object' && elements !== null && !Array.isArray(elements)) {
        // Define the order: macronutrients first, then micronutrients
        const macronutrients = ['N', 'P', 'K', 'Ca', 'Mg', 'S'];
        const micronutrients = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo', 'Si', 'Na', 'Cl'];

        return (
          <div className="space-y-4">
            {macronutrients.some(el => elements[el] !== undefined) && (
              <div>
                <h5 className="font-medium text-green-700 dark:text-green-400 mb-2">Macronutrientes</h5>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {macronutrients.map(element => 
                    elements[element] !== undefined && (
                      <div key={element} className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{element}:</span> {String(elements[element])} ppm
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            
            {micronutrients.some(el => elements[el] !== undefined) && (
              <div>
                <h5 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Micronutrientes</h5>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {micronutrients.map(element => 
                    elements[element] !== undefined && (
                      <div key={element} className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{element}:</span> {String(elements[element])} ppm
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
      return <p className="text-gray-500 dark:text-gray-400">Nenhuma concentração definida</p>;
    } catch {
      return <p className="text-gray-500 dark:text-gray-400">Erro ao carregar concentrações</p>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando receitas...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <TestTube className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('recipes.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('recipes.subtitle')}
            </p>
          </div>
        </div>
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
              <TestTube className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma receita criada</p>
              <p>Vá para a calculadora para criar e salvar suas receitas de nutrientes!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search Field */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar receitas por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {filteredRecipes.length} receita(s) encontrada(s)
              </p>
            )}
          </div>

          {/* No search results */}
          {filteredRecipes.length === 0 && searchTerm && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Nenhuma receita encontrada</p>
                  <p>Tente buscar com outros termos ou limpe o campo de busca.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recipes Grid */}
          {filteredRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {recipe.description || 'Sem descrição'}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Receita</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza de que deseja excluir esta receita? Esta ação é permanente e os dados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteRecipe(recipe.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Beaker className="h-4 w-4" />
                        <span>{recipe.solution_volume} {recipe.volume_unit}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Composição da Receita: {recipe.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
                                  Substâncias e Quantidades:
                                </h4>
                                {renderSubstances(recipe.substances)}
                              </div>
                              <div>
                                <Collapsible 
                                  open={showTargetConcentrations[recipe.id] || false}
                                  onOpenChange={() => toggleTargetConcentrations(recipe.id)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      className="flex items-center gap-2 p-0 h-auto font-medium text-gray-900 dark:text-gray-100"
                                    >
                                      {showTargetConcentrations[recipe.id] ? 
                                        <ChevronDown className="h-4 w-4" /> : 
                                        <ChevronRight className="h-4 w-4" />
                                      }
                                      {showTargetConcentrations[recipe.id] ? 
                                        'Ocultar Concentrações Alvo' : 
                                        'Mostrar Concentrações Alvo'
                                      }
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-3">
                                    {renderElements(recipe.elements)}
                                  </CollapsibleContent>
                                </Collapsible>
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
        </>
      )}
    </div>
  );
}
