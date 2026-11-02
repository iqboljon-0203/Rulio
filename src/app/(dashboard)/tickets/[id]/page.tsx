'use client';

import { useParams, useRouter } from 'next/navigation';
import { TestRunner } from '@/components/test/TestRunner';
import type { QuestionWithAnswer } from '@/types/test';

export default function TicketTestPage() {
  const params = useParams();
  const router = useRouter();
  const ticketNumber = parseInt((params?.id as string) || '1', 10);

  const load = async (): Promise<QuestionWithAnswer[]> => {
    const res = await fetch(`/api/tickets/${ticketNumber}`);
    if (res.status === 402) {
      router.replace('/pricing?locked=1');
      return [];
    }
    const data = await res.json();
    return data.questions ?? [];
  };

  return <TestRunner key={ticketNumber} mode="ticket" ticketNumber={ticketNumber} loadQuestions={load} />;
}
