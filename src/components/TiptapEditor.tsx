import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  CheckSquare, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  editable?: boolean;
}

/**
 * Converts legacy markdown strings to HTML if necessary
 */
function normalizeContentToHTML(content: string): string {
  if (!content) return '<p></p>';
  if (content.trim().startsWith('<') && content.includes('>')) {
    return content; // already HTML
  }

  // Convert basic markdown to HTML for seamless backward compatibility
  const lines = content.split('\n');
  const htmlLines: string[] = [];
  let inTaskList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Headers
    if (line.startsWith('# ')) {
      if (inTaskList) { htmlLines.push('</ul>'); inTaskList = false; }
      htmlLines.push(`<h1>${line.replace('# ', '')}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inTaskList) { htmlLines.push('</ul>'); inTaskList = false; }
      htmlLines.push(`<h2>${line.replace('## ', '')}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inTaskList) { htmlLines.push('</ul>'); inTaskList = false; }
      htmlLines.push(`<h3>${line.replace('### ', '')}</h3>`);
      continue;
    }

    // Checkboxes / TaskList
    if (line.includes('- [ ]') || line.includes('- [x]')) {
      if (!inTaskList) {
        htmlLines.push('<ul data-type="taskList">');
        inTaskList = true;
      }
      const checked = line.includes('- [x]');
      const text = line.replace('- [x]', '').replace('- [ ]', '').trim();
      htmlLines.push(`<li data-type="taskItem" data-checked="${checked}"><label><input type="checkbox" ${checked ? 'checked' : ''}><span></span></label><div><p>${text}</p></div></li>`);
      continue;
    } else if (inTaskList) {
      htmlLines.push('</ul>');
      inTaskList = false;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      htmlLines.push(`<blockquote><p>${line.replace('> ', '')}</p></blockquote>`);
      continue;
    }

    // Horizontal rule
    if (line.startsWith('---')) {
      htmlLines.push('<hr>');
      continue;
    }

    // Regular line / Bold & Italic replacements
    let formatted = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    if (formatted.trim() === '') {
      htmlLines.push('<p></p>');
    } else {
      htmlLines.push(`<p>${formatted}</p>`);
    }
  }

  if (inTaskList) {
    htmlLines.push('</ul>');
  }

  return htmlLines.join('');
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  editable = true,
}) => {
  const initialHTML = normalizeContentToHTML(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Comece a escrever suas ideias ou use a barra de ferramentas acima...',
      }),
    ],
    content: initialHTML,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[60vh] p-4 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed cursor-text select-text pb-36',
        style: '-webkit-user-select: text; user-select: text; -webkit-touch-callout: default; touch-action: manipulation;',
      },
    },
  });

  // Keep editor content in sync when selected note changes
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    const newHTML = normalizeContentToHTML(content);
    if (currentHTML !== newHTML && content !== currentHTML) {
      editor.commands.setContent(newHTML, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[380px] p-4 text-xs text-neutral-400 flex items-center justify-center">
        Carregando editor Rich Text...
      </div>
    );
  }

  const isTableActive = editor.isActive('table');

  return (
    <div className="flex flex-col flex-1 min-h-[420px] w-full">
      {/* WYSIWYG Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-neutral-50 dark:bg-neutral-850 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs select-none">
        
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Título Principal (H1)"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Subtítulo (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Seção (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Bold & Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Apple Notes Style Checkbox Task List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
              editor.isActive('taskList')
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Lista de Tarefas (Checklist Interativo Estilo Apple)"
          >
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline font-medium">Checklist</span>
          </button>

          {/* Bullet & Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Lista com Marcadores"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white font-bold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Blockquote & Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('blockquote')
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              editor.isActive('codeBlock')
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-950 dark:text-white'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title="Bloco de Código"
          >
            <Code className="w-4 h-4" />
          </button>

          <span className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          {/* Interactive Table Insert */}
          <button
            type="button"
            onClick={() => {
              if (isTableActive) {
                editor.chain().focus().deleteTable().run();
              } else {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors cursor-pointer ${
              isTableActive
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
            }`}
            title={isTableActive ? 'Excluir Tabela' : 'Inserir Tabela Grid Visual'}
          >
            <TableIcon className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline font-medium">Tabela</span>
          </button>
        </div>

        {/* Dynamic Table Helper Actions when cursor is inside a table */}
        {isTableActive && (
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-lg text-[11px]">
            <span className="text-neutral-400 font-medium">Tabela:</span>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded flex items-center gap-0.5 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              title="Adicionar Linha Abaixo"
            >
              <Rows className="w-3 h-3 text-emerald-500" />
              <span>+Linha</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded flex items-center gap-0.5 text-neutral-700 dark:text-neutral-300 cursor-pointer"
              title="Adicionar Coluna à Direita"
            >
              <Columns className="w-3 h-3 text-blue-500" />
              <span>+Coluna</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-500 cursor-pointer"
              title="Excluir Linha Atual"
            >
              -Linha
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-1.5 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-500 cursor-pointer"
              title="Excluir Coluna Atual"
            >
              -Coluna
            </button>
          </div>
        )}

      </div>

      {/* Editor Surface with Expanded Touch Area and Focus */}
      <div 
        onClick={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
        onTouchEnd={() => {
          if (!editor.isFocused) {
            editor.commands.focus();
          }
        }}
        className="flex-1 mt-2 flex flex-col min-h-[60vh] bg-transparent rounded-xl cursor-text overflow-y-auto"
        style={{ minHeight: '60vh', WebkitUserSelect: 'text', userSelect: 'text' }}
      >
        <EditorContent 
          editor={editor} 
          className="flex-1 min-h-[60vh] w-full"
          style={{ minHeight: '60vh', WebkitUserSelect: 'text', userSelect: 'text' }}
        />
      </div>
    </div>
  );
};
