export const RICH_TEXT_PATTERN =
  /<\/?(?:p|br|strong|b|em|i|u|s|strike|ul|ol|li|a|blockquote)\b[^>]*>/i;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Converts rich text HTML to a compact plain-text string for SEO/meta fields. */
export function richTextToPlainText(value: string): string {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return '';
  if (!RICH_TEXT_PATTERN.test(trimmed)) return trimmed;

  const withBreaks = trimmed
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');

  if (typeof DOMParser === 'undefined') {
    return withBreaks
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Cleans editor output so empty documents become an empty string. */
export function normalizeEditorHtml(html: string): string {
  const trimmed = html?.trim() ?? '';
  if (!trimmed) return '';

  const container = document.createElement('div');
  container.innerHTML = trimmed;
  const text = (container.textContent ?? '').replace(/\u00a0/g, ' ').trim();
  if (!text) return '';

  return container.innerHTML.trim();
}
