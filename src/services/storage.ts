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
} from '../types';

const STORAGE_KEYS = {
  USER: 'omniflow_user_v1',
  CATEGORIES: 'omniflow_categories_v1',
  TASKS: 'omniflow_tasks_v1',
  EVENTS: 'omniflow_events_v1',
  NOTES: 'omniflow_notes_v1',
  HABITS: 'omniflow_habits_v1',
  HABIT_LOGS: 'omniflow_habit_logs_v1',
  CYCLES: 'omniflow_cycles_v1',
  ARCHIVED_CYCLES: 'omniflow_archived_cycles_v1',
  DAILY_PROGRESS: 'omniflow_daily_progress_v1',
};

// Default Categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Trabalho', colorHex: '#3B82F6', icon: 'Briefcase' },
  { id: 'cat-personal', name: 'Pessoal', colorHex: '#10B981', icon: 'User' },
  { id: 'cat-health', name: 'Saúde & Fitness', colorHex: '#EF4444', icon: 'Heart' },
  { id: 'cat-study', name: 'Estudos & Leitura', colorHex: '#8B5CF6', icon: 'BookOpen' },
  { id: 'cat-projects', name: 'Projetos', colorHex: '#F59E0B', icon: 'Folder' },
];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(val?: string | Date): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  const str = String(val).trim();
  const dateOnly = str.includes('T') ? str.split('T')[0] : str.slice(0, 10);
  const parts = dateOnly.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0); // Meio-dia evita desvios de timezone
  }
  return new Date(val);
}

export function formatDayOfWeekAndDate(dateVal: string | Date): string {
  const d = parseLocalDate(dateVal);
  const weekdayNames = [
    'DOMINGO',
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO'
  ];
  const monthNames = [
    'JANEIRO',
    'FEVEREIRO',
    'MARÇO',
    'ABRIL',
    'MAIO',
    'JUNHO',
    'JULHO',
    'AGOSTO',
    'SETEMBRO',
    'OUTUBRO',
    'NOVEMBRO',
    'DEZEMBRO'
  ];

  const weekday = weekdayNames[d.getDay()];
  const day = String(d.getDate()).padStart(2, '0');
  const month = monthNames[d.getMonth()];
  return `${weekday}, ${day} DE ${month}`;
}

export function isSameDay(date1?: string | Date, date2?: string | Date): boolean {
  if (!date1 || !date2) return false;
  
  const extractYMD = (val: string | Date): string => {
    if (val instanceof Date) {
      return formatDateYMD(val);
    }
    const str = String(val).trim();
    if (str.includes('T')) {
      return str.split('T')[0];
    }
    return str.slice(0, 10);
  };

  return extractYMD(date1) === extractYMD(date2);
}

