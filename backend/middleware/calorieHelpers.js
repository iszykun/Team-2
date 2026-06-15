const { getToday } = require('./helpers');

function getTotalCalories(foods) {
  if (!Array.isArray(foods)) return 0;
  return foods.reduce((sum, item) => sum + Number(item.calories || 0), 0);
}

function ensureCalories(user) {
  user.calories = user.calories || { date: getToday(), foods: [] };
  user.calorieHistory = typeof user.calorieHistory === 'object' && user.calorieHistory !== null ? user.calorieHistory : {};

  const today = getToday();
  if (user.calories.date !== today) {
    const previousDate = user.calories.date;
    const total = getTotalCalories(user.calories.foods);
    if (total > 0) {
      user.calorieHistory[previousDate] = total;
    }
    user.calories.date = today;
    user.calories.foods = [];
  }

  user.calories.foods = Array.isArray(user.calories.foods) ? user.calories.foods : [];
}

function updateTodayHistory(user) {
  ensureCalories(user);
  const total = getTotalCalories(user.calories.foods);
  user.calorieHistory[getToday()] = total;
}

module.exports = { getTotalCalories, ensureCalories, updateTodayHistory };
