const monthNames = [
  'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
  'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
];

interface MonthCardProps {
  month: number;
  year: number;
}

export const MonthCard = ({ month, year }: MonthCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card animate-slide-up">
      <h1 className="text-xl font-display font-bold text-foreground text-center">
        {monthNames[month]} {year}
      </h1>
    </div>
  );
};
