import Telegraf, { ContextMessageUpdate, Extra, Markup } from 'telegraf';
import { initializeBot } from './BotInitializer';
import { checkIfCategoryExists, checkIfRoundIsValid, constructCategoriesList, generateRoundButtons } from './ButtonGenerator';
import { AnswerStatus } from './models/AnswerStatus';
import { Question } from './models/Question';
import { Quiz } from './models/Quiz';
import { QuizStatus } from './models/QuizStatus';
import { fetchQuestionsFromDatabase, generateQuizQuestions, normalizeAnswer } from './QuestionGenerator';

const bot = new Telegraf('1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8');

let hintTimer;
let quiz: Quiz = new Quiz();

export const questionsDatabase: Question[] = fetchQuestionsFromDatabase();

initializeBot(bot);

export const handleMessage = (ctx: ContextMessageUpdate) => {
  switch (quiz.status) {
    case QuizStatus.CHOOSING_CATEGORY:
      onCategoryChoice(ctx);
      break;
    case QuizStatus.CHOOSING_ROUND:
      onRoundChoice(ctx);
      break;
    case QuizStatus.PLAYING:
      checkAnswer(ctx);
      break;
    case QuizStatus.WAITING:
      break;
    default:
      ctx.reply('There must be an error on the Quiz');
      break;
  }
};

export const sendCategoryChoiceMessage = (ctx: ContextMessageUpdate) => {
  ctx.reply(
    `Quiztitiiiiiiiiii ! Starting a new game ! Please, choose your category : `,
    Extra
      .inReplyTo(ctx.message.message_id)
      .markup(Markup
        .keyboard(constructCategoriesList())
        .oneTime()
        .resize())
  );
};

export const sendRoundChoiceMessage = (ctx: ContextMessageUpdate, category: string) => {
  ctx.reply(`You choose ${category}. Now choose the number of rounds : `,
    Extra
      .inReplyTo(ctx.message.message_id)
      .markup(Markup
        .keyboard(generateRoundButtons())
        .oneTime()
        .resize()
      ));
  quiz.status = QuizStatus.CHOOSING_ROUND;
};

const onCategoryChoice = (ctx: ContextMessageUpdate) => {
  const { message } = ctx;
  const { text: category } = message;
  if (checkIfCategoryExists(category)) {
    quiz.category = category;
    sendRoundChoiceMessage(ctx, category);
  }
};

const onRoundChoice = (ctx: ContextMessageUpdate) => {
  if (checkIfRoundIsValid(ctx.message.text)) {
    quiz.numberOfRounds = parseInt(ctx.message.text);
    closeKeyboard(ctx, `${ctx.message.text} rounds : Let the Quiz begin !`);
    startQuiz(ctx);
  }
};

const startQuiz = (ctx: ContextMessageUpdate) => {
  quiz.status = QuizStatus.WAITING;
  quiz.questions = generateQuizQuestions(questionsDatabase, quiz);
  console.log(quiz.questions);
  quiz.status = QuizStatus.PLAYING;
  sendNextQuestion(ctx);
};

export const resetQuiz = () => {
  quiz = new Quiz();
  if (hintTimer) {
    clearInterval(hintTimer);
  }
};

export const stopQuiz = (ctx: ContextMessageUpdate) => {
  ctx.reply("Quiz is over ! Thanks for playing this awesome bot made by real professional !", Markup.removeKeyboard().extra());
  resetQuiz();
};

const checkAnswer = (ctx: ContextMessageUpdate) => {
  if (normalizeAnswer(ctx.message.text) === quiz.currentQuestion.normalizedAnswer) {
    sendAnswerAndNextQuestion(ctx, true);
  }
};

const sendAnswerAndNextQuestion = (ctx: ContextMessageUpdate, success: boolean) => {
  ctx.reply(`${success ? 'Well done ' : 'Better luck next time '} ! The answer was : ${quiz.currentQuestion.answer}`);
  if (hintTimer) {
    clearInterval(hintTimer);
  }
  setTimeout(() => sendNextQuestion(ctx), 5000);
};

const sendNextQuestion = (ctx: ContextMessageUpdate) => {
  quiz.answerStatus = AnswerStatus.INVISIBLE;
  if (quiz.numberOfRounds === -1 || quiz.currentRound <= quiz.numberOfRounds) {
    quiz.currentQuestion = quiz.questions[quiz.currentRound - 1];
    ctx.replyWithHTML(quiz.currentQuestion.question);
    quiz.currentRound++;
    sendHint(ctx);
  } else {
    stopQuiz(ctx);
  }
};

const sendHint = (ctx: ContextMessageUpdate) => {
  hintTimer = setInterval(() => {
    if (quiz.answerStatus === AnswerStatus.SECOND_FILL) {
      sendAnswerAndNextQuestion(ctx, false);
    } else {
      ctx.replyWithHTML(
        `<b>${quiz.currentQuestion.question}</b>\n`
      );
      quiz.answerStatus = quiz.answerStatus + 1;
    }
  }, 10000);
};

const closeKeyboard = (ctx: ContextMessageUpdate, message: string) => {
  ctx.reply(message, Markup.removeKeyboard().extra());
};