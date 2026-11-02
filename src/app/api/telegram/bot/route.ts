import { NextResponse } from 'next/server';
import { getBotUsername } from '@/lib/auth';

// Returns the bot username so the login page can build the t.me link.
export async function GET() {
  const username = await getBotUsername();
  if (!username) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN sozlanmagan' }, { status: 503 });
  }
  return NextResponse.json({ username, link: `https://t.me/${username}?start=login` });
}
