import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Layers, 
  Bell, 
  RotateCcw, 
  Server, 
  Smartphone, 
  Cloud, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface ArchitectureViewProps {
  onTriggerMorningTest: () => void;
  onTriggerNightTest: () => void;
  onRestoreDemoData: () => void;
}

const POSTGRESQL_DDL = `-- ========================================================
-- ESQUEMA COMPLETO DE BANCO DE DADOS (POSTGRESQL DDL)
-- OmniFlow 365: Produtividade Pessoal & Hábitos
-- ========================================================

-- Extensão para UUIDs v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  theme_preference VARCHAR(10) DEFAULT 'system',
  daily_summary_time TIME DEFAULT '08:00:00',
  google_calendar_connected BOOLEAN DEFAULT false,
  apple_calendar_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categorias / Tags
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7) DEFAULT '#6B7280',
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 3. Tarefas (To-Do & Eisenhower)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  due_time TIME,
  priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  reminder_at TIMESTAMPTZ,
  local_notification_id VARCHAR(255), -- ID da notificação agendada no SO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 4. Compromissos da Agenda (2-Way Sync Google & Apple)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  reminder_minutes_before INT DEFAULT 15,
  external_source VARCHAR(20) DEFAULT 'app', -- 'app', 'google', 'apple'
  external_event_id VARCHAR(255), -- ID de referência no Google/Apple Calendar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 5. Bloco de Notas (Hierarquia com Subpáginas e Rich Text)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  parent_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  title VARCHAR(255) DEFAULT 'Sem Título',
  content_json JSONB DEFAULT '{}',
  icon VARCHAR(50),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 6. Ciclos dos 365 Dias
CREATE TABLE year_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  reset_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Progresso Diário (Métricas e Heatmap)
CREATE TABLE daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES year_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INT NOT NULL,
  tasks_completed_count INT DEFAULT 0,
  tasks_total_count INT DEFAULT 0,
  productivity_score NUMERIC(5,2) DEFAULT 0.00,
  notes_created_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Hábitos
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  frequency_type VARCHAR(20) DEFAULT 'daily',
  target_days_per_week INT DEFAULT 7,
  color_hex VARCHAR(7) DEFAULT '#10B981',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 9. Log de Conclusão de Hábitos
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_habit_per_day UNIQUE(habit_id, completed_date)
);

-- ÍNDICES DE PERFORMANCE CRÍTICOS
CREATE INDEX idx_tasks_sync ON tasks (user_id, updated_at);
CREATE INDEX idx_daily_progress_cycle ON daily_progress (cycle_id, date);
CREATE INDEX idx_events_start ON calendar_events (user_id, start_time);
CREATE INDEX idx_notes_active ON notes (user_id) WHERE deleted_at IS NULL;
`;

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onTriggerMorningTest,
  onTriggerNightTest,
  onRestoreDemoData,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCopyDDL = async () => {
    try {
      await navigator.clipboard.writeText(POSTGRESQL_DDL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDatabaseSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omniflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDatabaseSnapshot(content);
      if (success) {
        setImportStatus('Backup restaurado com sucesso! Recarregando dados...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setImportStatus('Falha ao importar arquivo JSON: formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Arquitetura Técnica & Banco de Dados
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Especificação de Engenharia de Software, Modelo de Dados PostgreSQL e Sistema Offline-First
        </p>
      </div>

      {/* Architecture Cards: 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>1. Camada Offline-First</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Armazenamento local persistente em <strong>IndexedDB / SQLite (WatermelonDB)</strong>. Todas as mutações são aplicadas imediatamente na interface sem dependência de rede, com fila de sincronização de fundo.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Bell className="w-4 h-4" />
            <span>2. Lembretes no SO & Pop-ups</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Agendamento local nativo via <strong>EventKit (iOS) / expo-notifications / Web Notifications API</strong>. Alertas pop-up com ações diretas: <em>Concluir Tarefa</em>, <em>Adiar 15 min</em> e <em>Ver Nota</em>.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
            <Cloud className="w-4 h-4" />
            <span>3. Sincronização Bidirecional</span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Conexão 2-Way com <strong>Google Calendar API v3 (OAuth2)</strong> e <strong>Apple Calendar</strong> com suporte bidirecional e exportação RFC 5545 iCalendar (.ics).
          </p>
        </div>

      </div>

      {/* Interactive Testing & Data Portability Panel */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Controles de Teste e Portabilidade de Dados</span>
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTriggerMorningTest}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
          >
            Disparar Notificação Matinal (08:00)
          </button>
          <button
            onClick={onTriggerNightTest}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
          >
            Disparar Notificação Noturna (21:00)
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Snapshot JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar de JSON</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={onRestoreDemoData}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 rounded-xl transition-colors cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Dados Demo</span>
          </button>
        </div>

        {importStatus && (
          <div className="p-3 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
            {importStatus}
          </div>
        )}
      </div>

      {/* DDL Schema Code Display */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Esquema DDL PostgreSQL (9 Tabelas & Índices)
            </h3>
          </div>

          <button
            onClick={handleCopyDDL}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar SQL DDL</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-neutral-950 text-neutral-200 font-mono text-xs rounded-xl overflow-x-auto max-h-[500px] leading-relaxed scrollbar-thin">
            <code>{POSTGRESQL_DDL}</code>
          </pre>
        </div>
      </div>

    </div>
  );
};
