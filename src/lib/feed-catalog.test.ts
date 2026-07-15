import assert from 'node:assert/strict';
import test from 'node:test';

import { getDefaultFeeds, mergeFeeds, serializeCustomFeeds } from '@/lib/feed-catalog';

test('getDefaultFeeds normalizes built-in feed records', () => {
  const feeds = getDefaultFeeds();

  assert.ok(feeds.length >= 8);
  assert.equal(feeds[0]?.source, 'default');
  assert.ok(feeds.every((feed) => feed.id.length > 0));
  assert.ok(feeds.every((feed) => feed.url.startsWith('https://')));
});

test('mergeFeeds deduplicates custom feeds by URL and keeps defaults first', () => {
  const defaults = [
    {
      id: 'default-hn',
      url: 'https://hnrss.org/frontpage',
      title: 'Hacker News',
      addedAt: '2026-07-15T00:00:00.000Z',
      source: 'default' as const,
    },
  ];
  const custom = [
    {
      id: 'custom-duplicate',
      url: 'https://hnrss.org/frontpage',
      title: 'HN duplicate',
      addedAt: '2026-07-15T01:00:00.000Z',
      source: 'custom' as const,
    },
    {
      id: 'custom-new',
      url: 'https://github.blog/feed/',
      title: 'GitHub Blog',
      addedAt: '2026-07-15T02:00:00.000Z',
      source: 'custom' as const,
    },
  ];

  const merged = mergeFeeds(defaults, custom);

  assert.deepEqual(
    merged.map((feed) => feed.id),
    ['default-hn', 'custom-new'],
  );
});

test('serializeCustomFeeds drops built-in feed records', () => {
  const feeds = [
    {
      id: 'default-hn',
      url: 'https://hnrss.org/frontpage',
      title: 'Hacker News',
      addedAt: '2026-07-15T00:00:00.000Z',
      source: 'default' as const,
    },
    {
      id: 'custom-gh',
      url: 'https://github.blog/feed/',
      title: 'GitHub Blog',
      addedAt: '2026-07-15T02:00:00.000Z',
      source: 'custom' as const,
    },
  ];

  assert.deepEqual(serializeCustomFeeds(feeds), [feeds[1]]);
});
