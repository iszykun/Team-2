const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

function loadController() {
  delete require.cache[require.resolve('../controllers/workoutController')];
  delete require.cache[require.resolve('../models/userModel')];
  return require('../controllers/workoutController');
}

function makeReq(body = {}, sessionUser = 'student@myrp.edu.sg') {
  return { body, session: { user: sessionUser } };
}

function makeRes() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

function withTempUsers(initialUsers, callback) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workouts-'));
  const tempFile = path.join(tempDir, 'users.json');
  fs.writeFileSync(tempFile, JSON.stringify(initialUsers, null, 2));
  process.env.USER_DATA_FILE = tempFile;

  try {
    callback(tempFile);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
    delete process.env.USER_DATA_FILE;
  }
}

test('addWorkout saves a valid gym workout with extra fields', () => {
  withTempUsers([{ email: 'student@myrp.edu.sg', workouts: [] }], (tempFile) => {
    const { addWorkout } = loadController();
    const req = makeReq({
      exerciseName: 'Bench Press',
      workoutType: 'Gym / Weightlifting',
      duration: 45,
      caloriesBurned: 320,
      date: '2026-06-29',
      muscleGroup: 'Chest',
      description: 'Incline bench press',
      sets: 3,
      reps: 10,
      weight: 60,
      difficulty: 'Hard',
      mood: '💪 Energized',
      notes: 'Pushed hard',
      tags: '#chest #pb'
    });
    const res = makeRes();

    addWorkout(req, res);

    assert.equal(res.statusCode, 201);
    const storedUsers = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
    assert.equal(storedUsers[0].workouts.length, 1);
    assert.equal(storedUsers[0].workouts[0].workoutType, 'Gym / Weightlifting');
    assert.equal(storedUsers[0].workouts[0].muscleGroup, 'Chest');
    assert.equal(storedUsers[0].workouts[0].difficulty, 'Hard');
  });
});

test('addWorkout rejects invalid numeric fields for running', () => {
  withTempUsers([{ email: 'student@myrp.edu.sg', workouts: [] }], () => {
    const { addWorkout } = loadController();
    const req = makeReq({
      exerciseName: 'Morning Run',
      workoutType: 'Running',
      duration: 30,
      caloriesBurned: 250,
      date: '2026-06-29',
      distance: 0,
      pace: '5:00',
      heartRate: 150,
      routeDescription: 'Park loop',
      difficulty: 'Medium',
      mood: '😐 Okay',
      notes: 'Nice pace'
    });
    const res = makeRes();

    addWorkout(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.payload.message, /Distance/i);
  });
});

test('editWorkout updates an existing workout record', () => {
  withTempUsers([{ email: 'student@myrp.edu.sg', workouts: [{ id: 1, exerciseName: 'Cycling', duration: 20, caloriesBurned: 180, date: '2026-06-29', workoutType: 'Cycling' }] }], () => {
    const { editWorkout } = loadController();
    const req = makeReq({ id: '1', exerciseName: 'Cycling', duration: 45, caloriesBurned: 300, date: '2026-06-29', workoutType: 'Cycling' });
    const res = makeRes();

    editWorkout(req, res);

    assert.equal(res.statusCode, 200);
  });
});

test('deleteWorkout removes a workout record', () => {
  withTempUsers([{ email: 'student@myrp.edu.sg', workouts: [{ id: 2, exerciseName: 'Yoga', duration: 15, caloriesBurned: 90, date: '2026-06-29', workoutType: 'Yoga / Stretching' }] }], () => {
    const { deleteWorkout } = loadController();
    const req = makeReq({ id: '2' });
    const res = makeRes();

    deleteWorkout(req, res);

    assert.equal(res.statusCode, 200);
  });
});

test('getWorkouts returns workout history for the current user', () => {
  withTempUsers([{ email: 'student@myrp.edu.sg', workouts: [{ id: 3, exerciseName: 'Swimming', duration: 25, caloriesBurned: 220, date: '2026-06-30', workoutType: 'Swimming' }] }], () => {
    const { getWorkouts } = loadController();
    const req = makeReq();
    const res = makeRes();

    getWorkouts(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.workouts.length, 1);
    assert.equal(res.payload.workouts[0].exerciseName, 'Swimming');
  });
});
