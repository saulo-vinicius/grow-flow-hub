
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Plants() {
  const { t } = useTranslation();

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('plants.addPlant')}
        </Button>
      </div>

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
    </div>
  );
}
