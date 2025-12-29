import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Archive, Settings, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/', icon: Home, label: 'Početna' },
  { path: '/monthly', icon: FileText, label: 'Mjesečno' },
  { path: '/archive', icon: Archive, label: 'Arhiva' },
];

const openGoogleTranslate = () => {
  const currentUrl = window.location.href;
  const translateUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(currentUrl)}`;
  window.open(translateUrl, '_blank');
};

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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs font-medium">Opcije</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-[100]">
            <DropdownMenuItem onClick={openGoogleTranslate} className="cursor-pointer">
              <Languages className="w-4 h-4 mr-2" />
              Promijeni jezik
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
