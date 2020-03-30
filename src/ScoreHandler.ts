import { IncomingMessage } from 'telegraf/typings/telegram-types';
import { ScoreData } from './models/ScoreData';

/**
 * Update a given player score by adding the points gained for his good answer
 * @param score : global score for the Quiz
 * @param message : message containing user informations
 * @param scoreToAdd : score obtained by the good answer
 */
export const updatePlayerScore = (score: { [key: string]: ScoreData }, message: IncomingMessage, scoreToAdd: number) => {
  const { from: { first_name, id } } = message;
  const scoreData: ScoreData = score[id] ? score[id] : new ScoreData();
  scoreData.playerName = first_name;
  scoreData.numberOfAnswers++;
  scoreData.totalScore += scoreToAdd;
  score[id] = scoreData;
};

/**
 * Sort player ids by their score. The highest score will be the first.
 * @param score global score for the Quiz
 */
export const getSortedPlayersIdByScore = (score: { [key: string]: ScoreData }): string[] => {
  return Object.keys(score).sort((a, b) => score[b].totalScore - score[a].totalScore);
};