export function getDayOfYear(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

// Generate realistic seed data for 365 Days
function generateInitialDailyProgress(cycleId: string, currentYear: number): DailyProgress[] {
  const list: DailyProgress[] = [];
  const today = new Date();
  const currentDayOfYear = getDayOfYear(getTodayDateString());

  // Populate for every day from Jan 1 up to today
  for (let dayNum = 1; dayNum <= currentDayOfYear; dayNum++) {
    const d = new Date(currentYear, 0, dayNum);
    const dateStr = d.toISOString().split('T')[0];
    
    // Create organic variation: higher consistency recently, some rest days on weekends
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let baseScore = 65 + Math.sin(dayNum / 5) * 25 + (Math.random() * 15 - 7);
    if (isWeekend) baseScore = Math.max(30, baseScore - 20);
    const score = Math.max(15, Math.min(100, Math.round(baseScore)));

    const tasksTotal = 4 + (dayNum % 3);
    const tasksCompleted = Math.round((score / 100) * tasksTotal);
    const habitsTotal = 4;
    const habitsCompleted = Math.round((score / 100) * habitsTotal);

    list.push({
      id: `prog-${dateStr}`,
      cycleId,
      date: dateStr,
      dayNumber: dayNum,
      tasksCompletedCount: tasksCompleted,
      tasksTotalCount: tasksTotal,
      habitsCompletedCount: habitsCompleted,
      habitsTotalCount: habitsTotal,
      productivityScore: score,
      notesCreatedCount: dayNum % 4 === 0 ? 1 : 0,
    });
  }
  return list;
}

export class StorageService {
  static getUser(): UserProfile {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const defaultUser: UserProfile = {
      id: 'user-default-1',
      name: 'Gabriel Palmeira',
      email: 'gabriel.palmeira100@gmail.com',
      timezone: 'America/Sao_Paulo',
      themePreference: 'dark',
      dailySummaryMorningTime: '08:00',
      dailySummaryNightTime: '21:00',
      googleCalendarConnected: true,
      googleCalendarLastSync: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      appleCalendarConnected: true,
      appleCalendarLastSync: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    };
    this.saveUser(defaultUser);
    return defaultUser;
  }

  static saveUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getCategories(): Category[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }

  static getTasks(): Task[] {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const today = getTodayDateString();
    const initialTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Revisar arquitetura do motor Offline-First com SQLite & Supabase',
        description: 'Verificar estratégias de sincronização bidirecional e tratamento de conflitos no WatermelonDB.',
        categoryId: 'cat-work',
        priority: 'urgent',
        quadrant: 'urgent-important',
        isCompleted: false,
        dueDate: today,
        dueTime: '11:00',
        reminderMinutesBefore: 15,
        reminderAt: `${today}T10:45:00`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        title: 'Planejar ciclo de lançamentos e metas Q4',
        description: 'Definir OKRs de produto e alinhar cronograma com stakeholders.',
        categoryId: 'cat-work',
        priority: 'high',
        quadrant: 'not-urgent-important',
        isCompleted: false,
        dueDate: today,
        dueTime: '14:30',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        title: 'Responder solicitações urgentes de suporte no Discord',
        description: 'Triagem de dúvidas técnicas sobre a API v3.',
        categoryId: 'cat-work',
        priority: 'medium',
        quadrant: 'urgent-not-important',
        isCompleted: false,
        dueDate: today,
        dueTime: '16:00',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-4',
        title: 'Organizar downloads antigos e limpar cache de builds',
        description: 'Remover imagens Docker intermediárias e arquivos temporários.',
        categoryId: 'cat-personal',
        priority: 'low',
        quadrant: 'not-urgent-not-important',
        isCompleted: false,
        dueDate: today,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-5',
        title: 'Treino de Força e Mobilidade (Hipertrofia)',
        description: 'Sessão A: Peito, Ombros e Tríceps + 15 min de alongamento.',
        categoryId: 'cat-health',
        priority: 'high',
        quadrant: 'not-urgent-important',
        isCompleted: true,
        completedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        dueDate: today,
        dueTime: '07:30',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-6',
        title: 'Ler 20 páginas de "Designing Data-Intensive Applications"',
        description: 'Capítulo sobre algoritmos de consenso e replicação distribuída.',
        categoryId: 'cat-study',
        priority: 'medium',
        quadrant: 'not-urgent-important',
        isCompleted: true,
        completedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        dueDate: today,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    this.saveTasks(initialTasks);
    return initialTasks;
  }

  static saveTasks(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  static getEvents(): CalendarEvent[] {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const today = getTodayDateString();
    const initialEvents: CalendarEvent[] = [
      {
        id: 'ev-1',
        title: 'Daily Standup com Time de Engenharia',
        location: 'Google Meet',
        startTime: `${today}T09:30:00`,
        endTime: `${today}T10:00:00`,
        isAllDay: false,
        categoryId: 'cat-work',
        reminderMinutesBefore: 10,
        externalSource: 'google',
        externalEventId: 'gcal_ev_8492048',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ev-2',
        title: 'Revisão Técnica de Arquitetura de Sincronização',
        location: 'Sala de Conferência A / Híbrido',
        startTime: `${today}T11:00:00`,
        endTime: `${today}T12:00:00`,
        isAllDay: false,
        categoryId: 'cat-work',
        reminderMinutesBefore: 15,
        externalSource: 'app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ev-3',
        title: 'Almoço com Mentor de Produto & Carreira',
        location: 'Bistrô Jardim Paulista',
        startTime: `${today}T12:30:00`,
        endTime: `${today}T13:45:00`,
        isAllDay: false,
        categoryId: 'cat-personal',
        reminderMinutesBefore: 30,
        externalSource: 'apple',
        externalEventId: 'apple_cal_928172',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ev-4',
        title: 'Sessão Focada de Deep Work (Sem Notificações)',
        location: 'Home Office',
        startTime: `${today}T15:00:00`,
        endTime: `${today}T17:30:00`,
        isAllDay: false,
        categoryId: 'cat-projects',
        reminderMinutesBefore: 5,
        externalSource: 'app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    this.saveEvents(initialEvents);
    return initialEvents;
  }

  static saveEvents(events: CalendarEvent[]) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  static getNotes(): Note[] {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const initialNotes: Note[] = [
      {
        id: 'note-root-1',
        title: 'Manual de Engenharia & Arquitetura OmniFlow',
        icon: '⚡',
        categoryId: 'cat-work',
        parentNoteId: null,
        isPinned: true,
        content: `# Manual de Engenharia & Arquitetura OmniFlow

Bem-vindo à base de conhecimento central do sistema **OmniFlow 365**.

Este documento detalha os princípios que norteiam nossa arquitetura de software, modelo de sincronização e decisões de design.

### 📌 Pilares Arquiteturais
- **Offline-First:** O estado local no dispositivo é a única fonte primária imediata de verdade.
- **Resiliência a Desconexões:** Toda ação de CRUD enfileira operações no SQLite/IndexedDB e despacha via delta-sync com CRDTs ou Last-Write-Wins timestamps.
- **Gamificação Consciente:** O módulo de 365 Dias incentiva consistência sustentável sem punição tóxica.

---

### 🛠️ Subpáginas de Engenharia
Veja as subpáginas abaixo para aprofundamento específico em cada área:
- [Sincronização Bidirecional com Google & Apple Calendar]
- [Esquema de Dados e Índices de Performance]
- [Estratégia de Notificações Pop-up no SO]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'note-sub-1',
        title: 'Sincronização Bidirecional com Google & Apple Calendar',
        icon: '📅',
        categoryId: 'cat-work',
        parentNoteId: 'note-root-1',
        isPinned: false,
        content: `## Sincronização Bidirecional com Google & Apple Calendar

Para garantir paridade perfeita entre os compromissos nativos e plataformas externas:

### 1. Google Calendar API v3
- Conexão autenticada via OAuth 2.0 (escopo \`calendar.events\`).
- Webhooks de push notification (\`channels\`) registram alterações em tempo real no Google Cloud Pub/Sub.
- Delta sync executado via \`syncToken\` persistido no banco de dados.

### 2. Apple Calendar (iOS / macOS EventKit)
- Acesso nativo de alta velocidade usando \`EventKit.framework\`.
- Agendamento de alertas pop-up locais sincronizados diretamente com o subsistema do iOS.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'note-sub-2',
        title: 'Esquema de Dados e Índices de Performance',
        icon: '🗄️',
        categoryId: 'cat-work',
        parentNoteId: 'note-root-1',
        isPinned: false,
        content: `## Esquema de Dados e Índices de Performance

A camada de banco relacional foi desenhada no PostgreSQL com total suporte a:
- Chaves primárias em UUIDs v4 (\`gen_random_uuid()\`).
- Soft-deletes com \`deleted_at TIMESTAMPTZ\` para reconciliação precisa em nós offline.
- Índices compostos cobrindo consultas críticas:
  - \`CREATE INDEX idx_tasks_sync ON tasks (user_id, updated_at);\`
  - \`CREATE INDEX idx_daily_progress_cycle ON daily_progress (cycle_id, date);\`
  - \`CREATE INDEX idx_events_start ON calendar_events (user_id, start_time);\``,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'note-root-2',
        title: 'Visão de Vida & Metas para os 365 Dias',
        icon: '🎯',
        categoryId: 'cat-personal',
        parentNoteId: null,
        isPinned: true,
        content: `<h1>Visão de Vida & Metas para os 365 Dias</h1><blockquote><p>"Não nos tornamos extraordinários por façanhas isoladas, mas pela repetição consciente e diária das disciplinas fundamentais."</p></blockquote><h3>🎯 Checklist de Hábitos & Metas (Estilo Apple)</h3><ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Manter hidratação de 3L diários com garrafa graduada</p></div></li><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>Sessão de treino físico e mobilidade (6x por semana)</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Completar leitura de 20 páginas de engenharia de software</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Check-in noturno dos 365 dias e planejamento do dia seguinte</p></div></li></ul><h3>📊 Tabela de Planejamento Trimestral</h3><table><tbody><tr><th>Trimestre</th><th>Foco Principal</th><th>Meta de Consistência</th><th>Status</th></tr><tr><td>Q1</td><td>Fundamentos e rotina matinal</td><td>80% no Heatmap</td><td>Concluído</td></tr><tr><td>Q2</td><td>Aceleração de projetos e arquitetura</td><td>85% no Heatmap</td><td>Concluído</td></tr><tr><td>Q3</td><td>Consolidação de hábitos e saúde</td><td>90% no Heatmap</td><td>Em Progresso</td></tr></tbody></table>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    this.saveNotes(initialNotes);
    return initialNotes;
  }

  static saveNotes(notes: Note[]) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  static getHabits(): Habit[] {
    const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const initialHabits: Habit[] = [
      {
        id: 'habit-1',
        title: 'Treino Físico (Musculação / Cardio)',
        description: 'Mínimo de 45 minutos com intensidade e foco',
        frequencyType: 'daily',
        targetDaysPerWeek: 6,
        colorHex: '#EF4444',
        icon: 'Dumbbell',
        categoryId: 'cat-health',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-2',
        title: 'Hidratação (3 Litros de Água)',
        description: 'Distribuição ao longo do dia com garrafa marcada',
        frequencyType: 'daily',
        targetDaysPerWeek: 7,
        colorHex: '#3B82F6',
        icon: 'Droplet',
        categoryId: 'cat-health',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-3',
        title: 'Leitura Técnica ou de Não-Ficção (25 min)',
        description: 'Sem distrações com smartphone em modo não perturbe',
        frequencyType: 'daily',
        targetDaysPerWeek: 7,
        colorHex: '#8B5CF6',
        icon: 'BookOpen',
        categoryId: 'cat-study',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-4',
        title: 'Revisão Diária & Check-in 365 Noturno',
        description: 'Analisar tarefas concluídas, planejar o dia seguinte e registrar reflexão',
        frequencyType: 'daily',
        targetDaysPerWeek: 7,
        colorHex: '#10B981',
        icon: 'CheckCircle2',
        categoryId: 'cat-personal',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'habit-5',
        title: 'Meditação / Respiração Consciente (10 min)',
        description: 'Mindfulness matinal antes de abrir telas e e-mails',
        frequencyType: 'daily',
        targetDaysPerWeek: 5,
        colorHex: '#F59E0B',
        icon: 'Sun',
        categoryId: 'cat-health',
        createdAt: new Date().toISOString(),
      }
    ];
    this.saveHabits(initialHabits);
    return initialHabits;
  }

  static saveHabits(habits: Habit[]) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }

  static getHabitLogs(): HabitLog[] {
    const stored = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    // Generate recent logs for the past 14 days
    const today = new Date();
    const logs: HabitLog[] = [];
    const habits = ['habit-1', 'habit-2', 'habit-3', 'habit-4', 'habit-5'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Mark some as done
      habits.forEach((hId) => {
        // High consistency rate ~80%
        if (Math.random() > 0.22) {
          logs.push({
            id: `hlog-${hId}-${dateStr}`,
            habitId: hId,
            completedDate: dateStr,
            createdAt: d.toISOString(),
          });
        }
      });
    }

    this.saveHabitLogs(logs);
    return logs;
  }

  static saveHabitLogs(logs: HabitLog[]) {
    localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
  }

  static getActiveCycle(): YearCycle {
    const stored = localStorage.getItem(STORAGE_KEYS.CYCLES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed) return parsed;
      } catch { /* ignore */ }
    }
    const currentYear = new Date().getFullYear();
    const cycle: YearCycle = {
      id: `cycle-${currentYear}`,
      year: currentYear,
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      isActive: true,
      totalDaysCompleted: getDayOfYear(getTodayDateString()),
      productivityScoreAverage: 78.4,
      createdAt: `${currentYear}-01-01T00:00:00Z`,
    };
    this.saveActiveCycle(cycle);
    return cycle;
  }

  static saveActiveCycle(cycle: YearCycle) {
    localStorage.setItem(STORAGE_KEYS.CYCLES, JSON.stringify(cycle));
  }

  static getArchivedCycles(): YearCycle[] {
    const stored = localStorage.getItem(STORAGE_KEYS.ARCHIVED_CYCLES);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const prevYear = new Date().getFullYear() - 1;
    const initialArchived: YearCycle[] = [
      {
        id: `cycle-${prevYear}-archived`,
        year: prevYear,
        startDate: `${prevYear}-01-01`,
        endDate: `${prevYear}-12-31`,
        isActive: false,
        resetAt: `${prevYear}-12-31T23:59:59Z`,
        createdAt: `${prevYear}-01-01T00:00:00Z`,
        totalDaysCompleted: 365,
        productivityScoreAverage: 82.1,
        notes: 'Ciclo anterior concluído com sucesso e arquivado para consulta histórica.'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_CYCLES, JSON.stringify(initialArchived));
    return initialArchived;
  }

  static saveArchivedCycles(cycles: YearCycle[]) {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_CYCLES, JSON.stringify(cycles));
  }

  static getDailyProgress(): DailyProgress[] {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    const cycle = this.getActiveCycle();
    const currentYear = new Date().getFullYear();
    const progressList = generateInitialDailyProgress(cycle.id, currentYear);
    this.saveDailyProgress(progressList);
    return progressList;
  }

  static saveDailyProgress(list: DailyProgress[]) {
    localStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(list));
  }

  /**
   * Reset 365-day cycle safely with archival
   */
  static resetYearCycle(reason?: string): { oldCycle: YearCycle; newCycle: YearCycle } {
    const active = this.getActiveCycle();
    const archived = this.getArchivedCycles();

    const archivedActive: YearCycle = {
      ...active,
      isActive: false,
      resetAt: new Date().toISOString(),
      notes: reason || 'Ciclo resetado intencionalmente pelo usuário.',
    };

    archived.unshift(archivedActive);
    this.saveArchivedCycles(archived);

    // 1. Limpa os registros do progresso local (incluindo chaves padrão e personalizadas)
    localStorage.removeItem('daily_progress');
    localStorage.removeItem('year_cycle');
    localStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CYCLES);

    const now = new Date();
    const currentYear = now.getFullYear();
    const todayStr = getTodayDateString();

    // 2. Reinicia o estado do ciclo para o Dia 1 com 0% de progresso
    const newCycle: YearCycle = {
      id: `cycle-${Date.now()}`,
      year: currentYear,
      startDate: todayStr,
      endDate: `${currentYear}-12-31`,
      isActive: true,
      createdAt: now.toISOString(),
      totalDaysCompleted: 1,
      productivityScoreAverage: 0,
      notes: reason || `Novo ciclo iniciado em ${todayStr} (Dia 1).`,
    };

    this.saveActiveCycle(newCycle);

    // Inicializa o progresso limpo para o Dia 1 com 0% de progresso e 0 tarefas/hábitos
    const freshProgress: DailyProgress[] = [
      {
        id: `prog-${todayStr}`,
        cycleId: newCycle.id,
        date: todayStr,
        dayNumber: 1,
        tasksCompletedCount: 0,
        tasksTotalCount: 0,
        habitsCompletedCount: 0,
        habitsTotalCount: 0,
        productivityScore: 0,
        notesCreatedCount: 0,
      }
    ];
    this.saveDailyProgress(freshProgress);

    return { oldCycle: archivedActive, newCycle };
  }

  /**
   * Export all database records as a portable JSON snapshot
   */
  static exportDatabaseSnapshot(): string {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      categories: this.getCategories(),
      tasks: this.getTasks(),
      events: this.getEvents(),
      notes: this.getNotes(),
      habits: this.getHabits(),
      habitLogs: this.getHabitLogs(),
      activeCycle: this.getActiveCycle(),
      archivedCycles: this.getArchivedCycles(),
      dailyProgress: this.getDailyProgress(),
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Import database records
   */
  static importDatabaseSnapshot(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.user) this.saveUser(data.user);
      if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.events) this.saveEvents(data.events);
      if (data.notes) this.saveNotes(data.notes);
      if (data.habits) this.saveHabits(data.habits);
      if (data.habitLogs) this.saveHabitLogs(data.habitLogs);
      if (data.activeCycle) this.saveActiveCycle(data.activeCycle);
      if (data.archivedCycles) this.saveArchivedCycles(data.archivedCycles);
      if (data.dailyProgress) this.saveDailyProgress(data.dailyProgress);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset everything to factory demo state
   */
  static resetToDemoState() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }
}
