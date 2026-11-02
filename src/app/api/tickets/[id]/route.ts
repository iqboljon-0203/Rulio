import { NextResponse } from 'next/server';
import { getQuestionsForTicket } from '@/lib/db';
import { sessionFromRequest } from '@/lib/auth';
import { FREE_TICKETS, isPremium } from '@/lib/billing';

const TOTAL_TICKETS = 63;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticketNumber = parseInt(id, 10);

  if (isNaN(ticketNumber) || ticketNumber < 1 || ticketNumber > TOTAL_TICKETS) {
    return NextResponse.json({ error: `Bilet raqami 1–${TOTAL_TICKETS} oralig'ida bo'lishi kerak` }, { status: 400 });
  }

  if (ticketNumber > FREE_TICKETS) {
    const user = await sessionFromRequest(request);
    if (!(await isPremium(user?.telegramId))) {
      return NextResponse.json({ error: 'premium_required' }, { status: 402 });
    }
  }

  const questions = getQuestionsForTicket(ticketNumber);
  return NextResponse.json({ ticketNumber, totalQuestions: questions.length, questions });
}
