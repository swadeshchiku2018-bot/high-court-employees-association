import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import {
  PlusCircle, BookOpen, Calendar, User, ChevronRight,
  Shield, Edit3, Trash2, Clock, FileText, Sparkles, ArrowLeft,
  X, Feather, Tag
} from 'lucide-react';

interface Initiative {
  id: string;
  title: string;
  summary: string;
  content: string;
  tag: string;
  author: string;
  createdAt: string;
}

const TAGS = ['Welfare', 'Legal Aid', 'Education', 'Health', 'Infrastructure', 'Training', 'Recognition'];

const TAG_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Welfare':        { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
  'Legal Aid':      { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-400' },
  'Education':      { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-400' },
  'Health':         { bg: 'bg-rose-50',     text: 'text-rose-700',    dot: 'bg-rose-400' },
  'Infrastructure': { bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-400' },
  'Training':       { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-400' },
  'Recognition':    { bg: 'bg-cyan-50',     text: 'text-cyan-700',    dot: 'bg-cyan-400' },
};

const TAG_COLOR: Record<string, string> = {
  'Welfare': '#10b981', 'Legal Aid': '#3b82f6', 'Education': '#8b5cf6',
  'Health': '#f43f5e', 'Infrastructure': '#f97316', 'Training': '#f59e0b', 'Recognition': '#06b6d4',
};

const TagBadge: React.FC<{ tag: string; size?: 'sm' | 'md' }> = ({ tag, size = 'sm' }) => {
  const s = TAG_STYLES[tag] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${s.bg} ${s.text} ${size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-xs px-3 py-1'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {tag}
    </span>
  );
};

const AuthorMeta: React.FC<{ author: string; date: string; light?: boolean }> = ({ author, date, light }) => (
  <div className={`flex items-center gap-4 text-xs ${light ? 'text-slate-300' : 'text-slate-400'}`}>
    <span className="flex items-center gap-1.5">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${light ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
        {author.charAt(0)}
      </span>
      {author}
    </span>
    <span className="flex items-center gap-1">
      <Calendar className="w-3 h-3" />
      {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export const KeyInitiativesPage: React.FC<{ onNavigate: (route: string) => void }> = () => {
  const { currentUser } = useAuth();
  const isAdmin = !!(currentUser && ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'TREASURER'].includes(currentUser.role));

  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [selected, setSelected] = useState<Initiative | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterTag, setFilterTag] = useState('All');

  const [form, setForm] = useState({ title: '', summary: '', tag: TAGS[0] });
  const richContent = useRef('');

  const fetchInitiatives = async () => {
    try {
      const res = await fetch('/api/key-initiatives');
      if (res.ok) setInitiatives(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchInitiatives(); }, []);

  // ── Publish ──────────────────────────────────────────────────────────────
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);

    const payload = {
      title: form.title,
      summary: form.summary,
      content: richContent.current,
      tag: form.tag,
    };

    const localItem: Initiative = {
      id: `ki-local-${Date.now()}`,
      ...payload,
      author: currentUser?.name || 'Admin',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/key-initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const saved = res.ok ? await res.json() : localItem;
      setInitiatives(prev => [saved, ...prev]);
    } catch {
      setInitiatives(prev => [localItem, ...prev]);
    } finally {
      setLoading(false);
      setShowEditor(false);
      setForm({ title: '', summary: '', tag: TAGS[0] });
      richContent.current = '';
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/key-initiatives/${id}`, { method: 'DELETE' }).catch(() => {});
    setInitiatives(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const allTags = ['All', ...Array.from(new Set(initiatives.map(i => i.tag)))];
  const filtered = filterTag === 'All' ? initiatives : initiatives.filter(i => i.tag === filterTag);
  const [featured, ...rest] = filtered;

  // ──────────────────────────────────────────────────────────────────────────
  // FULL-PAGE EDITOR
  // ──────────────────────────────────────────────────────────────────────────
  if (showEditor) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
        {/* Editor Topbar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowEditor(false)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 cursor-pointer font-semibold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Discard
            </button>
            <span className="text-slate-200 text-lg">|</span>
            <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Feather className="w-4 h-4 text-amber-500" /> New Initiative Post
            </span>
          </div>
          <button
            form="post-form"
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#002855] hover:bg-[#001f4d] text-white text-sm font-bold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing…' : '🚀 Publish'}
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
          <form id="post-form" onSubmit={handlePublish} className="space-y-5">
            {/* Meta row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Initiative title…"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]/40 focus:border-[#002855] font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={form.tag}
                  onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]/40 focus:border-[#002855]"
                >
                  {TAGS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Summary / Tagline (shown on card)</label>
              <input
                type="text"
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="One-sentence teaser…"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002855]/40 focus:border-[#002855]"
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Content *</label>
              <RichTextEditor
                onChange={(html) => { richContent.current = html; }}
                placeholder="Write the full initiative details here. Use the toolbar to format text, add images, insert links, create lists, and more…"
                minHeight={420}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ARTICLE DETAIL VIEW
  // ──────────────────────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="bg-gradient-to-br from-[#001f4d] via-[#002855] to-[#003f88] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="max-w-4xl mx-auto px-6 py-10 relative">
            <button onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-semibold mb-5 cursor-pointer transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Initiatives
            </button>
            <TagBadge tag={selected.tag} size="md" />
            <h1 className="mt-3 text-3xl font-extrabold text-white leading-tight">{selected.title}</h1>
            {selected.summary && <p className="mt-2 text-slate-300 text-sm max-w-2xl">{selected.summary}</p>}
            <div className="mt-5"><AuthorMeta author={selected.author} date={selected.createdAt} light /></div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 md:px-12 py-10">
            {selected.summary && (
              <p className="text-lg text-slate-500 italic border-l-4 border-amber-400 pl-4 mb-8">{selected.summary}</p>
            )}
            <div
              className="rich-editor-content text-slate-700 text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: selected.content }}
            />
          </div>
          {isAdmin && (
            <div className="mt-5 flex justify-end">
              <button onClick={(e) => handleDelete(selected.id, e)}
                className="flex items-center gap-2 text-rose-500 hover:text-rose-700 text-sm font-semibold cursor-pointer">
                <Trash2 className="w-4 h-4" /> Delete Post
              </button>
            </div>
          )}
        </div>

        {/* Shared rich-content styles */}
        <style>{`
          .rich-editor-content h1 { font-size:1.6rem; font-weight:800; margin:1rem 0 .5rem; color:#0f172a; }
          .rich-editor-content h2 { font-size:1.3rem; font-weight:700; margin:.8rem 0 .4rem; color:#1e293b; }
          .rich-editor-content h3 { font-size:1.1rem; font-weight:600; margin:.6rem 0 .3rem; color:#334155; }
          .rich-editor-content p  { margin-bottom:.75rem; }
          .rich-editor-content ul { list-style:disc inside; margin:.5rem 0 .5rem 1rem; }
          .rich-editor-content ol { list-style:decimal inside; margin:.5rem 0 .5rem 1rem; }
          .rich-editor-content li { margin-bottom:.25rem; }
          .rich-editor-content blockquote { border-left:4px solid #f59e0b; padding:.5rem 1rem; margin:.75rem 0; background:#fffbeb; color:#78350f; border-radius:0 .5rem .5rem 0; font-style:italic; }
          .rich-editor-content a   { color:#2563eb; text-decoration:underline; }
          .rich-editor-content img { max-width:100%; border-radius:.5rem; margin:.75rem auto; display:block; box-shadow:0 2px 12px rgba(0,0,0,.1); }
          .rich-editor-content strong { font-weight:700; }
          .rich-editor-content em   { font-style:italic; }
        `}</style>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BLOG LISTING
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* ── Compact Hero ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#001f4d] to-[#003f88] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute right-0 top-0 w-64 h-full bg-amber-400/5 skew-x-12 translate-x-16" />

        <div className="max-w-6xl mx-auto px-6 py-6 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">OHCEA • Cuttack, Odisha</span>
              </div>
              <h1 className="text-xl font-extrabold text-white leading-tight tracking-tight">
                Key Initiatives &amp; Best Practices
              </h1>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{initiatives.length} articles</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated regularly</span>
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowEditor(true)}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-[#001f4d] font-bold rounded-xl shadow text-sm cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Write New Post
            </button>
          )}
        </div>
      </div>

      {/* Tag Filter */}
      {initiatives.length > 0 && (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filterTag === tag ? 'bg-[#002855] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">No initiatives published yet.</p>
            {isAdmin && <p className="text-slate-400 text-sm mt-1">Click "Write New Post" to create your first article.</p>}
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div
                onClick={() => setSelected(featured)}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 mb-6 flex"
              >
                <div className="w-1.5 shrink-0 bg-gradient-to-b from-amber-400 to-[#002855]" />
                <div className="flex-1 p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">★ Featured</span>
                    <TagBadge tag={featured.tag} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 group-hover:text-[#002855] transition-colors mb-2">
                    {featured.title}
                  </h2>
                  {featured.summary && (
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 max-w-2xl">{featured.summary}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <AuthorMeta author={featured.author} date={featured.createdAt} />
                    <span className="text-xs font-bold text-[#002855] flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={(e) => handleDelete(featured.id, e)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-rose-50 text-rose-500 hover:text-rose-700 p-1.5 rounded-lg cursor-pointer transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map(item => (
                  <article
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  >
                    <div className="h-1 w-full" style={{ backgroundColor: TAG_COLOR[item.tag] || '#002855' }} />
                    <div className="p-5 flex flex-col flex-1 gap-3">
                      <div className="flex items-start justify-between">
                        <TagBadge tag={item.tag} />
                        {isAdmin && (
                          <button onClick={(e) => handleDelete(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 p-1 rounded cursor-pointer transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#002855] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      {item.summary && (
                        <p className="text-sm text-slate-500 line-clamp-2 flex-1">{item.summary}</p>
                      )}
                      <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between">
                        <AuthorMeta author={item.author} date={item.createdAt} />
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#002855] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
