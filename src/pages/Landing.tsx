import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Smartphone, TrendingUp, Shield, Cloud, Users, BarChart3, 
  Wallet, ArrowRight, Star, ChevronDown, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.lovable.budgetcard.twa';
const WEB_APP_URL = 'https://budgetcard.lovable.app';

const screenshots = [
  { id: 1, label: 'Dashboard', gradient: 'from-primary/20 to-accent/10' },
  { id: 2, label: 'Monthly', gradient: 'from-accent/20 to-primary/10' },
  { id: 3, label: 'Accounts', gradient: 'from-primary/15 to-accent/15' },
  { id: 4, label: 'Options', gradient: 'from-accent/15 to-primary/15' },
];

const Landing = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const isAndroid = /android/i.test(navigator.userAgent);

  const content: Record<string, {
    hero: string; heroSub: string; cta: string; ctaWeb: string;
    featuresTitle: string; premiumTitle: string; premiumSub: string;
    screenshotsTitle: string; footerCta: string;
    features: { icon: any; title: string; desc: string }[];
    premiumFeatures: string[];
    screenshots: string[];
  }> = {
    hr: {
      hero: 'Vaš osobni financijski asistent',
      heroSub: 'Pratite prihode, rashode i budžet po kategorijama na jednom mjestu.',
      cta: 'Preuzmi na Google Play',
      ctaWeb: 'Otvori web aplikaciju',
      featuresTitle: 'Sve što trebate za upravljanje budžetom',
      premiumTitle: 'Premium pretplata',
      premiumSub: 'Otključajte napredne mogućnosti za potpunu kontrolu financija.',
      screenshotsTitle: 'Pogledajte aplikaciju',
      footerCta: 'Započnite besplatno danas',
      features: [
        { icon: Wallet, title: 'Praćenje prihoda i rashoda', desc: 'Jednostavno dodajte transakcije i pratite kamo odlazi vaš novac.' },
        { icon: BarChart3, title: 'Mjesečna analitika', desc: 'Vizualni prikaz potrošnje po kategorijama i mjesecima.' },
        { icon: TrendingUp, title: 'Budžetski limiti', desc: 'Postavite limite po kategorijama i pratite napredak.' },
        { icon: Globe, title: '8 jezika', desc: 'Potpuna lokalizacija na hrvatski, engleski, njemački, poljski, španjolski, francuski, kineski i hindi.' },
      ],
      premiumFeatures: [
        'Postavljanje budžetskih limita',
        'Napredna mjesečna analitika',
        'Sinkronizacija podataka u oblaku',
        'Zajedničko vođenje budžeta',
        'Prijenosi između kategorija',
        'Neograničen broj računa',
      ],
      screenshots: ['Početna', 'Mjesečno', 'Računi', 'Opcije'],
    },
    en: {
      hero: 'Your personal finance assistant',
      heroSub: 'Track income, expenses and budgets by category, all in one simple app.',
      cta: 'Get it on Google Play',
      ctaWeb: 'Open web app',
      featuresTitle: 'Everything you need for budget management',
      premiumTitle: 'Premium subscription',
      premiumSub: 'Unlock advanced features for complete financial control.',
      screenshotsTitle: 'See the app in action',
      footerCta: 'Start for free today',
      features: [
        { icon: Wallet, title: 'Income & expense tracking', desc: 'Easily add transactions and see where your money goes.' },
        { icon: BarChart3, title: 'Monthly analytics', desc: 'Visual breakdown of spending by category and month.' },
        { icon: TrendingUp, title: 'Budget limits', desc: 'Set limits per category and track your progress.' },
        { icon: Globe, title: '8 languages', desc: 'Fully localized in Croatian, English, German, Polish, Spanish, French, Chinese and Hindi.' },
      ],
      premiumFeatures: [
        'Budget limit settings',
        'Advanced monthly analytics',
        'Cloud data synchronization',
        'Shared budget management',
        'Category transfers',
        'Unlimited accounts',
      ],
      screenshots: ['Dashboard', 'Monthly', 'Accounts', 'Options'],
    },
  };

  const c = content[language] || content.en;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAndroid ? (
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 text-base px-8 py-6 rounded-xl shadow-glow">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M3.609 1.814 13.792 12 3.609 22.186a1.004 1.004 0 0 1-.609-.93V2.744c0-.382.217-.72.609-.93ZM14.852 13.06l2.538 2.539-8.833 5.108 6.295-7.647ZM18.687 10.7l2.606 1.508a1.003 1.003 0 0 1 0 1.742l-2.606 1.508L16.034 12l2.653-1.3ZM8.557 3.293l8.833 5.108-2.538 2.539-6.295-7.647Z"/>
                  </svg>
                  {c.cta}
                </Button>
              </a>
            ) : (
              <a href={WEB_APP_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="gap-2 text-base px-8 py-6 rounded-xl shadow-glow">
                  <ArrowRight className="w-5 h-5" />
                  {c.ctaWeb}
                </Button>
              </a>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2 text-base px-8 py-6 rounded-xl"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ChevronDown className="w-5 h-5" />
              {language === 'hr' ? 'Saznaj više' : 'Learn more'}
            </Button>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            {c.screenshotsTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {screenshots.map((s, i) => (
              <div key={s.id} className="group">
                <div className={`relative aspect-[9/16] rounded-2xl bg-gradient-to-br ${s.gradient} border border-border/50 overflow-hidden shadow-card transition-transform duration-300 group-hover:scale-[1.02]`}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    {/* Mock phone screen */}
                    <div className="w-full h-full rounded-xl bg-card/80 backdrop-blur-sm border border-border/30 flex flex-col overflow-hidden">
                      <div className="h-6 bg-primary/10 flex items-center justify-center">
                        <div className="w-12 h-1.5 rounded-full bg-primary/20" />
                      </div>
                      <div className="flex-1 p-3 flex flex-col gap-2">
                        <div className="h-3 w-3/4 rounded bg-primary/15" />
                        <div className="h-3 w-1/2 rounded bg-muted-foreground/10" />
                        <div className="flex-1 rounded-lg bg-gradient-to-b from-primary/5 to-accent/5 mt-2" />
                        <div className="flex gap-2">
                          <div className="h-8 flex-1 rounded-lg bg-primary/10" />
                          <div className="h-8 flex-1 rounded-lg bg-accent/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-3 font-medium">
                  {c.screenshots[i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Premium Section */}
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

      {/* CTA Footer */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-6">{c.footerCta}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={isAndroid ? PLAY_STORE_URL : WEB_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 text-base px-8 py-6 rounded-xl shadow-glow">
                <ArrowRight className="w-5 h-5" />
                {isAndroid ? c.cta : c.ctaWeb}
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} BudgetCard. {language === 'hr' ? 'Sva prava pridržana.' : 'All rights reserved.'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
