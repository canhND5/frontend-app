export interface EditorialSlugEntry {
  slug: string;
  ogTitle: string;
  ogDescription: string;
}

const R2_KEY = 'editorial/slugs.json';

export async function getEditorialSlugs(bucket: R2Bucket | undefined): Promise<EditorialSlugEntry[]> {
  if (!bucket) return [];
  try {
    const obj = await bucket.get(R2_KEY);
    if (!obj) return [];
    const raw = await obj.json<unknown>();
    return Array.isArray(raw) ? (raw as EditorialSlugEntry[]) : [];
  } catch {
    return [];
  }
}

export async function findEditorialSlug(
  bucket: R2Bucket | undefined,
  slug: string,
): Promise<EditorialSlugEntry | null> {
  const entries = await getEditorialSlugs(bucket);
  return entries.find((e) => e.slug === slug) ?? null;
}
