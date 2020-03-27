/**
 * Handle methods associated to the Question class.
 * Manage data fetch from database, and fetch questions for the Quiz
 */

import { Question } from './models/Question';
import { normalizeText } from './utils';

const fs = require('fs');

/**
 * Read database.json content to fetch all the existing questions.
 * Generate an Array of Question, with improvements on data quality
 */
export const fetchQuestionsFromDatabase = (): Question[] => {
  const databaseContent: string = fs.readFileSync('src/assets/database.json', 'utf8');
  if (databaseContent) {
    const usableQuestions: Question[] = JSON.parse(databaseContent)?.questions.filter(question => question.theme !== 'Anagramme');
    usableQuestions.forEach(question => {
      // Replace dashes to avoid weird render when displaying hints
      question.answer = question.answer.replace('-', ' ');
      // Normalize the answer to avoid accent issues when answering questions
      question.normalizedAnswer = normalizeText(question.answer);
    });
    return usableQuestions;
  }
  return [];
};

export const getRandomQuestion = (questionsDatabase: Question[]): Question => {
  const randomIndex = Math.floor(Math.random() * (questionsDatabase.length));
  return questionsDatabase[randomIndex];
};