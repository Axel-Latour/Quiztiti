/**
 * This file is used to handle Button generated on the keyboard : generate list
 * of Buttons and check the validity of the selected values
 */
export const ROUND_PREFIX = '⌛';
export const CATEGORY_PREFIX = '📖';
export const ALL_CATEGORIES = 'All';
export const INFINITE_ROUND = 'Infinite';
const playedCategories = {};

/**
 * From a list of categories, returns the Array of buttons, used by Telegraf.
 * It returns 'All' button at first position, and two buttons per line for
 * every used categories
 */
export const constructCategoriesList = () => {
  const categoriesName = Object.keys(playedCategories);
  const categoriesList = [[`${CATEGORY_PREFIX}${ALL_CATEGORIES}`]];
  let line = [];
  categoriesName.forEach((category, index) => {
    line.push(category);
    if (line.length === 2 || index === categoriesName.length - 1) {
      categoriesList.push(line);
    }
  });
  return categoriesList;
};

/**
 * Check if the given category is known
 * @param categoryName: category to check
 */
export const checkIfCategoryExists = (categoryName: string): boolean => {
  return !!playedCategories[categoryName] || categoryName === ALL_CATEGORIES;
};

/**
 * Returns the list of round buttons used by Telegraf
 */
export const generateRoundButtons = () => {
  return [
    [`${ROUND_PREFIX} 10`, `${ROUND_PREFIX} 20`],
    [`${ROUND_PREFIX} 30`, `${ROUND_PREFIX} 50`],
    [`${ROUND_PREFIX} ${INFINITE_ROUND}`]
  ];
};

/**
 * Check if the given number of rounds is known
 * @param round: number of rounds to check
 */
export const checkIfRoundIsValid = (round: string): boolean => {
  return ['10', '20', '30', '50', INFINITE_ROUND].includes(round);
};