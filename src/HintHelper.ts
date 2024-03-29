import { Question } from './models/Question';

const SECRET_CHAR: string = '_ ';

/**
 * Transform the answer into a hint with hidden characters.
 * Update the question reference.
 * @param question: question to update by setting the hint
 */
export const replaceCharactersBySecret = (question: Question) => {
  question.hintLetters = question.normalizedAnswer.split('').map(letter => {
    // For alphanumeric characters, hide them
    if (letter.match(/[\w]/)) {
      return SECRET_CHAR;
    } else if (letter === ' ') {
      // Double the spaces for better rendering
      return '  ';
    }
    // By default, just return the given letter ith a space (for special chars)
    return `${letter} `;
  });
  question.hint = question.hintLetters.join('');
};

/**
 * Update the given question object and generate the hint.
 * Hint is generated by displaying 25% of the answer.
 * @param question: question containing the current hint
 */
export const fillSecretsWithLetters = (question: Question) => {
  const { answer, discoveredLettersIndex, hintLetters } = question;
  // Returns a number between 1 and 25% of alphanumeric characters length (to avoid counting spaces or separators)
  // It will display 25% of the hint
  const numberOfHints = Math.ceil(answer.match(/[\w]/g).length / 4);
  const splittedAnswer: string[] = answer.split('');
  const indexesToFill = getIndexesToFill(answer, discoveredLettersIndex);
  // If there's as many hints to reveal than the indexes to fill, it means the answer will
  // be fully discovered. Just remove one index to fill to keep one blank in the answer
  if (numberOfHints === indexesToFill.length) {
    indexesToFill.splice(Math.floor(Math.random() * indexesToFill.length));
  }
  let randomIndex: number;
  let hintIndex: number;
  for (let i = 0; i < numberOfHints; i++) {
    // Generate random between 0 and the length of indexesToFill
    randomIndex = Math.floor(Math.random() * indexesToFill.length);
    // Find the index of the hint that must be filled
    hintIndex = indexesToFill[randomIndex];
    // Store the index that will be discovered
    discoveredLettersIndex.push(hintIndex);
    // Replace the hint hidden letter by the answer letter
    hintLetters[hintIndex] = `${splittedAnswer[hintIndex]} `;
    // Remove the displayed index rom the indexes to fill
    indexesToFill.splice(randomIndex, 1);
  }
  question.hint = hintLetters.join('');
};

/**
 * Generate an array containing the indexes of the answer
 * which are not already discovered
 * @param answer : answer for the current question
 * @param discoveredIndexes already discovered indexes of the answer
 */
export const getIndexesToFill = (answer: string, discoveredIndexes: number[]): number[] => {
  const indexesToFill = [];
  answer.split('').forEach((letter: string, index: number) => {
    // Only keep indexes which are not already discovered, and alphanumeric characters
    if (!discoveredIndexes.includes(index) && letter.match(/[\w]/)) {
      indexesToFill.push(index);
    }
  });
  return indexesToFill;
};