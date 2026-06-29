const { readUsers, saveUsers } = require('../models/userModel');
const { getToday, normalizeEmail } = require('../middleware/helpers');

function findSessionUser(users, email) {
  return users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

function getGoal(req, res) {
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const goal = user.goal !== undefined ? user.goal : null;
  const goalHistory = typeof user.goalHistory === 'object' && user.goalHistory !== null ? user.goalHistory : {};
  const caloriesConsumed = Array.isArray(user.calories?.foods)
    ? user.calories.foods.reduce((sum, food) => sum + Number(food.calories || 0), 0)
    : 0;
  const caloriesRemaining = goal !== null ? Math.max(goal - caloriesConsumed, 0) : null;
  return res.json({ success: true, goal, caloriesConsumed, caloriesRemaining, goalHistory });
}

function saveGoal(req, res) {
  const goal = Number(String(req.body.goal || '').trim());
  if (!Number.isFinite(goal) || goal < 0) return res.status(400).json({ success: false, message: 'Goal must be a non-negative number' });

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.goal = goal;
  user.goalHistory = typeof user.goalHistory === 'object' && user.goalHistory !== null ? user.goalHistory : {};
  user.goalHistory[getToday()] = goal;
  saveUsers(users);
  return res.json({ success: true, message: 'Saved successfully' });
}

function calendar(req, res) {
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const goalHistory = typeof user.goalHistory === 'object' && user.goalHistory !== null ? user.goalHistory : {};
  const results = {};
  Object.entries(goalHistory).forEach(([date, goal]) => {
    if (date.startsWith(`${year}-${String(month).padStart(2, '0')}`)) {
      results[date] = { status: Number(goal) > 0 ? 'green' : 'neutral' };
    }
  });
  return res.json({ success: true, results, today: getToday() });
}

module.exports = { getGoal, saveGoal, calendar };
