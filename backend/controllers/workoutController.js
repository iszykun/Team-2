const { readUsers, saveUsers } = require('../models/userModel');
const { getToday, normalizeEmail } = require('../middleware/helpers');

function findSessionUser(users, email) {
  return users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

function ensureWorkouts(user) {
  user.workouts = Array.isArray(user.workouts) ? user.workouts : [];
}

function validateWorkoutPayload(payload) {
  const exerciseName = String(payload.exerciseName || '').trim();
  const duration = Number(payload.duration);
  const caloriesBurned = Number(payload.caloriesBurned);
  const date = String(payload.date || '').trim() || getToday();

  if (!exerciseName) return { valid: false, message: 'Exercise name is required' };
  if (!Number.isFinite(duration) || duration <= 0) return { valid: false, message: 'Duration must be greater than 0' };
  if (!Number.isFinite(caloriesBurned) || caloriesBurned <= 0) return { valid: false, message: 'Calories burned must be greater than 0' };
  if (!date || Number.isNaN(Date.parse(date))) return { valid: false, message: 'A valid workout date is required' };

  return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date };
}

function getWorkouts(req, res) {
  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureWorkouts(user);
  const workouts = [...user.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  return res.json({ success: true, workouts });
}

function addWorkout(req, res) {
  const validation = validateWorkoutPayload(req.body);
  if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureWorkouts(user);
  user.workouts.push({
    id: Date.now(),
    exerciseName: validation.exerciseName,
    duration: validation.duration,
    caloriesBurned: validation.caloriesBurned,
    date: validation.date
  });

  saveUsers(users);
  return res.status(201).json({ success: true, message: 'Workout saved successfully' });
}

function editWorkout(req, res) {
  const id = String(req.body.id || req.params.id || '');
  const validation = validateWorkoutPayload(req.body);
  if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });
  if (!id) return res.status(400).json({ success: false, message: 'Workout id is required' });

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureWorkouts(user);
  const workout = user.workouts.find((item) => String(item.id) === String(id));
  if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });

  workout.exerciseName = validation.exerciseName;
  workout.duration = validation.duration;
  workout.caloriesBurned = validation.caloriesBurned;
  workout.date = validation.date;

  saveUsers(users);
  return res.json({ success: true, message: 'Workout updated successfully' });
}

function deleteWorkout(req, res) {
  const id = String(req.body.id || req.params.id || '');
  if (!id) return res.status(400).json({ success: false, message: 'Workout id is required' });

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureWorkouts(user);
  const beforeCount = user.workouts.length;
  user.workouts = user.workouts.filter((workout) => String(workout.id) !== String(id));
  if (user.workouts.length === beforeCount) return res.status(404).json({ success: false, message: 'Workout not found' });

  saveUsers(users);
  return res.json({ success: true, message: 'Workout deleted successfully' });
}

module.exports = { getWorkouts, addWorkout, editWorkout, deleteWorkout };
