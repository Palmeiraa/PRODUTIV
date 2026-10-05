import React from 'react';
import { 
  Plus, 
  Moon, 
  Sun, 
  Bell, 
  WifiOff
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'notes'
  | 'year365'
  | 'habits'
  | 'architecture';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenQuickAdd: () => void;
  onTriggerNotificationTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleTheme,
  onOpenQuickAdd,
  onTriggerNotificationTest,
}) => {
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Tarefas & Matriz' },
    { id: 'calendar', label: 'Agenda' },
    { id: 'notes', label: 'Notas' },
    { id: 'year365', label: '365 Dias' },
    { id: 'habits', label: 'Hábitos' },
    { id: 'architecture', label: 'Arquitetura & DDL' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              OmniFlow <span className="font-light text-neutral-500 dark:text-neutral-400">365</span>
            </span>
          </button>

          {/* Quiet Offline-First indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 ml-2">
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-emerald-500" />
              <span>Offline-First</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Quick Tester trigger */}
          <button
            onClick={onTriggerNotificationTest}
            title="Simular Lembrete Pop-up"
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors cursor-pointer"
            aria-label="Simular Notificação"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-colors cursor-pointer"
            aria-label="Alternar Tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Create Action */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white rounded-xl shadow-sm transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Criar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
