'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import {
  mergeFeeds,
  serializeCustomFeeds,
  type FeedRecord,
} from '@/lib/feed-catalog';

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

const CUSTOM_FEEDS_STORAGE_KEY = 'geekrss.custom-feeds.v1';

function formatDate(d: string): string {
  if (!d) return '';
  try {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function loadStoredCustomFeeds(): FeedRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CUSTOM_FEEDS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FeedRecord[]) : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [defaultFeeds, setDefaultFeeds] = useState<FeedRecord[]>([]);
  const [customFeeds, setCustomFeeds] = useState<FeedRecord[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<FeedRecord | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState('');
  const [storageReady, setStorageReady] = useState(false);

  const feeds = useMemo(
    () => mergeFeeds(defaultFeeds, customFeeds),
    [defaultFeeds, customFeeds],
  );

  const fetchFeeds = useCallback(async () => {
    try {
      const res = await fetch('/api/feeds');
      const data = await res.json();
      setDefaultFeeds(Array.isArray(data.feeds) ? (data.feeds as FeedRecord[]) : []);
    } catch {
      setError('failed to load feeds');
    }
  }, []);

  const fetchItems = useCallback(async (feed: FeedRecord) => {
    setItemsLoading(true);
    setSelectedFeed(feed);
    try {
      const res = await fetch(`/api/feeds/items?url=${encodeURIComponent(feed.url)}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    setCustomFeeds(loadStoredCustomFeeds());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      CUSTOM_FEEDS_STORAGE_KEY,
      JSON.stringify(serializeCustomFeeds(customFeeds)),
    );
  }, [customFeeds, storageReady]);

  // auto-select first feed on initial load
  useEffect(() => {
    if (feeds.length > 0 && !selectedFeed) {
      fetchItems(feeds[0]);
    }
  }, [feeds, selectedFeed, fetchItems]);

  const handleAddFeed = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const feed = data.feed as FeedRecord;
        const nextCustomFeeds = mergeFeeds([], [...customFeeds, feed]).filter(
          (customFeed) => customFeed.source === 'custom',
        );
        const nextFeeds = mergeFeeds(defaultFeeds, nextCustomFeeds);
        const nextSelectedFeed =
          nextFeeds.find((candidate) => candidate.url === feed.url) || feed;

        setInputUrl('');
        setCustomFeeds(nextCustomFeeds);
        fetchItems(nextSelectedFeed);
      }
    } catch {
      setError('failed to add feed');
    } finally {
      setLoading(false);
    }
  }, [customFeeds, defaultFeeds, fetchItems, inputUrl]);

  const handleRemoveFeed = useCallback((id: string) => {
    setCustomFeeds((previousFeeds) =>
      previousFeeds.filter((feed) => feed.id !== id),
    );

    if (selectedFeed?.id === id) {
      setSelectedFeed(null);
      setItems([]);
    }
  }, [selectedFeed]);

  return (
    <div className="min-h-screen max-w-[960px] mx-auto px-4 py-6">
      {/* header */}
      <header className="mb-6 border-b border-border pb-4">
        <h1 className="text-[15px] font-bold tracking-tight text-foreground">
          {'>'} rss
        </h1>
        <p className="text-muted text-[12px] mt-1">minimal feed reader</p>
      </header>

      {/* add feed */}
      <form onSubmit={handleAddFeed} className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://example.com/feed.xml"
          className="flex-1 bg-transparent border border-border px-3 py-1.5 text-foreground placeholder:text-muted focus:outline-none focus:border-accent-green"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 border border-border text-accent-green hover:bg-hover disabled:opacity-50 cursor-pointer"
        >
          {loading ? '...' : '+ add'}
        </button>
      </form>

      {error && (
        <div className="text-red-400 text-[12px] mb-4">! {error}</div>
      )}

      <div className="mb-4 text-muted text-[11px]">
        repo defaults ship with the site, custom feeds stay in this browser
      </div>

      <div className="flex gap-6">
        {/* sidebar: feed list */}
        <aside className="w-[240px] shrink-0">
          <div className="text-muted text-[11px] uppercase tracking-wider mb-2">
            feeds ({feeds.length})
          </div>
          {feeds.length === 0 && (
            <div className="text-muted text-[12px]">no feeds yet</div>
          )}
          <ul className="space-y-0">
            {feeds.map((feed) => (
              <li
                key={feed.id}
                className="group flex items-start justify-between border-b border-border py-1.5"
              >
                <button
                  onClick={() => fetchItems(feed)}
                  className={`text-left flex-1 truncate cursor-pointer ${
                    selectedFeed?.id === feed.id
                      ? 'text-accent-green'
                      : 'text-foreground hover:text-accent-green'
                  }`}
                >
                  {feed.title}
                </button>
                {feed.source === 'custom' && (
                  <button
                    onClick={() => handleRemoveFeed(feed.id)}
                    className="text-muted hover:text-red-400 ml-2 opacity-0 group-hover:opacity-100 cursor-pointer text-[12px]"
                    title="remove"
                  >
                    x
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* main: items */}
        <main className="flex-1 min-w-0">
          {!selectedFeed && feeds.length > 0 && (
            <div className="text-muted text-[12px]">select a feed to read</div>
          )}
          {!selectedFeed && feeds.length === 0 && (
            <div className="text-muted text-[12px]">
              add a feed url above to get started
            </div>
          )}
          {selectedFeed && (
            <>
              <div className="text-muted text-[11px] uppercase tracking-wider mb-3 border-b border-border pb-2">
                {selectedFeed.title}
                {items.length > 0 && ` — ${items.length} items`}
              </div>
              {itemsLoading && <div className="text-muted">loading...</div>}
              <ul className="space-y-0">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="border-b border-border py-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-muted text-[11px] shrink-0 w-[20px] text-right">
                        {i + 1}.
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:text-accent-green truncate"
                      >
                        {item.title}
                      </a>
                      {item.pubDate && (
                        <span className="text-muted text-[11px] shrink-0 ml-auto pl-4">
                          {formatDate(item.pubDate)}
                        </span>
                      )}
                    </div>
                    {item.contentSnippet && (
                      <div className="text-muted text-[12px] mt-0.5 pl-[28px] truncate">
                        {stripHtml(item.contentSnippet)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>
      </div>

      {/* footer */}
      <footer className="mt-12 pt-4 border-t border-border text-muted text-[11px]">
        rss — no cookies, no tracking, just feeds
      </footer>
    </div>
  );
}
