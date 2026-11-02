import { NextResponse } from 'next/server';
import { allQuestions } from '@/lib/db';

// Returns specific questions by id (used by the "Saqlanganlar" page).
export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get('ids') || '').split(',').filter(Boolean).slice(0, 200);
  const set = new Set(ids);
  return NextResponse.json({ questions: allQuestions.filter((q) => set.has(q.questionId)) });
}
