export function nextPrefixedId(prefix: string, existingIds: string[], pad = 3) {
  const nums = existingIds
    .map((id) => Number(id.replace(/\D/g, '')))
    .filter((n) => !Number.isNaN(n));
  const next = (Math.max(0, ...nums) + 1).toString().padStart(pad, '0');
  return `${prefix}${next}`;
}

export function nextBookingId(existingIds: string[]) {
  const year = new Date().getFullYear().toString().slice(-2);
  const nums = existingIds
    .map((id) => Number(id.replace(/\D/g, '').slice(-3)))
    .filter((n) => !Number.isNaN(n));
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
  return `DES${year}${next}`;
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'service'
  );
}

export function leanDoc<T extends Record<string, unknown>>(doc: T | null | undefined) {
  if (!doc) return null;
  const { _id: _ignored, __v: _v, ...rest } = doc;
  return rest as Omit<T, '_id' | '__v'>;
}
