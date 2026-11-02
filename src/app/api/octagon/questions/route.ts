import { NextResponse } from 'next/server';
import { allQuestions } from '@/lib/db';
import { FREE_TICKETS } from '@/lib/billing';

// 5 short text questions from the free tickets for a fast 1v1 round
export async function GET() {
  const pool = allQuestions.filter((q) => q.ticketNumber <= FREE_TICKETS);
  const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
  return NextResponse.json({ success: true, questions: selected });
}
