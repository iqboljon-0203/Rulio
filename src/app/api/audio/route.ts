import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get('url');

  if (!src) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(src, {
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
