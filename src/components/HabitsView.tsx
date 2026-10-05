import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Award, 
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Habit, HabitLog } from '../types';
import { getTodayDateString, parseLocalDate, formatDateYMD } from '../services/storage';

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
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Get 7 days for the selected week starting dynamically on Sunday (Dom)
  const getWeekDays = (offset: number) => {
    const today = parseLocalDate(todayStr);
    const dayOfWeek = today.getDay(); // 0 is Sunday
    // Start of the week: Sunday
    const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek + (offset * 7), 12, 0, 0);

    const weekdayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i, 12, 0, 0);
      const str = formatDateYMD(d);
      const weekday = weekdayShort[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      list.push({
        dateStr: str,
        weekday,
        dayNum,
        monthNum,
        label: `${dayNum}/${monthNum}`,
        isToday: str === todayStr,
      });
    }
    return list;
  };

  const displayDays = getWeekDays(weekOffset);

  // Calculate habit stats (Streak, completion count in current displayed week)
  const getHabitStats = (habitId: string) => {
    const logs = habitLogs.filter((l) => l.habitId === habitId);
    const logDates = new Set(logs.map((l) => l.completedDate));

    // Calculate current streak backward from today
    let streak = 0;
    const checkDate = parseLocalDate(todayStr);
    
    // Check if today is completed
    const todayLogged = logDates.has(todayStr);
    if (!todayLogged) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const s = formatDateYMD(checkDate);
      if (logDates.has(s)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Completion rate in the currently displayed week
    const completedInWeek = displayDays.filter((d) => logDates.has(d.dateStr)).length;
    const weeklyRate = Math.round((completedInWeek / 7) * 100);

    return { streak, weeklyRate, completedInWeek, logDates };
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Rastreador de Hábitos
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Acompanhamento semanal com reset automático e histórico preservado
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Hábito</span>
        </button>
      </div>

      {/* Week Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="flex items-center gap-1 min-h-[44px] px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Semana Anterior</span>
          </button>
          
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
            className="min-h-[44px] px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 disabled:opacity-40 rounded-xl cursor-pointer"
          >
            Esta Semana
          </button>

          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="flex items-center gap-1 min-h-[44px] px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
          >
            <span>Próxima Semana</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span>Período: </span>
          <strong className="text-neutral-900 dark:text-white font-mono">
            {displayDays[0].label} ({displayDays[0].weekday}) até {displayDays[6].label} ({displayDays[6].weekday})
          </strong>
          {weekOffset === 0 && (
            <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
              Semana Atual
            </span>
          )}
        </div>
      </div>

      {/* Habits Grid with 7-Day Matrix */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center text-xs text-neutral-400">
            Nenhum hábito cadastrado ainda. Comece criando seu primeiro hábito diário!
          </div>
        ) : (
          habits.map((habit) => {
            const { streak, weeklyRate, completedInWeek, logDates } = getHabitStats(habit.id);

            return (
              <div
                key={habit.id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                        {streak} dias seguidos
                      </span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500 font-mono tabular-nums">
                        {completedInWeek}/7 dias ({weeklyRate}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-Day Interactive Matrix */}
                <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-1">
                  {displayDays.map((day) => {
                    const isDone = logDates.has(day.dateStr);

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => onToggleHabitDate(habit.id, day.dateStr)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-w-[44px] min-h-[50px] select-none active:scale-95 ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-xs font-bold'
                            : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                        } ${day.isToday ? 'ring-2 ring-blue-500/80 ring-offset-1 dark:ring-offset-neutral-900' : ''}`}
                        title={`${day.dateStr}: ${isDone ? 'Concluído' : 'Pendente'}`}
                      >
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${day.isToday ? 'text-blue-600 dark:text-blue-400 font-extrabold' : ''}`}>
                          {day.weekday}
                        </span>
                        <span className="text-xs font-mono font-bold mt-0.5">
                          {day.dayNum}
                        </span>
                        <div className="mt-1">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <Circle className="w-4 h-4 opacity-35" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Habit Actions */}
                <div className="flex items-center justify-end gap-2 md:w-16">
                  <button
                    type="button"
                    onClick={() => onDeleteHabit(habit.id)}
                    title="Excluir Hábito"
                    className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
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
