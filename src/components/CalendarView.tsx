import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Plus, 
  RefreshCw, 
  Download, 
  ExternalLink,
  CheckCircle2,
  Trash2,
  Bell
} from 'lucide-react';
import { CalendarEvent, Category, UserProfile } from '../types';
import { CalendarSyncService } from '../services/calendarSync';
import { getTodayDateString, formatDateYMD, isSameDay, parseLocalDate, formatDayOfWeekAndDate } from '../services/storage';

interface CalendarViewProps {
  events: CalendarEvent[];
  user: UserProfile;
  categories: Category[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onSyncGoogle: () => Promise<void>;
  onSyncApple: () => Promise<void>;
  onTriggerEventReminder: (event: CalendarEvent) => void;
}

type CalendarMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  user,
  categories,
  onAddEvent,
  onDeleteEvent,
  onSyncGoogle,
  onSyncApple,
  onTriggerEventReminder,
}) => {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  const todayStr = getTodayDateString();

  const handleDownloadICS = () => {
    CalendarSyncService.downloadICSFile(events, 'agenda-omniflow-365.ics');
  };

  const handleSyncGoogle = async () => {
    setIsSyncing(true);
    await onSyncGoogle();
    setIsSyncing(false);
  };

  const handleSyncApple = async () => {
    setIsSyncing(true);
    await onSyncApple();
    setIsSyncing(false);
  };

  // Date Navigation
  const prevPeriod = () => {
    const d = new Date(currentDate);
    if (calendarMode === 'month') d.setMonth(d.getMonth() - 1);
    if (calendarMode === 'week') d.setDate(d.getDate() - 7);
    if (calendarMode === 'day') d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextPeriod = () => {
    const d = new Date(currentDate);
    if (calendarMode === 'month') d.setMonth(d.getMonth() + 1);
    if (calendarMode === 'week') d.setDate(d.getDate() + 7);
    if (calendarMode === 'day') d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper formatting
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Get week days for the week view (Sunday to Saturday)
  const getWeekDays = (baseDate: Date) => {
    const d = parseLocalDate(baseDate);
    const day = d.getDay(); // 0 is Sunday
    const sunday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day, 12, 0, 0);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i, 12, 0, 0);
      week.push(nextDay);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);

  const getSourceBadge = (source: CalendarEvent['externalSource']) => {
    switch (source) {
      case 'google':
        return (
          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
            Google Calendar
          </span>
        );
      case 'apple':
        return (
          <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
            Apple Calendar (iOS)
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
            OmniFlow Local
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Sua Agenda
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 capitalize">
            {monthName} · Google & Apple Calendar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Nav */}
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1">
            <button
              onClick={prevPeriod}
              className="flex items-center justify-center min-h-[40px] min-w-[40px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={resetToToday}
              className="min-h-[40px] px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={nextPeriod}
              className="flex items-center justify-center min-h-[40px] min-w-[40px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setCalendarMode('month')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                calendarMode === 'month'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                calendarMode === 'week'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setCalendarMode('day')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                calendarMode === 'day'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500'
              }`}
            >
              Dia
            </button>
          </div>

          <button
            onClick={onAddEvent}
            className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Evento</span>
          </button>
        </div>
      </div>

      {/* 2-Way Sync Integration Status Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="font-semibold text-neutral-900 dark:text-white">Google Calendar:</span>
              <span className="text-neutral-500">Conectado (2-Way OAuth)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
              <span className="font-semibold text-neutral-900 dark:text-white">Apple Calendar:</span>
              <span className="text-neutral-500">EventKit nativo ativo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncGoogle}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Google</span>
            </button>
            <button
              onClick={handleSyncApple}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar Apple</span>
            </button>
            <button
              onClick={handleDownloadICS}
              title="Exportar arquivo .ics padrão para Apple Calendar ou Google Calendar"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar .ICS</span>
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR BODY */}

      {/* WEEK VIEW */}
      {calendarMode === 'week' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map((dayDate) => {
              const dayStr = formatDateYMD(dayDate);
              const isToday = isSameDay(dayDate, todayStr);
              const dayEvents = events
                .filter((e) => isSameDay(e.startTime, dayDate))
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

              return (
                <div
                  key={dayStr}
                  className={`rounded-xl border p-3 flex flex-col min-h-[320px] transition-colors ${
                    isToday
                      ? 'border-blue-500/50 bg-blue-50/20 dark:bg-blue-950/10'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs font-medium uppercase text-neutral-500">
                      {dayDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {dayDate.getDate()}
                    </span>
                  </div>

                  {/* Events list inside the day column */}
                  <div className="mt-2.5 space-y-2 flex-1">
                    {dayEvents.length === 0 ? (
                      <span className="text-[11px] text-neutral-400 block pt-4 text-center leading-tight">
                        Nenhum compromisso para este dia
                      </span>
                    ) : (
                      dayEvents.map((ev) => {
                        const startStr = new Date(ev.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div
                            key={ev.id}
                            className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-2xs group relative"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-1">
                                {ev.title}
                              </p>
                              <button
                                onClick={() => onDeleteEvent(ev.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 transition-opacity"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-500 font-mono">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{startStr}</span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between">
                              {getSourceBadge(ev.externalSource)}
                              <button
                                onClick={() => onTriggerEventReminder(ev)}
                                title="Simular Lembrete Pop-up"
                                className="text-neutral-400 hover:text-blue-500"
                              >
                                <Bell className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {calendarMode === 'day' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white uppercase tracking-wide">
                {formatDayOfWeekAndDate(currentDate)}
              </h3>
              <p className="text-xs text-neutral-500">Compromissos agendados para este dia</p>
            </div>
            <button
              onClick={onAddEvent}
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Novo Evento</span>
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {events
              .filter((e) => isSameDay(e.startTime, currentDate))
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
                  <CalendarIcon className="w-8 h-8 opacity-40" />
                  <span className="text-sm font-medium">Nenhum compromisso para este dia</span>
                </div>
              ) : (
                events
                  .filter((e) => isSameDay(e.startTime, currentDate))
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((ev) => {
                    const startStr = new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={ev.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors min-h-[52px]"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white break-words">
                              {ev.title}
                            </span>
                            {getSourceBadge(ev.externalSource)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              {startStr} - {endStr}
                            </span>
                            {ev.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="truncate max-w-[200px]">{ev.location}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800/60">
                          <button
                            onClick={() => onTriggerEventReminder(ev)}
                            title="Simular Lembrete"
                            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl cursor-pointer"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            title="Excluir"
                            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl cursor-pointer"
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
      )}

      {/* MONTH VIEW */}
      {calendarMode === 'month' && (() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0).getDay(); // 0 for Sunday
        const paddingCount = firstDayOfMonth;

        return (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs">
            <div className="text-center py-2">
              <p className="text-xs text-neutral-500 mb-4">
                Toque em qualquer dia para ver os compromissos detalhados.
              </p>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-neutral-400 pb-2">
                <span className="text-red-500 dark:text-red-400">Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span className="text-blue-500 dark:text-blue-400">Sáb</span>
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: paddingCount }).map((_, idx) => (
                  <div key={`pad-${idx}`} className="h-16 sm:h-20 rounded-xl bg-neutral-50/40 dark:bg-neutral-900/30 border border-dashed border-neutral-100 dark:border-neutral-800/40" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const cellDate = new Date(year, month, dayNum, 12, 0, 0);
                  const count = events.filter((e) => isSameDay(e.startTime, cellDate)).length;
                  const isToday = isSameDay(cellDate, todayStr);
                  const isSelected = isSameDay(cellDate, currentDate);

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => {
                        setCurrentDate(cellDate);
                        setCalendarMode('day');
                      }}
                      className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                          : isToday
                          ? 'border-blue-400 bg-blue-50/20 dark:bg-blue-950/20'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-mono font-bold ${
                          isToday ? 'text-blue-600 dark:text-blue-400 underline underline-offset-2' : 'text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {dayNum}
                        </span>
                        {isToday && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate bg-blue-50 dark:bg-blue-950/60 px-1 py-0.5 rounded">
                          {count} {count === 1 ? 'evento' : 'eventos'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
