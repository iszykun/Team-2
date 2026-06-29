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
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, user: sanitizeUser(user) });
}

function deleteUser(req, res) {
  const email = normalizeEmail(req.params.email);
  const users = readUsers();
  const filtered = users.filter((user) => normalizeEmail(user.email) !== email);
  if (filtered.length === users.length) return res.status(404).json({ success: false, message: 'User not found' });
  saveUsers(filtered);
  return res.json({ success: true, message: 'User deleted' });
}

module.exports = { getUsers, getUser, deleteUser };
