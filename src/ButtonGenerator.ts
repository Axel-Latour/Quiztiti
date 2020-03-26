export const ALL_CATEGORIES = 'All';
const playedCategories = {
  'Movies': 11,
  'Music': 12,
  'Video Games': 15,
  'Science & Nature': 17,
  'Anime & Manga': 31,
};

export const constructCategoriesList = () => {
  const categoriesName = Object.keys(playedCategories);
  const categoriesList = [[ALL_CATEGORIES]];
  let line = [];
  categoriesName.forEach((category, index) => {
    line.push(category);
    if (line.length === 2 || index === categoriesName.length - 1) {
      categoriesList.push(line);
      line = [];
    }
  });
  return categoriesList;
};

export const checkIfCategoryExists = (categoryName: string) => {
  return !!playedCategories[categoryName] || categoryName === ALL_CATEGORIES;
};

export const generateRoundButtons = () => {
  return [
    ['10', '20'],
    ['30', '50'],
  ];
};

export const checkIfRoundIsValid = (round: string) => {
  return ['10', '20', '30', '50'].includes(round);
};