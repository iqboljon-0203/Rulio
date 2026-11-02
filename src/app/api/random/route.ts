import { NextResponse } from 'next/server';
import { allQuestions } from '@/lib/db';
import { sessionFromRequest } from '@/lib/auth';
import { FREE_TICKETS, isPremium } from '@/lib/billing';

// Free users get random questions only from the free tickets.
export async function GET(request: Request) {
  const user = await sessionFromRequest(request);
  const premium = await isPremium(user?.telegramId);
  const pool = premium ? allQuestions : allQuestions.filter((q) => q.ticketNumber <= FREE_TICKETS);
  const questions = [...pool]
    .sort(() => 0.5 - Math.random())
    .slice(0, 20)
    .map((q, i) => ({ ...q, questionNumber: i + 1 }));
  return NextResponse.json({ testType: 'random', premium, totalQuestions: questions.length, questions });
}
