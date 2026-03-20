import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

export const ContactDialog = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t('contact.fillAll') || 'Molimo ispunite sva polja.');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      if (error) throw error;
      toast.success(t('contact.sent') || 'Poruka uspješno poslana!');
      setName('');
      setEmail('');
      setMessage('');
      setOpen(false);
    } catch (err) {
      console.error('Contact error:', err);
      toast.error(t('contact.error') || 'Greška pri slanju poruke.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          {t('contact.button') || 'Kontakt'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('contact.title') || 'Kontaktirajte nas'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t('contact.name') || 'Ime'}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('contact.namePlaceholder') || 'Vaše ime'}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t('contact.email') || 'Email'}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('contact.emailPlaceholder') || 'vas@email.com'}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {t('contact.message') || 'Poruka'}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('contact.messagePlaceholder') || 'Opišite vaš upit...'}
              rows={4}
            />
          </div>
          <Button onClick={handleSubmit} disabled={sending} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {sending
              ? (t('contact.sending') || 'Slanje...')
              : (t('contact.send') || 'Pošalji')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
