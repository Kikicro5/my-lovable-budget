import { useState, useEffect } from 'react';
import { Chrome, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BrowserRedirect = () => {
  const [showRedirect, setShowRedirect] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Detect in-app browsers (Facebook, Instagram, TikTok, etc.)
    const inAppBrowsers = [
      'FBAN', 'FBAV', // Facebook
      'Instagram',
      'Twitter',
      'TikTok',
      'Line',
      'KAKAOTALK',
      'Snapchat',
      'Pinterest',
      'LinkedIn',
      'MicroMessenger', // WeChat
    ];
    
    const isInApp = inAppBrowsers.some(browser => userAgent.includes(browser));
    setIsInAppBrowser(isInApp);
    
    // Detect Chrome
    const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    const isChromeMobile = /CriOS/.test(userAgent); // Chrome on iOS
    const isSamsung = /SamsungBrowser/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    
    // Show redirect if not Chrome-based and not already dismissed
    const dismissed = localStorage.getItem('browser-redirect-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }
    
    // Allow Chrome, Samsung Internet, Edge (Chromium-based)
    if (!isChrome && !isChromeMobile && !isSamsung && !isEdge) {
      setShowRedirect(true);
    }
    
    if (isInApp) {
      setShowRedirect(true);
    }
  }, []);

  const handleOpenInChrome = () => {
    const currentUrl = window.location.href;
    
    // Try Android intent to open in Chrome
    if (/Android/i.test(navigator.userAgent)) {
      const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      
      // Fallback: try to open in default browser
      setTimeout(() => {
        window.open(currentUrl, '_system');
      }, 500);
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS: try googlechrome:// scheme
      const chromeUrl = currentUrl.replace(/^https?/, 'googlechrome');
      window.location.href = chromeUrl;
      
      // Fallback
      setTimeout(() => {
        window.open(currentUrl, '_blank');
      }, 500);
    } else {
      // Desktop: just copy URL
      navigator.clipboard?.writeText(currentUrl);
      alert('Link kopiran! Zalijepi ga u Chrome preglednik.');
    }
  };

  const handleDismiss = () => {
    setShowRedirect(false);
    localStorage.setItem('browser-redirect-dismissed', Date.now().toString());
  };

  if (!showRedirect) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl p-6 max-w-sm w-full border border-border shadow-lg text-center">
        <Chrome className="w-16 h-16 mx-auto mb-4 text-primary" />
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          {isInAppBrowser ? 'Otvori u pregledniku' : 'Koristi Chrome'}
        </h2>
        
        <p className="text-muted-foreground mb-6">
          {isInAppBrowser 
            ? 'Za najbolje iskustvo i mogućnost instalacije, otvori Budget Card u Chrome pregledniku.'
            : 'Budget Card najbolje radi u Chrome pregledniku. Instaliraj aplikaciju direktno iz Chromea.'}
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleOpenInChrome}
            className="w-full gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Otvori u Chrome
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleDismiss}
            className="w-full text-muted-foreground"
          >
            Nastavi ovdje
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrowserRedirect;
