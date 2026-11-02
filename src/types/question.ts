export interface Question {
  id: string;
  ticketNumber: number;
  questionNumber: number;
  category: string;
  text: string;          // Current locale text
  imageUrl?: string;
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: Answer[];
}

export interface Answer {
  id: string;
  questionId: string;
  answerIndex: number;
  text: string;          // Current locale text
}

export interface QuestionDB {
  id: string;
  ticket_number: number;
  question_number: number;
  category: string;
  text_uz_lat: string;
  text_uz_cyr: string | null;
  text_ru: string | null;
  image_url: string | null;
  correct_answer: number;
  explanation_uz_lat: string | null;
  explanation_uz_cyr: string | null;
  explanation_ru: string | null;
  difficulty: string;
  is_active: number;
  created_at: number;
}

export interface AnswerDB {
  id: string;
  question_id: string;
  answer_index: number;
  text_uz_lat: string;
  text_uz_cyr: string | null;
  text_ru: string | null;
}

export type QuestionCategory =
  | 'belgilar'        // Yo'l belgilari
  | 'svetofor'        // Svetofor
  | 'chiziqlar'       // Yo'l chiziqlari
  | 'harakat'         // Harakat tartibi
  | 'qoidalar'        // Yo'l harakati qoidalari
  | 'birinchi_yordam' // Birinchi tibbiy yordam
  | 'texnik'          // Texnik holat
  | 'jazo';           // Jazo choralari

export const categoryNames: Record<QuestionCategory, { 'uz-lat': string; 'uz-cyr': string; ru: string }> = {
  belgilar: { 'uz-lat': "Yo'l belgilari", 'uz-cyr': 'Йўл белгилари', ru: 'Дорожные знаки' },
  svetofor: { 'uz-lat': 'Svetofor', 'uz-cyr': 'Светофор', ru: 'Светофор' },
  chiziqlar: { 'uz-lat': "Yo'l chiziqlari", 'uz-cyr': 'Йўл чизиқлари', ru: 'Дорожная разметка' },
  harakat: { 'uz-lat': 'Harakat tartibi', 'uz-cyr': 'Ҳаракат тартиби', ru: 'Порядок движения' },
  qoidalar: { 'uz-lat': "Yo'l harakati qoidalari", 'uz-cyr': 'Йўл ҳаракати қоидалари', ru: 'ПДД' },
  birinchi_yordam: { 'uz-lat': "Birinchi tibbiy yordam", 'uz-cyr': 'Биринчи тиббий ёрдам', ru: 'Первая помощь' },
  texnik: { 'uz-lat': 'Texnik holat', 'uz-cyr': 'Техник ҳолат', ru: 'Техническое состояние' },
  jazo: { 'uz-lat': 'Jazo choralari', 'uz-cyr': 'Жазо чоралари', ru: 'Штрафные санкции' },
};
