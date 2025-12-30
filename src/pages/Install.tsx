import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Download, Plus, Share, MoreVertical, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Provjeri je li app pokrenuta kao PWA (standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Provjeri platformu
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Slušaj beforeinstallprompt (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Slušaj appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Aplikacija je instalirana!</CardTitle>
            <CardDescription>
              Već koristiš Budget Card kao instaliranu aplikaciju.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Idi na početnu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <img 
            src="/icon-192.png?v=2" 
            alt="Budget Card" 
            className="w-20 h-20 mx-auto rounded-2xl shadow-lg mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Instaliraj Budget Card</h1>
          <p className="text-muted-foreground mt-2">
            Dodaj aplikaciju na početni ekran za brži pristup i offline korištenje.
          </p>
        </div>

        {/* Install button za Android */}
        {deferredPrompt && (
          <Card className="border-primary">
            <CardContent className="pt-6">
              <Button onClick={handleInstallClick} className="w-full" size="lg">
                <Download className="w-5 h-5 mr-2" />
                Instaliraj aplikaciju
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS upute */}
        {isIOS && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🍎</span> iPhone / iPad upute
              </CardTitle>
              <CardDescription>Safari preglednik</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Otvori ovu stranicu u Safari</p>
                  <p className="text-sm text-muted-foreground">Chrome i drugi preglednici ne podržavaju instalaciju na iOS.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Pritisni</p>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-muted rounded">
                    <Share className="w-4 h-4" />
                  </div>
                  <p className="font-medium">(Share gumb)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Odaberi</p>
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                    <Plus className="w-4 h-4" />
                    Add to Home Screen
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">Pritisni "Add" u gornjem desnom kutu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Android upute */}
        {isAndroid && !deferredPrompt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🤖</span> Android upute
              </CardTitle>
              <CardDescription>Chrome preglednik</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Otvori ovu stranicu u Chrome</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Pritisni</p>
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-muted rounded">
                    <MoreVertical className="w-4 h-4" />
                  </div>
                  <p className="font-medium">(3 točkice)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium">Odaberi "Install app" ili "Add to Home screen"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium">Potvrdi instalaciju</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop upute */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💻</span> Desktop upute
              </CardTitle>
              <CardDescription>Chrome / Edge preglednik</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium">Potraži ikonu instalacije u adresnoj traci</p>
                  <p className="text-sm text-muted-foreground">Obično je na desnoj strani, izgleda kao monitor s strelicom.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium">Klikni na tu ikonu i potvrdi instalaciju</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prednosti */}
        <Card>
          <CardHeader>
            <CardTitle>Zašto instalirati?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Brži pristup s početnog ekrana</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Radi i bez interneta</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Nema adresne trake – puni ekran</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary" />
                <span>Automatska ažuriranja</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Povratak */}
        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
          <Home className="w-4 h-4 mr-2" />
          Natrag na aplikaciju
        </Button>
      </div>
    </div>
  );
}
