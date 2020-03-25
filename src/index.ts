import Telegraf, { ContextMessageUpdate, Extra, Markup } from 'telegraf';
import { initializeBot } from './botInitializer';
import { checkIfCategoryExists, checkIfRoundIsValid, generateRoundButtons, INFINITE_ROUNDS } from './buttonGenerator';
import { AnswerStatus } from './models/AnswerStatus';
import { Game } from './models/Game';
import { GameStatus } from './models/GameStatus';
import { Question } from './models/Question';

const fs = require('fs');

const bot = new Telegraf('1132298501:AAHW-k5TMwYISexLi3DyN0YTHBzDwxd3oW8');

let hintTimer;
let game: Game = new Game();

initializeBot(bot);

bot.on('text', (ctx: ContextMessageUpdate) => {
  switch (game.status) {
    case GameStatus.CHOOSING_CATEGORY:
      onCategoryChoice(ctx);
      break;
    case GameStatus.CHOOSING_ROUND:
      onRoundChoice(ctx);
      break;
    case GameStatus.PLAYING:
      checkAnswer(ctx);
      break;
    case GameStatus.WAITING:
      break;
    default:
      ctx.reply('There must be an error on the Game');
      break;
  }
});

const onCategoryChoice = (ctx: ContextMessageUpdate) => {
  const { message } = ctx;
  const { text: category } = message;
  if (checkIfCategoryExists(category)) {
    game.category = category;
    ctx.reply(`You choose ${category}. Now choose the number of rounds : `,
      Extra
        .inReplyTo(message.message_id)
        .markup(Markup.keyboard(generateRoundButtons())));
    game.status = GameStatus.CHOOSING_ROUND;
  }
};

const onRoundChoice = (ctx: ContextMessageUpdate) => {
  if (checkIfRoundIsValid(ctx.message.text)) {
    game.numberOfRounds = ctx.message.text === INFINITE_ROUNDS ? -1 : parseInt(ctx.message.text);
    closeKeyboard(ctx, `${ctx.message.text} rounds : let the Quiz begin !`);
    startGame(ctx);
  }
};

const startGame = (ctx: ContextMessageUpdate) => {
  fetchQuestions(ctx);
};

export const resetGame = () => {
  game = new Game();
  if (hintTimer) {
    clearInterval(hintTimer);
  }
};

export const stopGame = (ctx: ContextMessageUpdate) => {
  ctx.reply("Quiz is over ! Thanks for playing this awesome bot made by real professional !", Markup.removeKeyboard().extra());
  resetGame();
};

const checkAnswer = (ctx: ContextMessageUpdate) => {
  if (ctx.message.text === game.currentQuestion.answer) {
    sendAnswerAndNetxQuestion(ctx, true);
  }
};

const sendAnswerAndNetxQuestion = (ctx: ContextMessageUpdate, success: boolean) => {
  ctx.reply(`${success ? 'Well done ' : 'Better luck next time '} ! The answer was : ${game.currentQuestion.answer}`);
  if (hintTimer) {
    clearInterval(hintTimer);
  }
  setTimeout(() => sendNextQuestion(ctx), 5000);
};

const sendNextQuestion = (ctx: ContextMessageUpdate) => {
  game.answerStatus = AnswerStatus.INVISIBLE;
  if (game.numberOfRounds === -1 || game.currentRound <= game.numberOfRounds) {
    game.currentQuestion = game.questions[game.currentRound - 1];
    ctx.replyWithHTML(game.currentQuestion.question);
    game.currentRound++;
    sendHint(ctx);
  } else {
    stopGame(ctx);
  }
};

const sendHint = (ctx: ContextMessageUpdate) => {
  hintTimer = setInterval(() => {
    if (game.answerStatus === AnswerStatus.SECOND_FILL) {
      sendAnswerAndNetxQuestion(ctx, false);
    } else {
      ctx.replyWithHTML(game.currentQuestion.question);
      game.answerStatus = game.answerStatus + 1;
    }
  }, 10000);
};

const fetchQuestions = (ctx: ContextMessageUpdate) => {
  const questions: Question[] = JSON.parse(fs.readFileSync('src/assets/database.json', 'utf8')).questions;
  const randomIndex: number = Math.floor(Math.random() * (questions.length - game.numberOfRounds));
  game.questions = questions.slice(randomIndex, randomIndex + game.numberOfRounds);
  console.log(game.questions);
  game.status = GameStatus.PLAYING;
  sendNextQuestion(ctx);
};

const closeKeyboard = (ctx: ContextMessageUpdate, message: string) => {
  ctx.reply(message, Markup.removeKeyboard().extra());
};