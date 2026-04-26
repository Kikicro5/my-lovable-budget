import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Crown, ShieldOff, Users, MessageSquare, Eye, Reply, Send, Power } from 'lucide-react';

interface CodeData {
  id: string; code: string; max_uses: number; current_uses: number; expires_at: string; created_at: string; note: string | null;
}
interface UserData {
  id: string; email: string; created_at: string; last_sign_in_at: string | null; isPremium: boolean; premiumUntil: string | null; role: string;
}
interface ContactMessage {
  id: string; name: string; email: string; message: string; is_read: boolean; created_at: string; admin_reply: string | null; replied_at: string | null;
}
interface AppSetting {
  key: string; value: any;
}

const Admin = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [billingSaving, setBillingSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'user' | 'message'; id: string; label: string } | null>(null);
  const [replyDialog, setReplyDialog] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
    if (!authLoading && isAdmin) loadAll();
  }, [isAdmin, authLoading, navigate]);

  const adminCall = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('admin-codes', {
      body: { action, ...params },
    });
    if (error) throw new Error(error.message || 'Edge function error');
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const loadAll = async () => {
    try {
      const [adminData, messagesResult] = await Promise.all([
        adminCall('load-all'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      ]);
      setUsers(adminData.users || []);
      const settings: AppSetting[] = adminData.settings || [];
      const billing = settings.find(s => s.key === 'premium_billing_enabled');
      setBillingEnabled(billing ? billing.value !== false : true);
      setMessages((messagesResult.data as ContactMessage[]) || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDeleteDialog(null);
    try { await adminCall('delete-user', { userId }); toast.success('Korisnik obrisan'); } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setDeleteDialog(null);
    try {
      await supabase.from('contact_messages').delete().eq('id', messageId);
      toast.success('Poruka obrisana');
    } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleMarkRead = async (msg: ContactMessage) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
  };

  const handleReply = async () => {
    if (!replyDialog || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await supabase.from('contact_messages').update({
        admin_reply: replyText.trim(),
        replied_at: new Date().toISOString(),
        is_read: true,
      }).eq('id', replyDialog.id);
      setMessages(prev => prev.map(m => m.id === replyDialog.id ? { ...m, admin_reply: replyText.trim(), replied_at: new Date().toISOString(), is_read: true } : m));
      toast.success('Odgovor spremljen');
      setReplyDialog(null);
      setReplyText('');
    } catch (e: any) { toast.error(e.message); } finally { setSendingReply(false); }
  };

  const confirmDelete = () => {
    if (!deleteDialog) return;
    if (deleteDialog.type === 'user') handleDeleteUser(deleteDialog.id);
    else handleDeleteMessage(deleteDialog.id);
  };

  const handleDeactivatePremium = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremium: false, premiumUntil: null } : u));
    try { await adminCall('deactivate-premium', { userId }); toast.success('Premium deaktiviran'); } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleToggleBilling = async (enabled: boolean) => {
    const prev = billingEnabled;
    setBillingEnabled(enabled);
    setBillingSaving(true);
    try {
      await adminCall('set-setting', { key: 'premium_billing_enabled', value: enabled });
      toast.success(enabled ? 'Naplata premium licenci uključena' : 'Naplata isključena — svi korisnici imaju premium besplatno');
    } catch (e: any) {
      setBillingEnabled(prev);
      toast.error(e.message);
    } finally {
      setBillingSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Učitavanje...</p></div>;
  if (!isAdmin) return null;

  const showSkeleton = initialLoading;
  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Power className="w-4 h-4" />
              Naplata premium licenci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {billingEnabled ? 'Naplata uključena' : 'Naplata isključena'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {billingEnabled
                    ? 'Korisnici moraju aktivirati premium kodom ili kupnjom.'
                    : 'Svi korisnici automatski imaju premium pristup besplatno.'}
                </p>
              </div>
              <Switch
                checked={billingEnabled}
                disabled={billingSaving || showSkeleton}
                onCheckedChange={handleToggleBilling}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="gap-1 text-xs"><Users className="w-3 h-3" />Korisnici</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 text-xs relative">
              <MessageSquare className="w-3 h-3" />Poruke
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* KORISNICI TAB */}
          <TabsContent value="users" className="space-y-4 mt-4">
            <h3 className="font-semibold text-sm">Korisnici ({users.length})</h3>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Registriran</TableHead>
                    <TableHead>Zadnja prijava</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          {u.email}
                          {u.isPremium && <Badge className="bg-primary/20 text-primary gap-1 ml-1"><Crown className="w-3 h-3" />Premium</Badge>}
                          {u.role === 'admin' && <Badge variant="outline" className="ml-1">Admin</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString('hr')}</TableCell>
                      <TableCell className="text-xs">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('hr') : '—'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {u.isPremium && <Button variant="ghost" size="icon" onClick={() => handleDeactivatePremium(u.id)} title="Deaktiviraj premium"><ShieldOff className="w-4 h-4" /></Button>}
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'user', id: u.id, label: u.email })} title="Obriši račun"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nema korisnika</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* PORUKE TAB */}
          <TabsContent value="messages" className="space-y-4 mt-4">
            <h3 className="font-semibold text-sm">Poruke ({messages.length})</h3>
            {showSkeleton ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Nema poruka</p>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <Card key={msg.id} className={`border ${!msg.is_read ? 'border-primary/40 bg-primary/5' : ''}`}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{msg.name}</span>
                            <span className="text-xs text-muted-foreground">{msg.email}</span>
                            {!msg.is_read && <Badge variant="default" className="text-[10px] px-1.5 py-0">Nova</Badge>}
                            {msg.admin_reply && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-300">Odgovoreno</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(msg.created_at).toLocaleString('hr')}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {!msg.is_read && (
                            <Button variant="ghost" size="icon" onClick={() => handleMarkRead(msg)} title="Označi kao pročitano">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => { setReplyDialog(msg); setReplyText(msg.admin_reply || ''); }} title="Odgovori">
                            <Reply className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'message', id: msg.id, label: msg.name })} title="Obriši">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                      {msg.admin_reply && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Vaš odgovor:</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{msg.admin_reply}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === 'message'
                ? `Jeste li sigurni da želite obrisati poruku od "${deleteDialog?.label}"?`
                : `Jeste li sigurni da želite obrisati korisnika "${deleteDialog?.label}"? Ova radnja je nepovratna.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reply Dialog */}
      <AlertDialog open={!!replyDialog} onOpenChange={(open) => { if (!open) { setReplyDialog(null); setReplyText(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Reply className="w-5 h-5" />
              Odgovori na poruku
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p className="text-sm"><strong>{replyDialog?.name}</strong> ({replyDialog?.email})</p>
                <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{replyDialog?.message}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Vaš odgovor..."
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleReply} disabled={sendingReply || !replyText.trim()} className="gap-2">
              <Send className="w-4 h-4" />
              {sendingReply ? 'Slanje...' : 'Pošalji odgovor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
