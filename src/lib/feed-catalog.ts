import rawFeeds from '../../data/feeds.json';

export type FeedSource = 'default' | 'custom';

export interface FeedRecord {
  id: string;
  url: string;
  title: string;
  addedAt: string;
  source: FeedSource;
}

interface RawFeedRecord {
  id?: string;
  url: string;
  title: string;
  addedAt?: string;
}

const defaultTimestamp = '2026-07-15T00:00:00.000Z';

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function normalizeFeedRecord(
  feed: RawFeedRecord,
  index: number,
  source: FeedSource,
): FeedRecord {
  return {
    id: feed.id || `${source}-${index + 1}`,
    url: normalizeUrl(feed.url),
    title: feed.title.trim(),
    addedAt: feed.addedAt || defaultTimestamp,
    source,
  };
}

export function getDefaultFeeds(): FeedRecord[] {
  return rawFeeds.map((feed, index) => normalizeFeedRecord(feed, index, 'default'));
}

export function mergeFeeds(defaultFeeds: FeedRecord[], customFeeds: FeedRecord[]): FeedRecord[] {
  const merged = new Map<string, FeedRecord>();

  for (const feed of defaultFeeds) {
    merged.set(normalizeUrl(feed.url), feed);
  }

  for (const feed of customFeeds) {
    const key = normalizeUrl(feed.url);
    if (!merged.has(key)) {
      merged.set(key, { ...feed, url: key, source: 'custom' });
    }
  }

  return Array.from(merged.values());
}

export function serializeCustomFeeds(feeds: FeedRecord[]): FeedRecord[] {
  return feeds.filter((feed) => feed.source === 'custom');
}

export function createCustomFeed(url: string, title: string): FeedRecord {
  return {
    id: crypto.randomUUID(),
    url: normalizeUrl(url),
    title: title.trim(),
    addedAt: new Date().toISOString(),
    source: 'custom',
  };
}
