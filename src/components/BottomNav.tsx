import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Sparkles,
  FileText, 
  Flame 
} from 'lucide-react';
import { NavTab } from './Header';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'calendar', label: 'Agenda', icon: CalendarIcon },
    { id: 'habits', label: 'Hábitos', icon: Sparkles },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'year365', label: '365 Dias', icon: Flame },
  ];

  return (
    <nav 
      aria-label="Navegação mobile"
className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800"    >
      <div className="grid grid-cols-6 items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-h-[50px] py-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <div 
                className={`relative flex items-center justify-center px-2.5 py-1 rounded-full transition-colors ${
                  isActive 
                    ? 'bg-blue-100/70 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400' 
                    : ''
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-full leading-none font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
