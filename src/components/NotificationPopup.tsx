import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Clock, 
  ExternalLink, 
  X, 
  Calendar, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { ScheduledReminder } from '../types';

interface NotificationPopupProps {
  reminders: ScheduledReminder[];
  onDismiss: (id: string) => void;
  onCompleteTask: (taskId: string) => void;
  onSnooze: (id: string, minutes: number) => void;
  onViewDetails: (reminder: ScheduledReminder) => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  reminders,
  onDismiss,
  onCompleteTask,
  onSnooze,
  onViewDetails,
}) => {
  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {reminders.map((reminder) => {
          const isTask = reminder.type === 'task';
          const isMorning = reminder.type === 'morning_summary';
          const isNight = reminder.type === 'night_checkin';

          let icon = <Bell className="w-5 h-5 text-blue-500" />;
          if (reminder.type === 'event') icon = <Calendar className="w-5 h-5 text-emerald-500" />;
          if (isMorning) icon = <Sun className="w-5 h-5 text-amber-500" />;
          if (isNight) icon = <Moon className="w-5 h-5 text-indigo-400" />;

          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl p-4 text-neutral-900 dark:text-neutral-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 mt-0.5">
                    {icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight leading-snug">
                      {reminder.title}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {reminder.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDismiss(reminder.id)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2 text-xs">
                {isTask && reminder.targetId && (
                  <button
                    onClick={() => {
                      onCompleteTask(reminder.targetId!);
                      onDismiss(reminder.id);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Concluir Tarefa</span>
                  </button>
                )}

                <button
                  onClick={() => onSnooze(reminder.id, 15)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-md transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Adiar 15m</span>
                </button>

                <button
                  onClick={() => {
                    onViewDetails(reminder);
                    onDismiss(reminder.id);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium rounded-md transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
