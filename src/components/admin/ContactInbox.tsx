import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Mail, MailOpen, Reply, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  admin_reply: string | null;
  is_read: boolean;
  created_at: string;
  replied_at: string | null;
}

interface ContactInboxProps {
  messages: ContactMessage[];
  loading: boolean;
  onRefresh: () => void;
}

const ContactInbox = ({ messages, loading, onRefresh }: ContactInboxProps) => {
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const handleOpen = async (msg: ContactMessage) => {
    setSelected(msg);
    setReply(msg.admin_reply || '');
    if (!msg.is_read) {
      await supabase.from('contact_messages').update({ is_read: true }).eq('id', msg.id);
      onRefresh();
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_reply: reply.trim(), replied_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (error) throw error;
      toast.success('Odgovor spremljen');
      setSelected(null);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      toast.success('Poruka obrisana');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">
          Poruke ({messages.length})
          {unread > 0 && <Badge className="ml-2 bg-destructive text-destructive-foreground">{unread} novo</Badge>}
        </h3>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Ime</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              </TableRow>
            )) : (
              <>
                {messages.map(m => (
                  <TableRow key={m.id} className={!m.is_read ? 'bg-primary/5' : ''}>
                    <TableCell>
                      {m.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-primary" />}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{m.name}</TableCell>
                    <TableCell className="text-xs">{m.email}</TableCell>
                    <TableCell className="text-xs">{new Date(m.created_at).toLocaleDateString('hr')}</TableCell>
                    <TableCell>
                      {m.admin_reply ? (
                        <Badge variant="outline" className="text-xs gap-1"><Reply className="w-3 h-3" />Odgovoreno</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Čeka</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpen(m)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!messages.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nema poruka</TableCell></TableRow>}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Poruka od {selected?.name}</DialogTitle>
            <DialogDescription>{selected?.email} · {selected ? new Date(selected.created_at).toLocaleString('hr') : ''}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm whitespace-pre-wrap">{selected?.message}</p>
            </div>
            <Textarea
              placeholder="Napiši odgovor..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
            />
            <Button onClick={handleReply} disabled={sending || !reply.trim()} className="w-full gap-2">
              <Reply className="w-4 h-4" />
              {sending ? '...' : 'Spremi odgovor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactInbox;
