import { ContextMessageUpdate, Extra, Markup } from 'telegraf';
import { constructCategoriesList } from './buttonGenerator';
import { resetGame, stopGame } from './index';

export const initializeBot = (bot) => {
  bot.command('start', (ctx) => {
    resetGame();
    return ctx.reply(
      `Quiztitiiiiiiiiii ! Starting a new game ! Please, choose your category : `,
      Extra
        .inReplyTo(ctx.message.message_id)
        .markup(Markup
          .keyboard(constructCategoriesList())
          .oneTime()
          .resize())
    );
  });

  bot.command('stop', (ctx: ContextMessageUpdate) => {
    stopGame(ctx);
  });

  bot.startPolling();
};