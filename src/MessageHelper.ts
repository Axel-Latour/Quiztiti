import { Quiz } from './models/Quiz';

export const getCategoryChoiceMessage = (): string => `Quiztitiiiiii ! 😀
Get ready for the next quiz ! 💪

Choose your category :`;

export const getRoundChoiceMessage = (category: string): string => `You chose : ${category} !
Now, let's choose the duration : ⌛`

export const getQuestionMessage = (quiz: Quiz): string =>
  `<i>Round ${quiz.currentRound}${quiz.numberOfRounds !== -1 ? '/' + quiz.numberOfRounds : ''} - Theme : ${quiz.currentQuestion.theme}</i>

<b>${quiz.currentQuestion.question}</b>

<i>${quiz.currentQuestion.hint || ''}</i>`;

export const getEndOfQuizMessage = (scoreMessage: string): string => `🏁 <b>Quiz is over ! Thanks for playing this awesome bot made by real professional !</b>

${scoreMessage}`;

export const getPartyBeginsMessage = (round: string): string => `${round} rounds : Let the Quiz begin !`;