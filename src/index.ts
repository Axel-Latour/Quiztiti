import Telegraf, { ContextMessageUpdate, Extra, Markup } from 'telegraf';
import { initializeBot } from './BotInitializer';
import { checkIfCategoryExists, checkIfRoundIsValid, constructCategoriesList, generateRoundButtons } from './ButtonGenerator';
import { fillSecretsWithLetters, replaceCharactersBySecret } from './HintHelper';
import { AnswerStatus } from './models/AnswerStatus';
import { Question } from './models/Question';
import { Quiz } from './models/Quiz';
import { QuizStatus } from './models/QuizStatus';
import { fetchQuestionsFromDatabase, generateQuizQuestions, normalizeAnswer } from './QuestionGenerator';

const bot = new Telegraf('1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8');

let hintTimer, nextQuestionTimer;
let quiz: Quiz = new Quiz();
let globalScore: { [key: string]: number } = {};

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
      ctx.reply('There must be an error on the QuizStatus');
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
    setTimeout(() => startQuiz(ctx), 3000);
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
  if (nextQuestionTimer) {
    clearTimeout(nextQuestionTimer);
  }
};

export const stopQuiz = (ctx: ContextMessageUpdate) => {
  let scoreMessage: string = '';
  const sortedPlayers = Object.keys(globalScore).sort((a, b) => globalScore[b] - globalScore[a]);
  sortedPlayers.forEach(name => {
    scoreMessage += `${name} : ${globalScore[name]} point(s)\n`;
  });
  ctx.replyWithHTML(`<b>Quiz is over ! Thanks for playing this awesome bot made by real professional !</b>\n\n${scoreMessage}`, Markup.removeKeyboard().extra());
  resetQuiz();
};

const checkAnswer = (ctx: ContextMessageUpdate) => {
  if (normalizeAnswer(ctx.message.text) === quiz.currentQuestion.normalizedAnswer) {
    sendAnswerAndNextQuestion(ctx, true);
  }
};

const sendAnswerAndNextQuestion = (ctx: ContextMessageUpdate, success: boolean) => {
  quiz.status = QuizStatus.WAITING;
  if (success) {
    handleSuccessMessage(ctx);
  } else {
    ctx.replyWithHTML(`Better luck next time ! The answer was :\n${quiz.currentQuestion.answer}\n`);
  }
  if (hintTimer) {
    clearInterval(hintTimer);
  }
  nextQuestionTimer = setTimeout(() => sendNextQuestion(ctx), 5000);
};

const handleSuccessMessage = (ctx: ContextMessageUpdate) => {
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

const sendNextQuestion = (ctx: ContextMessageUpdate) => {
  quiz.status = QuizStatus.PLAYING;
  quiz.answerStatus = AnswerStatus.INVISIBLE;
  if (quiz.currentRound <= quiz.numberOfRounds - 1) {
    quiz.currentQuestion = quiz.questions[quiz.currentRound];
    ctx.replyWithHTML(`<b>${quiz.currentQuestion.question}</b>`);
    quiz.currentRound++;
    sendHint(ctx);
  } else {
    stopQuiz(ctx);
  }
};

const generateHint = (ctx: ContextMessageUpdate) => {
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

const sendHint = (ctx: ContextMessageUpdate) => {
  hintTimer = setInterval(() => {
    if (quiz.answerStatus === AnswerStatus.SECOND_FILL) {
      sendAnswerAndNextQuestion(ctx, false);
    } else {
      generateHint(ctx);
      ctx.replyWithHTML(
        `Round ${quiz.currentRound}/${quiz.numberOfRounds}\n
<b>${quiz.currentQuestion.question}</b>\n
<i>${quiz.currentQuestion.hint}</i>`
      );
      quiz.answerStatus = quiz.answerStatus + 1;
    }
  }, 10000);
};

const closeKeyboard = (ctx: ContextMessageUpdate, message: string) => {
  ctx.reply(message, Markup.removeKeyboard().extra());
};