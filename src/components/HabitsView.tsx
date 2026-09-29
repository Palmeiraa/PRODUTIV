import React from 'react';
import { 
  Flame, 
  Plus, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Award, 
  Trash2,
  Calendar
} from 'lucide-react';
import { Habit, HabitLog } from '../types';
import { getTodayDateString } from '../services/storage';

interface HabitsViewProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onToggleHabitDate: (habitId: string, dateStr: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onOpenQuickAdd: () => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  habitLogs,
  onToggleHabitDate,
  onDeleteHabit,
  onOpenQuickAdd,
}) => {
  const todayStr = getTodayDateString();

  // Get past 7 days for the weekly check-in matrix
  const getRecentDays = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNum = d.getDate();
      list.push({ dateStr: str, weekday, dayNum, isToday: str === todayStr });
    }
    return list;
  };

  const recentDays = getRecentDays();

  // Calculate habit stats (Streak, completion count in past 7 days)
  const getHabitStats = (habitId: string) => {
    const logs = habitLogs.filter((l) => l.habitId === habitId);
    const logDates = new Set(logs.map((l) => l.completedDate));

    // Calculate current streak backward from today
    let streak = 0;
    const checkDate = new Date();
    
    // Check if today is completed
    const todayLogged = logDates.has(todayStr);
    if (!todayLogged) {
      // Check if yesterday was completed
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const s = checkDate.toISOString().split('T')[0];
      if (logDates.has(s)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Weekly completion rate (last 7 days)
    const completedLast7 = recentDays.filter((d) => logDates.has(d.dateStr)).length;
    const weeklyRate = Math.round((completedLast7 / 7) * 100);

    return { streak, weeklyRate, completedLast7, logDates };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Rastreador de Hábitos & Streaks
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Mantenha suas disciplinas diárias com sequências ininterruptas
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Hábito</span>
        </button>
      </div>

      {/* Habits Grid with 7-Day Matrix */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-400">
            Nenhum hábito cadastrado ainda. Comece criando seu primeiro hábito diário!
          </div>
        ) : (
          habits.map((habit) => {
            const { streak, weeklyRate, completedLast7, logDates } = getHabitStats(habit.id);

            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Habit Info & Streaks */}
                <div className="flex items-start gap-3 min-w-0 md:w-1/3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: habit.colorHex }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                        {habit.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        {streak} dias de sequência
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 font-mono tabular-nums">
                        {weeklyRate}% nesta semana
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Interactive Matrix */}
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {recentDays.map((day) => {
                    const isDone = logDates.has(day.dateStr);

                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => onToggleHabitDate(habit.id, day.dateStr)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-w-[44px] ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-xs scale-102'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                        } ${day.isToday ? 'ring-2 ring-blue-500/50' : ''}`}
                        title={`${day.dateStr}: ${isDone ? 'Concluído' : 'Pendente'}`}
                      >
                        <span className="text-[10px] uppercase font-semibold">
                          {day.weekday}
                        </span>
                        <span className="text-xs font-bold font-mono mt-0.5">
                          {day.dayNum}
                        </span>
                        <div className="mt-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Habit Actions */}
                <div className="flex items-center justify-end gap-2 md:w-20">
                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    title="Excluir Hábito"
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
