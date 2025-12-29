import { useLanguage } from '@/i18n/LanguageContext';

interface MonthCardProps {
  month: number;
  year: number;
}

export const MonthCard = ({ month, year }: MonthCardProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card animate-slide-up">
      <h1 className="text-xl font-display font-bold text-foreground text-center">
        {t(`month.${month}`)} {year}
      </h1>
    </div>
  );
};