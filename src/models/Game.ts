import { AnswerStatus } from './AnswerStatus';
import { GameStatus } from './GameStatus';
import { Question } from './Question';

export class Game {
  status: GameStatus = GameStatus.CHOOSING_CATEGORY;
  category: string;
  numberOfRounds: number;
  currentRound: number = 1;
  questions: Question[];
  currentQuestion: Question;
  answerStatus: AnswerStatus = AnswerStatus.INVISIBLE;
}