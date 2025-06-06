
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && (!isOver18 || !acceptedTerms)) {
      toast({
        title: "Erro",
        description: "Você deve confirmar que é maior de 18 anos e aceitar os termos e avisos legais.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        if (!isLogin) {
          toast({
            title: "Conta criada!",
            description: "Verifique seu email para confirmar a conta."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Algo deu errado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsOver18(false);
    setAcceptedTerms(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
            Bora Grow
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sua plataforma de cultivo hidropônico
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Terms and Age confirmation for signup */}
              {!isLogin && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="age-confirm" 
                      checked={isOver18}
                      onCheckedChange={(checked) => setIsOver18(checked as boolean)}
                    />
                    <Label 
                      htmlFor="age-confirm" 
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Confirmo que sou maior de 18 anos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms-accept" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label 
                      htmlFor="terms-accept" 
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      Aceito os termos de uso e avisos legais
                    </Label>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white" 
                disabled={loading}
              >
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
