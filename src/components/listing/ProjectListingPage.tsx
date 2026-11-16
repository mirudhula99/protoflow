import { useState, useMemo } from 'react';
import { useAppStore, type ProjectSummary } from '@/hooks/useAppStore';

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

type SortOption = 'last-modified' | 'name' | 'oldest';

export function ProjectListingPage() {
  const projectList = useAppStore((s) => s.projectList);
  const openProject = useAppStore((s) => s.openProject);
  const createNewProject = useAppStore((s) => s.createNewProject);
  const createNewEnhancementProject = useAppStore((s) => s.createNewEnhancementProject);
  const deleteProject = useAppStore((s) => s.deleteProject);

  const [showModePicker, setShowModePicker] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('last-modified');
  const [filterMode, setFilterMode] = useState<'all' | 'standard' | 'enhancement'>('all');

  const filtered = useMemo(() => {
    let list = [...projectList];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Filter by mode
    if (filterMode !== 'all') {
      list = list.filter((p) => p.mode === filterMode);
    }

    // Sort
    if (sort === 'last-modified') {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    }

    return list;
  }, [projectList, search, sort, filterMode]);

  const handleDelete = (e: React.MouseEvent, project: ProjectSummary) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
    }
  };

  return (
    <div className="h-screen flex bg-[#f8f8f8] dark:bg-zinc-950 text-foreground overflow-hidden">

      {/* ── Left Sidebar ── */}
      <aside className="w-[240px] border-r border-border bg-background flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">ProtoFlow</span>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 rounded-md border border-border bg-muted/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <button
            onClick={() => setFilterMode('all')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              filterMode === 'all' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            All Projects
            <span className="ml-auto text-[10px] text-muted-foreground">{projectList.length}</span>
          </button>

          <button
            onClick={() => setFilterMode('standard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              filterMode === 'standard' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9l3 3-3 3" />
            </svg>
            Standard
            <span className="ml-auto text-[10px] text-muted-foreground">{projectList.filter((p) => p.mode === 'standard').length}</span>
          </button>

          <button
            onClick={() => setFilterMode('enhancement')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              filterMode === 'enhancement' ? 'bg-indigo-500/10 text-indigo-600 font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Enhancement
            <span className="ml-auto text-[10px] text-muted-foreground">{projectList.filter((p) => p.mode === 'enhancement').length}</span>
          </button>
        </nav>

        {/* New Project button at bottom */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setShowModePicker(true)}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
            New Project
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b border-border bg-background flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">
              {filterMode === 'all' ? 'All Projects' : filterMode === 'standard' ? 'Standard Projects' : 'Enhancement Projects'}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="last-modified">Last modified</option>
              <option value="name">Name</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </header>

        {/* Project grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 && projectList.length > 0 && (
            <div className="text-center py-20">
              <p className="text-sm text-muted-foreground">No projects match your search</p>
            </div>
          )}

          {projectList.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="text-base font-semibold mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first project to get started</p>
              <button
                onClick={() => setShowModePicker(true)}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" /><path d="M5 12h14" />
                </svg>
                New Project
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <div
                key={project.id}
                onClick={() => openProject(project.id)}
                className="group rounded-xl overflow-hidden bg-background border border-border hover:shadow-lg hover:border-border/80 transition-all cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                  {project.thumbnailDataUrl ? (
                    <img
                      src={project.thumbnailDataUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}

                  {/* Delete button — top right on hover */}
                  <button
                    onClick={(e) => handleDelete(e, project)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete project"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {/* Mode icon */}
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      project.mode === 'enhancement'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {project.mode === 'enhancement' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9l3 3-3 3" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Edited {timeAgo(project.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Mode Picker Modal ── */}
      {showModePicker && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setShowModePicker(false)}
        >
          <div
            className="bg-background border border-border rounded-2xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose a project type to get started</p>
            </div>
            <div className="px-6 pb-2 grid grid-cols-2 gap-3">
              {/* Standard */}
              <button
                onClick={() => { setShowModePicker(false); createNewProject(); }}
                className="text-left border border-border rounded-xl p-4 hover:border-blue-400/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9l3 3-3 3" />
                  </svg>
                </div>
                <span className="text-sm font-semibold block mb-1">Standard</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Canvas prototyping with navigation linking and HTML export
                </p>
              </button>

              {/* Enhancement */}
              <button
                onClick={() => { setShowModePicker(false); createNewEnhancementProject(); }}
                className="text-left border border-border rounded-xl p-4 hover:border-indigo-400/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <span className="text-sm font-semibold block mb-1">Enhancement</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Change-request demos with Current/Enhanced toggle and app shell export
                </p>
              </button>
            </div>
            <div className="px-6 py-4">
              <button
                onClick={() => setShowModePicker(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
