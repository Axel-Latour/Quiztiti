const Telegraf = require('telegraf');
import { Markup } from 'telegraf';
import { initializeBot } from './BotInitializer';
import { checkIfCategoryExists, checkIfRoundIsValid, INFINITE_ROUND } from './ButtonGenerator';
import { fillSecretsWithLetters, replaceCharactersBySecret } from './HintHelper';
import { getEndOfQuizMessage, getPartyBeginsMessage, getQuestionMessage } from './MessageHelper';
import { AnswerStatus } from './models/AnswerStatus';
import { Question } from './models/Question';
import { Quiz } from './models/Quiz';
import { QuizStatus } from './models/QuizStatus';
import { fetchQuestionsFromDatabase, getRandomQuestion } from './QuestionGenerator';
import { QuiztitiContext } from './QuiztitiContext';
import { normalizeText, removeNonAlphanumericCharacters } from './utils';

const bot = new Telegraf('1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8', { contextType: QuiztitiContext });

const questionsDatabase: Question[] = fetchQuestionsFromDatabase();

initializeBot(bot);

let hintTimer, nextQuestionTimer;
let quiz: Quiz = new Quiz();
let globalScore: { [key: string]: number } = {};

/**
 * Triggered on all messages received from Telegram.
 * Only treat them when the quiz is playing, to avoid bad interpretations
 * @param ctx
 */
export const handleMessage = (ctx: QuiztitiContext) => {
  if (quiz.status === QuizStatus.PLAYING) {
    checkAnswer(ctx);
  }
};

/**
 * Triggered for the category choice
 * @param ctx
 */
export const sendCategoryChoiceMessage = (ctx: QuiztitiContext) => {
  ctx.replyWithCategoryChoice();
};

/**
 * Triggered for the round choice
 * @param ctx
 */
const sendRoundChoiceMessage = (ctx: QuiztitiContext) => {
  ctx.replyWithRoundChoice(ctx.message.text);
  quiz.status = QuizStatus.CHOOSING_ROUND;
};

/**
 * Triggered when category has been chosen.
 * Check if its value is valid, and pass to the next step
 * @param ctx
 */
export const onCategoryChoice = (ctx: QuiztitiContext) => {
  const category = removeNonAlphanumericCharacters(ctx.message.text);
  if (checkIfCategoryExists(category)) {
    console.log('Choosen category : ', category);
    quiz.category = category;
    sendRoundChoiceMessage(ctx);
  }
};

/**
 * Triggered when number of rounds has been chosen.
 * Check if round value is valid, remove buttons from keyboard and start the quiz
 * @param ctx
 */
export const onRoundChoice = (ctx: QuiztitiContext) => {
  const round = removeNonAlphanumericCharacters(ctx.message.text);
  if (checkIfRoundIsValid(round)) {
    console.log('Choosen round : ', round);
    quiz.numberOfRounds = round === INFINITE_ROUND ? -1 : parseInt(round);
    ctx.closeKeyboard(getPartyBeginsMessage(ctx.message.text));
    setTimeout(() => startQuiz(ctx), 1500);
  }
};

/**
 * Start quiz by updating its status and calling for the next question
 * @param ctx
 */
const startQuiz = (ctx: QuiztitiContext) => {
  console.log('Quiz state at the beginning : ', quiz);
  quiz.status = QuizStatus.PLAYING;
  sendNextQuestion(ctx);
};

/**
 * Reset all the data associated to the quiz, to be able to restart properly
 */
export const resetQuiz = () => {
  quiz = new Quiz();
  globalScore = {};
  clearInterval(hintTimer);
  clearTimeout(nextQuestionTimer);
};

export const stopQuiz = (ctx: QuiztitiContext) => {
  let scoreMessage: string = '';
  const sortedPlayers = Object.keys(globalScore).sort((a, b) => globalScore[b] - globalScore[a]);
  sortedPlayers.forEach(name => {
    scoreMessage += `${name} : ${globalScore[name]} point(s)\n`;
  });
  ctx.replyWithHTML(getEndOfQuizMessage(scoreMessage), Markup.removeKeyboard().extra());
  resetQuiz();
};

/**
 * Check if the given answer is matching with the question's answer.
 * If it is, pass to the next question
 * @param ctx
 */
const checkAnswer = (ctx: QuiztitiContext) => {
  if (normalizeText(ctx.message.text) === quiz.currentQuestion.normalizedAnswer) {
    sendAnswerAndNextQuestion(ctx, true);
  }
};

const sendAnswerAndNextQuestion = (ctx: QuiztitiContext, success: boolean) => {
  quiz.status = QuizStatus.WAITING;
  quiz.currentRound++;
  if (success) {
    handleSuccessMessage(ctx);
  } else {
    ctx.replyWithHTML(`Better luck next time ! The answer was :\n${quiz.currentQuestion.answer}\n`);
  }
  clearInterval(hintTimer);
  nextQuestionTimer = setTimeout(() => sendNextQuestion(ctx), 5000);
};

const handleSuccessMessage = (ctx: QuiztitiContext) => {
  let score: number;
  switch (quiz.answerStatus) {
    case AnswerStatus.INVISIBLE:
      score = 5;
      break;
    case AnswerStatus.VISIBLE:
      score = 3;
      break;
    case AnswerStatus.FIRST_FILL:
      score = 2;
      break;
    case AnswerStatus.SECOND_FILL:
      score = 1;
      break;
  }
  if (!globalScore[ctx.message.from.first_name]) {
    globalScore[ctx.message.from.first_name] = 0;
  }
  globalScore[ctx.message.from.first_name] = globalScore[ctx.message.from.first_name] + score;
  ctx.reply(`Well done ! The answer was : \n${quiz.currentQuestion.answer}\n\n${ctx.message.from.first_name} won ${score} point(s) !`);
};

const sendNextQuestion = (ctx: QuiztitiContext) => {
  quiz.status = QuizStatus.PLAYING;
  quiz.answerStatus = AnswerStatus.INVISIBLE;
  if (quiz.numberOfRounds === -1 || quiz.currentRound <= quiz.numberOfRounds) {
    quiz.currentQuestion = getRandomQuestion(questionsDatabase);
    console.log(quiz.currentQuestion);
    ctx.replyWithHTML(getQuestionMessage(quiz));
    sendHint(ctx);
  } else {
    stopQuiz(ctx);
  }
};

const generateHint = (ctx: QuiztitiContext) => {
  switch (quiz.answerStatus) {
    case AnswerStatus.INVISIBLE:
      replaceCharactersBySecret(quiz.currentQuestion);
      break;
    case AnswerStatus.VISIBLE:
    case AnswerStatus.FIRST_FILL:
      fillSecretsWithLetters(quiz.currentQuestion);
      break;
    default:
      ctx.reply('There must be an error on the AnswerStatus');
      break;
  }
};

const sendHint = (ctx: QuiztitiContext) => {
  hintTimer = setInterval(() => {
    if (quiz.answerStatus === AnswerStatus.SECOND_FILL) {
      sendAnswerAndNextQuestion(ctx, false);
    } else {
      generateHint(ctx);
      ctx.replyWithHTML(getQuestionMessage(quiz));
      quiz.answerStatus = quiz.answerStatus + 1;
    }
  }, 20000);
};