
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Settings, Shield, MessageSquare, CreditCard, LogOut, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChangePasswordDialog } from '@/components/account/ChangePasswordDialog';
import { DeleteAccountDialog } from '@/components/account/DeleteAccountDialog';
import { SupportDialog } from '@/components/account/SupportDialog';
import { SubscriptionModal } from '@/components/account/SubscriptionModal';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  full_name: string | null;
  created_at: string;
}

interface Subscription {
  subscription_tier: string;
  subscribed: boolean;
  subscription_end: string | null;
}

export function Account() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscribers')
        .select('subscription_tier, subscribed, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      setProfile(profileData);
      setSubscription(subData);
      setNewName(profileData?.full_name || '');
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserName = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: newName.trim() || null })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, full_name: newName.trim() || null } : null);
      setEditingName(false);

      toast({
        title: "Nome atualizado",
        description: "Seu nome foi atualizado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar nome",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  // Use user.created_at for member since date, fallback to profile.created_at
  const memberSince = user?.created_at || profile?.created_at;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Minha Conta
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie suas informações pessoais e configurações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Dados da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              {editingName ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Seu nome"
                  />
                  <Button onClick={updateUserName} size="sm">
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingName(false);
                      setNewName(profile?.full_name || '');
                    }}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg">{profile?.full_name || 'Nome não informado'}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingName(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">E-mail</label>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Membro desde</label>
              <p className="text-lg">
                {memberSince ? new Date(memberSince).toLocaleDateString('pt-BR') : 'Data não disponível'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plano e Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Plano Atual</label>
              <p className="text-lg font-medium">
                {subscription?.subscribed ? subscription.subscription_tier : 'Free'}
              </p>
            </div>
            {subscription?.subscribed && subscription.subscription_end && (
              <div>
                <label className="text-sm font-medium text-gray-500">Renovação</label>
                <p className="text-lg">
                  {new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            <SubscriptionModal>
              <Button variant="outline" className="w-full">
                Gerenciar Assinatura
              </Button>
            </SubscriptionModal>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ChangePasswordDialog />
            <DeleteAccountDialog />
          </CardContent>
        </Card>

        {/* Suporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Suporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SupportDialog />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
