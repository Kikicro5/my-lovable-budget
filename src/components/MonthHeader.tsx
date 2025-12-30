import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import appIcon from '@/assets/app-icon-base.png';

interface MonthHeaderProps {
  month: number;
  year: number;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
}

const monthNames = [
  'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
  'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
];

export const MonthHeader = ({
  month,
  year,
  onPrevious,
  onNext,
  showNavigation = false,
}: MonthHeaderProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <img src={appIcon} alt="Budget Card" className="w-8 h-8 rounded-lg" />
      {showNavigation && onPrevious && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}
      <h1 className="text-2xl font-display font-bold text-foreground">
        {monthNames[month]} {year}
      </h1>
      {showNavigation && onNext && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
