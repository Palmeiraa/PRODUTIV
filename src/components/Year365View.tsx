import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  RotateCcw, 
  Archive, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Info,
  Clock
} from 'lucide-react';
import { YearCycle, DailyProgress } from '../types';
import { getDayOfYear, getTodayDateString } from '../services/storage';

interface Year365ViewProps {
  activeCycle: YearCycle;
  archivedCycles: YearCycle[];
  dailyProgress: DailyProgress[];
  onOpenResetModal: () => void;
}

export const Year365View: React.FC<Year365ViewProps> = ({
  activeCycle,
  archivedCycles,
  dailyProgress,
  onOpenResetModal,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyProgress | null>(null);
  const today = getTodayDateString();
  const isFreshCycle = activeCycle.totalDaysCompleted === 1 && (dailyProgress.length <= 1 || activeCycle.startDate === today);
  const currentDay = isFreshCycle ? 1 : Math.max(1, activeCycle.totalDaysCompleted || getDayOfYear(today));
  const totalYearDays = 365;
  const yearProgressPercent = isFreshCycle && (dailyProgress[0]?.productivityScore || 0) === 0
    ? 0
    : Math.min(100, Number(((currentDay / totalYearDays) * 100).toFixed(1)));
  const daysRemaining = totalYearDays - currentDay;

  // Calculate consistency statistics
  const loggedDays = isFreshCycle ? 0 : dailyProgress.length;
  const consistentDays = isFreshCycle ? 0 : dailyProgress.filter((d) => d.productivityScore >= 50).length;
  const averageProductivity = isFreshCycle ? 0 : (loggedDays > 0 
    ? Math.round(dailyProgress.reduce((acc, curr) => acc + curr.productivityScore, 0) / loggedDays)
    : 0);

  // Calculate current streak
  let currentStreak = 0;
  if (!isFreshCycle) {
    for (let i = dailyProgress.length - 1; i >= 0; i--) {
      if (dailyProgress[i].productivityScore >= 40) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Build GitHub-style 53 weeks x 7 days grid
  // Days of week: 0 (Sun), 1 (Mon) ... 6 (Sat)
  const currentYear = activeCycle.year;
  const yearStart = new Date(currentYear, 0, 1);
  const firstDayOfWeek = yearStart.getDay(); // 0-6

  // 53 columns (weeks), 7 rows (days)
  const weeksGrid: (DailyProgress | null)[][] = [];
  let currentWeek: (DailyProgress | null)[] = [];

  // Pad beginning of first week
  for (let p = 0; p < firstDayOfWeek; p++) {
    currentWeek.push(null);
  }

  // Pre-index progress map by date
  const progressByDate = new Map<string, DailyProgress>();
  dailyProgress.forEach((p) => progressByDate.set(p.date, p));

  // Iterate all 365 days of the year
  for (let d = 1; d <= totalYearDays; d++) {
    const dayDate = new Date(currentYear, 0, d);
    const dateStr = dayDate.toISOString().split('T')[0];
    const prog = progressByDate.get(dateStr) || {
      id: `virtual-${dateStr}`,
      cycleId: activeCycle.id,
      date: dateStr,
      dayNumber: d,
      tasksCompletedCount: 0,
      tasksTotalCount: 0,
      habitsCompletedCount: 0,
      habitsTotalCount: 0,
      productivityScore: 0,
      notesCreatedCount: 0,
    };

    currentWeek.push(prog);

    if (currentWeek.length === 7) {
      weeksGrid.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeksGrid.push(currentWeek);
  }

  // Color intensity scale
  const getCellColor = (item: DailyProgress | null) => {
    if (!item) return 'bg-transparent';
    if (item.dayNumber > currentDay) {
      return 'bg-neutral-100 dark:bg-neutral-800/40 border border-dashed border-neutral-200 dark:border-neutral-800';
    }
    const score = item.productivityScore;
    if (score === 0) return 'bg-neutral-100 dark:bg-neutral-800';
    if (score < 30) return 'bg-emerald-200 dark:bg-emerald-950 text-emerald-800';
    if (score < 60) return 'bg-emerald-400 dark:bg-emerald-800 text-emerald-950';
    if (score < 85) return 'bg-emerald-500 dark:bg-emerald-600 text-white';
    return 'bg-emerald-600 dark:bg-emerald-500 text-white font-bold';
  };

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Reset Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SISTEMA DE ACOMPANHAMENTO ANUAL · CICLO ATIVO</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Progresso de 365 Dias ({activeCycle.year})
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Acompanhamento diário visual de produtividade, consistência e hábitos acumulados
          </p>
        </div>

        {/* Safety Reset Button */}
        <button
          onClick={onOpenResetModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-red-300 dark:hover:border-red-900/60 hover:text-red-600 dark:hover:text-red-400 rounded-xl shadow-2xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-red-500" />
          <span>Resetar Ciclo de 365 Dias</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Dia do Ano</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white">
              {currentDay}
            </span>
            <span className="text-xs text-neutral-500">/ 365</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{daysRemaining} dias restantes</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Progresso do Ano</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {yearProgressPercent}%
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Concluído do ciclo</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Sequência Atual (Streak)</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {currentStreak} dias
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Consistência ininterrupta</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Produtividade Média</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-purple-600 dark:text-purple-400">
              {averageProductivity}%
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Média ponderada do ciclo</p>
        </div>

      </div>

      {/* HEATMAP CARD: Full 365 Days Grid (GitHub style) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Mapa de Consistência Anual (Heatmap 365)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Intensidade proporcional a tarefas concluídas e hábitos cumpridos no dia
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>Menos</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-xs bg-neutral-100 dark:bg-neutral-800" />
              <span className="w-3 h-3 rounded-xs bg-emerald-200 dark:bg-emerald-950" />
              <span className="w-3 h-3 rounded-xs bg-emerald-400 dark:bg-emerald-800" />
              <span className="w-3 h-3 rounded-xs bg-emerald-500 dark:bg-emerald-600" />
              <span className="w-3 h-3 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
            </div>
            <span>Mais</span>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div className="overflow-x-auto pb-2">
          {/* Months Labels */}
          <div className="flex justify-between text-[10px] text-neutral-400 font-medium px-4 mb-1 min-w-[760px]">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>

          {/* 7 rows x 53 columns */}
          <div className="flex gap-1 min-w-[760px] p-2 bg-neutral-50/50 dark:bg-neutral-950/40 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
            {weeksGrid.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((dayItem, dIdx) => (
                  <button
                    key={dIdx}
                    onMouseEnter={() => dayItem && setHoveredDay(dayItem)}
                    onClick={() => dayItem && setHoveredDay(dayItem)}
                    className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-135 focus:outline-none cursor-pointer ${getCellColor(
                      dayItem
                    )}`}
                    title={
                      dayItem
                        ? `${dayItem.date}: Dia ${dayItem.dayNumber} · Produtividade ${dayItem.productivityScore}%`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Hovered Day Inspection Drawer */}
        {hoveredDay && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-neutral-900 dark:text-white">
                {hoveredDay.date} (Dia {hoveredDay.dayNumber} / 365)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                {hoveredDay.productivityScore}% produtividade
              </span>
            </div>

            <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-300 font-mono">
              <span>{hoveredDay.tasksCompletedCount} tarefas concluídas</span>
              <span>·</span>
              <span>{hoveredDay.habitsCompletedCount} hábitos cumpridos</span>
            </div>
          </div>
        )}
      </div>

      {/* ARCHIVED CYCLES HISTORY */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
            Histórico de Ciclos Anteriores Arquivados
          </h3>
        </div>

        {archivedCycles.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            Nenhum ciclo anterior arquivado. Este é o seu primeiro ciclo ativo!
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {archivedCycles.map((cycle) => (
              <div key={cycle.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      Ciclo {cycle.year}
                    </span>
                    <span className="text-neutral-400">({cycle.startDate} até {cycle.endDate})</span>
                  </div>
                  {cycle.notes && (
                    <p className="text-neutral-500 mt-0.5 text-[11px]">{cycle.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 font-mono tabular-nums text-neutral-600 dark:text-neutral-300">
                  <span>{cycle.totalDaysCompleted} dias registrados</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {cycle.productivityScoreAverage}% média
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER DANGER PANEL: Resetar Ciclo dos 365 Dias */}
      <div className="bg-red-50/60 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>Zona de Reinicialização: Ciclo de 365 Dias</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
            Deseja recomeçar o contador anual? O histórico dos 365 dias deste ciclo será arquivado com segurança e o contador voltará ao <strong className="text-neutral-900 dark:text-white">Dia 1</strong> para um novo ciclo de produtividade.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenResetModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Resetar Ciclo dos 365 Dias</span>
        </button>
      </div>

    </div>
  );
};
