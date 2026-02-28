import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Download, Crown, ShieldOff, Key, Users, DollarSign, FileText, Zap } from 'lucide-react';
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

const Admin = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [codes, setCodes] = useState<CodeData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [codeCount, setCodeCount] = useState(10);
  const [maxUses, setMaxUses] = useState(1);
  const [expiresPeriod, setExpiresPeriod] = useState('365');
  const [lastGenerated, setLastGenerated] = useState<CodeData[]>([]);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
    if (!authLoading && isAdmin) loadAll();
  }, [isAdmin, authLoading, navigate]);

  const adminCall = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('admin-codes', {
      body: { action, ...params },
    });
    if (error) throw error;
    return data;
  };

  const loadAll = async () => {
    try {
      const data = await adminCall('load-all');
      setCodes(data.codes || []);
      setUsers(data.users || []);
      setPrices(data.prices || []);
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
      toast.success(`${generated.length} kodova generirano`);
      loadAll();
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
    try { await adminCall('delete-code', { codeId }); toast.success('Kod obrisan'); } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Obrisati korisnika?')) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
    try { await adminCall('delete-user', { userId }); toast.success('Korisnik obrisan'); } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleDeactivatePremium = async (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isPremium: false, premiumUntil: null } : u));
    try { await adminCall('deactivate-premium', { userId }); toast.success('Premium deaktiviran'); } catch (e: any) { toast.error(e.message); loadAll(); }
  };

  const handleUpdatePrices = async () => {
    try { await adminCall('update-prices', { prices }); toast.success('Cijene ažurirane'); } catch (e: any) { toast.error(e.message); }
  };

  const getDurationLabel = (days: number) => {
    if (days <= 31) return '1 mjesec';
    if (days <= 93) return '3 mjeseca';
    return '12 mjeseci';
  };

  if (authLoading || initialLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Učitavanje...</p></div>;
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

        <Tabs defaultValue="codes">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="codes" className="gap-1 text-xs"><Key className="w-3 h-3" />Kodovi</TabsTrigger>
            <TabsTrigger value="users" className="gap-1 text-xs"><Users className="w-3 h-3" />Korisnici</TabsTrigger>
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
                  {codes.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.code}</TableCell>
                      <TableCell>{c.current_uses}/{c.max_uses}</TableCell>
                      <TableCell className="text-xs">{new Date(c.expires_at).toLocaleDateString('hr')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteCode(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {!codes.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nema kodova</TableCell></TableRow>}
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
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} title="Obriši račun"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nema korisnika</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* CIJENE TAB */}
          <TabsContent value="prices" className="space-y-4 mt-4">
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
    </div>
  );
};

export default Admin;
