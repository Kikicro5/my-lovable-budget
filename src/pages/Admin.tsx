import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2, Plus, Download, Copy, Key, Users, Calendar, Hash, Shield, ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

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

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [maxUses, setMaxUses] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [count, setCount] = useState('1');

  const fetchCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-codes', {
        method: 'GET',
      });
      if (error) throw error;
      setCodes(data?.codes || []);
    } catch (err) {
      console.error('Failed to fetch codes:', err);
      toast.error('Failed to load codes');
    } finally {
      setIsLoadingCodes(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchCodes();
  }, [isAdmin, fetchCodes]);

  // Set default expiration to 1 year from now
  useEffect(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiresAt(d.toISOString().split('T')[0]);
  }, []);

  if (loading) {
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
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges.</p>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-codes', {
        method: 'POST',
        body: { maxUses, expiresAt, note: note.trim() || null, count },
      });
      if (error) throw error;
      toast.success(`Created ${data?.codes?.length || 1} code(s)`);
      fetchCodes();
      setNote('');
      setCount('1');
    } catch (err) {
      toast.error('Failed to create codes');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const exportCSV = () => {
    const rows = [['Code', 'Max Uses', 'Current Uses', 'Expires', 'Note', 'Created']];
    codes.forEach(c => {
      rows.push([
        c.code,
        String(c.max_uses),
        String(c.current_uses),
        new Date(c.expires_at).toLocaleDateString(),
        c.note || '',
        new Date(c.created_at).toLocaleDateString(),
      ]);
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

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Create Codes */}
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            Generate Activation Codes
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="maxUses" className="text-xs">Max Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  max="10000"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="count" className="text-xs">Number of Codes</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={e => setCount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="expiresAt" className="text-xs">Expires At</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="note" className="text-xs">Note (optional)</Label>
              <Input
                id="note"
                placeholder="e.g. Client XYZ batch"
                value={note}
                onChange={e => setNote(e.target.value)}
                maxLength={200}
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isCreating}>
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate
            </Button>
          </form>
        </div>

        {/* Codes List */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              Codes ({codes.length})
            </h2>
            <Button variant="outline" size="sm" className="gap-1" onClick={exportCSV} disabled={codes.length === 0}>
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
          </div>

          {isLoadingCodes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No codes yet. Generate some above.</p>
          ) : (
            <div className="space-y-3">
              {codes.map(code => (
                <div key={code.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded font-semibold">
                        {code.code}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(code.code)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex gap-1.5">
                      {isExpired(code.expires_at) ? (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      ) : code.current_uses >= code.max_uses ? (
                        <Badge variant="secondary" className="text-xs">Full</Badge>
                      ) : (
                        <Badge className="text-xs bg-primary/10 text-primary border-0">Active</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {code.current_uses}/{code.max_uses}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(code.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                  {code.note && (
                    <p className="text-xs text-muted-foreground italic">{code.note}</p>
                  )}
                  {code.activations.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">Activations:</p>
                        {code.activations.map(a => (
                          <div key={a.id} className="text-xs text-muted-foreground flex justify-between bg-muted/50 rounded px-2 py-1">
                            <span>{a.email}</span>
                            <span>{new Date(a.created_at).toLocaleDateString()}</span>
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
      </div>
    </div>
  );
};

export default Admin;
