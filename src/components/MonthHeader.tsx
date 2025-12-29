import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-foreground">
          {monthNames[month]}
        </h1>
        <p className="text-lg text-muted-foreground font-medium">{year}</p>
      </div>
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
