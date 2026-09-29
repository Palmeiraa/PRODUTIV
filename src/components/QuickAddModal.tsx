import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckSquare, Calendar, Flame, FileText } from 'lucide-react';
import { Category, Priority, EisenhowerQuadrant, ExternalSource } from '../types';
import { getTodayDateString } from '../services/storage';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateTask: (taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    priority: Priority;
    quadrant: EisenhowerQuadrant;
    categoryId: string;
    reminderMinutesBefore: number;
  }) => void;
  onCreateEvent: (eventData: {
    title: string;
    location: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    categoryId: string;
    externalSource: ExternalSource;
  }) => void;
  onCreateHabit: (habitData: {
    title: string;
    description: string;
    targetDaysPerWeek: number;
    colorHex: string;
    categoryId: string;
  }) => void;
  onCreateNote: (noteData: {
    title: string;
    categoryId: string;
  }) => void;
}

type TabType = 'task' | 'event' | 'habit' | 'note';

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateTask,
  onCreateEvent,
  onCreateHabit,
  onCreateNote,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('task');
  const today = getTodayDateString();

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState(today);
  const [taskTime, setTaskTime] = useState('14:00');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskQuadrant, setTaskQuadrant] = useState<EisenhowerQuadrant>('not-urgent-important');
  const [taskCategory, setTaskCategory] = useState(categories[0]?.id || '');
  const [taskReminder, setTaskReminder] = useState(15);

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState(today);
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:00');
  const [eventSource, setEventSource] = useState<ExternalSource>('app');
  const [eventCategory, setEventCategory] = useState(categories[0]?.id || '');

  // Habit Form State
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitDays, setHabitDays] = useState(7);
  const [habitColor, setHabitColor] = useState('#10B981');
  const [habitCategory, setHabitCategory] = useState(categories[0]?.id || '');

  // Note Form State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState(categories[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    onCreateTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      dueDate: taskDate,
      dueTime: taskTime,
      priority: taskPriority,
      quadrant: taskQuadrant,
      categoryId: taskCategory,
      reminderMinutesBefore: taskReminder,
    });
    setTaskTitle('');
    setTaskDesc('');
    onClose();
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    onCreateEvent({
      title: eventTitle.trim(),
      location: eventLocation.trim(),
      startTime: `${eventDate}T${eventStartTime}:00`,
      endTime: `${eventDate}T${eventEndTime}:00`,
      isAllDay: false,
      categoryId: eventCategory,
      externalSource: eventSource,
    });
    setEventTitle('');
    setEventLocation('');
    onClose();
  };

  const handleSubmitHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;
    onCreateHabit({
      title: habitTitle.trim(),
      description: habitDesc.trim(),
      targetDaysPerWeek: habitDays,
      colorHex: habitColor,
      categoryId: habitCategory,
    });
    setHabitTitle('');
    onClose();
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    onCreateNote({
      title: noteTitle.trim(),
      categoryId: noteCategory,
    });
    setNoteTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-neutral-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-bold tracking-tight">Criar Novo Item</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-1 p-1 mt-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('task')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'task'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>Tarefa</span>
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'event'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Agenda</span>
          </button>
          <button
            onClick={() => setActiveTab('habit')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'habit'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Hábito</span>
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'note'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
            <span>Nota</span>
          </button>
        </div>

        {/* Tab 1: Tarefa Form */}
        {activeTab === 'task' && (
          <form onSubmit={handleSubmitTask} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Título da Tarefa *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Finalizar proposta comercial"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Descrição ou Notas
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes ou critérios de aceitação..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Data Limite
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Prioridade
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Matriz Eisenhower
                </label>
                <select
                  value={taskQuadrant}
                  onChange={(e) => setTaskQuadrant(e.target.value as EisenhowerQuadrant)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <option value="urgent-important">Q1: Fazer Agora (Urgente/Importante)</option>
                  <option value="not-urgent-important">Q2: Agendar (Não Urg/Importante)</option>
                  <option value="urgent-not-important">Q3: Delegar (Urgente/Não Importante)</option>
                  <option value="not-urgent-not-important">Q4: Eliminar (Não Urg/Não Importante)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Categoria
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Lembrete Pop-up
                </label>
                <select
                  value={taskReminder}
                  onChange={(e) => setTaskReminder(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <option value={0}>Na hora exata</option>
                  <option value={5}>5 min antes</option>
                  <option value={15}>15 min antes</option>
                  <option value={30}>30 min antes</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Salvar Tarefa
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Agenda Event Form */}
        {activeTab === 'event' && (
          <form onSubmit={handleSubmitEvent} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Título do Evento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Reunião com diretoria"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Local ou Link da Chamada
              </label>
              <input
                type="text"
                placeholder="Ex: Google Meet / Escritório Central"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">Data</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">Início</label>
                <input
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">Término</label>
                <input
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="w-full px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Origem / Calendário
                </label>
                <select
                  value={eventSource}
                  onChange={(e) => setEventSource(e.target.value as ExternalSource)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <option value="app">OmniFlow (Local)</option>
                  <option value="google">Google Calendar (Sincronizado)</option>
                  <option value="apple">Apple Calendar (iOS EventKit)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Categoria
                </label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Salvar Compromisso
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Hábito Form */}
        {activeTab === 'habit' && (
          <form onSubmit={handleSubmitHabit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nome do Hábito *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Beber 3L de Água"
                value={habitTitle}
                onChange={(e) => setHabitTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Descrição ou Meta Específica
              </label>
              <input
                type="text"
                placeholder="Ex: Distribuir durante a manhã e tarde"
                value={habitDesc}
                onChange={(e) => setHabitDesc(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Meta Semanal (Dias)
                </label>
                <select
                  value={habitDays}
                  onChange={(e) => setHabitDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <option value={7}>Todos os dias (7x)</option>
                  <option value={6}>6 dias por semana</option>
                  <option value={5}>Dias úteis (5x)</option>
                  <option value={4}>4 dias por semana</option>
                  <option value={3}>3 dias por semana</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setHabitColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        habitColor === color ? 'scale-125 ring-2 ring-neutral-400' : 'opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
              >
                Cadastrar Hábito
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: Nota Form */}
        {activeTab === 'note' && (
          <form onSubmit={handleSubmitNote} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Título da Nota *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Planejamento Estratégico 2026"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Caderno / Categoria
              </label>
              <select
                value={noteCategory}
                onChange={(e) => setNoteCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-neutral-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
              >
                Criar Nota
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
