import { NextResponse } from 'next/server';
import { allQuestions } from '@/lib/db';
import { sessionFromRequest } from '@/lib/auth';
import { FREE_TICKETS, isPremium } from '@/lib/billing';

// Returns specific questions by id (used by the "Saqlanganlar" page).
// Free users only get questions from the free tickets, otherwise ids (q-1…q-1251)
// could be used to download the whole paid bank.
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 200);
  const set = new Set(ids);
  const user = await sessionFromRequest(request);
  const premium = await isPremium(user?.telegramId);
  const questions = allQuestions.filter((q) => set.has(q.questionId) && (premium || q.ticketNumber <= FREE_TICKETS));
  return NextResponse.json({ questions });
}
