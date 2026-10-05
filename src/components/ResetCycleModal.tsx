import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Archive, RotateCcw, X, ShieldAlert, Check } from 'lucide-react';
import { YearCycle } from '../types';

interface ResetCycleModalProps {
  isOpen: boolean;
  activeCycle: YearCycle;
  onClose: () => void;
  onConfirmReset: (reason: string) => void;
}

export const ResetCycleModal: React.FC<ResetCycleModalProps> = ({
  isOpen,
  activeCycle,
  onClose,
  onConfirmReset,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [reason, setReason] = useState('Reinício intencional para novo foco');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleProceedToStep2 = () => {
    setStep(2);
  };

  const handleFinalConfirm = () => {
    onConfirmReset(reason);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-neutral-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold">
              {step === 1 ? 'Confirmação: Resetar Ciclo dos 365 Dias' : 'Confirmação Final (Passo 2 de 2)'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Exact Required Confirmation Message */}
        {step === 1 && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl">
              <p className="text-base font-bold text-red-700 dark:text-red-300 leading-snug">
                Deseja zerar seu progresso e recomeçar do Dia 1?
              </p>
              <p className="text-xs text-red-600/90 dark:text-red-400/90 mt-1.5 leading-relaxed">
                O histórico dos 365 dias será arquivado com segurança e o contador voltará ao Dia 1 com 0% de progresso.
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-white">
                <Archive className="w-4 h-4 text-blue-500" />
                <span>O que acontecerá com seus dados:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>O ciclo atual com seus {activeCycle.totalDaysCompleted} dias registrados será <strong className="text-neutral-900 dark:text-white">arquivado com segurança no Histórico</strong>.</li>
                <li>Suas tarefas, compromissos na agenda, notas e hábitos cadastrados permanecem intactos.</li>
                <li>O contador e o heatmap serão reinicializados a partir do <strong className="text-emerald-600 dark:text-emerald-400">Dia 1</strong> para um novo ciclo de produtividade.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Avançar para Confirmação</span>
                <span className="text-[10px] bg-red-800/60 px-1.5 py-0.5 rounded">1/2</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Second Confirmation Step */}
        {step === 2 && (
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-bold block mb-0.5">Confirmação Definitiva de Reinício</span>
                Você está no segundo e último passo para arquivar o ciclo atual e zerar o contador anual de 365 dias para o Dia 1.
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Motivo ou meta do novo ciclo (opcional):
              </label>
              <input
                type="text"
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Novo trimestre, novo foco profissional..."
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
              >
                ← Voltar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirmar e Resetar Agora</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
