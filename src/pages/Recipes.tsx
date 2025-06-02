
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Recipes() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('recipes.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('recipes.subtitle')}
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('recipes.createNew')}
        </Button>
      </div>

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
    </div>
  );
}
