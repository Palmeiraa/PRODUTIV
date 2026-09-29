export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type EisenhowerQuadrant = 
  | 'urgent-important'       // Q1: Do First (Fazer Agora)
  | 'not-urgent-important'   // Q2: Schedule (Agendar / Decidir)
  | 'urgent-not-important'   // Q3: Delegate (Delegar)
  | 'not-urgent-not-important'; // Q4: Eliminate (Eliminar)

export type ExternalSource = 'app' | 'google' | 'apple';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  timezone: string;
  themePreference: 'light' | 'dark' | 'system';
  dailySummaryMorningTime: string; // e.g. "08:00"
  dailySummaryNightTime: string;   // e.g. "21:00"
  googleCalendarConnected: boolean;
  googleCalendarLastSync?: string;
  appleCalendarConnected: boolean;
  appleCalendarLastSync?: string;
}

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  icon: string;
}

export interface Task {
  id: string;
  categoryId?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  quadrant: EisenhowerQuadrant;
  reminderMinutesBefore?: number;
  reminderAt?: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  categoryId?: string;
  title: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isAllDay: boolean;
  reminderMinutesBefore: number;
  externalSource: ExternalSource;
  externalEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  categoryId?: string;
  parentNoteId?: string | null;
  title: string;
  content: string; // Markdown or rich text
  icon?: string;
  coverGradient?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  categoryId?: string;
  title: string;
  description?: string;
  frequencyType: 'daily' | 'weekly';
  targetDaysPerWeek: number;
  colorHex: string;
  icon?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  completedDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface YearCycle {
  id: string;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  isActive: boolean;
  resetAt?: string;
  createdAt: string;
  totalDaysCompleted: number;
  productivityScoreAverage: number;
  notes?: string;
}

export interface DailyProgress {
  id: string;
  cycleId: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1-365
  tasksCompletedCount: number;
  tasksTotalCount: number;
  habitsCompletedCount: number;
  habitsTotalCount: number;
  productivityScore: number; // 0 - 100
  notesCreatedCount: number;
}

export interface ScheduledReminder {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'event' | 'morning_summary' | 'night_checkin';
  dueTime: string;
  targetId?: string;
  snoozedUntil?: string;
  data?: {
    route: 'Agenda' | 'Tarefas' | '365' | 'Notas' | 'Dashboard';
    id?: string;
    [key: string]: any;
  };
}
