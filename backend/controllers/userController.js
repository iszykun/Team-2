<<<<<<< HEAD
﻿const { readUsers, sanitizeUser } = require('../models/userModel');
const { normalizeEmail } = require('../middleware/helpers');

function getCurrentUser(req, res) {
  const email = normalizeEmail(req.session.user);
  const user = readUsers().find((item) => normalizeEmail(item.email) === email);
=======
const { readUsers, saveUsers, sanitizeUser } = require('../models/userModel');
const { normalizeEmail } = require('../middleware/helpers');

function getUsers(req, res) {
  const users = readUsers().map((user) => sanitizeUser(user));
  return res.json({ success: true, users });
}

function getUser(req, res) {
  const email = normalizeEmail(req.params.email);
  const users = readUsers();
  const user = users.find((item) => normalizeEmail(item.email) === email);
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, user: sanitizeUser(user) });
}

<<<<<<< HEAD
function listUsers(req, res) {
  const users = readUsers().map(sanitizeUser);
  return res.json({ success: true, users });
}

module.exports = { getCurrentUser, listUsers };
=======
function deleteUser(req, res) {
  const email = normalizeEmail(req.params.email);
  const users = readUsers();
  const filtered = users.filter((user) => normalizeEmail(user.email) !== email);
  if (filtered.length === users.length) return res.status(404).json({ success: false, message: 'User not found' });
  saveUsers(filtered);
  return res.json({ success: true, message: 'User deleted' });
}

module.exports = { getUsers, getUser, deleteUser };
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
