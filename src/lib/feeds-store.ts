import fs from 'node:fs';
import path from 'node:path';

const STORE_PATH = path.join(process.env.COZE_WORKSPACE_PATH || '/tmp', 'data', 'feeds.json');

export interface Feed {
  id: string;
  url: string;
  title: string;
  addedAt: string;
}

function ensureDir(): void {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const DEFAULT_FEEDS: Omit<Feed, 'id' | 'addedAt'>[] = [
  { url: 'https://hnrss.org/frontpage', title: 'Hacker News' },
  { url: 'https://lobste.rs/rss', title: 'Lobsters' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', title: 'Ars Technica' },
  { url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge' },
  { url: 'https://css-tricks.com/feed/', title: 'CSS-Tricks' },
];

function seedDefaults(): Feed[] {
  const now = new Date().toISOString();
  return DEFAULT_FEEDS.map((f) => ({
    ...f,
    id: crypto.randomUUID(),
    addedAt: now,
  }));
}

function readFeeds(): Feed[] {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    const defaults = seedDefaults();
    writeFeeds(defaults);
    return defaults;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as Feed[];
  } catch {
    return [];
  }
}

function writeFeeds(feeds: Feed[]): void {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(feeds, null, 2), 'utf-8');
}

export function getAllFeeds(): Feed[] {
  return readFeeds();
}

export function addFeed(url: string, title: string): Feed {
  const feeds = readFeeds();
  const existing = feeds.find((f) => f.url === url);
  if (existing) return existing;
  const feed: Feed = {
    id: crypto.randomUUID(),
    url,
    title,
    addedAt: new Date().toISOString(),
  };
  feeds.push(feed);
  writeFeeds(feeds);
  return feed;
}

export function removeFeed(id: string): boolean {
  const feeds = readFeeds();
  const idx = feeds.findIndex((f) => f.id === id);
  if (idx === -1) return false;
  feeds.splice(idx, 1);
  writeFeeds(feeds);
  return true;
}
