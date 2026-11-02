import { QuestionWithAnswer } from '@/types/test';
import rawQuestions from './questions-data.json';

export interface YHQQuestion extends QuestionWithAnswer {
  categoryKey?: string;
  audioUrl?: string;
}

export const allQuestions: QuestionWithAnswer[] = rawQuestions as unknown as QuestionWithAnswer[];
export const sampleQuestions: QuestionWithAnswer[] = allQuestions.slice(0, 20);

// Get 20 authentic questions for a specific ticket (Tickets 1 to 63)
export function getQuestionsForTicket(ticketId: number): QuestionWithAnswer[] {
  const filtered = allQuestions.filter((q) => q.ticketNumber === ticketId);
  if (filtered.length > 0) {
    return filtered;
  }
  // Fallback if ticketId exceeds or isn't found
  const startIndex = Math.max(0, ((ticketId - 1) * 20) % allQuestions.length);
  return allQuestions.slice(startIndex, startIndex + 20).map((q, idx) => ({
    ...q,
    ticketNumber: ticketId,
    questionNumber: idx + 1,
  }));
}

// Generate random 20 questions for Practice/Random mode
export function getRandomQuestions(count = 20): QuestionWithAnswer[] {
  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((q, idx) => ({
    ...q,
    questionNumber: idx + 1,
  }));
}

// Filter questions by Category
export function getQuestionsByCategory(categoryName: string): QuestionWithAnswer[] {
  const filtered = allQuestions.filter((q) =>
    q.category.toLowerCase().includes(categoryName.toLowerCase())
  );
  return filtered.length > 0 ? filtered : allQuestions.slice(0, 20);
}
