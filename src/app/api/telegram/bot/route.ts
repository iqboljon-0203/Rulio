import { NextResponse } from 'next/server';
import { getBotUsername } from '@/lib/auth';

// Returns the bot username so the login page can build the t.me link.
export async function GET() {
  const username = await getBotUsername();
  const cleanUsername = (username || 'ruliouzbot')
    .replace(/^https?:\/\/t\.me\//, '')
    .replace(/^@/, '')
    .replace(/\/$/, '')
    .trim();
  return NextResponse.json({
    username: cleanUsername,
    link: `https://t.me/${cleanUsername}?start=login`,
  });
}
