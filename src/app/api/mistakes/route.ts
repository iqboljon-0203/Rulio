import { NextResponse } from 'next/server';

// Mistakes are kept on the device (localStorage "rulio_mistakes"); the page reads them directly.
export function GET() {
  return NextResponse.json({ totalMistakes: 0, questions: [] });
}
