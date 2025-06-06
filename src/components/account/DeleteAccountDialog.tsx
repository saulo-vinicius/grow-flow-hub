
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle } from 'lucide-react';

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmText !== 'delete') {
      toast({
        title: "Erro",
        description: "Digite 'delete' para confirmar",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Delete all user data
      if (user) {
        // Delete user's plants
        await supabase.from('plants').delete().eq('user_id', user.id);
        
        // Delete user's recipes
        await supabase.from('nutrient_recipes').delete().eq('user_id', user.id);
        
        // Delete user's custom substances
        await supabase.from('custom_substances').delete().eq('user_id', user.id);
        
        // Delete user's support messages
        await supabase.from('support_messages').delete().eq('user_id', user.id);
        
        // Delete profile and subscription (will cascade)
        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.from('subscribers').delete().eq('user_id', user.id);
      }

      // Delete the auth user using the admin API
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) throw error;

      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída permanentemente"
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta. Tente novamente ou entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Apagar Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Apagar Conta
          </DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e todos os seus dados.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção:</strong> Você perderá todas as suas plantas, receitas, substâncias personalizadas e mensagens de suporte.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Digite <strong>delete</strong> para confirmar:
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={loading || confirmText !== 'delete'}
              className="flex-1"
            >
              {loading ? 'Excluindo...' : 'Excluir Permanentemente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
