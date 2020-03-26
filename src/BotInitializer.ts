import { ContextMessageUpdate } from 'telegraf';
import { handleMessage, resetQuiz, sendRoundChoiceMessage, stopQuiz } from './index';

export const initializeBot = (bot) => {
  bot.command('start', (ctx) => {
    console.log('start command has been triggered');
    resetQuiz();
    sendRoundChoiceMessage(ctx, '');
  });

  bot.command('stop', (ctx: ContextMessageUpdate) => {
    console.log('stop command has been triggered');
    stopQuiz(ctx);
  });

  bot.on('text', (ctx: ContextMessageUpdate) => {
    handleMessage(ctx);
  });

  bot.startPolling();
};