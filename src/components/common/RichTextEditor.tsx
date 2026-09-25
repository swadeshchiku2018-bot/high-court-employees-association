import React, { useRef, useCallback } from 'react';
import {
  Bold, Italic, Underline, List, ListOrdered, Link2, Image,
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight,
  Strikethrough, Quote, Minus, RotateCcw, RotateCw
} from 'lucide-react';

interface RichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const ToolbarBtn: React.FC<{
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, active, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-all cursor-pointer
      ${active ? 'bg-[#002855] text-white' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

export const RichTextEditor: React.FC<RichEditorProps> = ({
  onChange,
  placeholder = 'Start writing...',
  minHeight = 320,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (onChange && editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (onChange && editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      // Limit 500KB for blog images
      if (file.size > 500 * 1024) {
        alert('Image must be less than 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        exec('insertImage', ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const insertHr = () => {
    exec('insertHTML', '<hr style="border:none;border-top:2px solid #e2e8f0;margin:1.5rem 0;" /><br/>');
  };

  const formatBlock = (tag: string) => exec('formatBlock', tag);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#002855]/40 focus-within:border-[#002855] transition-all">
      {/* Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-0.5">

        {/* Undo / Redo */}
        <ToolbarBtn onClick={() => exec('undo')} title="Undo">
          <RotateCcw className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('redo')} title="Redo">
          <RotateCw className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => formatBlock('h1')} title="Heading 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('h2')} title="Heading 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => formatBlock('h3')} title="Heading 3">
          <Heading3 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Inline styles */}
        <ToolbarBtn onClick={() => exec('bold')} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('italic')} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('underline')} title="Underline">
          <Underline className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('strikeThrough')} title="Strikethrough">
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => exec('justifyLeft')} title="Align Left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyCenter')} title="Align Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('justifyRight')} title="Align Right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Bullet List">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Numbered List">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Quote + HR */}
        <ToolbarBtn onClick={() => formatBlock('blockquote')} title="Blockquote">
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={insertHr} title="Horizontal Rule">
          <Minus className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Link + Image */}
        <ToolbarBtn onClick={insertLink} title="Insert Link">
          <Link2 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={insertImage} title="Insert Image (max 500KB)">
          <Image className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Font color */}
        <label title="Text Color" className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 cursor-pointer transition-all">
          <span className="text-[11px] font-bold border-b-2 border-red-500 leading-none">A</span>
          <input
            type="color"
            className="sr-only"
            onChange={(e) => exec('foreColor', e.target.value)}
          />
        </label>

        {/* Highlight */}
        <label title="Highlight" className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-200 cursor-pointer transition-all">
          <span className="text-[11px] font-bold bg-yellow-300 px-0.5 leading-none rounded-sm">H</span>
          <input
            type="color"
            defaultValue="#fef08a"
            className="sr-only"
            onChange={(e) => exec('hiliteColor', e.target.value)}
          />
        </label>

        {/* Font size */}
        <select
          title="Font Size"
          onChange={(e) => exec('fontSize', e.target.value)}
          className="ml-1 text-xs border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 cursor-pointer focus:outline-none"
        >
          <option value="">Size</option>
          {[1, 2, 3, 4, 5, 6, 7].map(s => (
            <option key={s} value={s}>{['8', '10', '12', '14', '18', '24', '36'][s - 1]}px</option>
          ))}
        </select>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={{ minHeight }}
        data-placeholder={placeholder}
        className="px-5 py-4 text-slate-800 text-sm leading-relaxed focus:outline-none rich-editor-content"
      />

      <style>{`
        .rich-editor-content:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .rich-editor-content h1 { font-size: 1.6rem; font-weight: 800; margin: 0.75rem 0 0.4rem; color: #0f172a; }
        .rich-editor-content h2 { font-size: 1.3rem; font-weight: 700; margin: 0.6rem 0 0.3rem; color: #1e293b; }
        .rich-editor-content h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; color: #334155; }
        .rich-editor-content p, .rich-editor-content div { margin-bottom: 0.5rem; }
        .rich-editor-content ul { list-style: disc inside; margin: 0.5rem 0 0.5rem 1rem; }
        .rich-editor-content ol { list-style: decimal inside; margin: 0.5rem 0 0.5rem 1rem; }
        .rich-editor-content li { margin-bottom: 0.25rem; }
        .rich-editor-content blockquote {
          border-left: 4px solid #f59e0b;
          padding: 0.5rem 1rem;
          margin: 0.75rem 0;
          background: #fffbeb;
          color: #78350f;
          border-radius: 0 0.5rem 0.5rem 0;
          font-style: italic;
        }
        .rich-editor-content a { color: #2563eb; text-decoration: underline; }
        .rich-editor-content img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 0.75rem auto;
          display: block;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .rich-editor-content strong { font-weight: 700; }
        .rich-editor-content em { font-style: italic; }
      `}</style>
    </div>
  );
};
