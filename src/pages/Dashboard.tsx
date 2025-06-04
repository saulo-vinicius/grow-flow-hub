
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Plus, Leaf, Flask } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plantsCount, setPlantsCount] = useState(0);
  const [recipesCount, setRecipesCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCounts();
    }
  }, [user]);

  const fetchCounts = async () => {
    if (!user) return;

    try {
      // Contar plantas
      const { count: plantsCount } = await supabase
        .from('plants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Contar receitas
      const { count: recipesCount } = await supabase
        .from('nutrient_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setPlantsCount(plantsCount || 0);
      setRecipesCount(recipesCount || 0);
    } catch (error) {
      console.error('Erro ao buscar contadores:', error);
    }
  };

  const quickActions = [
    {
      title: t('calculator.title'),
      description: t('calculator.subtitle'),
      icon: Calculator,
      href: '/calculator',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: t('recipes.createNew'),
      description: 'Criar uma nova receita de nutrientes',
      icon: Plus,
      href: '/recipes',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: t('plants.addPlant'),
      description: 'Adicionar uma nova planta',
      icon: Plus,
      href: '/plants',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const stats = [
    {
      title: t('dashboard.totalPlants'),
      value: plantsCount.toString(),
      icon: Leaf,
      color: 'text-green-600',
    },
    {
      title: t('dashboard.totalRecipes'),
      value: recipesCount.toString(),
      icon: Flask,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('common.welcome')} ao {t('app.name')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 ${action.color} text-white rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Nenhuma atividade recente</p>
            <p className="text-sm mt-2">Comece criando uma receita ou adicionando uma planta!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
