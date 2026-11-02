export interface TestResult {
  id: string;
  userId: string;
  testType: 'ticket' | 'random' | 'category';
  ticketNumber?: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  timeSpent?: number;
  passed: boolean;
  createdAt: number;
}

export interface UserAnswer {
  id: string;
  testResultId: string;
  questionId: string;
  selectedAnswer?: number;
  isCorrect: boolean;
  timeSpent?: number;
  createdAt: number;
}

export interface TestState {
  testType: 'ticket' | 'random' | 'category';
  ticketNumber?: number;
  questions: QuestionWithAnswer[];
  currentIndex: number;
  startedAt: number;
  timeLimit: number; // seconds
  answers: Record<string, number | null>; // questionId -> selectedAnswer
}

export interface QuestionWithAnswer {
  questionId: string;
  ticketNumber: number;
  questionNumber: number;
  category: string;
  categoryRu?: string;
  text: string;
  textRu?: string;
  imageUrl?: string;
  correctAnswer: number;
  explanation?: string;
  explanationRu?: string;
  answers: { index: number; text: string; textRu?: string }[];
}

export type PaymentProvider = 'payme' | 'click' | 'uzum';
export type SubscriptionPlan = 'free' | '2_week' | '1_month' | '3_month';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface Payment {
  id: string;
  userId: string;
  provider: PaymentProvider;
  providerTransactionId?: string;
  amount: number;
  plan: SubscriptionPlan;
  status: PaymentStatus;
  createdAt: number;
  completedAt?: number;
}

export const planDurations: Record<SubscriptionPlan, number> = {
  free: 0,
  '2_week': 14 * 24 * 60 * 60,
  '1_month': 30 * 24 * 60 * 60,
  '3_month': 90 * 24 * 60 * 60,
};

export const planPrices: Record<SubscriptionPlan, number> = {
  free: 0,
  '2_week': 15000,
  '1_month': 25000,
  '3_month': 59000,
};
