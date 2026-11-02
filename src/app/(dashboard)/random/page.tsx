'use client';

import { TestRunner } from '@/components/test/TestRunner';
import type { QuestionWithAnswer } from '@/types/test';

export default function RandomTestPage() {
  const load = async (): Promise<QuestionWithAnswer[]> => {
    const res = await fetch('/api/random');
    const data = await res.json();
    return data.questions ?? [];
  };

  return <TestRunner mode="random" loadQuestions={load} />;
}
