const playedCategories = {
  'Movies': 11,
  'Music': 12,
  'Video Games': 15,
  'Science & Nature': 17,
  'Anime & Manga': 31,
};

const constructCategoriesList = () => {
  const categoriesName = Object.keys(playedCategories);
  const categoriesList = [['All']];
  let line = [];
  categoriesName.forEach((category, index) => {
    line.push(category);
    if(line.length === 2 || index === categoriesName.length - 1) {
      categoriesList.push(line);
      line = [];
    }
  });
  return categoriesList;
};