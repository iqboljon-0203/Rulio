import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { testType, ticketNumber, totalQuestions, correctAnswers, wrongAnswers, timeSpent } = body;

    const passed = correctAnswers >= 18;
    const resultId = `res-${Date.now()}`;

    return NextResponse.json({
      success: true,
      result: {
        id: resultId,
        testType,
        ticketNumber,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        passed,
        timeSpent,
        createdAt: Date.now(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Natijani saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
