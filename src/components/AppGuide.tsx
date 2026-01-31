import { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Wallet, PlusCircle, FileText, Settings, BarChart3, Archive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GuideStep {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  tips: string[];
}

export const AppGuide = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const steps: GuideStep[] = [
    {
      icon: <Wallet className="w-12 h-12 text-primary" />,
      titleKey: 'guide.step1.title',
      descriptionKey: 'guide.step1.description',
      tips: [
        t('guide.step1.tip1'),
        t('guide.step1.tip2'),
        t('guide.step1.tip3'),
      ],
    },
    {
      icon: <PlusCircle className="w-12 h-12 text-income" />,
      titleKey: 'guide.step2.title',
      descriptionKey: 'guide.step2.description',
      tips: [
        t('guide.step2.tip1'),
        t('guide.step2.tip2'),
        t('guide.step2.tip3'),
      ],
    },
    {
      icon: <FileText className="w-12 h-12 text-primary" />,
      titleKey: 'guide.step3.title',
      descriptionKey: 'guide.step3.description',
      tips: [
        t('guide.step3.tip1'),
        t('guide.step3.tip2'),
        t('guide.step3.tip3'),
      ],
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-investment" />,
      titleKey: 'guide.step4.title',
      descriptionKey: 'guide.step4.description',
      tips: [
        t('guide.step4.tip1'),
        t('guide.step4.tip2'),
        t('guide.step4.tip3'),
      ],
    },
    {
      icon: <Archive className="w-12 h-12 text-muted-foreground" />,
      titleKey: 'guide.step5.title',
      descriptionKey: 'guide.step5.description',
      tips: [
        t('guide.step5.tip1'),
        t('guide.step5.tip2'),
      ],
    },
    {
      icon: <Settings className="w-12 h-12 text-primary" />,
      titleKey: 'guide.step6.title',
      descriptionKey: 'guide.step6.description',
      tips: [
        t('guide.step6.tip1'),
        t('guide.step6.tip2'),
        t('guide.step6.tip3'),
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpen = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{t('guide.title')}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {t('guide.description')}
      </p>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleOpen} className="w-full gap-2">
            <BookOpen className="w-4 h-4" />
            {t('guide.start')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t('guide.title')}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Step indicator */}
            <div className="flex justify-center gap-1.5">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-primary w-6' 
                      : index < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="text-center space-y-4">
              <div className="flex justify-center p-4 bg-muted/50 rounded-xl">
                {currentStepData.icon}
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(currentStepData.titleKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(currentStepData.descriptionKey)}
                </p>
              </div>
            </div>

            {/* Tips */}
            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  💡 {t('guide.tips')}
                </h4>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
              <Button 
                variant="outline" 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex-1 gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('guide.prev')}
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 gap-2"
                >
                  {t('guide.finish')}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  className="flex-1 gap-2"
                >
                  {t('guide.next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
