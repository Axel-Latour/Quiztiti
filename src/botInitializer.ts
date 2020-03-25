import { constructCategoriesList } from './buttonGenerator';
import { resetGame } from './index';
import { ContextMessageUpdate, Extra, Markup } from 'telegraf';

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
    return ctx.reply('Okay... Please, come back quick ! Bye !', Markup.removeKeyboard().extra());
  });

  bot.startPolling();
};