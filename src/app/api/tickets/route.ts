import { NextResponse } from 'next/server';

export async function GET() {
  const tickets = Array.from({ length: 40 }, (_, i) => {
    const num = i + 1;
    let status: 'new' | 'passed' | 'failed' = 'new';
    if (num <= 3) status = 'passed';
    else if (num === 4) status = 'failed';
    const locked = num > 5; // Free tier locks > 5

    return {
      number: num,
      status,
      locked,
      totalQuestions: 20,
    };
  });

  return NextResponse.json({ tickets });
}
