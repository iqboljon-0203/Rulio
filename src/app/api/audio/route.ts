import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get('url');

  if (!src) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only proxy question audio; an open proxy lets anyone use the server to fetch arbitrary URLs.
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return NextResponse.json({ error: 'Bad url' }, { status: 400 });
  }
  const ALLOWED_HOSTS = ['api.osonprava.uz'];
  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.includes(parsed.hostname) || !parsed.pathname.endsWith('.mp3')) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  try {
    const res = await fetch(parsed, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch audio stream' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg';
    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Audio fetch error' }, { status: 500 });
  }
}
