export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizData {
  article: string;
  questions: Question[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export type AppState = 'input' | 'quiz' | 'results' | 'history';

export interface QuizHistoryItem {
  id: number;
  timestamp: number;
  article: string;
  questions: Question[];
  answers: UserAnswer[];
  score: number;
  total: number;
}
