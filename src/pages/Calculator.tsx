
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Calculator() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('calculator.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('calculator.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Nutrientes</CardTitle>
          <CardDescription>
            A calculadora completa será implementada na próxima fase, mantendo todas as funcionalidades existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calculator className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Calculadora em Desenvolvimento</p>
            <p>A calculadora de nutrientes será migrada do repositório original mantendo todas as funcionalidades.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
