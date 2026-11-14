import sanitizeHtml from 'sanitize-html';

export function sanitizeRichText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [
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
      'div',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto', 'tel'],
    },
    allowProtocolRelative: false,
    transformTags: {
      div: 'p',
      b: 'strong',
      i: 'em',
      strike: 's',
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';
        if (!href) return { tagName, attribs: {} as Record<string, string> };
        if (/^https?:\/\//i.test(href)) {
          return {
            tagName,
            attribs: { href, target: '_blank', rel: 'noopener noreferrer' },
          };
        }
        return { tagName, attribs: { href } };
      },
    },
  }).trim();
}

export function richTextIsEmpty(value: string): boolean {
  const text = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/gi, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return !text;
}
