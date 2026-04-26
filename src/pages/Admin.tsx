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
import { ArrowLeft, Trash2, Download, Crown, ShieldOff, Key, Users, DollarSign, FileText, Zap, MessageSquare, Mail, Eye, Reply, Send, Power } from 'lucide-react';
import jsPDF from 'jspdf';

interface CodeData {
  id: string; code: string; max_uses: number; current_uses: number; expires_at: string; created_at: string; note: string | null;
}
interface UserData {
  id: string; email: string; created_at: string; last_sign_in_at: string | null; isPremium: boolean; premiumUntil: string | null; role: string;
}
interface PriceData {
  id: string; price: number; duration_days: number; currency: string;
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
  const [codes, setCodes] = useState<CodeData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [billingEnabled, setBillingEnabled] = useState(true);
  const [billingSaving, setBillingSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [codeCount, setCodeCount] = useState(10);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresPeriod, setExpiresPeriod] = useState('365');
  const [lastGenerated, setLastGenerated] = useState<CodeData[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'code' | 'user' | 'message'; id: string; label: string } | null>(null);
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
      setCodes(adminData.codes || []);
      setUsers(adminData.users || []);
      setPrices(adminData.prices || []);
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

  const handleGenerateCodes = async () => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresPeriod));
      const data = await adminCall('generate-codes', { count: codeCount, maxUses, expiresAt: expiresAt.toISOString() });
      const generated = data.codes || [];
      setLastGenerated(generated);
      setCodes(prev => [...generated, ...prev]);
      toast.success(`${generated.length} kodova generirano`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleDownloadPDF = () => {
    const codesToExport = lastGenerated.length > 0 ? lastGenerated : codes;
    if (!codesToExport.length) { toast.error('Nema kodova za preuzimanje'); return; }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Premium aktivacijski kodovi', 14, 20);
    doc.setFontSize(9);
    doc.text(`Generirano: ${new Date().toLocaleDateString('hr')}`, 14, 28);
    
    doc.setFontSize(10);
    let y = 40;
    codesToExport.forEach((c, i) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. ${c.code}   (max: ${c.max_uses}, ističe: ${new Date(c.expires_at).toLocaleDateString('hr')})`, 14, y);
      y += 7;
    });

    doc.save('aktivacijski-kodovi.pdf');
  };

  const handleDeleteCode = async (codeId: string) => {
    setCodes(prev => prev.filter(c => c.id !== codeId));
    setDeleteDialog(null);
    try { await adminCall('delete-code', { codeId }); toast.success('Kod obrisan'); } catch (e: any) { toast.error(e.message); loadAll(); }
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
    if (deleteDialog.type === 'code') handleDeleteCode(deleteDialog.id);
    else if (deleteDialog.type === 'user') handleDeleteUser(deleteDialog.id);
    else handleDeleteMessage(deleteDialog.id);
  };

  const handleDeactivatePremium = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremium: false, premiumUntil: null } : u));
    try { await adminCall('deactivate-premium', { userId }); toast.success('Premium deaktiviran'); } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleUpdatePrices = async () => {
    try { await adminCall('update-prices', { prices }); toast.success('Cijene ažurirane'); } catch (e: any) { toast.error(e.message); }
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

  const getDurationLabel = (days: number) => {
    if (days <= 31) return '1 mjesec';
    if (days <= 93) return '3 mjeseca';
    return '12 mjeseci';
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

        <Tabs defaultValue="codes">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="codes" className="gap-1 text-xs"><Key className="w-3 h-3" />Kodovi</TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs"><Users className="w-3 h-3" />Korisnici</TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 text-xs relative">
              <MessageSquare className="w-3 h-3" />Poruke
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="prices" className="gap-1 text-xs"><DollarSign className="w-3 h-3" />Cijene</TabsTrigger>
          </TabsList>

          {/* KODOVI TAB */}
          <TabsContent value="codes" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Generiraj kodove</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Broj kodova</label>
                    <Input type="number" min={1} max={100} value={codeCount} onChange={(e) => setCodeCount(parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Maks. korištenja</label>
                    <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Trajanje</label>
                    <Select value={expiresPeriod} onValueChange={setExpiresPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">1 mjesec</SelectItem>
                        <SelectItem value="90">3 mjeseca</SelectItem>
                        <SelectItem value="365">12 mjeseci</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGenerateCodes} disabled={loading} className="flex-1 gap-2">
                    <Zap className="w-4 h-4" />{loading ? 'Generiranje...' : 'Generiraj'}
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                    <FileText className="w-4 h-4" />PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Kodovi ({codes.length})</h3>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Korištenja</TableHead>
                    <TableHead>Ističe</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {showSkeleton ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  )) : (
                    <>
                      {codes.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-xs">{c.code}</TableCell>
                          <TableCell>{c.current_uses}/{c.max_uses}</TableCell>
                          <TableCell className="text-xs">{new Date(c.expires_at).toLocaleDateString('hr')}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ type: 'code', id: c.id, label: c.code })}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                      {!codes.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nema kodova</TableCell></TableRow>}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

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

          {/* CIJENE TAB */}
          <TabsContent value="prices" className="space-y-4 mt-4">
            <Card>
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

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Cijena premium licenci</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {prices.map((p, i) => (
                  <Card key={p.id} className="border">
                    <CardContent className="p-4">
                      <label className="text-sm font-medium text-foreground block mb-2">{getDurationLabel(p.duration_days)}</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={p.price}
                          onChange={(e) => {
                            const updated = [...prices];
                            updated[i] = { ...p, price: parseFloat(e.target.value) || 0 };
                            setPrices(updated);
                          }}
                        />
                        <span className="text-sm text-muted-foreground font-medium">{p.currency}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {prices.length > 0 && <Button onClick={handleUpdatePrices} className="w-full">Spremi</Button>}
                {!prices.length && <p className="text-center text-muted-foreground text-sm">Nema cijena</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrda brisanja</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog?.type === 'code'
                ? `Jeste li sigurni da želite obrisati kod "${deleteDialog?.label}"?`
                : deleteDialog?.type === 'message'
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
