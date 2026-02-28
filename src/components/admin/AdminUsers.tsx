import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Search, Trash2, ShieldOff, Crown } from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  isPremium: boolean;
}

const AdminUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', { method: 'GET' });
      if (error) throw error;
      setUsers(data?.users || []);
    } catch {
      toast.error(t('admin.failedLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { action: 'delete-user', userId: deleteTarget.id },
      });
      if (error) throw error;
      toast.success(t('admin.userDeleted'));
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
    } catch {
      toast.error(t('admin.failedDelete'));
    } finally {
      setActionLoading(null);
      setDeleteTarget(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        method: 'POST',
        body: { action: 'deactivate-premium', userId },
      });
      if (error) throw error;
      toast.success(t('admin.premiumDeactivated'));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremium: false } : u));
    } catch {
      toast.error(t('admin.failedDeactivate'));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('admin.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Badge variant="outline" className="whitespace-nowrap">
            {filtered.length} / {users.length}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t('admin.noUsers')}</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(user => (
              <div key={user.id} className="border border-border rounded-lg p-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                    {user.isPremium ? (
                      <Badge className="text-xs bg-primary/10 text-primary border-0 shrink-0">
                        <Crown className="w-3 h-3 mr-1" />
                        {t('admin.premium')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs shrink-0">{t('admin.free')}</Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>{t('admin.registered')}: {new Date(user.created_at).toLocaleDateString()}</span>
                    <span>{t('admin.lastLogin')}: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : t('admin.never')}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {user.isPremium && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-orange-500 hover:text-orange-600"
                      onClick={() => handleDeactivate(user.id)}
                      disabled={actionLoading === user.id}
                      title={t('admin.deactivate')}
                    >
                      {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(user)}
                    disabled={actionLoading === user.id}
                    title={t('admin.deleteUser')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.deleteUser')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.email}<br />
              {t('admin.confirmDeleteUser')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('admin.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
