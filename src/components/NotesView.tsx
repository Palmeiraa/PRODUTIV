import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Pin, 
  Trash2, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  CornerDownRight,
  Layers,
  List,
  ArrowLeft
} from 'lucide-react';
import { Note, Category } from '../types';
import { TiptapEditor } from './TiptapEditor';

interface NotesViewProps {
  notes: Note[];
  categories: Category[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateSubpage: (parentNoteId: string) => void;
  onOpenQuickAdd: () => void;
  initialSelectedNoteId?: string;
}

type SidebarViewMode = 'tree' | 'list';

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  categories,
  onSaveNote,
  onDeleteNote,
  onCreateSubpage,
  onOpenQuickAdd,
  initialSelectedNoteId,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(
    initialSelectedNoteId || notes[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoteIds, setExpandedNoteIds] = useState<Set<string>>(new Set(['note-root-1']));
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarViewMode>('tree');
  // Mobile responsive view pane: 'sidebar' or 'editor'
  const [mobilePane, setMobilePane] = useState<'sidebar' | 'editor'>('editor');

  // Sync selectedNote with available notes
  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    // On mobile, immediately show the editor pane when a note is tapped
    setMobilePane('editor');
  };

  const toggleExpand = (noteId: string) => {
    setExpandedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  };

  // Build recursive note tree
  const rootNotes = notes.filter((n) => !n.parentNoteId);
  const getSubpages = (parentId: string) => notes.filter((n) => n.parentNoteId === parentId);

