'use client';

import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';
import { Label } from './label';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  labelName?: string;
  labelClassName?: string;
  error?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }): React.JSX.Element | null => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-300 bg-gray-50 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('bold') ? 'bg-gray-300' : 'bg-white',
        )}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('italic') ? 'bg-gray-300' : 'bg-white',
        )}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <div className="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : 'bg-white',
        )}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : 'bg-white',
        )}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : 'bg-white',
        )}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </button>
      <div className="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('bulletList') ? 'bg-gray-300' : 'bg-white',
        )}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'rounded p-2 hover:bg-gray-200',
          editor.isActive('orderedList') ? 'bg-gray-300' : 'bg-white',
        )}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="rounded bg-white p-2 hover:bg-gray-200"
        title="Horizontal Rule"
      >
        <Minus size={18} />
      </button>
      <div className="mx-1 w-px bg-gray-300" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="rounded bg-white p-2 hover:bg-gray-200 disabled:opacity-50"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="rounded bg-white p-2 hover:bg-gray-200 disabled:opacity-50"
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, labelName, labelClassName, error }, ref) => {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || 'Start typing...',
        }),
      ],
      content: value,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-base max-w-none min-h-[500px] p-6 focus:outline-none',
            'prose-headings:font-bold prose-headings:text-gray-900',
            'prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:pb-2 prose-h1:border-b prose-h1:border-gray-300',
            'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4',
            'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3',
            'prose-p:my-3 prose-p:leading-relaxed prose-p:text-gray-700',
            'prose-ul:my-4 prose-ul:ml-6 prose-ol:my-4 prose-ol:ml-6',
            'prose-li:my-1',
          ),
        },
      },
    });

    // Update editor content when value prop changes
    React.useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    return (
      <div ref={ref} className="relative grid w-full items-center gap-2">
        {labelName && (
          <Label htmlFor="rich-text-editor" className={labelClassName}>
            {labelName}
          </Label>
        )}
        <div
          className={cn(
            'overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm',
            { 'border-red-500': error },
            className,
          )}
        >
          <MenuBar editor={editor} />
          <EditorContent editor={editor} />
        </div>
        {error && <small className="text-red-500">{error}</small>}
      </div>
    );
  },
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
