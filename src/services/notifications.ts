import { ScheduledReminder, Task, CalendarEvent } from '../types';
import { playReminderChime } from './audio';

type ReminderListener = (reminder: ScheduledReminder) => void;
type ResponseListener = (data: { route: string; id?: string }) => void;

class NotificationManager {
  private listeners: ReminderListener[] = [];
  private responseListeners: ResponseListener[] = [];
  private activeReminders: ScheduledReminder[] = [];
  private isBrowserNotificationSupported = typeof window !== 'undefined' && 'Notification' in window;

  constructor() {
    if (typeof window !== 'undefined') {
      // Start periodic checker every 20 seconds
      setInterval(() => this.checkScheduledTriggers(), 20000);
    }
  }

  public subscribe(listener: ReminderListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public onNotificationResponse(listener: ResponseListener): () => void {
    this.responseListeners.push(listener);
    return () => {
      this.responseListeners = this.responseListeners.filter((l) => l !== listener);
    };
  }

  public handleNotificationClick(data?: { route: string; id?: string }) {
    if (!data) return;
    this.responseListeners.forEach((l) => l(data));
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isBrowserNotificationSupported) return 'denied';
    return await Notification.requestPermission();
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isBrowserNotificationSupported) return 'denied';
    return Notification.permission;
  }

  public triggerReminder(reminder: ScheduledReminder) {
    playReminderChime();
    this.activeReminders.push(reminder);

    // Try system notification if allowed, attaching the specific data payload
    if (this.isBrowserNotificationSupported && Notification.permission === 'granted') {
      try {
        const sysNotification = new Notification(reminder.title, {
          body: reminder.message,
          icon: '/favicon.ico',
          data: reminder.data,
        });

        sysNotification.onclick = (e) => {
          e.preventDefault();
          window.focus();
          if (reminder.data) {
            this.handleNotificationClick(reminder.data);
          }
          sysNotification.close();
        };
      } catch {
        // Fallback to in-app toast/modal
      }
    }

    // Broadcast to in-app modal listeners
    this.listeners.forEach((listener) => listener(reminder));
  }

  public triggerTaskReminder(task: Task) {
    // Specific immutable copy for this task reminder
    const reminder: ScheduledReminder = {
      id: `task-rem-${task.id}-${Date.now()}`,
      title: `⏰ Lembrete de Tarefa: ${task.title}`,
      message: task.description || 'Sua tarefa agendada atingiu o horário estipulado. Deseja concluir agora ou abrir a lista de tarefas?',
      type: 'task',
      dueTime: task.dueTime || 'Agora',
      targetId: task.id,
      data: {
        route: 'Tarefas',
        id: task.id,
        taskId: task.id,
        type: 'task',
      },
    };
    this.triggerReminder(reminder);
  }

  public triggerEventReminder(event: CalendarEvent) {
    // Specific immutable copy for this event reminder
    const reminder: ScheduledReminder = {
      id: `ev-rem-${event.id}-${Date.now()}`,
      title: `📅 Próximo Compromisso: ${event.title}`,
      message: `Local: ${event.location || 'Sem local'} · Início às ${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      type: 'event',
      dueTime: new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      targetId: event.id,
      data: {
        route: 'Agenda',
        id: event.id,
        eventId: event.id,
        type: 'event',
      },
    };
    this.triggerReminder(reminder);
  }

  public triggerMorningDigest(todayTasksCount: number, todayEventsCount: number) {
    const reminder: ScheduledReminder = {
      id: `morning-${Date.now()}`,
      title: '☀️ Bom dia! Seu Resumo de Produtividade',
      message: `Você tem ${todayTasksCount} tarefa(s) prioritária(s) e ${todayEventsCount} compromisso(s) na agenda hoje. Prepare sua energia e vença o dia!`,
      type: 'morning_summary',
      dueTime: '08:00',
      data: {
        route: 'Dashboard',
        type: 'morning_summary',
      },
    };
    this.triggerReminder(reminder);
  }

  public triggerNightCheckin(pendingHabitsCount: number, currentStreak: number) {
    const reminder: ScheduledReminder = {
      id: `night-${Date.now()}`,
      title: '🌙 Revisão Noturna & Check-in 365 Dias',
      message: pendingHabitsCount > 0 
        ? `Você ainda tem ${pendingHabitsCount} hábito(s) para registrar hoje! Mantenha sua sequência de ${currentStreak} dias firme no Heatmap.`
        : `Parabéns! Todos os hábitos de hoje foram concluídos. Sua sequência de ${currentStreak} dias está brilhando no Heatmap!`,
      type: 'night_checkin',
      dueTime: '21:00',
      data: {
        route: '365',
        type: 'night_checkin',
      },
    };
    this.triggerReminder(reminder);
  }

  private checkScheduledTriggers() {
    // Routine check comparing current time HH:mm
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
}

export const notificationManager = new NotificationManager();
