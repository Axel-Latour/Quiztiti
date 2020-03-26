import { ContextMessageUpdate } from 'telegraf';
import { handleMessage, resetQuiz, sendRoundChoiceMessage, stopQuiz } from './index';

export const initializeBot = (bot) => {
  bot.command('start', (ctx) => {
    resetQuiz();
    sendRoundChoiceMessage(ctx, '');
  });

  bot.command('stop', (ctx: ContextMessageUpdate) => {
    stopQuiz(ctx);
  });

  bot.on('text', (ctx: ContextMessageUpdate) => {
    handleMessage(ctx);
  });

  bot.startPolling();
};