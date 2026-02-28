import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Download, Crown, ShieldOff, Key, Users, DollarSign } from 'lucide-react';

interface CodeData {
  id: string; code: string; max_uses: number; current_uses: number; expires_at: string; created_at: string; note: string | null;
}
interface UserData {
  id: string; email: string; created_at: string; isPremium: boolean; premiumUntil: string | null; role: string;
}
interface PriceData {
  id: string; price: number; duration_days: number; currency: string;
}

const Admin = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [codes, setCodes] = useState<CodeData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresIn, setExpiresIn] = useState(365);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  const adminCall = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('admin-codes', {
      body: { action, ...params },
    });
    if (error) throw error;
    return data;
  };

  const loadCodes = async () => {
    try { const data = await adminCall('list-codes'); setCodes(data.codes || []); } catch (e: any) { toast.error(e.message); }
  };

  const loadUsers = async () => {
    try { const data = await adminCall('list-users'); setUsers(data.users || []); } catch (e: any) { toast.error(e.message); }
  };

  const loadPrices = async () => {
    try { const data = await adminCall('get-prices'); setPrices(data.prices || []); } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateCode = async () => {
    if (!newCode.trim()) return;
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
      await adminCall('create-code', { code: newCode.trim(), maxUses, expiresAt: expiresAt.toISOString(), note: note || null });
      toast.success('Kod kreiran');
      setNewCode(''); setNote(''); setMaxUses(1);
      loadCodes();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const handleDeleteCode = async (codeId: string) => {
    try { await adminCall('delete-code', { codeId }); toast.success('Kod obrisan'); loadCodes(); } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Obrisati korisnika?')) return;
    try { await adminCall('delete-user', { userId }); toast.success('Korisnik obrisan'); loadUsers(); } catch (e: any) { toast.error(e.message); }
  };

  const handleDeactivatePremium = async (userId: string) => {
    try { await adminCall('deactivate-premium', { userId }); toast.success('Premium deaktiviran'); loadUsers(); } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdatePrices = async () => {
    try { await adminCall('update-prices', { prices }); toast.success('Cijene ažurirane'); } catch (e: any) { toast.error(e.message); }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  };

  const getDurationLabel = (days: number) => {
    if (days <= 31) return '1 mjesec';
    if (days <= 93) return '3 mjeseca';
    return '12 mjeseci';
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Učitavanje...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>

        <Tabs defaultValue="codes" onValueChange={(v) => { if (v === 'codes') loadCodes(); else if (v === 'users') loadUsers(); else if (v === 'prices') loadPrices(); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="codes" className="gap-1 text-xs"><Key className="w-3 h-3" />Kodovi</TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs"><Users className="w-3 h-3" />Korisnici</TabsTrigger>
            <TabsTrigger value="prices" className="gap-1 text-xs"><DollarSign className="w-3 h-3" />Cijene</TabsTrigger>
          </TabsList>

          <TabsContent value="codes" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Novi kod</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Kod (npr. PREMIUM2024)" value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Maks. korištenja</label>
                    <Input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Ističe za (dana)</label>
                    <Input type="number" min={1} value={expiresIn} onChange={(e) => setExpiresIn(parseInt(e.target.value) || 365)} />
                  </div>
                </div>
                <Input placeholder="Napomena (opcionalno)" value={note} onChange={(e) => setNote(e.target.value)} />
                <Button onClick={handleCreateCode} disabled={loading} className="w-full gap-2">
                  <Plus className="w-4 h-4" />{loading ? '...' : 'Kreiraj kod'}
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Kodovi ({codes.length})</h3>
              <Button variant="outline" size="sm" onClick={() => exportCSV(codes, 'kodovi.csv')} className="gap-1">
                <Download className="w-3 h-3" />CSV
              </Button>
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
                  {codes.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.code}<br/><span className="text-muted-foreground">{c.note || ''}</span></TableCell>
                      <TableCell>{c.current_uses}/{c.max_uses}</TableCell>
                      <TableCell className="text-xs">{new Date(c.expires_at).toLocaleDateString('hr')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteCode(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {!codes.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Učitaj kodove klikom na tab</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm">Korisnici ({users.length})</h3>
              <Button variant="outline" size="sm" onClick={() => exportCSV(users, 'korisnici.csv')} className="gap-1">
                <Download className="w-3 h-3" />CSV
              </Button>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="text-xs">{u.email}<br/><span className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString('hr')}</span></TableCell>
                      <TableCell>
                        {u.isPremium ? <Badge className="bg-primary/20 text-primary gap-1"><Crown className="w-3 h-3" />Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                        {u.role === 'admin' && <Badge variant="outline" className="ml-1">Admin</Badge>}
                      </TableCell>
                      <TableCell className="space-x-1">
                        {u.isPremium && <Button variant="ghost" size="icon" onClick={() => handleDeactivatePremium(u.id)} title="Deaktiviraj premium"><ShieldOff className="w-4 h-4" /></Button>}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} title="Obriši"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Učitaj korisnike klikom na tab</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="prices" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Premium cijene</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {prices.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">{getDurationLabel(p.duration_days)}</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={p.price}
                      onChange={(e) => {
                        const updated = [...prices];
                        updated[i] = { ...p, price: parseFloat(e.target.value) || 0 };
                        setPrices(updated);
                      }}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">{p.currency}</span>
                  </div>
                ))}
                {prices.length > 0 && <Button onClick={handleUpdatePrices} className="w-full">Spremi cijene</Button>}
                {!prices.length && <p className="text-center text-muted-foreground text-sm">Učitaj cijene klikom na tab</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
