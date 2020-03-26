import { Question } from './models/Question';
import { Quiz } from './models/Quiz';

const fs = require('fs');

export const fetchQuestionsFromDatabase = (): Question[] => {
  const databaseContent: string = fs.readFileSync('src/assets/database.json', 'utf8');
  if (databaseContent) {
    const questions: Question[] = JSON.parse(databaseContent)?.questions;
    // Normalize the answer to avoid accent issues when answering questions
    questions.forEach(question => {
      question.normalizedAnswer = normalizeAnswer(question.answer);
    });
    return questions;
  }
  return [];
};

export const generateQuizQuestions = (questionsDatabase: Question[], quiz: Quiz): Question[] => {
  const randomIndex: number = Math.floor(Math.random() * (questionsDatabase.length - quiz.numberOfRounds));
  return questionsDatabase.slice(randomIndex, randomIndex + quiz.numberOfRounds);
};

export const normalizeAnswer = (answer: string): string => {
  return answer.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};