  // Search filtering
  const matchingNotes = searchQuery.trim()
    ? notes.filter((n) => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Breadcrumbs calculation
  const getBreadcrumbs = (note: Note): Note[] => {
    const crumbs: Note[] = [note];
    let curr = note;
    while (curr.parentNoteId) {
      const parent = notes.find((n) => n.id === curr.parentNoteId);
      if (parent) {
        crumbs.unshift(parent);
        curr = parent;
      } else {
        break;
      }
    }
    return crumbs;
  };

  const breadcrumbs = selectedNote ? getBreadcrumbs(selectedNote) : [];

  // Note mutation helpers
  const handleTitleChange = (newTitle: string) => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleContentChange = (newContentHTML: string) => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      content: newContentHTML,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTogglePin = () => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      isPinned: !selectedNote.isPinned,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSelectEmoji = (emoji: string) => {
    if (!selectedNote) return;
    onSaveNote({
      ...selectedNote,
      icon: emoji,
      updatedAt: new Date().toISOString(),
    });
    setIsEmojiPickerOpen(false);
  };

  const currentSubpages = selectedNote ? getSubpages(selectedNote.id) : [];

  return (
    <div className="space-y-4 pb-12">
      
      {/* Mobile Top Navigation Switcher */}
      <div className="flex lg:hidden items-center justify-between p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobilePane('sidebar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mobilePane === 'sidebar'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Lista de Notas ({notes.length})
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('editor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mobilePane === 'editor'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Editor: {selectedNote?.title || 'Nota'}
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
          title="Nova Nota"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Responsive on Mobile & Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: Pages Tree, List & Search */}
        <div 
          className={`lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs flex flex-col min-h-[500px] lg:h-[760px] ${
            mobilePane === 'sidebar' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Header & Mode Switcher */}
          <div className="space-y-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Notas & Cadernos</span>
              </h3>
              
              <div className="flex items-center gap-1">
                <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSidebarMode('tree')}
                    className={`p-1 rounded cursor-pointer ${
                      sidebarMode === 'tree' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
                    }`}
                    title="Visão em Árvore Hierárquica"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarMode('list')}
                    className={`p-1 rounded cursor-pointer ${
                      sidebarMode === 'list' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
                    }`}
                    title="Visão em Lista Plana"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenQuickAdd}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
                  title="Nova Nota Raiz"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar em todas as notas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Tree / List Content with Generous Touch Targets */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-1 pr-1">
            {matchingNotes ? (
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-neutral-400 px-2 uppercase">
                  Resultados ({matchingNotes.length})
                </span>
                {matchingNotes.map((n) => {
                  const isSelected = selectedNote?.id === n.id;
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleSelectNote(n.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-left cursor-pointer transition-all min-h-[48px] ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 font-semibold text-purple-950 dark:text-purple-200 shadow-2xs'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <span className="text-base shrink-0">{n.icon || '📄'}</span>
                      <div className="min-w-0 flex-1">
                        <span className="truncate block font-medium">{n.title}</span>
                        <span className="text-[10px] text-neutral-400 truncate block mt-0.5">
                          {n.content.replace(/<[^>]*>?/gm, '').trim().slice(0, 38) || 'Sem conteúdo adicional'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : sidebarMode === 'list' ? (
              <div className="space-y-1">
                {notes.map((n) => {
                  const isSelected = selectedNote?.id === n.id;
                  const category = categories.find((c) => c.id === n.categoryId);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleSelectNote(n.id)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all min-h-[48px] ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 font-semibold text-neutral-900 dark:text-white shadow-2xs'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{n.icon || '📄'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate text-neutral-900 dark:text-neutral-100">
                            {n.title}
                          </span>
                          {n.isPinned && <Pin className="w-3 h-3 text-amber-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                          {category && <span>{category.name}</span>}
                          {n.parentNoteId && <span>· Subpágina</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-0.5">
                {rootNotes.map((rootNote) => (
                  <TreeNode
                    key={rootNote.id}
                    note={rootNote}
                    allNotes={notes}
                    selectedNoteId={selectedNote?.id || ''}
                    expandedNoteIds={expandedNoteIds}
                    onSelectNote={handleSelectNote}
                    onToggleExpand={toggleExpand}
                    onCreateSubpage={onCreateSubpage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onOpenQuickAdd}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Criar Nova Página Raiz</span>
            </button>
          </div>
        </div>

        {/* RIGHT: TIPTAP RICH TEXT EDITOR */}
        <div 
          className={`lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col min-h-[70vh] lg:h-[760px] ${
            mobilePane === 'editor' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {selectedNote ? (
            <>
              {/* Top Bar: Back Button (Mobile), Breadcrumbs & Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs">
                
                {/* Mobile Back Button */}
                <div className="flex items-center gap-1.5 truncate max-w-md">
                  <button
                    type="button"
                    onClick={() => setMobilePane('sidebar')}
                    className="lg:hidden p-1 -ml-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg flex items-center gap-1 cursor-pointer"
                    title="Voltar à lista de notas"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[11px] font-medium hidden sm:inline">Notas</span>
                  </button>

                  {/* Breadcrumb Trail */}
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Workspace</span>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.id}>
                      <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />
                      <button
                        type="button"
                        onClick={() => handleSelectNote(crumb.id)}
                        className={`truncate hover:text-neutral-900 dark:hover:text-white cursor-pointer ${
                          idx === breadcrumbs.length - 1 ? 'font-semibold text-neutral-900 dark:text-white' : ''
                        }`}
                      >
                        {crumb.title}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Actions: Pin, Subpage, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleTogglePin}
                    title={selectedNote.isPinned ? 'Desafixar nota' : 'Fixar nota'}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      selectedNote.isPinned
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCreateSubpage(selectedNote.id)}
                    title="Criar Subpágina vinculada a esta nota"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <CornerDownRight className="w-3 h-3 text-purple-500" />
                    <span className="hidden sm:inline">+ Subpágina</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(selectedNote.id)}
                    title="Excluir Nota"
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Title & Emoji Header */}
              <div className="pt-3 pb-2 space-y-2 relative">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="text-2xl p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
                    title="Mudar Ícone da Página"
                  >
                    {selectedNote.icon || '📄'}
                  </button>

                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Sem Título"
                    className="w-full text-xl sm:text-3xl font-bold tracking-tight bg-transparent text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-400"
                  />
                </div>

                {/* Emoji Picker Popover */}
                {isEmojiPickerOpen && (
                  <div className="absolute top-12 left-0 z-30 p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl flex flex-wrap gap-1.5 max-w-xs">
                    {['⚡', '🎯', '📅', '🗄️', '🚀', '💡', '📚', '🛠️', '✨', '🔥', '📊', '🧠', '📝', '🔒', '💻'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handleSelectEmoji(em)}
                        className="text-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* REAL-TIME WYSIWYG TIPTAP RICH TEXT EDITOR (Never clipped by overflow-hidden) */}
              <div className="flex-1 mt-2 flex flex-col min-h-[60vh] overflow-y-auto">
                <TiptapEditor
                  key={selectedNote.id}
                  content={selectedNote.content}
                  onChange={handleContentChange}
                  editable={true}
                />

                {/* Subpages Links Section */}
                {currentSubpages.length > 0 && (
                  <div className="pt-4 mt-6 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                      Subpáginas Vinculadas ({currentSubpages.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentSubpages.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectNote(sub.id)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors cursor-pointer min-h-[44px]"
                        >
                          <span className="text-base shrink-0">{sub.icon || '📄'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                              {sub.title}
                            </p>
                            <span className="text-[10px] text-neutral-400">Subpágina</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-400 py-12">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-semibold">Nenhuma nota selecionada</p>
              <p className="text-xs mt-1">Selecione uma nota na barra lateral ou crie uma nova.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

// Recursive Tree Node Component
interface TreeNodeProps {
  note: Note;
  allNotes: Note[];
  selectedNoteId: string;
  expandedNoteIds: Set<string>;
  onSelectNote: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onCreateSubpage: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  note,
  allNotes,
  selectedNoteId,
  expandedNoteIds,
  onSelectNote,
  onToggleExpand,
  onCreateSubpage,
}) => {
  const children = allNotes.filter((n) => n.parentNoteId === note.id);
  const hasChildren = children.length > 0;
  const isExpanded = expandedNoteIds.has(note.id);
  const isSelected = selectedNoteId === note.id;

  return (
    <div className="space-y-0.5">
      <div
        onClick={() => onSelectNote(note.id)}
        className={`group flex items-center justify-between px-2.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer min-h-[44px] ${
          isSelected
            ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 font-semibold text-purple-950 dark:text-purple-200 shadow-2xs'
            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(note.id);
              }}
              className="p-1 -ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-3" />
          )}

          <span className="text-base shrink-0">{note.icon || '📄'}</span>
          <span className="truncate">{note.title}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCreateSubpage(note.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-purple-600 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 rounded transition-all cursor-pointer"
          title="Adicionar subpágina vinculada"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-3.5 space-y-0.5 border-l border-neutral-200 dark:border-neutral-800 ml-3.5">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              note={child}
              allNotes={allNotes}
              selectedNoteId={selectedNoteId}
              expandedNoteIds={expandedNoteIds}
              onSelectNote={onSelectNote}
              onToggleExpand={onToggleExpand}
              onCreateSubpage={onCreateSubpage}
            />
          ))}
        </div>
      )}
    </div>
  );
};
