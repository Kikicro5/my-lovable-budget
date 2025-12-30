import { useLanguage } from '@/i18n/LanguageContext';

interface MonthCardProps {
  month: number;
  year: number;
}

export const MonthCard = ({ month, year }: MonthCardProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card animate-slide-up">
      <h1 className="text-xl font-display font-bold text-foreground">
        <span className="flex items-center justify-center gap-3">
          <img
            src="/icon-192.png"
            alt="Budget Card ikona"
            className="h-12 w-12 rounded-full"
            loading="lazy"
          />
          <span>{t(`month.${month}`)} {year}</span>
        </span>
      </h1>
    </div>
  );
};