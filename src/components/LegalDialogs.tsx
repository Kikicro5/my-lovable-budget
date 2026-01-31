import { FileText, Shield } from 'lucide-react';
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

const TermsOfServiceContent = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 text-sm text-foreground">
      <section>
        <h3 className="font-semibold mb-2">{t('legal.terms.section1.title')}</h3>
        <p className="text-muted-foreground">{t('legal.terms.section1.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.terms.section2.title')}</h3>
        <p className="text-muted-foreground">{t('legal.terms.section2.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.terms.section3.title')}</h3>
        <p className="text-muted-foreground">{t('legal.terms.section3.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.terms.section4.title')}</h3>
        <p className="text-muted-foreground">{t('legal.terms.section4.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.terms.section5.title')}</h3>
        <p className="text-muted-foreground">{t('legal.terms.section5.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.terms.section6.title')}</h3>
        <p className="text-muted-foreground">{t('legal.terms.section6.content')}</p>
      </section>
    </div>
  );
};

const PrivacyPolicyContent = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 text-sm text-foreground">
      <section>
        <h3 className="font-semibold mb-2">{t('legal.privacy.section1.title')}</h3>
        <p className="text-muted-foreground">{t('legal.privacy.section1.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.privacy.section2.title')}</h3>
        <p className="text-muted-foreground">{t('legal.privacy.section2.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.privacy.section3.title')}</h3>
        <p className="text-muted-foreground">{t('legal.privacy.section3.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.privacy.section4.title')}</h3>
        <p className="text-muted-foreground">{t('legal.privacy.section4.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.privacy.section5.title')}</h3>
        <p className="text-muted-foreground">{t('legal.privacy.section5.content')}</p>
      </section>
      
      <section>
        <h3 className="font-semibold mb-2">{t('legal.privacy.section6.title')}</h3>
        <p className="text-muted-foreground">{t('legal.privacy.section6.content')}</p>
      </section>
    </div>
  );
};

export const TermsOfServiceDialog = () => {
  const { t } = useLanguage();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <FileText className="w-4 h-4" />
          {t('legal.terms.title')}
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
        <Button variant="outline" className="w-full gap-2">
          <Shield className="w-4 h-4" />
          {t('legal.privacy.title')}
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
