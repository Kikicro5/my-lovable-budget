import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Archive, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Početna' },
  { path: '/monthly', icon: FileText, label: 'Mjesečno' },
  { path: '/archive', icon: Archive, label: 'Arhiva' },
  { path: '/options', icon: Settings, label: 'Opcije' },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-soft z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
