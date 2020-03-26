import { Question } from './models/Question';

const SECRET_CHAR: string = '_ ';

export const replaceCharactersBySecret = (question: Question) => {
  const hintLetters: string[] = [];
  question.normalizedAnswer.split('').forEach(letter => {
    if (letter.match(/[\w]/)) {
      hintLetters.push(SECRET_CHAR);
    } else if (letter === ' ') {
      hintLetters.push('  ');
    } else {
      hintLetters.push(`${letter} `);
    }
  });
  question.hintLetters = hintLetters;
  question.discoveredLettersIndex = [];
  question.hint = question.hintLetters.join('');
};

export const fillSecretsWithLetters = (question: Question) => {
  const { answer, discoveredLettersIndex, hintLetters } = question;
  const numberOfHints = Math.ceil(answer.match(/[\w]/g).length / 4);
  const splittedAnswer: string[] = answer.split('');
  const indexesToFill = getIndexesToFill(answer, discoveredLettersIndex);
  let randomIndex: number;
  let hintIndex: number;
  for (let i = 0; i < numberOfHints; i++) {
    randomIndex = Math.ceil(Math.random() * (indexesToFill.length - 1));
    hintIndex = indexesToFill[randomIndex];
    discoveredLettersIndex.push(hintIndex);
    hintLetters[hintIndex] = `${splittedAnswer[hintIndex]} `;
    indexesToFill.splice(randomIndex, 1);
  }
  question.hint = hintLetters.join('');
};

export const getIndexesToFill = (answer: string, discoveredIndexes: number[]): number[] => {
  const indexesToFill = [];
  answer.split('').forEach((letter: string, index: number) => {
    if (!discoveredIndexes.includes(index) && letter.match(/[\w]/)) {
      indexesToFill.push(index);
    }
  });
  return indexesToFill;
};