import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
} from 'react';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  RemoveFormatting,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { escapeHtml, normalizeEditorHtml } from '../../utils/richText';
import './RichTextEditor.css';

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

type ActiveFormats = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  unorderedList: boolean;
  orderedList: boolean;
};

const EMPTY_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  unorderedList: false,
  orderedList: false,
};

function normalizeLinkUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

function hardenEditorLinks(editor: HTMLElement) {
  editor.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href') ?? '';
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else {
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
    }
  });
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 150,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef('');
  const [active, setActive] = useState<ActiveFormats>(EMPTY_FORMATS);
  const [isEmpty, setIsEmpty] = useState(!value);

  const readActive = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    if (!selection.anchorNode || !editor.contains(selection.anchorNode)) {
      setActive(EMPTY_FORMATS);
      return;
    }
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough'),
      unorderedList: document.queryCommandState('insertUnorderedList'),
      orderedList: document.queryCommandState('insertOrderedList'),
    });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value !== lastValueRef.current) {
      editor.innerHTML = value;
      lastValueRef.current = value;
      setIsEmpty(!normalizeEditorHtml(value));
    }
  }, [value]);

  useEffect(() => {
    document.addEventListener('selectionchange', readActive);
    return () => document.removeEventListener('selectionchange', readActive);
  }, [readActive]);

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    const clean = normalizeEditorHtml(editor.innerHTML);
    if (!clean && editor.innerHTML) editor.innerHTML = '';
    lastValueRef.current = clean;
    setIsEmpty(!clean);
    onChange(clean);
  }

  function runCommand(command: string, commandValue?: string) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, commandValue);
    hardenEditorLinks(editor);
    emitChange();
    readActive();
  }

  function insertLink() {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const savedRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    const input = window.prompt('Link URL', 'https://');
    if (input === null) return;
    const url = normalizeLinkUrl(input);
    if (!url) {
      window.alert('Enter a valid http, https, mailto, tel, or relative link.');
      return;
    }

    editor.focus();
    if (savedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    const collapsed = !selection || selection.isCollapsed || selection.rangeCount === 0;
    if (collapsed) {
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          url,
        )}</a>`,
      );
    } else {
      document.execCommand('createLink', false, url);
    }

    hardenEditorLinks(editor);
    emitChange();
    readActive();
  }

  function clearFormatting() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    if (document.queryCommandState('insertUnorderedList')) {
      document.execCommand('insertUnorderedList');
    }
    if (document.queryCommandState('insertOrderedList')) {
      document.execCommand('insertOrderedList');
    }
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    hardenEditorLinks(editor);
    emitChange();
    readActive();
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    emitChange();
  }

  function handleFocus() {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // Not supported in every browser; the server normalizes the HTML.
    }
    readActive();
  }

  return (
    <div className="rich-text-editor">
      <span className="rich-text-editor__label">{label}</span>
      <div className="rich-text-editor__frame">
        <div className="rich-text-editor__toolbar" role="toolbar" aria-label={`${label} formatting`}>
          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Bold"
            aria-pressed={active.bold}
            title="Bold (Ctrl/Cmd+B)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('bold')}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Italic"
            aria-pressed={active.italic}
            title="Italic (Ctrl/Cmd+I)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('italic')}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Underline"
            aria-pressed={active.underline}
            title="Underline (Ctrl/Cmd+U)"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('underline')}
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Strikethrough"
            aria-pressed={active.strikethrough}
            title="Strikethrough"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('strikeThrough')}
          >
            <Strikethrough size={16} />
          </button>

          <span className="rich-text-editor__divider" aria-hidden="true" />

          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Bullet list"
            aria-pressed={active.unorderedList}
            title="Bullet list"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('insertUnorderedList')}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Numbered list"
            aria-pressed={active.orderedList}
            title="Numbered list"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand('insertOrderedList')}
          >
            <ListOrdered size={16} />
          </button>

          <span className="rich-text-editor__divider" aria-hidden="true" />

          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Insert link"
            title="Insert link"
            onMouseDown={(event) => event.preventDefault()}
            onClick={insertLink}
          >
            <Link2 size={16} />
          </button>
          <button
            type="button"
            className="rich-text-editor__tool"
            aria-label="Clear formatting"
            title="Clear formatting"
            onMouseDown={(event) => event.preventDefault()}
            onClick={clearFormatting}
          >
            <RemoveFormatting size={16} />
          </button>
        </div>

        <div className="rich-text-editor__input-wrap">
          {isEmpty && placeholder && (
            <span className="rich-text-editor__placeholder" aria-hidden="true">
              {placeholder}
            </span>
          )}
          <div
            ref={editorRef}
            className="rich-text-editor__input"
            contentEditable
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            style={{ minHeight }}
            onInput={emitChange}
            onBlur={emitChange}
            onPaste={handlePaste}
            onKeyUp={readActive}
            onMouseUp={readActive}
            onFocus={handleFocus}
          />
        </div>
      </div>
    </div>
  );
}
