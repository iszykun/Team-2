const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');
<<<<<<< HEAD

function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
=======
const ACTIVE_DATA_FILE = process.env.USER_DATA_FILE || DATA_FILE;

function ensureDataFile() {
  const dataDir = path.dirname(ACTIVE_DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(ACTIVE_DATA_FILE)) fs.writeFileSync(ACTIVE_DATA_FILE, '[]');
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
}

function readUsers() {
  ensureDataFile();
<<<<<<< HEAD
  const rawData = fs.readFileSync(DATA_FILE, 'utf8').trim();
=======
  const rawData = fs.readFileSync(ACTIVE_DATA_FILE, 'utf8').trim();
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
  if (!rawData) return [];
  return JSON.parse(rawData);
}

function saveUsers(users) {
  ensureDataFile();
<<<<<<< HEAD
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
=======
  fs.writeFileSync(ACTIVE_DATA_FILE, JSON.stringify(users, null, 2));
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
}

function sanitizeUser(user) {
  return {
    email: user.email,
    createdAt: user.createdAt || 'Unknown',
    lastLogin: user.lastLogin || 'Never',
    profile: user.profile || null,
    calories: user.calories || { date: new Date().toISOString().split('T')[0], foods: [] }
  };
}

module.exports = { readUsers, saveUsers, sanitizeUser };
