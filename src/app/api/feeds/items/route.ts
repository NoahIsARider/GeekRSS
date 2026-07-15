import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'RSS-Reader/1.0' },
});

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  try {
    const feed = await parser.parseURL(url);
    const items: FeedItem[] = (feed.items || []).slice(0, 50).map((item) => ({
      title: item.title || 'Untitled',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || '',
      contentSnippet: (item.contentSnippet || item.content || '').slice(0, 300),
    }));

    return NextResponse.json({
      title: feed.title || url,
      items,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch feed items';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
