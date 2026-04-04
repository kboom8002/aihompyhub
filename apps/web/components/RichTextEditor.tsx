'use client';
import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';

export const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (like pre-filling during Edit)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      // Small timeout to prevent immediate re-renders stealing focus
      setTimeout(() => editor.commands.setContent(value), 0);
    }
  }, [value, editor]);

  const addImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const url = window.prompt('이미지 URL 링크를 붙여넣으세요:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ padding: '0.6rem 1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''} style={{ padding: '0.25rem 0.5rem', background: editor.isActive('bold') ? '#d1d5db' : 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          B
        </button>
        <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }} disabled={!editor.can().chain().focus().toggleItalic().run()} style={{ padding: '0.25rem 0.5rem', background: editor.isActive('italic') ? '#d1d5db' : 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontStyle: 'italic' }}>
          I
        </button>
        <span style={{ width: '1px', background: '#e5e7eb', margin: '0 0.5rem', height: '24px' }} />
        <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }} style={{ padding: '0.25rem 0.5rem', background: editor.isActive('heading', { level: 2 }) ? '#d1d5db' : 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
          H2
        </button>
        <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }} style={{ padding: '0.25rem 0.5rem', background: editor.isActive('heading', { level: 3 }) ? '#d1d5db' : 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
          H3
        </button>
        <span style={{ width: '1px', background: '#e5e7eb', margin: '0 0.5rem', height: '24px' }} />
        <select 
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          style={{ padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', minWidth: '150px' }}
        >
          <option value="inherit">Brand 기본 폰트</option>
          <option value="Georgia, serif">Serif (클래식/매거진)</option>
          <option value="Courier New, monospace">Monospace (가독성)</option>
        </select>
        
        <button onClick={addImage} style={{ padding: '0.35rem 0.75rem', marginLeft: 'auto', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>📷</span> 미디어 URL 삽입
        </button>
      </div>

      <div style={{ padding: '1.5rem', minHeight: '400px', cursor: 'text' }} onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror { outline: none; min-height: 400px; color: #1f2937; }
        .ProseMirror p { margin: 0 0 1.2em 0; line-height: 1.7; font-size: 1.05rem; }
        .ProseMirror h2 { margin: 1.5em 0 0.8em 0; font-size: 1.8rem; font-weight: 700; color: #111827; }
        .ProseMirror h3 { margin: 1.25em 0 0.6em 0; font-size: 1.4rem; font-weight: 600; color: #111827; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 2rem auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .ProseMirror img.ProseMirror-selectednode { outline: 3px solid #3b82f6; }
      `}</style>
    </div>
  );
}
