const { readUsers, saveUsers } = require('../models/userModel');
const { normalizeEmail } = require('../middleware/helpers');

function getUsers(req, res) {
  const users = readUsers().map((user) => ({ email: user.email, createdAt: user.createdAt || 'Unknown', lastLogin: user.lastLogin || 'Never' }));
  return res.json({ success: true, users });
}

function deleteUser(req, res) {
  const email = normalizeEmail(req.body.email || req.params.email || '');
  const users = readUsers();
  const remaining = users.filter((user) => normalizeEmail(user.email) !== email);
  if (remaining.length === users.length) return res.status(404).json({ success: false, message: 'User not found' });
  saveUsers(remaining);
  return res.json({ success: true, message: 'User deleted' });
}

function userOverview(req, res) {
  const email = normalizeEmail(req.body.email || '');
  const users = readUsers();
  const user = users.find((item) => normalizeEmail(item.email) === email);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const foodCount = Array.isArray(user.calories?.foods) ? user.calories.foods.length : 0;
  const totalCalories = Array.isArray(user.calories?.foods)
    ? user.calories.foods.reduce((sum, food) => sum + Number(food.calories || 0), 0)
    : 0;

  return res.json({ success: true, overview: { email: user.email, createdAt: user.createdAt || 'Unknown', lastLogin: user.lastLogin || 'Never', foodCount, totalCalories } });
}

module.exports = { getUsers, deleteUser, userOverview };
