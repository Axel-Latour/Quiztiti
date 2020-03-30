import { Quiz } from './models/Quiz';
import { ScoreData } from './models/ScoreData';

export const getCategoryChoiceMessage = (): string => `Quiztitiiiiii ! 😀
Get ready for the next quiz ! 💪

Choose your category :`;

export const getRoundChoiceMessage = (category: string): string => `You chose : ${category} !
Now, let's choose the duration :`

export const getQuestionMessage = (quiz: Quiz): string =>
  `<i>Round ${quiz.currentRound}${quiz.numberOfRounds !== -1 ? '/' + quiz.numberOfRounds : ''} - Theme : ${quiz.currentQuestion.theme}</i>

<b>${quiz.currentQuestion.question}</b>

<i>${quiz.currentQuestion.hint || ''}</i>`;

export const getEndOfQuizMessage = (scoreMessage: string): string => `🏁 <b>Quiz is over ! Thanks for playing this awesome bot made by real professional !</b>

${scoreMessage}`;

export const getPartyBeginsMessage = (round: string): string => `${round} rounds : Let the Quiz begin !`;

export const getAnswerNotfoundMessage = (answer: string): string => `❌ Better luck next time ! The answer was : <b>${answer}</b>`;

export const getAnswerFoundMessage = (answer: string, playerName: string, score: number): string => `✅ Well done ! The answer was : <b>${answer}</b>

${playerName} won ${score} point(s) !`;

export const getPlayersScoreMessage = (score: { [key: string]: ScoreData }, sortedPlayerIds: string[]): string => {
  let scoreMessage: string = '';
  sortedPlayerIds.forEach(id => {
    scoreMessage += `${score[id].playerName} : ${score[id].totalScore} point(s) with ${score[id].numberOfAnswers} answer(s)\n`;
  });
  return scoreMessage;
};