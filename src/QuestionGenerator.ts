import { Question } from './models/Question';
import { Quiz } from './models/Quiz';

const fs = require('fs');

export const fetchQuestionsFromDatabase = (): Question[] => {
  const databaseContent: string = fs.readFileSync('src/assets/database.json', 'utf8');
  if (databaseContent) {
    const usableQuestions: Question[] = JSON.parse(databaseContent)?.questions.filter(question => question.theme !== 'Anagramme');
    usableQuestions.forEach(question => {
      // Normalize the answer to avoid accent issues when answering questions
      question.answer = question.answer.replace('-', ' ');
      question.normalizedAnswer = normalizeAnswer(question.answer);
    });
    return usableQuestions;
  }
  return [];
};

export const generateQuizQuestions = (questionsDatabase: Question[], quiz: Quiz): Question[] => {
  const questions: Question[] = [];
  let randomIndex: number;

  for (let i = 0; i < quiz.numberOfRounds; i++) {
    randomIndex = Math.floor(Math.random() * (questionsDatabase.length));
    questions.push(questionsDatabase[randomIndex]);
  }
  return questions;
};

export const normalizeAnswer = (answer: string): string => {
  return answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};