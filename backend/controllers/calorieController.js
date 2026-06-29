const { readUsers, saveUsers } = require('../models/userModel');
const { getToday, normalizeEmail } = require('../middleware/helpers');

function findSessionUser(users, email) {
  return users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

function ensureCalories(user) {
  user.calories = user.calories || { date: getToday(), foods: [] };
  user.calories.date = user.calories.date || getToday();
  user.calories.foods = Array.isArray(user.calories.foods) ? user.calories.foods : [];
}

function getProfile(req, res) {
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureCalories(user);
  saveUsers(users);
  return res.json({ success: true, calories: { date: user.calories.date, foods: user.calories.foods } });
}

function addFood(req, res) {
  const name = String(req.body.name || '').trim();
  const calories = Number(req.body.calories);
  if (!name || !Number.isFinite(calories) || calories <= 0) {
    return res.status(400).json({ success: false, message: 'Enter a food name and calories above 0' });
  }

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureCalories(user);
  user.calories.foods.push({ id: Date.now(), name, calories: Math.round(calories) });
  saveUsers(users);
  return res.status(201).json({ success: true });
}

function editFood(req, res) {
  const id = String(req.body.id || '');
  const name = String(req.body.name || '').trim();
  const calories = Number(req.body.calories);
  if (!id || !name || !Number.isFinite(calories) || calories <= 0) {
    return res.status(400).json({ success: false, message: 'Valid food details are required' });
  }

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureCalories(user);
  const food = user.calories.foods.find((item) => String(item.id) === id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

  food.name = name;
  food.calories = Math.round(calories);
  saveUsers(users);
  return res.json({ success: true });
}

function deleteFood(req, res) {
  const id = String(req.body.id || '');
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureCalories(user);
  const beforeCount = user.calories.foods.length;
  user.calories.foods = user.calories.foods.filter((food) => String(food.id) !== id);
  if (user.calories.foods.length === beforeCount) return res.status(404).json({ success: false, message: 'Food not found' });
  saveUsers(users);
  return res.json({ success: true });
}

function resetFoods(req, res) {
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureCalories(user);
  user.calories.date = getToday();
  user.calories.foods = [];
  saveUsers(users);
  return res.json({ success: true });
}

module.exports = { getProfile, addFood, editFood, deleteFood, resetFoods };
