import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header, NavTab } from './components/Header';
import { NotificationPopup } from './components/NotificationPopup';
import { ResetCycleModal } from './components/ResetCycleModal';
import { QuickAddModal } from './components/QuickAddModal';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { CalendarView } from './components/CalendarView';
import { NotesView } from './components/NotesView';
import { Year365View } from './components/Year365View';
import { HabitsView } from './components/HabitsView';
import { ArchitectureView } from './components/ArchitectureView';

import { 
  UserProfile, 
  Category, 
  Task, 
  CalendarEvent, 
  Note, 
  Habit, 
  HabitLog, 
  YearCycle, 
  DailyProgress, 
  ScheduledReminder,
  EisenhowerQuadrant,
  Priority,
  ExternalSource
} from './types';
import { StorageService, getTodayDateString, getDayOfYear } from './services/storage';
import { playCheckmarkSound } from './services/audio';
import { notificationManager } from './services/notifications';
import { CalendarSyncService } from './services/calendarSync';

const THEME_STORAGE_KEY = 'omniflow_theme_mode';

export default function App() {
  // Theme state persisted in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'dark';
      }
    }
    return true; // default dark
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeNoteId, setActiveNoteId] = useState<string>('');

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isResetCycleOpen, setIsResetCycleOpen] = useState(false);

  // Active Reminders pop-ups
  const [activeReminders, setActiveReminders] = useState<ScheduledReminder[]>([]);

  // Navigation router for notification payload
  const handleNotificationResponse = (data?: { route?: string; id?: string }) => {
    if (!data || !data.route) return;
    const route = data.route.toLowerCase();
    if (route === 'agenda' || route === 'calendar') {
      setActiveTab('calendar');
    } else if (route === 'tarefas' || route === 'tasks') {
      setActiveTab('tasks');
    } else if (route === '365' || route === 'year365') {
      setActiveTab('year365');
    } else if (route === 'notas' || route === 'notes') {
      setActiveTab('notes');
      if (data.id) setActiveNoteId(data.id);
    } else if (route === 'dashboard') {
      setActiveTab('dashboard');
    }
  };

  // Persistent Domain States
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [events, setEvents] = useState<CalendarEvent[]>(() => StorageService.getEvents());
  const [notes, setNotes] = useState<Note[]>(() => StorageService.getNotes());
  const [habits, setHabits] = useState<Habit[]>(() => StorageService.getHabits());
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => StorageService.getHabitLogs());
  const [activeCycle, setActiveCycle] = useState<YearCycle>(() => StorageService.getActiveCycle());
  const [archivedCycles, setArchivedCycles] = useState<YearCycle[]>(() => StorageService.getArchivedCycles());
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>(() => StorageService.getDailyProgress());

  // Subscribe to Notification Manager for scheduled pop-ups and external responses
  useEffect(() => {
    const unsubReminder = notificationManager.subscribe((reminder) => {
      setActiveReminders((prev) => [reminder, ...prev]);
    });
    const unsubResponse = notificationManager.onNotificationResponse((data) => {
      handleNotificationResponse(data);
    });
    return () => {
      unsubReminder();
      unsubResponse();
    };
  }, []);

  // Update theme class on HTML element and persist preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Recalculate today's progress score
  const updateTodayProgress = (updatedTasks: Task[], updatedLogs: HabitLog[]) => {
    const today = getTodayDateString();
    const dayNum = getDayOfYear(today);

    const todayTasks = updatedTasks.filter((t) => t.dueDate === today);
    const tasksCompleted = todayTasks.filter((t) => t.isCompleted).length;
    const tasksTotal = Math.max(1, todayTasks.length);

    const todayLogs = updatedLogs.filter((l) => l.completedDate === today);
    const habitsCompleted = todayLogs.length;
    const habitsTotal = Math.max(1, habits.length);

    const taskRatio = tasksCompleted / tasksTotal;
    const habitRatio = habitsCompleted / habitsTotal;
    const score = Math.min(100, Math.round((taskRatio * 0.5 + habitRatio * 0.5) * 100));

    setDailyProgress((prev) => {
      const existingIdx = prev.findIndex((p) => p.date === today);
      let updated: DailyProgress[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          tasksCompletedCount: tasksCompleted,
          tasksTotalCount: tasksTotal,
          habitsCompletedCount: habitsCompleted,
          habitsTotalCount: habitsTotal,
          productivityScore: score,
        };
      } else {
        const newProg: DailyProgress = {
          id: `prog-${today}`,
          cycleId: activeCycle.id,
          date: today,
          dayNumber: dayNum,
          tasksCompletedCount: tasksCompleted,
          tasksTotalCount: tasksTotal,
          habitsCompletedCount: habitsCompleted,
          habitsTotalCount: habitsTotal,
          productivityScore: score,
          notesCreatedCount: 0,
        };
        updated = [...prev, newProg];
      }
      StorageService.saveDailyProgress(updated);
      return updated;
    });
  };

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const willComplete = !t.isCompleted;
        if (willComplete) {
          playCheckmarkSound();
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.85 },
            colors: ['#3B82F6', '#10B981', '#F59E0B'],
          });
        }
        return {
          ...t,
          isCompleted: willComplete,
          completedAt: willComplete ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    setTasks(nextTasks);
    StorageService.saveTasks(nextTasks);
    updateTodayProgress(nextTasks, habitLogs);
  };

  const handleDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(nextTasks);
    StorageService.saveTasks(nextTasks);
    updateTodayProgress(nextTasks, habitLogs);
  };

  const handleUpdateQuadrant = (taskId: string, quadrant: EisenhowerQuadrant) => {
    const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, quadrant, updatedAt: new Date().toISOString() } : t));
    setTasks(nextTasks);
    StorageService.saveTasks(nextTasks);
  };

  // Calendar Event Handlers
  const handleDeleteEvent = (id: string) => {
    const nextEvents = events.filter((e) => e.id !== id);
    setEvents(nextEvents);
    StorageService.saveEvents(nextEvents);
  };

  const handleSyncGoogle = async () => {
    const result = await CalendarSyncService.syncWithGoogleCalendar(events);
    setEvents(result.syncedEvents);
    StorageService.saveEvents(result.syncedEvents);
    const updatedUser = {
      ...user,
      googleCalendarConnected: true,
      googleCalendarLastSync: new Date().toISOString(),
    };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  const handleSyncApple = async () => {
    const result = await CalendarSyncService.syncWithAppleCalendar(events);
    setEvents(result.syncedEvents);
    StorageService.saveEvents(result.syncedEvents);
    const updatedUser = {
      ...user,
      appleCalendarConnected: true,
      appleCalendarLastSync: new Date().toISOString(),
    };
    setUser(updatedUser);
    StorageService.saveUser(updatedUser);
  };

  // Note Handlers
  const handleSaveNote = (updatedNote: Note) => {
    const nextNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(nextNotes);
    StorageService.saveNotes(nextNotes);
  };

  const handleDeleteNote = (noteId: string) => {
    // Delete note and any direct subpages
    const nextNotes = notes.filter((n) => n.id !== noteId && n.parentNoteId !== noteId);
    setNotes(nextNotes);
    StorageService.saveNotes(nextNotes);
  };

  const handleCreateSubpage = (parentNoteId: string) => {
    const parent = notes.find((n) => n.id === parentNoteId);
    const newSub: Note = {
      id: `note-sub-${Date.now()}`,
      categoryId: parent?.categoryId || 'cat-work',
      parentNoteId,
      title: 'Nova Subpágina',
      content: 'Comece a detalhar o conteúdo desta subpágina...',
      icon: '📄',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextNotes = [...notes, newSub];
    setNotes(nextNotes);
    StorageService.saveNotes(nextNotes);
    setActiveNoteId(newSub.id);
  };

  // Habit Handlers
  const handleToggleHabit = (habitId: string) => {
    const today = getTodayDateString();
    handleToggleHabitDate(habitId, today);
  };

  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    const exists = habitLogs.some((l) => l.habitId === habitId && l.completedDate === dateStr);
    let nextLogs: HabitLog[];

    if (exists) {
      nextLogs = habitLogs.filter((l) => !(l.habitId === habitId && l.completedDate === dateStr));
    } else {
      playCheckmarkSound();
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10B981', '#34D399'],
      });
      const newLog: HabitLog = {
        id: `log-${habitId}-${dateStr}-${Date.now()}`,
        habitId,
        completedDate: dateStr,
        createdAt: new Date().toISOString(),
      };
      nextLogs = [...habitLogs, newLog];
    }

    setHabitLogs(nextLogs);
    StorageService.saveHabitLogs(nextLogs);
    updateTodayProgress(tasks, nextLogs);
  };

  const handleDeleteHabit = (habitId: string) => {
    const nextHabits = habits.filter((h) => h.id !== habitId);
    const nextLogs = habitLogs.filter((l) => l.habitId !== habitId);
    setHabits(nextHabits);
    setHabitLogs(nextLogs);
    StorageService.saveHabits(nextHabits);
    StorageService.saveHabitLogs(nextLogs);
  };

  // Cycle Reset Action
  const handleConfirmResetCycle = (reason?: string) => {
    // 1. Limpa os registros do progresso local
    localStorage.removeItem('daily_progress');
    localStorage.removeItem('year_cycle');

    // 2. Executa o reset completo e persistente no StorageService
    const { oldCycle, newCycle } = StorageService.resetYearCycle(reason);

    // 3. Reinicia o estado do ciclo para o Dia 1 com 0% de progresso
    setActiveCycle(newCycle);
    setArchivedCycles(StorageService.getArchivedCycles());
    const freshDaily = StorageService.getDailyProgress();
    setDailyProgress(freshDaily);

    // Notificação imediata de confirmação
    notificationManager.triggerReminder({
      id: `reset-alert-${Date.now()}`,
      title: '✅ Ciclo Zerado com Sucesso!',
      message: 'O ciclo anterior foi arquivado no histórico. Você está no Dia 1 com 0% de progresso.',
      type: 'morning_summary',
      dueTime: 'Agora',
      data: {
        route: '365',
        type: 'night_checkin'
      }
    });
  };

  // Expose global handler for direct script/console triggers
  useEffect(() => {
    (window as any).handleReset365Cycle = () => {
      handleConfirmResetCycle('Reinício do ciclo via script');
    };
  }, []);

  // Notification Dismiss / Snooze
  const handleDismissReminder = (id: string) => {
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSnoozeReminder = (id: string, minutes: number) => {
    handleDismissReminder(id);
    // In actual production app with expo-notifications, re-schedule after +15m
  };

  // Quick Add Creation Callbacks
  const handleCreateTaskFromModal = (data: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    priority: Priority;
    quadrant: EisenhowerQuadrant;
    categoryId: string;
    reminderMinutesBefore: number;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      priority: data.priority,
      quadrant: data.quadrant,
      categoryId: data.categoryId,
      reminderMinutesBefore: data.reminderMinutesBefore,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    StorageService.saveTasks(nextTasks);
    updateTodayProgress(nextTasks, habitLogs);
  };

  const handleCreateEventFromModal = (data: {
    title: string;
    location: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    categoryId: string;
    externalSource: ExternalSource;
  }) => {
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: data.title,
      location: data.location,
      startTime: data.startTime,
      endTime: data.endTime,
      isAllDay: data.isAllDay,
      categoryId: data.categoryId,
      externalSource: data.externalSource,
      reminderMinutesBefore: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextEvents = [newEvent, ...events];
    setEvents(nextEvents);
    StorageService.saveEvents(nextEvents);
  };

  const handleCreateHabitFromModal = (data: {
    title: string;
    description: string;
    targetDaysPerWeek: number;
    colorHex: string;
    categoryId: string;
  }) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: data.title,
      description: data.description,
      frequencyType: 'daily',
      targetDaysPerWeek: data.targetDaysPerWeek,
      colorHex: data.colorHex,
      categoryId: data.categoryId,
      createdAt: new Date().toISOString(),
    };
    const nextHabits = [...habits, newHabit];
    setHabits(nextHabits);
    StorageService.saveHabits(nextHabits);
  };

  const handleCreateNoteFromModal = (data: {
    title: string;
    categoryId: string;
  }) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: data.title,
      categoryId: data.categoryId,
      parentNoteId: null,
      content: `# ${data.title}\n\nEscreva suas notas aqui...`,
      icon: '📝',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const nextNotes = [newNote, ...notes];
    setNotes(nextNotes);
    StorageService.saveNotes(nextNotes);
    setActiveNoteId(newNote.id);
    setActiveTab('notes');
  };

  // Lembretes & Digest Triggers
  const triggerMorningDigest = () => {
    const today = getTodayDateString();
    const todayTasksCount = tasks.filter((t) => t.dueDate === today && !t.isCompleted).length;
    const todayEventsCount = events.filter((e) => e.startTime.startsWith(today)).length;
    notificationManager.triggerMorningDigest(todayTasksCount, todayEventsCount);
  };

  const triggerNightCheckin = () => {
    const today = getTodayDateString();
    const todayHabitLogs = habitLogs.filter((l) => l.completedDate === today);
    const pendingHabitsCount = Math.max(0, habits.length - todayHabitLogs.length);
    notificationManager.triggerNightCheckin(pendingHabitsCount, 14);
  };

  const triggerTaskReminder = (task: Task) => {
    notificationManager.triggerTaskReminder(task);
  };

  const triggerEventReminder = (event: CalendarEvent) => {
    notificationManager.triggerEventReminder(event);
  };

  const handleRestoreDemoData = () => {
    if (confirm('Deseja restaurar todos os dados para o padrão de demonstração?')) {
      StorageService.resetToDemoState();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col">
      
      {/* Strict 3-Zone Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onTriggerNotificationTest={() => {
          if (tasks.length > 0) {
            triggerTaskReminder(tasks[0]);
          } else {
            triggerMorningDigest();
          }
        }}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            events={events}
            habits={habits}
            habitLogs={habitLogs}
            activeCycle={activeCycle}
            categories={categories}
            onToggleTask={handleToggleTask}
            onToggleHabit={handleToggleHabit}
            onNavigateTab={setActiveTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onTriggerMorningTest={triggerMorningDigest}
            onTriggerNightTest={triggerNightCheckin}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            categories={categories}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateQuadrant={handleUpdateQuadrant}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onTriggerTaskReminder={triggerTaskReminder}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            user={user}
            categories={categories}
            onAddEvent={() => setIsQuickAddOpen(true)}
            onDeleteEvent={handleDeleteEvent}
            onSyncGoogle={handleSyncGoogle}
            onSyncApple={handleSyncApple}
            onTriggerEventReminder={triggerEventReminder}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            categories={categories}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onCreateSubpage={handleCreateSubpage}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            initialSelectedNoteId={activeNoteId}
          />
        )}

        {activeTab === 'year365' && (
          <Year365View
            activeCycle={activeCycle}
            archivedCycles={archivedCycles}
            dailyProgress={dailyProgress}
            onOpenResetModal={() => setIsResetCycleOpen(true)}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            habitLogs={habitLogs}
            onToggleHabitDate={handleToggleHabitDate}
            onDeleteHabit={handleDeleteHabit}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView
            onTriggerMorningTest={triggerMorningDigest}
            onTriggerNightTest={triggerNightCheckin}
            onRestoreDemoData={handleRestoreDemoData}
          />
        )}
      </main>

      {/* Pop-up Scheduled Reminders & Toasts */}
      <NotificationPopup
        reminders={activeReminders}
        onDismiss={handleDismissReminder}
        onCompleteTask={handleToggleTask}
        onSnooze={handleSnoozeReminder}
        onViewDetails={(reminder) => {
          handleNotificationResponse(
            reminder.data || {
              route: reminder.type === 'event' ? 'Agenda' : 'Tarefas',
              id: reminder.targetId,
            }
          );
        }}
      />

      {/* Quick Add Universal Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onCreateTask={handleCreateTaskFromModal}
        onCreateEvent={handleCreateEventFromModal}
        onCreateHabit={handleCreateHabitFromModal}
        onCreateNote={handleCreateNoteFromModal}
      />

      {/* Safety Double-Confirmation 365 Cycle Reset Modal */}
      <ResetCycleModal
        isOpen={isResetCycleOpen}
        activeCycle={activeCycle}
        onClose={() => setIsResetCycleOpen(false)}
        onConfirmReset={handleConfirmResetCycle}
      />
    </div>
  );
}
