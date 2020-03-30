export enum AnswerStatus {
  INVISIBLE,
  VISIBLE,
  FIRST_FILL,
  SECOND_FILL,
}

export class AnswerOptions {
  status: AnswerStatus;
  timeBeforeNextStep: number;
  score: number;
}

export const ANSWER_OPTIONS: { [key: string]: AnswerOptions } = {
  INVISIBLE: {
    status: AnswerStatus.INVISIBLE,
    timeBeforeNextStep: 10000,
    score: 5,
  },
  VISIBLE: {
    status: AnswerStatus.VISIBLE,
    timeBeforeNextStep: 15000,
    score: 3,
  },
  FIRST_FILL: {
    status: AnswerStatus.FIRST_FILL,
    timeBeforeNextStep: 15000,
    score: 2,
  },
  SECOND_FILL: {
    status: AnswerStatus.SECOND_FILL,
    timeBeforeNextStep: 20000,
    score: 1,
  }
};