import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Loader2, Shield, ArrowLeft, Key, Users, DollarSign, Plus, Copy, Download,
  Hash, Calendar, Crown, Trash2, Ban, Search, Save,
} from 'lucide-react';
import { format } from 'date-fns';

// ── Types ──

interface Activation {
  id: string;
  email: string;
  device_id: string;
  valid_until: string;
  created_at: string;
}

interface ActivationCode {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  created_at: string;
  note: string | null;
  activations: Activation[];
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: string;
  activations: Array<{ id: string; valid_until: string; device_id: string }>;
}

interface PriceTier {
  id: string;
  price: number;
  duration_days: number;
  currency: string;
}

// ── Helper ──

const invoke = (body: Record<string, unknown>) =>
  supabase.functions.invoke('admin-codes', { body });

const Admin = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { t } = useLanguage();

  // Codes state
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [maxUses, setMaxUses] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [codeCount, setCodeCount] = useState('1');

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Prices state
  const [prices, setPrices] = useState<PriceTier[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Default expiry
  useEffect(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiresAt(d.toISOString().split('T')[0]);
  }, []);

  // Fetch codes on mount
  const fetchCodes = useCallback(async () => {
    try {
      const { data, error } = await invoke({ action: 'list' });
      if (error) throw error;
      setCodes(data?.codes || []);
    } catch {
      toast.error(t('admin.failedLoad'));
    } finally {
      setLoadingCodes(false);
    }
  }, [t]);

  useEffect(() => {
    if (!authLoading && isAdmin) fetchCodes();
  }, [authLoading, isAdmin, fetchCodes]);

  // Fetch users on demand
  const fetchUsers = useCallback(async () => {
    if (usersLoaded) return;
    setLoadingUsers(true);
    try {
      const { data, error } = await invoke({ action: 'list-users' });
      if (error) throw error;
      setUsers(data?.users || []);
      setUsersLoaded(true);
    } catch {
      toast.error(t('admin.failedLoad'));
    } finally {
      setLoadingUsers(false);
    }
  }, [usersLoaded, t]);

  // Fetch prices on demand
  const fetchPrices = useCallback(async () => {
    if (pricesLoaded) return;
    setLoadingPrices(true);
    try {
      const { data, error } = await invoke({ action: 'get-prices' });
      if (error) throw error;
      setPrices(data?.prices || []);
      setPricesLoaded(true);
    } catch {
      toast.error(t('admin.failedLoad'));
    } finally {
      setLoadingPrices(false);
    }
  }, [pricesLoaded, t]);

  const handleTabChange = (tab: string) => {
    if (tab === 'users') fetchUsers();
    if (tab === 'pricing') fetchPrices();
  };

  // ── Code actions ──

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await invoke({
        action: 'create',
        max_uses: parseInt(maxUses),
        expires_at: new Date(expiresAt).toISOString(),
        count: parseInt(codeCount),
        note: note.trim() || null,
      });
      if (error) throw error;
      toast.success(`${t('admin.created')} ${data?.codes?.length || 1}`);
      fetchCodes();
      setNote('');
      setCodeCount('1');
    } catch {
      toast.error(t('admin.failedCreate'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    try {
      const { error } = await invoke({ action: 'delete', id });
      if (error) throw error;
      setCodes(prev => prev.filter(c => c.id !== id));
      toast.success(t('admin.codeCopied'));
    } catch {
      toast.error(t('admin.failedDelete'));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('admin.codeCopied'));
  };

  const exportCSV = () => {
    const rows = [['Code', t('admin.maxUses'), t('admin.codeCount'), t('admin.expiresAt'), t('admin.note'), 'Created']];
    codes.forEach(c => {
      rows.push([c.code, String(c.max_uses), String(c.current_uses), new Date(c.expires_at).toLocaleDateString(), c.note || '', new Date(c.created_at).toLocaleDateString()]);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activation-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── User actions ──

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await invoke({ action: 'delete-user', user_id: userId });
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(t('admin.userDeleted'));
    } catch {
      toast.error(t('admin.failedDelete'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { error } = await invoke({ action: 'deactivate-user', user_id: userId });
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, activations: [] } : u));
      toast.success(t('admin.premiumDeactivated'));
    } catch {
      toast.error(t('admin.failedDeactivate'));
    } finally {
      setActionLoading(null);
    }
  };

  // ── Price actions ──

  const updatePrice = (id: string, field: 'price' | 'duration_days', value: string) => {
    setPrices(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: field === 'price' ? parseFloat(value) || 0 : parseInt(value) || 0 } : p
    ));
  };

  const handleSavePrices = async () => {
    setIsSaving(true);
    try {
      const { error } = await invoke({ action: 'update-prices', prices });
      if (error) throw error;
      toast.success(t('admin.pricesSaved'));
    } catch {
      toast.error(t('admin.failedSavePrices'));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Guards ──

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">{t('admin.accessDenied')}</h2>
          <p className="text-muted-foreground">{t('admin.noPrivileges')}</p>
          <Button asChild><Link to="/">{t('admin.goHome')}</Link></Button>
        </div>
      </div>
    );
  }

  const isExpired = (date: string) => new Date(date) < new Date();
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const activeActivation = (u: AdminUser) => u.activations.find(a => new Date(a.valid_until) > new Date());

  const TIER_LABELS: Record<string, string> = {
    '1month': t('admin.1month'),
    '3months': t('admin.3months'),
    '12months': t('admin.12months'),
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('admin.title')}
            </h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="codes" onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="codes" className="text-xs gap-1.5">
              <Key className="w-3.5 h-3.5" />{t('admin.tabCodes')}
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />{t('admin.tabUsers')}
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />{t('admin.tabPricing')}
            </TabsTrigger>
          </TabsList>

          {/* ── CODES TAB ── */}
          <TabsContent value="codes" className="space-y-4 mt-4">
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border shadow-sm space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                {t('admin.generateCodes')}
              </h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{t('admin.codeCount')}</Label>
                    <Input type="number" min="1" max="100" value={codeCount} onChange={e => setCodeCount(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('admin.maxUses')}</Label>
                    <Input type="number" min="1" max="10000" value={maxUses} onChange={e => setMaxUses(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('admin.expiresAt')}</Label>
                    <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t('admin.note')}</Label>
                  <Input placeholder={t('admin.notePlaceholder')} value={note} onChange={e => setNote(e.target.value)} maxLength={200} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 gap-2" disabled={isCreating}>
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    {t('admin.generate')}
                  </Button>
                  <Button variant="outline" type="button" onClick={exportCSV} disabled={codes.length === 0}>
                    <Download className="w-4 h-4" /> CSV
                  </Button>
                </div>
              </form>
            </div>

            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border shadow-sm space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                {t('admin.codes')} ({codes.length})
              </h2>

              {loadingCodes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : codes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('admin.noCodes')}</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {codes.map(code => (
                    <div key={code.id} className="bg-muted/50 rounded-lg p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono font-bold text-foreground">{code.code}</code>
                        <div className="flex items-center gap-1">
                          <button onClick={() => copyCode(code.code)} className="p-1 hover:bg-muted rounded">
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1 hover:bg-destructive/10 rounded">
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin.deleteUser')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('admin.confirmDeleteUser')}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCode(code.id)}>{t('admin.confirm')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <div className="ml-1">
                            {isExpired(code.expires_at) ? (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{t('admin.expired')}</Badge>
                            ) : code.current_uses >= code.max_uses ? (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t('admin.full')}</Badge>
                            ) : (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">{t('admin.active')}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{code.current_uses}/{code.max_uses}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(code.expires_at), 'dd.MM.yyyy')}</span>
                      </div>
                      {code.note && <p className="text-[10px] text-muted-foreground italic">{code.note}</p>}
                      {code.activations.length > 0 && (
                        <>
                          <Separator className="my-1" />
                          <div className="space-y-1">
                            {code.activations.map(a => (
                              <div key={a.id} className="text-[10px] text-muted-foreground flex justify-between bg-muted rounded px-2 py-0.5">
                                <span>{a.email}</span>
                                <span>{format(new Date(a.created_at), 'dd.MM.yyyy')}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── USERS TAB ── */}
          <TabsContent value="users" className="mt-4">
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border shadow-sm space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {t('admin.tabUsers')} ({users.length})
              </h2>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.search')}
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">{t('admin.noUsers')}</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredUsers.map(u => {
                    const activation = activeActivation(u);
                    const isPremium = !!activation;
                    const isUserAdmin = u.role === 'admin';

                    return (
                      <div key={u.id} className="bg-muted/50 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground truncate">{u.email}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isUserAdmin && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">
                                <Shield className="w-3 h-3 mr-0.5" />Admin
                              </Badge>
                            )}
                            {isPremium && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500 text-yellow-600">
                                <Crown className="w-3 h-3 mr-0.5" />Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <div className="flex flex-wrap gap-x-3">
                            <span>{t('admin.registered')}: {format(new Date(u.created_at), 'dd.MM.yyyy')}</span>
                            {u.last_sign_in_at && (
                              <span>{t('admin.lastLogin')}: {format(new Date(u.last_sign_in_at), 'dd.MM.yyyy HH:mm')}</span>
                            )}
                          </div>
                          {isPremium && activation && (
                            <div className="text-yellow-600">
                              Premium do: {format(new Date(activation.valid_until), 'dd.MM.yyyy')}
                            </div>
                          )}
                        </div>

                        {!isUserAdmin && (
                          <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                            {isPremium && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" disabled={actionLoading === u.id}>
                                    <Ban className="w-3 h-3 mr-1" />{t('admin.deactivate')}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('admin.deactivate')}</AlertDialogTitle>
                                    <AlertDialogDescription>{u.email}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeactivateUser(u.id)}>{t('admin.confirm')}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-destructive hover:text-destructive" disabled={actionLoading === u.id}>
                                  <Trash2 className="w-3 h-3 mr-1" />{t('admin.deleteUser')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('admin.deleteUser')}</AlertDialogTitle>
                                  <AlertDialogDescription>{u.email}<br />{t('admin.confirmDeleteUser')}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {t('admin.confirm')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── PRICING TAB ── */}
          <TabsContent value="pricing" className="mt-4">
            <div className="bg-card rounded-xl p-3 sm:p-4 border border-border shadow-sm space-y-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                {t('admin.pricing')}
              </h2>

              {loadingPrices ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {prices.map(tier => (
                      <div key={tier.id} className="border border-border rounded-lg p-3 space-y-2">
                        <h3 className="text-xs font-medium text-foreground">
                          {TIER_LABELS[tier.id] || tier.id}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">{t('admin.priceLabel')}</Label>
                            <Input type="number" step="0.01" min="0" value={tier.price} onChange={e => updatePrice(tier.id, 'price', e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">{t('admin.durationDays')}</Label>
                            <Input type="number" min="1" value={tier.duration_days} onChange={e => updatePrice(tier.id, 'duration_days', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSavePrices} className="w-full gap-2" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('admin.savePrices')}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
