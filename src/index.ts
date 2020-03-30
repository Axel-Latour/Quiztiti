const Telegraf = require('telegraf');
import { initializeBot } from './BotInitializer';
import { checkIfCategoryExists, checkIfRoundIsValid, INFINITE_ROUND } from './ButtonGenerator';
import { fillSecretsWithLetters, replaceCharactersBySecret } from './HintHelper';
import { getPartyBeginsMessage } from './MessageGenerator';
import { ANSWER_OPTIONS, AnswerStatus } from './models/AnswerOptions';
import { Question } from './models/Question';
import { Quiz } from './models/Quiz';
import { QuizStatus } from './models/QuizStatus';
import { fetchQuestionsFromDatabase, getRandomQuestion } from './QuestionGenerator';
import { QuiztitiContext } from './QuiztitiContext';
import { normalizeText, removeNonAlphanumericCharacters } from './utils';

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN, { contextType: QuiztitiContext });

const questionsDatabase: Question[] = fetchQuestionsFromDatabase();

initializeBot(bot);

let hintTimer, nextQuestionTimer, quizStartTimer;
let quiz: Quiz = new Quiz();

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
    quizStartTimer = setTimeout(() => startQuiz(ctx), 1500);
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
export const resetQuiz = (ctx: QuiztitiContext) => {
  quiz = new Quiz();
  ctx.quizData.scoreHandler.score = {};
  clearTimeout(hintTimer);
  clearTimeout(quizStartTimer);
  clearTimeout(nextQuestionTimer);
};

/**
 * Stop the current quiz, by resetting all the global data and sending
 * the appropriate message
 * @param ctx
 */
export const stopQuiz = (ctx: QuiztitiContext) => {
  ctx.replyEndOfQuiz(ctx.quizData.scoreHandler.score);
  resetQuiz(ctx);
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

/**
 * Update quiz data when changing question, send the message containing the answer
 * and wait a bit before sending the next question
 * @param ctx
 * @param success : true if answer was found
 */
const sendAnswerAndNextQuestion = (ctx: QuiztitiContext, success: boolean) => {
  // Need to have a special status, to avoid treating answers while waiting for the next question (after answer reception)
  quiz.status = QuizStatus.WAITING;
  quiz.currentRound++;
  sendAnswer(ctx, success);
  // Avoid sending next hints if answer has been found
  clearTimeout(hintTimer);
  nextQuestionTimer = setTimeout(() => sendNextQuestion(ctx), 5000);
};

/**
 * Send message according to the success on the question.
 * If answer was found, send a congrats message and handle score.
 * If not, just send a message with the answer
 * @param ctx
 * @param success true if the answer was found
 */
const sendAnswer = (ctx: QuiztitiContext, success: boolean) => {
  if (success) {
    ctx.quizData.scoreHandler.updatePlayerScore(ctx.quizData.scoreHandler.score, ctx.message, quiz.answerStatus.score);
    ctx.replyWhenAnswerFound(quiz.currentQuestion.answer, ctx.message.from.first_name, quiz.answerStatus.score);
  } else {
    ctx.replyWhenAnswerNotFound(quiz.currentQuestion.answer);
  }
};

/**
 * Send the next question if it's not already the last one.
 * Otherwise, it stops the quiz.
 * If a question must be sent, it's generated randomly from the database
 * @param ctx
 */
const sendNextQuestion = (ctx: QuiztitiContext) => {
  quiz.status = QuizStatus.PLAYING;
  quiz.answerStatus = ANSWER_OPTIONS.INVISIBLE;
  // -1 means infinite round
  if (quiz.numberOfRounds === -1 || quiz.currentRound <= quiz.numberOfRounds) {
    quiz.currentQuestion = getRandomQuestion(questionsDatabase);
    console.log(quiz.currentQuestion);
    ctx.replyWithQuestion(quiz);
    sendHint(ctx);
  } else {
    stopQuiz(ctx);
  }
};

/**
 * Generate the content of the hint, depending on its current status.
 * Update the status to the next step
 * @param ctx
 */
const generateHint = (ctx: QuiztitiContext) => {
  switch (quiz.answerStatus.status) {
    case AnswerStatus.INVISIBLE:
      quiz.answerStatus = ANSWER_OPTIONS.VISIBLE;
      replaceCharactersBySecret(quiz.currentQuestion);
      break;
    case AnswerStatus.VISIBLE:
      quiz.answerStatus = ANSWER_OPTIONS.FIRST_FILL;
      fillSecretsWithLetters(quiz.currentQuestion);
      break;
    case AnswerStatus.FIRST_FILL:
      quiz.answerStatus = ANSWER_OPTIONS.SECOND_FILL;
      fillSecretsWithLetters(quiz.currentQuestion);
      break;
    default:
      ctx.reply('There must be an error on the AnswerStatus');
      break;
  }
};

/**
 * Send the next hint if question is still in progress.
 * If all the hints have been given, send the next question.
 * This method has recursivity inside the setTimeout to handle different
 * timer between each step
 * @param ctx
 */
const sendHint = (ctx: QuiztitiContext) => {
  // Store the interval before passing to the next AnswerStatus
  const interval: number = quiz.answerStatus.timeBeforeNextStep;
  hintTimer = setTimeout(() => {
    if (quiz.answerStatus.status === AnswerStatus.SECOND_FILL) {
      sendAnswerAndNextQuestion(ctx, false);
    } else {
      generateHint(ctx);
      ctx.replyWithQuestion(quiz);
      // Recursive call to handle different interval using setTimeout between each hint
      sendHint(ctx);
    }
  }, interval);
};