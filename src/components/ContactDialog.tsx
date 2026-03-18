import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const ContactDialog = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t('contact.fillAll'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error(t('contact.invalidEmail'));
      return;
    }

    if (message.trim().length > 1000) {
      toast.error(t('contact.messageTooLong'));
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({ name: name.trim(), email: email.trim(), message: message.trim() });

      if (error) throw error;

      toast.success(t('contact.sent'));
      setName('');
      setEmail('');
      setMessage('');
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || t('contact.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="w-4 h-4" />
          {t('contact.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('contact.title')}</DialogTitle>
          <DialogDescription>{t('contact.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder={t('contact.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
          <Input
            type="email"
            placeholder={t('contact.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
          />
          <Textarea
            placeholder={t('contact.message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={4}
          />
          <Button onClick={handleSubmit} disabled={sending} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {sending ? '...' : t('contact.send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
