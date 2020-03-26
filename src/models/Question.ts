export class Question {
  question: string;
  answer: string;
  normalizedAnswer: string;
  hint: string;
  hintLetters: string[];
  discoveredLettersIndex: number[];
  theme: string;
}