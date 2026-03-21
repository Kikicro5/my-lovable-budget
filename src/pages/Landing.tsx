import { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, TrendingUp, Shield, Cloud, Users, BarChart3, 
  Wallet, ArrowRight, Star, ChevronDown, Globe, BookOpen
} from 'lucide-react';
import { TermsOfServiceContent, PrivacyPolicyContent, GDPRContent } from '@/components/LegalDialogs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Scale } from 'lucide-react';
import screenshotDashboard from '@/assets/screenshots/screenshot-dashboard.jpg';
import screenshotTransactions from '@/assets/screenshots/screenshot-transactions.jpg';
import screenshotPromo from '@/assets/screenshots/screenshot-promo.png';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.lovable.budgetcard.twa';
const WEB_APP_URL = 'https://budgetcard.lovable.app';

type LandingContent = {
  hero: string; heroSub: string; cta: string; ctaWeb: string;
  featuresTitle: string; premiumTitle: string; premiumSub: string;
  screenshotsTitle: string; footerCta: string; learnMore: string;
  features: { icon: any; title: string; desc: string }[];
  premiumFeatures: string[];
};

const content: Record<string, LandingContent> = {
  hr: {
    hero: 'Budget Card - Praćenje troškova',
    heroSub: 'Pratite prihode, rashode i budžet po kategorijama na jednom mjestu.',
    cta: 'Preuzmi na Google Play',
    ctaWeb: 'Otvori web aplikaciju',
    featuresTitle: 'Sve što trebate za upravljanje budžetom',
    premiumTitle: 'Premium pretplata',
    premiumSub: 'Otključajte napredne mogućnosti za potpunu kontrolu financija.',
    screenshotsTitle: 'Pogledajte aplikaciju',
    footerCta: 'Započnite besplatno danas',
    learnMore: 'Saznaj više',
    features: [
      { icon: Wallet, title: 'Praćenje prihoda i rashoda', desc: 'Jednostavno dodajte transakcije i pratite kamo odlazi vaš novac.' },
      { icon: BarChart3, title: 'Mjesečna analitika', desc: 'Vizualni prikaz potrošnje po kategorijama i mjesecima.' },
      { icon: TrendingUp, title: 'Budžetski limiti', desc: 'Postavite limite po kategorijama i pratite napredak.' },
      { icon: Globe, title: '8 jezika', desc: 'Potpuna lokalizacija na hrvatski, engleski, njemački, poljski, španjolski, francuski, kineski i hindi.' },
    ],
    premiumFeatures: [
      'Postavljanje budžetskih limita', 'Napredna mjesečna analitika',
      'Sinkronizacija podataka u oblaku', 'Zajedničko vođenje budžeta',
      'Prijenosi između kategorija', 'Neograničen broj računa',
    ],
  },
  en: {
    hero: 'Budget Card - Expense Tracker',
    heroSub: 'Track income, expenses and budgets by category, all in one simple app.',
    cta: 'Get it on Google Play',
    ctaWeb: 'Open web app',
    featuresTitle: 'Everything you need for budget management',
    premiumTitle: 'Premium subscription',
    premiumSub: 'Unlock advanced features for complete financial control.',
    screenshotsTitle: 'See the app in action',
    footerCta: 'Start for free today',
    learnMore: 'Learn more',
    features: [
      { icon: Wallet, title: 'Income & expense tracking', desc: 'Easily add transactions and see where your money goes.' },
      { icon: BarChart3, title: 'Monthly analytics', desc: 'Visual breakdown of spending by category and month.' },
      { icon: TrendingUp, title: 'Budget limits', desc: 'Set limits per category and track your progress.' },
      { icon: Globe, title: '8 languages', desc: 'Fully localized in Croatian, English, German, Polish, Spanish, French, Chinese and Hindi.' },
    ],
    premiumFeatures: [
      'Budget limit settings', 'Advanced monthly analytics',
      'Cloud data synchronization', 'Shared budget management',
      'Category transfers', 'Unlimited accounts',
    ],
  },
  de: {
    hero: 'Budget Card - Ausgaben-Tracker',
    heroSub: 'Verfolgen Sie Einnahmen, Ausgaben und Budgets nach Kategorien an einem Ort.',
    cta: 'Bei Google Play herunterladen',
    ctaWeb: 'Web-App öffnen',
    featuresTitle: 'Alles was Sie für die Budgetverwaltung brauchen',
    premiumTitle: 'Premium-Abonnement',
    premiumSub: 'Schalten Sie erweiterte Funktionen für die vollständige Finanzkontrolle frei.',
    screenshotsTitle: 'Sehen Sie die App in Aktion',
    footerCta: 'Starten Sie noch heute kostenlos',
    learnMore: 'Mehr erfahren',
    features: [
      { icon: Wallet, title: 'Einnahmen- & Ausgabenverfolgung', desc: 'Fügen Sie einfach Transaktionen hinzu und sehen Sie, wohin Ihr Geld geht.' },
      { icon: BarChart3, title: 'Monatliche Analysen', desc: 'Visuelle Aufschlüsselung der Ausgaben nach Kategorie und Monat.' },
      { icon: TrendingUp, title: 'Budgetlimits', desc: 'Setzen Sie Limits pro Kategorie und verfolgen Sie Ihren Fortschritt.' },
      { icon: Globe, title: '8 Sprachen', desc: 'Vollständig lokalisiert in Kroatisch, Englisch, Deutsch, Polnisch, Spanisch, Französisch, Chinesisch und Hindi.' },
    ],
    premiumFeatures: [
      'Budgetlimit-Einstellungen', 'Erweiterte monatliche Analysen',
      'Cloud-Datensynchronisierung', 'Gemeinsame Budgetverwaltung',
      'Kategorieübertragungen', 'Unbegrenzte Konten',
    ],
  },
  pl: {
    hero: 'Budget Card - Śledzenie wydatków',
    heroSub: 'Śledź przychody, wydatki i budżety według kategorii w jednym miejscu.',
    cta: 'Pobierz z Google Play',
    ctaWeb: 'Otwórz aplikację webową',
    featuresTitle: 'Wszystko czego potrzebujesz do zarządzania budżetem',
    premiumTitle: 'Subskrypcja Premium',
    premiumSub: 'Odblokuj zaawansowane funkcje dla pełnej kontroli finansów.',
    screenshotsTitle: 'Zobacz aplikację w akcji',
    footerCta: 'Zacznij za darmo już dziś',
    learnMore: 'Dowiedz się więcej',
    features: [
      { icon: Wallet, title: 'Śledzenie przychodów i wydatków', desc: 'Łatwo dodawaj transakcje i sprawdzaj, na co idą Twoje pieniądze.' },
      { icon: BarChart3, title: 'Miesięczne analizy', desc: 'Wizualny podział wydatków według kategorii i miesiąca.' },
      { icon: TrendingUp, title: 'Limity budżetowe', desc: 'Ustaw limity dla każdej kategorii i śledź postępy.' },
      { icon: Globe, title: '8 języków', desc: 'Pełna lokalizacja w języku chorwackim, angielskim, niemieckim, polskim, hiszpańskim, francuskim, chińskim i hindi.' },
    ],
    premiumFeatures: [
      'Ustawienia limitów budżetowych', 'Zaawansowane miesięczne analizy',
      'Synchronizacja danych w chmurze', 'Wspólne zarządzanie budżetem',
      'Transfery między kategoriami', 'Nieograniczona liczba kont',
    ],
  },
  es: {
    hero: 'Budget Card - Seguimiento de gastos',
    heroSub: 'Controla ingresos, gastos y presupuestos por categoría en un solo lugar.',
    cta: 'Descargar en Google Play',
    ctaWeb: 'Abrir aplicación web',
    featuresTitle: 'Todo lo que necesitas para gestionar tu presupuesto',
    premiumTitle: 'Suscripción Premium',
    premiumSub: 'Desbloquea funciones avanzadas para un control financiero completo.',
    screenshotsTitle: 'Mira la aplicación en acción',
    footerCta: 'Empieza gratis hoy',
    learnMore: 'Saber más',
    features: [
      { icon: Wallet, title: 'Seguimiento de ingresos y gastos', desc: 'Añade transacciones fácilmente y mira a dónde va tu dinero.' },
      { icon: BarChart3, title: 'Análisis mensual', desc: 'Desglose visual del gasto por categoría y mes.' },
      { icon: TrendingUp, title: 'Límites de presupuesto', desc: 'Establece límites por categoría y sigue tu progreso.' },
      { icon: Globe, title: '8 idiomas', desc: 'Totalmente localizada en croata, inglés, alemán, polaco, español, francés, chino y hindi.' },
    ],
    premiumFeatures: [
      'Configuración de límites', 'Análisis mensual avanzado',
      'Sincronización en la nube', 'Gestión compartida del presupuesto',
      'Transferencias entre categorías', 'Cuentas ilimitadas',
    ],
  },
  fr: {
    hero: 'Budget Card - Suivi des dépenses',
    heroSub: 'Suivez revenus, dépenses et budgets par catégorie en un seul endroit.',
    cta: 'Télécharger sur Google Play',
    ctaWeb: 'Ouvrir l\'application web',
    featuresTitle: 'Tout ce dont vous avez besoin pour gérer votre budget',
    premiumTitle: 'Abonnement Premium',
    premiumSub: 'Débloquez des fonctionnalités avancées pour un contrôle financier complet.',
    screenshotsTitle: 'Découvrez l\'application',
    footerCta: 'Commencez gratuitement aujourd\'hui',
    learnMore: 'En savoir plus',
    features: [
      { icon: Wallet, title: 'Suivi des revenus et dépenses', desc: 'Ajoutez facilement des transactions et voyez où va votre argent.' },
      { icon: BarChart3, title: 'Analyses mensuelles', desc: 'Répartition visuelle des dépenses par catégorie et par mois.' },
      { icon: TrendingUp, title: 'Limites de budget', desc: 'Définissez des limites par catégorie et suivez vos progrès.' },
      { icon: Globe, title: '8 langues', desc: 'Entièrement localisée en croate, anglais, allemand, polonais, espagnol, français, chinois et hindi.' },
    ],
    premiumFeatures: [
      'Paramètres de limites budgétaires', 'Analyses mensuelles avancées',
      'Synchronisation cloud des données', 'Gestion partagée du budget',
      'Transferts entre catégories', 'Comptes illimités',
    ],
  },
  zh: {
    hero: 'Budget Card - 费用追踪器',
    heroSub: '在一个地方按类别跟踪收入、支出和预算。',
    cta: '在 Google Play 下载',
    ctaWeb: '打开网页应用',
    featuresTitle: '预算管理所需的一切',
    premiumTitle: 'Premium 订阅',
    premiumSub: '解锁高级功能，全面掌控财务。',
    screenshotsTitle: '查看应用',
    footerCta: '今天免费开始',
    learnMore: '了解更多',
    features: [
      { icon: Wallet, title: '收入和支出跟踪', desc: '轻松添加交易，查看资金流向。' },
      { icon: BarChart3, title: '月度分析', desc: '按类别和月份直观展示支出。' },
      { icon: TrendingUp, title: '预算限额', desc: '为每个类别设置限额并跟踪进度。' },
      { icon: Globe, title: '8种语言', desc: '完全支持克罗地亚语、英语、德语、波兰语、西班牙语、法语、中文和印地语。' },
    ],
    premiumFeatures: [
      '预算限额设置', '高级月度分析',
      '云数据同步', '共享预算管理',
      '类别间转账', '无限账户',
    ],
  },
  hi: {
    hero: 'Budget Card - व्यय ट्रैकर',
    heroSub: 'एक ही जगह पर श्रेणी के अनुसार आय, व्यय और बजट ट्रैक करें।',
    cta: 'Google Play से डाउनलोड करें',
    ctaWeb: 'वेब ऐप खोलें',
    featuresTitle: 'बजट प्रबंधन के लिए आपको जो कुछ भी चाहिए',
    premiumTitle: 'प्रीमियम सदस्यता',
    premiumSub: 'पूर्ण वित्तीय नियंत्रण के लिए उन्नत सुविधाएं अनलॉक करें।',
    screenshotsTitle: 'ऐप देखें',
    footerCta: 'आज ही मुफ्त में शुरू करें',
    learnMore: 'और जानें',
    features: [
      { icon: Wallet, title: 'आय और व्यय ट्रैकिंग', desc: 'आसानी से लेन-देन जोड़ें और देखें कि आपका पैसा कहाँ जाता है।' },
      { icon: BarChart3, title: 'मासिक विश्लेषण', desc: 'श्रेणी और महीने के अनुसार खर्च का दृश्य विवरण।' },
      { icon: TrendingUp, title: 'बजट सीमाएं', desc: 'प्रत्येक श्रेणी के लिए सीमाएं निर्धारित करें और प्रगति ट्रैक करें।' },
      { icon: Globe, title: '8 भाषाएं', desc: 'क्रोएशियाई, अंग्रेजी, जर्मन, पोलिश, स्पैनिश, फ्रेंच, चीनी और हिंदी में पूर्ण स्थानीयकरण।' },
    ],
    premiumFeatures: [
      'बजट सीमा सेटिंग्स', 'उन्नत मासिक विश्लेषण',
      'क्लाउड डेटा सिंक्रनाइज़ेशन', 'साझा बजट प्रबंधन',
      'श्रेणी स्थानांतरण', 'असीमित खाते',
    ],
  },
};

