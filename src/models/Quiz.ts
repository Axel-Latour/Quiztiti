import { ANSWER_OPTIONS, AnswerOptions } from './AnswerOptions';
import { Question } from './Question';
import { QuizStatus } from './QuizStatus';

export class Quiz {
  status: QuizStatus = QuizStatus.CHOOSING_ROUND;
  category: string;
  numberOfRounds: number;
  currentRound: number = 1;
  currentQuestion: Question;
  answerStatus: AnswerOptions = ANSWER_OPTIONS.INVISIBLE;
}