import { Languages } from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';

const openGoogleTranslate = () => {
  const currentUrl = window.location.origin;
  const translateUrl = `https://translate.google.com/translate?sl=hr&tl=en&u=${encodeURIComponent(currentUrl)}`;
  window.location.href = translateUrl;
};

const Options = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-foreground mb-6">Opcije</h1>
        
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Jezik</h2>
            <Button 
              onClick={openGoogleTranslate}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <Languages className="w-5 h-5" />
              Promijeni jezik aplikacije
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Otvara Google Translate za prijevod aplikacije na željeni jezik.
            </p>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Options;
