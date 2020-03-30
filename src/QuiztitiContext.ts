import { Markup } from 'telegraf';
import { constructCategoriesList, generateRoundButtons } from './ButtonGenerator';
import { getAnswerFoundMessage, getAnswerNotfoundMessage, getCategoryChoiceMessage, getEndOfQuizMessage, getPlayersScoreMessage, getQuestionMessage, getRoundChoiceMessage } from './MessageGenerator';
import { Quiz } from './models/Quiz';
import { ScoreData } from './models/ScoreData';
import { getSortedPlayersIdByScore } from './ScoreHandler';

const Telegraf = require('telegraf');

/**
 * Override of the Telegraf Context to handle all the messages
 * sent using the bot
 */
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
   * Send a message containing a question with all its informations
   * @param quiz : quiz configuration, containing the current question
   */
  replyWithQuestion = (quiz: Quiz) => {
    super.replyWithHTML(getQuestionMessage(quiz));
  };

  /**
   * Send a message when the answer to the question has not been found
   * @param answer : answer for the current question
   */
  replyWhenAnswerNotFound = (answer: string) => {
    super.replyWithHTML(getAnswerNotfoundMessage(answer));
  };

  /**
   * Send a message when the answer to the question has been found.
   * @param answer : answer for the current question
   * @param playerName : name of the player who found the answer
   * @param score : number of points won
   */
  replyWhenAnswerFound = (answer: string, playerName: string, score: number) => {
    super.replyWithHTML(getAnswerFoundMessage(answer, playerName, score));
  };

  /**
   * Send a message when the quiz is over
   */
  replyEndOfQuiz = (score: { [key: string]: ScoreData }) => {
    super.replyWithHTML(getEndOfQuizMessage(getPlayersScoreMessage(score, getSortedPlayersIdByScore(score))), Markup.removeKeyboard().extra());
  };

  /**
   * Send a message and remove all buttons displayed in the keyboard
   * @param message: message to send
   */
  closeKeyboard = (message: string) => {
    super.replyWithHTML(message, Markup.removeKeyboard().extra());
  };
}