import { NextResponse } from 'next/server';

// Old demo endpoint with fake data; results are kept in /api/user/sync now.
export function GET() {
  return NextResponse.json({ error: 'gone' }, { status: 410 });
}

export function POST() {
  return NextResponse.json({ error: 'gone' }, { status: 410 });
}
