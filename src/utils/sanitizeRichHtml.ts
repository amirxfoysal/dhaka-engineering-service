import DOMPurify from 'dompurify';
import { RICH_TEXT_PATTERN, escapeHtml } from './richText';

const RICH_TEXT_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
];

// Allow http(s), mailto, tel, anchors, and relative URLs; block javascript: and data:.
const ALLOWED_URI_PATTERN = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i;

function hardenLinks(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('a').forEach((anchor) => {
    const href = anchor.getAttribute('href') ?? '';
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    } else {
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
    }
  });
  return container.innerHTML;
}

/**
 * Sanitizes editor HTML for safe rendering. The server applies the same
 * allow-list before saving, so this is defense in depth for the public site.
 */
export function sanitizeRichHtml(html: string): string {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICH_TEXT_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: ALLOWED_URI_PATTERN,
  });
  return hardenLinks(sanitized);
}

/**
 * Converts stored content to HTML. Older service descriptions are plain text,
 * so newlines are preserved as paragraphs/breaks until the category is edited.
 */
export function richTextToHtml(value: string): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  if (RICH_TEXT_PATTERN.test(trimmed)) return sanitizeRichHtml(trimmed);

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
