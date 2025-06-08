
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown } from 'lucide-react';

interface SubscriptionModalProps {
  children: React.ReactNode;
}

export function SubscriptionModal({ children }: SubscriptionModalProps) {
  const plans = [
    {
      name: 'Plano Mensal',
      price: 'R$ 9,90',
      period: '/mês',
      usdPrice: '~$2.00 USD',
      eurPrice: '~€1.80 EUR',
      features: [
        'Plantas ilimitadas',
        'Receitas salvas ilimitadas',
        'Calculadora avançada',
        'Suporte prioritário',
        'Relatórios detalhados'
      ]
    },
    {
      name: 'Plano Anual',
      price: 'R$ 80,00',
      period: '/ano',
      usdPrice: '~$16.00 USD',
      eurPrice: '~€14.50 EUR',
      savings: 'Economize R$ 38,80',
      features: [
        'Plantas ilimitadas',
        'Receitas salvas ilimitadas',
        'Calculadora avançada',
        'Suporte prioritário',
        'Relatórios detalhados',
        '2+ meses grátis'
      ]
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Escolha seu Plano Premium</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${index === 1 ? 'ring-2 ring-green-500' : ''}`}>
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Mais Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-green-600">
                    {plan.price}
                    <span className="text-lg font-normal text-gray-500">{plan.period}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.usdPrice} • {plan.eurPrice}
                  </div>
                  {plan.savings && (
                    <div className="text-sm font-medium text-green-600">{plan.savings}</div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full" disabled>
                  Em breve - Integração Stripe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-2">Recursos do Plano Premium:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• <strong>Plantas ilimitadas:</strong> Acompanhe quantas plantas quiser</li>
            <li>• <strong>Receitas salvas ilimitadas:</strong> Salve todas as suas formulações favoritas</li>
            <li>• <strong>Calculadora avançada:</strong> Acesso a recursos exclusivos de cálculo</li>
            <li>• <strong>Suporte prioritário:</strong> Atendimento rápido e personalizado</li>
            <li>• <strong>Relatórios detalhados:</strong> Análises completas do seu cultivo</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
