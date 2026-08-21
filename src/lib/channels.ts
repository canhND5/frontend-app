export interface ChannelEntry {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface CmsChannel {
  id: string;
  name: string;
  desc?: string | null;
  avatarUrl?: string | null;
}

const FALLBACK: ChannelEntry[] = [
  { id: 'ntd', name: 'NTD 新唐人', avatarUrl: null },
  { id: 'gjw', name: '干净世界', avatarUrl: null },
  { id: 'djy', name: '大紀元 YT', avatarUrl: null },
  { id: 'soh', name: '希望之聲', avatarUrl: null },
];

/**
 * Fetch channels.json from the CMS_MANIFEST R2 bucket.
 * Falls back to the static list when the binding is absent (npm run dev)
 * or the object cannot be read.
 */
export async function fetchChannels(bucket: R2Bucket | undefined): Promise<ChannelEntry[]> {
  if (!bucket) return FALLBACK;

  try {
    const obj = await bucket.get('channels.json');
    if (!obj) return FALLBACK;

    const raw = await obj.json<unknown>();
    const arr: CmsChannel[] = Array.isArray(raw) ? raw : [];
    if (arr.length === 0) return FALLBACK;

    return arr.map(ch => ({
      id: ch.id,
      name: ch.name,
      avatarUrl: ch.avatarUrl ?? null,
    }));
  } catch {
    return FALLBACK;
  }
}
