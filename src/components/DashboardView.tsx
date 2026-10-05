import React from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  FileText,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { 
  Task, 
  CalendarEvent, 
  Habit, 
  HabitLog, 
  YearCycle, 
  Category 
} from '../types';
import { getDayOfYear, getTodayDateString, isSameDay, formatDayOfWeekAndDate } from '../services/storage';

interface DashboardViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  habitLogs: HabitLog[];
  activeCycle: YearCycle;
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onToggleHabit: (habitId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenQuickAdd: () => void;
  onTriggerMorningTest: () => void;
  onTriggerNightTest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  events,
  habits,
  habitLogs,
  activeCycle,
  categories,
  onToggleTask,
  onToggleHabit,
  onNavigateTab,
  onOpenQuickAdd,
  onTriggerMorningTest,
  onTriggerNightTest,
}) => {
  const today = getTodayDateString();
  const isFreshCycle = activeCycle.totalDaysCompleted === 1 && (activeCycle.productivityScoreAverage === 0 || activeCycle.startDate === today);
  const currentCycleDay = isFreshCycle ? 1 : Math.max(1, activeCycle.totalDaysCompleted || getDayOfYear(today));
  const totalYearDays = 365;
  const yearProgressPercent = isFreshCycle ? 0 : Math.min(100, Number(((currentCycleDay / totalYearDays) * 100).toFixed(1)));
  const daysRemaining = totalYearDays - currentCycleDay;

  // Filter today's tasks
  const todayTasks = tasks.filter((t) => t.dueDate === today || !t.dueDate);
  const completedTodayTasks = todayTasks.filter((t) => t.isCompleted);
  const pendingTasks = todayTasks.filter((t) => !t.isCompleted);

  // Filter today's events sorted by start time
  const todayEvents = events
    .filter((e) => isSameDay(e.startTime, today))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Habit completion status for today
  const todayHabitLogs = habitLogs.filter((l) => l.completedDate === today);
  const habitsStatus = habits.map((habit) => {
    const isDone = todayHabitLogs.some((l) => l.habitId === habit.id);
    return { habit, isDone };
  });

  const completedHabitsCount = habitsStatus.filter((h) => h.isDone).length;
  const habitsPercent = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 365 Days Hero Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{formatDayOfWeekAndDate(today)} · ANO {activeCycle.year}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
              Dia <span className="tabular-nums font-mono text-blue-600 dark:text-blue-400">{currentCycleDay}</span> de {totalYearDays}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Você já completou <strong className="text-neutral-800 dark:text-neutral-200 tabular-nums">{yearProgressPercent}%</strong> do ciclo anual. Restam {daysRemaining} dias de oportunidade.
            </p>
          </div>

          {/* Quick Notification Simulations & 365 View Link */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onTriggerMorningTest}
              className="py-2.5 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
            >
              Simular Digest 08:00
            </button>
            <button
              onClick={onTriggerNightTest}
              className="py-2.5 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
            >
              Simular Check-in 21:00
            </button>
            <button
              onClick={() => onNavigateTab('year365')}
              className="flex items-center gap-1.5 py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Ver Heatmap 365</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-500 font-mono tabular-nums">
            <span>01 Jan</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Progresso Anual {yearProgressPercent}%</span>
            <span>31 Dez</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${yearProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Criar Rápido (Tarefa, Agenda, Hábito, Nota)</span>
        </button>
        <button
          onClick={() => onNavigateTab('tasks')}
          className="py-2.5 px-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          Matriz de Eisenhower
        </button>
        <button
          onClick={() => onNavigateTab('calendar')}
          className="py-2.5 px-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          Sincronização de Calendários
        </button>
        <button
          onClick={() => onNavigateTab('notes')}
          className="py-2.5 px-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          Bloco de Notas
        </button>
      </div>

      {/* Main 3-Column Grid: Tasks, Agenda, Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Daily Tasks (Things 3 style) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Tarefas de Hoje
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono tabular-nums">
                {completedTodayTasks.length}/{todayTasks.length}
              </span>
            </div>

            <div className="mt-3.5 space-y-2">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Nenhuma tarefa pendente para hoje. Aproveite o foco!
                </div>
              ) : (
                todayTasks.map((task) => {
                  const category = categories.find((c) => c.id === task.categoryId);
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-start gap-2.5 p-2 rounded-lg transition-colors ${
                        task.isCompleted
                          ? 'opacity-60 bg-neutral-50/50 dark:bg-neutral-800/30'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer shrink-0"
                        title={task.isCompleted ? 'Desmarcar' : 'Concluir'}
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium leading-snug truncate ${
                            task.isCompleted
                              ? 'line-through text-neutral-400 dark:text-neutral-500'
                              : 'text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                          {task.dueTime && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {task.dueTime}
                            </span>
                          )}
                          {category && (
                            <span>{category.name}</span>
                          )}
                          {task.priority === 'urgent' && (
                            <span className="text-red-500 font-semibold">Urgente</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              onClick={() => onNavigateTab('tasks')}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Gerenciar tarefas completas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 2: Today's Agenda (Integrated with Google & Apple) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Agenda do Dia
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono tabular-nums">
                {todayEvents.length} compromissos
              </span>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {todayEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  Nenhum compromisso agendado para hoje.
                </div>
              ) : (
                todayEvents.map((event) => {
                  const startTimeStr = new Date(event.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTimeStr = new Date(event.endTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-500 font-mono tabular-nums">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{startTimeStr} - {endTimeStr}</span>
                            {event.location && (
                              <>
                                <span>·</span>
                                <span className="font-sans truncate max-w-[120px]">{event.location}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Source Tag */}
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          event.externalSource === 'google'
                            ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400'
                            : event.externalSource === 'apple'
                            ? 'text-neutral-700 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300'
                            : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}>
                          {event.externalSource === 'google' ? 'Google' : event.externalSource === 'apple' ? 'Apple' : 'OmniFlow'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              onClick={() => onNavigateTab('calendar')}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver agenda semanal e mensal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Column 3: Daily Habit Check-in (1-Click Streak) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Hábitos Diários
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono tabular-nums">
                {habitsPercent}% concluído
              </span>
            </div>

            <div className="mt-3.5 space-y-2">
              {habitsStatus.map(({ habit, isDone }) => (
                <div
                  key={habit.id}
                  onClick={() => onToggleHabit(habit.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isDone
                      ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: habit.colorHex }}
                    />
                    <span className={`text-xs font-medium truncate ${
                      isDone ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {habit.title}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              onClick={() => onNavigateTab('habits')}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Ver sequências e histórico semanal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
