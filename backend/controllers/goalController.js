const { readUsers, saveUsers } = require('../models/userModel');
const { getToday, normalizeEmail } = require('../middleware/helpers');
const { getTotalCalories, ensureCalories } = require('../middleware/calorieHelpers');

function findSessionUser(users, email) {
  return users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

function getGoal(req, res) {
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureCalories(user);
  const goal = Number.isInteger(user.goal) ? user.goal : null;
  const caloriesConsumed = getTotalCalories(user.calories.foods);
  const caloriesRemaining = goal !== null ? Math.max(goal - caloriesConsumed, 0) : null;

  saveUsers(users);
  return res.json({ success: true, goal, caloriesConsumed, caloriesRemaining, today: getToday() });
}

function setGoal(req, res) {
  const rawGoal = String(req.body.goal || '').trim();
  if (!rawGoal) {
    return res.status(400).json({ success: false, message: 'Goal is required' });
  }

  const goal = Number(rawGoal);
  if (!Number.isFinite(goal) || !Number.isInteger(goal)) {
    return res.status(400).json({ success: false, message: 'Goal must be a whole number' });
  }

  if (goal < 500 || goal > 10000) {
    return res.status(400).json({ success: false, message: 'Goal must be between 500 and 10000 calories' });
  }

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.goal = goal;
  user.goalHistory = typeof user.goalHistory === 'object' && user.goalHistory !== null ? user.goalHistory : {};
  user.goalHistory[getToday()] = goal;

  ensureCalories(user);
  saveUsers(users);
  return res.json({ success: true, goal });
}

function getCalendar(req, res) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ success: false, message: 'Valid year and month are required' });
  }

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureCalories(user);
  const today = getToday();
  const goal = Number.isInteger(user.goal) ? user.goal : null;
  const daysInMonth = new Date(year, month, 0).getDate();
  const results = {};

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let status = 'neutral';
    let calories = null;

    if (dayString <= today) {
      if (user.calorieHistory && Object.prototype.hasOwnProperty.call(user.calorieHistory, dayString)) {
        calories = Number(user.calorieHistory[dayString]);
      } else if (dayString === today) {
        calories = getTotalCalories(user.calories.foods);
      }

      if (calories !== null && goal !== null) {
        status = calories <= goal ? 'green' : 'red';
      }
    }

    results[dayString] = { calories, status };
  }

  saveUsers(users);
  return res.json({ success: true, year, month, results, today });
}

module.exports = { getGoal, setGoal, getCalendar };