const langLabels: Record<string, string> = {
  hr: '🇭🇷 Hrvatski', en: '🇬🇧 English', de: '🇩🇪 Deutsch', pl: '🇵🇱 Polski',
  es: '🇪🇸 Español', fr: '🇫🇷 Français', zh: '🇨🇳 中文', hi: '🇮🇳 हिन्दी',
};

const LanguageSelector = ({ language, setLanguage }: { language: string; setLanguage: (l: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/50 shadow-soft text-sm font-medium hover:bg-muted transition-colors"
      >
        <Globe className="w-4 h-4 text-primary" />
        {langLabels[language] || langLabels.en}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-card overflow-hidden min-w-[160px] z-50">
          {Object.entries(langLabels).map(([code, label]) => (
            <button
              key={code}
              onClick={() => { setLanguage(code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${language === code ? 'bg-primary/10 text-primary font-semibold' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Landing = () => {
  const { language, setLanguage } = useLanguage();
  const isAndroid = /android/i.test(navigator.userAgent);
  const c = content[language] || content.en;

  useEffect(() => {
    document.title = 'Budget Card - Expense Tracker | Personal Finance & Budget Manager';
    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Track expenses, manage budgets by category, set savings goals and bill reminders. Free personal finance app with spending reports and multilingual support.');
    setMeta('og:title', 'Budget Card - Expense Tracker | Personal Finance & Budget Manager', 'property');
    setMeta('og:description', 'Track expenses, manage budgets by category, set savings goals and bill reminders. Free personal finance app.', 'property');
    setMeta('og:url', 'https://budgetcard.lovable.app/landing', 'property');
  }, []);

  const screenshots = [
    { src: screenshotDashboard, alt: 'Budget Card dashboard showing expense categories and balance overview' },
    { src: screenshotTransactions, alt: 'Transaction list with income and expense entries in Budget Card app' },
    { src: screenshotPromo, alt: 'Budget Card expense tracker app promotional screenshot' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header with Language Selector */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
          <span className="font-display font-bold text-lg">BudgetCard</span>
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Smartphone className="w-4 h-4" />
            BudgetCard
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            {c.hero}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {c.heroSub}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-16"
              />
            </a>
            <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6 rounded-xl">
                <ArrowRight className="w-5 h-5" />
                {c.ctaWeb}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            {c.screenshotsTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {screenshots.map((s) => (
              <div key={s.alt} className="group">
                <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-card transition-transform duration-300 group-hover:scale-[1.02]">
                  <img src={s.src} alt={s.alt} className="w-full h-auto" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            {c.featuresTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {c.features.map((f, i) => (
              <Card key={i} className="border-border/50 shadow-soft hover:shadow-card transition-shadow duration-300">
                <CardContent className="p-6 flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-1">{f.title}</h3>
                    <p className="text-muted-foreground text-sm">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-accent/10 text-accent text-sm font-medium">
            <Star className="w-4 h-4" />
            Premium
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {c.premiumTitle}
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            {c.premiumSub}
          </p>
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
            {c.premiumFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-soft">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-6">{c.footerCta}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              <img
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-16"
              />
            </a>
            {!isAndroid && (
              <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 text-base px-8 py-6 rounded-xl shadow-glow">
                  <ArrowRight className="w-5 h-5" />
                  {c.ctaWeb}
                </Button>
              </a>
            )}
          </div>
          <Separator className="my-8" />

          {/* Legal */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Dialog>
              <DialogTrigger className="hover:text-foreground underline-offset-4 hover:underline transition-colors cursor-pointer">
                {language === 'hr' ? 'Uvjeti korištenja' : language === 'de' ? 'Nutzungsbedingungen' : language === 'pl' ? 'Regulamin' : language === 'es' ? 'Términos de uso' : language === 'fr' ? 'Conditions d\'utilisation' : language === 'zh' ? '使用条款' : language === 'hi' ? 'उपयोग की शर्तें' : 'Terms of Service'}
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader><DialogTitle><FileText className="w-5 h-5 inline mr-2" />Terms of Service</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh] pr-4"><TermsOfServiceContent /></ScrollArea>
              </DialogContent>
            </Dialog>
            <span>·</span>
            <Dialog>
              <DialogTrigger className="hover:text-foreground underline-offset-4 hover:underline transition-colors cursor-pointer">
                {language === 'hr' ? 'Pravila privatnosti' : language === 'de' ? 'Datenschutz' : language === 'pl' ? 'Polityka prywatności' : language === 'es' ? 'Política de privacidad' : language === 'fr' ? 'Politique de confidentialité' : language === 'zh' ? '隐私政策' : language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader><DialogTitle><Shield className="w-5 h-5 inline mr-2" />Privacy Policy</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh] pr-4"><PrivacyPolicyContent /></ScrollArea>
              </DialogContent>
            </Dialog>
            <span>·</span>
            <Dialog>
              <DialogTrigger className="hover:text-foreground underline-offset-4 hover:underline transition-colors cursor-pointer">
                GDPR
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh]">
                <DialogHeader><DialogTitle><Scale className="w-5 h-5 inline mr-2" />GDPR</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh] pr-4"><GDPRContent /></ScrollArea>
              </DialogContent>
            </Dialog>
            <span>·</span>
            <a href={WEB_APP_URL + '?tab=options'} target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline-offset-4 hover:underline transition-colors">
              {language === 'hr' ? 'Vodič za aplikaciju' : language === 'de' ? 'App-Anleitung' : language === 'pl' ? 'Przewodnik po aplikacji' : language === 'es' ? 'Guía de la aplicación' : language === 'fr' ? 'Guide de l\'application' : language === 'zh' ? '应用指南' : language === 'hi' ? 'ऐप गाइड' : 'App Guide'}
            </a>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} BudgetCard.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
