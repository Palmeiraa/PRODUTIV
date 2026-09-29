import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Grid, 
  List, 
  Calendar, 
  AlertCircle, 
  Tag, 
  Filter, 
  ArrowRight,
  MoveRight,
  Check,
  Bell
} from 'lucide-react';
import { Task, Category, Priority, EisenhowerQuadrant } from '../types';
import { getTodayDateString } from '../services/storage';

interface TasksViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateQuadrant: (taskId: string, quadrant: EisenhowerQuadrant) => void;
  onOpenQuickAdd: () => void;
  onTriggerTaskReminder: (task: Task) => void;
}

type FilterMode = 'today' | 'next7' | 'overdue' | 'completed' | 'all';
type ViewMode = 'list' | 'eisenhower';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  categories,
  onToggleTask,
  onDeleteTask,
  onUpdateQuadrant,
  onOpenQuickAdd,
  onTriggerTaskReminder,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('eisenhower');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const today = getTodayDateString();

  // Helper date calculations
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.isCompleted) return false;
    return task.dueDate < today;
  };

  const isNext7Days = (task: Task) => {
    if (!task.dueDate) return false;
    const d = new Date(task.dueDate);
    const now = new Date(today);
    const diffDays = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  // Filter tasks for List view
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery.trim()) {
      const match = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!match) return false;
    }

    if (selectedCategory !== 'all' && task.categoryId !== selectedCategory) {
      return false;
    }

    if (filterMode === 'today') {
      return task.dueDate === today && !task.isCompleted;
    }
    if (filterMode === 'next7') {
      return isNext7Days(task) && !task.isCompleted;
    }
    if (filterMode === 'overdue') {
      return isOverdue(task);
    }
    if (filterMode === 'completed') {
      return task.isCompleted;
    }
    return true;
  });

  // Quadrants breakdown for Eisenhower
  const q1Tasks = tasks.filter((t) => !t.isCompleted && t.quadrant === 'urgent-important');
  const q2Tasks = tasks.filter((t) => !t.isCompleted && t.quadrant === 'not-urgent-important');
  const q3Tasks = tasks.filter((t) => !t.isCompleted && t.quadrant === 'urgent-not-important');
  const q4Tasks = tasks.filter((t) => !t.isCompleted && t.quadrant === 'not-urgent-not-important');

  const priorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 px-1.5 py-0.5 rounded">Urgente</span>;
      case 'high':
        return <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded">Alta</span>;
      case 'medium':
        return <span className="text-[10px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-1.5 py-0.5 rounded">Média</span>;
      case 'low':
        return <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">Baixa</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* View Header with Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Gestão de Tarefas
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize prioridades por lista inteligente ou matriz de Eisenhower (4 quadrantes)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented View Mode Switcher */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            <button
              onClick={() => setViewMode('eisenhower')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'eisenhower'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-blue-500" />
              <span>Matriz Eisenhower</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-500" />
              <span>Lista Inteligente</span>
            </button>
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* EISENHOWER MATRIX VIEW */}
      {viewMode === 'eisenhower' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Q1: Do First (Urgente & Importante) */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-red-200 dark:border-red-950/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-red-100 dark:border-red-950/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Q1: Fazer Agora
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md">
                    Urgente & Importante ({q1Tasks.length})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Crises, prazos iminentes e bloqueios críticos</p>

                <div className="mt-3 space-y-2">
                  {q1Tasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      Nenhuma tarefa neste quadrante.
                    </div>
                  ) : (
                    q1Tasks.map((task) => (
                      <TaskMatrixCard 
                        key={task.id} 
                        task={task} 
                        categories={categories}
                        onToggleTask={onToggleTask}
                        onDeleteTask={onDeleteTask}
                        onUpdateQuadrant={onUpdateQuadrant}
                        onTriggerReminder={onTriggerTaskReminder}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar a Q1</span>
                </button>
              </div>
            </div>

            {/* Q2: Schedule / Decide (Não Urgente & Importante) - HIGHEST VALUE */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-blue-200 dark:border-blue-950/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-blue-100 dark:border-blue-950/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Q2: Agendar & Decidir
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                    Não Urgente & Importante ({q2Tasks.length})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Planejamento, saúde, desenvolvimento e foco estratégico</p>

                <div className="mt-3 space-y-2">
                  {q2Tasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      Nenhuma tarefa neste quadrante.
                    </div>
                  ) : (
                    q2Tasks.map((task) => (
                      <TaskMatrixCard 
                        key={task.id} 
                        task={task} 
                        categories={categories}
                        onToggleTask={onToggleTask}
                        onDeleteTask={onDeleteTask}
                        onUpdateQuadrant={onUpdateQuadrant}
                        onTriggerReminder={onTriggerTaskReminder}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar a Q2</span>
                </button>
              </div>
            </div>

            {/* Q3: Delegate (Urgente & Não Importante) */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-amber-200 dark:border-amber-950/60 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-amber-100 dark:border-amber-950/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Q3: Delegar
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                    Urgente & Não Importante ({q3Tasks.length})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Interrupções, triagens secundárias e tarefas rotineiras</p>

                <div className="mt-3 space-y-2">
                  {q3Tasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      Nenhuma tarefa neste quadrante.
                    </div>
                  ) : (
                    q3Tasks.map((task) => (
                      <TaskMatrixCard 
                        key={task.id} 
                        task={task} 
                        categories={categories}
                        onToggleTask={onToggleTask}
                        onDeleteTask={onDeleteTask}
                        onUpdateQuadrant={onUpdateQuadrant}
                        onTriggerReminder={onTriggerTaskReminder}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar a Q3</span>
                </button>
              </div>
            </div>

            {/* Q4: Eliminate (Não Urgente & Não Importante) */}
            <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Q4: Eliminar
                    </h3>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                    Não Urgente & Não Importante ({q4Tasks.length})
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">Distrações, limpezas triviais ou desperdício de tempo</p>

                <div className="mt-3 space-y-2">
                  {q4Tasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      Nenhuma tarefa neste quadrante.
                    </div>
                  ) : (
                    q4Tasks.map((task) => (
                      <TaskMatrixCard 
                        key={task.id} 
                        task={task} 
                        categories={categories}
                        onToggleTask={onToggleTask}
                        onDeleteTask={onDeleteTask}
                        onUpdateQuadrant={onUpdateQuadrant}
                        onTriggerReminder={onTriggerTaskReminder}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-full py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar a Q4</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SMART LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'today', label: 'Hoje' },
                { id: 'next7', label: 'Próximos 7 Dias' },
                { id: 'overdue', label: 'Atrasadas' },
                { id: 'completed', label: 'Concluídas' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id as FilterMode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterMode === f.id
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300"
              >
                <option value="all">Todas Categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                Nenhuma tarefa encontrada com os filtros selecionados.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const category = categories.find((c) => c.id === task.categoryId);
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80 transition-colors ${
                      task.isCompleted ? 'opacity-60 bg-neutral-50/50 dark:bg-neutral-800/20' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-xs font-semibold leading-snug ${
                          task.isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white'
                        }`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-neutral-400">
                          {task.dueDate && (
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate} {task.dueTime}
                            </span>
                          )}
                          {category && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                              {category.name}
                            </span>
                          )}
                          {priorityBadge(task.priority)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTriggerTaskReminder(task)}
                        title="Simular Lembrete Pop-up"
                        className="p-1.5 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        title="Excluir"
                        className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};

interface TaskMatrixCardProps {
  task: Task;
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateQuadrant: (taskId: string, quadrant: EisenhowerQuadrant) => void;
  onTriggerReminder: (task: Task) => void;
}

const TaskMatrixCard: React.FC<TaskMatrixCardProps> = ({
  task,
  categories,
  onToggleTask,
  onDeleteTask,
  onUpdateQuadrant,
  onTriggerReminder,
}) => {
  const category = categories.find((c) => c.id === task.categoryId);

  return (
    <div className="p-3 bg-neutral-50/80 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <button
            onClick={() => onToggleTask(task.id)}
            className="mt-0.5 text-neutral-400 hover:text-emerald-600 cursor-pointer shrink-0"
          >
            <Circle className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white leading-snug">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400">
              {task.dueDate && <span>{task.dueDate}</span>}
              {category && <span>· {category.name}</span>}
            </div>
          </div>
        </div>

        {/* Move Quadrant Selector & Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={task.quadrant}
            onChange={(e) => onUpdateQuadrant(task.id, e.target.value as EisenhowerQuadrant)}
            title="Mover para outro quadrante"
            className="text-[10px] px-1 py-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded text-neutral-600 dark:text-neutral-300 cursor-pointer"
          >
            <option value="urgent-important">Q1</option>
            <option value="not-urgent-important">Q2</option>
            <option value="urgent-not-important">Q3</option>
            <option value="not-urgent-not-important">Q4</option>
          </select>
          <button
            onClick={() => onTriggerReminder(task)}
            title="Testar Lembrete"
            className="p-1 text-neutral-400 hover:text-blue-500 rounded cursor-pointer"
          >
            <Bell className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDeleteTask(task.id)}
            title="Excluir"
            className="p-1 text-neutral-400 hover:text-red-500 rounded cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
