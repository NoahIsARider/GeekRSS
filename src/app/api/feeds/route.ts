import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createCustomFeed, getDefaultFeeds } from '@/lib/feed-catalog';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'RSS-Reader/1.0' },
});

export async function GET() {
  return NextResponse.json({ feeds: getDefaultFeeds() });
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    const feed = await parser.parseURL(url.trim());
    const title = feed.title || new URL(url).hostname;
    const customFeed = createCustomFeed(url.trim(), title);

    return NextResponse.json({ feed: customFeed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to parse feed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, id });
}
