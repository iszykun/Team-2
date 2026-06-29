const { readUsers, saveUsers } = require('../models/userModel');
const { getToday, normalizeEmail } = require('../middleware/helpers');

function findSessionUser(users, email) {
  return users.find((user) => normalizeEmail(user.email) === normalizeEmail(email));
}

function ensureWorkouts(user) {
  user.workouts = Array.isArray(user.workouts) ? user.workouts : [];
}

function getPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function validateWorkoutPayload(payload, existingWorkout = {}) {
  const exerciseName = String(payload.exerciseName || (existingWorkout.exerciseName || '')).trim();
  const duration = getPositiveNumber(payload.duration !== undefined ? payload.duration : existingWorkout.duration);
  const caloriesBurned = getPositiveNumber(payload.caloriesBurned !== undefined ? payload.caloriesBurned : existingWorkout.caloriesBurned);
  const date = String(payload.date || (existingWorkout.date || '')).trim() || getToday();
  const workoutType = String(payload.workoutType || (existingWorkout.workoutType || 'Other')).trim() || 'Other';
  const difficulty = String(payload.difficulty || (existingWorkout.difficulty || '')).trim();
  const mood = String(payload.mood || (existingWorkout.mood || '')).trim();
  const notes = String(payload.notes || (existingWorkout.notes || '')).trim();
  const tags = String(payload.tags || (existingWorkout.tags || '')).trim();
  const isEdit = Object.keys(existingWorkout || {}).length > 0;

  if (!exerciseName) return { valid: false, message: 'Exercise name is required' };
  if (!duration) return { valid: false, message: 'Duration must be greater than 0' };
  if (!caloriesBurned) return { valid: false, message: 'Calories burned must be greater than 0' };
  if (!date || Number.isNaN(Date.parse(date))) return { valid: false, message: 'A valid workout date is required' };
  if (!isEdit && !difficulty) return { valid: false, message: 'Difficulty is required' };
  if (!isEdit && !mood) return { valid: false, message: 'Mood is required' };

  const commonFields = {
    workoutType,
    difficulty,
    mood,
    notes,
    tags
  };

  if (workoutType === 'Gym / Weightlifting') {
    const hadSpecificData = payload.sets !== undefined || payload.reps !== undefined || payload.weight !== undefined || payload.muscleGroup !== undefined || payload.description !== undefined;
    const muscleGroup = String(payload.muscleGroup || (existingWorkout.muscleGroup || '')).trim();
    const sets = getPositiveNumber(payload.sets !== undefined ? payload.sets : existingWorkout.sets);
    const reps = getPositiveNumber(payload.reps !== undefined ? payload.reps : existingWorkout.reps);
    const weight = getPositiveNumber(payload.weight !== undefined ? payload.weight : existingWorkout.weight);
    if (hadSpecificData && (!muscleGroup || !sets || !reps || !weight)) {
      if (!muscleGroup) return { valid: false, message: 'Muscle group is required for gym workouts' };
      if (!sets) return { valid: false, message: 'Sets must be greater than 0' };
      if (!reps) return { valid: false, message: 'Reps must be greater than 0' };
      if (!weight) return { valid: false, message: 'Weight must be greater than 0' };
    }
    return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields, muscleGroup, description: String(payload.description || (existingWorkout.description || '')).trim(), sets: sets ? Math.round(sets) : existingWorkout.sets, reps: reps ? Math.round(reps) : existingWorkout.reps, weight: weight ? Math.round(weight) : existingWorkout.weight };
  }

  if (workoutType === 'Running') {
    const hadSpecificData = payload.distance !== undefined || payload.heartRate !== undefined || payload.pace !== undefined || payload.routeDescription !== undefined;
    const distance = getPositiveNumber(payload.distance !== undefined ? payload.distance : existingWorkout.distance);
    const heartRate = getPositiveNumber(payload.heartRate !== undefined ? payload.heartRate : existingWorkout.heartRate);
    if (hadSpecificData && (!distance || !heartRate)) {
      if (!distance) return { valid: false, message: 'Distance must be greater than 0' };
      if (!heartRate) return { valid: false, message: 'Heart rate must be greater than 0' };
    }
    return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields, distance: distance ? Number(distance.toFixed(2)) : existingWorkout.distance, pace: String(payload.pace || (existingWorkout.pace || '')).trim(), heartRate: heartRate ? Math.round(heartRate) : existingWorkout.heartRate, routeDescription: String(payload.routeDescription || (existingWorkout.routeDescription || '')).trim() };
  }

  if (workoutType === 'Cycling') {
    const hadSpecificData = payload.distance !== undefined || payload.averageSpeed !== undefined || payload.elevationGain !== undefined;
    const distance = getPositiveNumber(payload.distance !== undefined ? payload.distance : existingWorkout.distance);
    const averageSpeed = getPositiveNumber(payload.averageSpeed !== undefined ? payload.averageSpeed : existingWorkout.averageSpeed);
    const elevationGain = getPositiveNumber(payload.elevationGain !== undefined ? payload.elevationGain : existingWorkout.elevationGain);
    if (hadSpecificData && (!distance || !averageSpeed || !elevationGain)) {
      if (!distance) return { valid: false, message: 'Distance must be greater than 0' };
      if (!averageSpeed) return { valid: false, message: 'Average speed must be greater than 0' };
      if (!elevationGain) return { valid: false, message: 'Elevation gain must be greater than 0' };
    }
    return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields, distance: distance ? Number(distance.toFixed(2)) : existingWorkout.distance, averageSpeed: averageSpeed ? Number(averageSpeed.toFixed(2)) : existingWorkout.averageSpeed, elevationGain: elevationGain ? Math.round(elevationGain) : existingWorkout.elevationGain };
  }

  if (workoutType === 'Swimming') {
    const hadSpecificData = payload.laps !== undefined || payload.poolLength !== undefined || payload.strokeType !== undefined;
    const laps = getPositiveNumber(payload.laps !== undefined ? payload.laps : existingWorkout.laps);
    const poolLength = getPositiveNumber(payload.poolLength !== undefined ? payload.poolLength : existingWorkout.poolLength);
    if (hadSpecificData && (!laps || !poolLength)) {
      if (!laps) return { valid: false, message: 'Number of laps must be greater than 0' };
      if (!poolLength) return { valid: false, message: 'Pool length must be greater than 0' };
    }
    return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields, laps: laps ? Math.round(laps) : existingWorkout.laps, poolLength: poolLength ? Math.round(poolLength) : existingWorkout.poolLength, strokeType: String(payload.strokeType || (existingWorkout.strokeType || '')).trim() };
  }

  if (workoutType === 'Yoga / Stretching') {
    const hadSpecificData = payload.sessionType !== undefined || payload.poses !== undefined;
    const sessionType = String(payload.sessionType || (existingWorkout.sessionType || '')).trim();
    if (hadSpecificData && !sessionType) return { valid: false, message: 'Session type is required for yoga sessions' };
    return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields, sessionType, poses: String(payload.poses || (existingWorkout.poses || '')).trim() };
  }

  if (workoutType === 'Other') {
    return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields, description: String(payload.description || (existingWorkout.description || '')).trim() };
  }

  return { valid: true, exerciseName, duration: Math.round(duration), caloriesBurned: Math.round(caloriesBurned), date, ...commonFields };
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
    date: validation.date,
    ...validation
  });

  saveUsers(users);
  return res.status(201).json({ success: true, message: 'Workout saved successfully' });
}

function editWorkout(req, res) {
  const id = String(req.body.id || req.params.id || '');
  if (!id) return res.status(400).json({ success: false, message: 'Workout id is required' });

  const users = readUsers();
  const user = findSessionUser(users, req.session.user);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  ensureWorkouts(user);
  const workout = user.workouts.find((item) => String(item.id) === String(id));
  if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });

  const validation = validateWorkoutPayload(req.body, workout);
  if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });

  Object.assign(workout, validation);

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
