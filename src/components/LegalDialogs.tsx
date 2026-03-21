import { FileText, Shield, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/i18n/LanguageContext';

export const TermsOfServiceContent = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 text-sm text-foreground">
      {[1,2,3,4,5,6].map(i => (
        <section key={i}>
          <h3 className="font-semibold mb-2">{t(`legal.terms.section${i}.title`)}</h3>
          <p className="text-muted-foreground">{t(`legal.terms.section${i}.content`)}</p>
        </section>
      ))}
    </div>
  );
};

export const PrivacyPolicyContent = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 text-sm text-foreground">
      {[1,2,3,4,5,6].map(i => (
        <section key={i}>
          <h3 className="font-semibold mb-2">{t(`legal.privacy.section${i}.title`)}</h3>
          <p className="text-muted-foreground">{t(`legal.privacy.section${i}.content`)}</p>
        </section>
      ))}
    </div>
  );
};

export const GDPRContent = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 text-sm text-foreground">
      {[1,2,3,4,5,6].map(i => (
        <section key={i}>
          <h3 className="font-semibold mb-2">{t(`legal.gdpr.section${i}.title`)}</h3>
          <p className="text-muted-foreground">{t(`legal.gdpr.section${i}.content`)}</p>
        </section>
      ))}
    </div>
  );
};

export const TermsOfServiceDialog = () => {
  const { t } = useLanguage();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 text-xs sm:text-sm">
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">{t('legal.terms.title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('legal.terms.title')}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <TermsOfServiceContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const PrivacyPolicyDialog = () => {
  const { t } = useLanguage();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 text-xs sm:text-sm">
          <Shield className="w-4 h-4 shrink-0" />
          <span className="truncate">{t('legal.privacy.title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('legal.privacy.title')}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <PrivacyPolicyContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const GDPRDialog = () => {
  const { t } = useLanguage();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 text-xs sm:text-sm">
          <Scale className="w-4 h-4 shrink-0" />
          <span className="truncate">GDPR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            {t('legal.gdpr.title') || 'GDPR'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <GDPRContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
