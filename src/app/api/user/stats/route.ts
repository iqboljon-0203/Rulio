import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    overallReadiness: 68,
    totalTestsTaken: 24,
    passRate: 75,
    streakDays: 5,
    averageScore: 82,
    ticketsProgress: {
      passed: 12,
      failed: 3,
      unattempted: 25,
      total: 40,
    },
    categoryBreakdown: [
      { category: "Yo'l belgilari", percentage: 85, color: 'success' },
      { category: "Harakat tartibi", percentage: 70, color: 'primary' },
      { category: "Svetofor va belgilari", percentage: 90, color: 'success' },
      { category: "Birinchi yordam", percentage: 55, color: 'warning' },
      { category: "Texnik holat", percentage: 40, color: 'error' },
      { category: "Jazo choralari", percentage: 35, color: 'error' },
    ],
  });
}
