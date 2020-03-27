import { Markup } from 'telegraf';
import { constructCategoriesList, generateRoundButtons } from './ButtonGenerator';
import { getCategoryChoiceMessage, getRoundChoiceMessage } from './MessageHelper';

const Telegraf = require('telegraf');

export class QuiztitiContext extends Telegraf.Context {
  constructor(update, telegram, options) {
    super(update, telegram, options);
  }

  /**
   * Send a message to channel with buttons for Category choice displayed
   * in the keyboard
   */
  replyWithCategoryChoice = () => {
    super.replyWithHTML(
      getCategoryChoiceMessage(),
      Markup
        .keyboard(constructCategoriesList())
        .oneTime()
        .resize()
        .extra());
  };

  /**
   * Send a message to channel with buttons for Round choice displayed
   * in the keyboard
   * @param category: selected category, displayed in the message
   */
  replyWithRoundChoice = (category: string) => {
    super.replyWithHTML(
      getRoundChoiceMessage(category),
      Markup
        .keyboard(generateRoundButtons())
        .oneTime()
        .resize()
        .extra()
    )
  };

  /**
   * Send a message and remove all buttons displayed in the keyboard
   * @param message: message to send
   */
  closeKeyboard = (message: string) => {
    super.replyWithHTML(message, Markup.removeKeyboard().extra());
  };
}