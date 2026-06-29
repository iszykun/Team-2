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

test('addWorkout saves a valid workout record', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workouts-'));
  const tempFile = path.join(tempDir, 'users.json');
  fs.writeFileSync(tempFile, JSON.stringify([{ email: 'student@myrp.edu.sg', workouts: [] }], null, 2));
  process.env.USER_DATA_FILE = tempFile;

  const { addWorkout } = loadController();
  const req = makeReq({ exerciseName: 'Running', duration: 30, caloriesBurned: 250, date: '2026-06-29' });
  const res = makeRes();

  addWorkout(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.payload.success, true);
  const storedUsers = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
  assert.equal(storedUsers[0].workouts.length, 1);
  assert.equal(storedUsers[0].workouts[0].exerciseName, 'Running');

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.USER_DATA_FILE;
});

test('editWorkout updates an existing workout record', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workouts-'));
  const tempFile = path.join(tempDir, 'users.json');
  fs.writeFileSync(tempFile, JSON.stringify([{ email: 'student@myrp.edu.sg', workouts: [{ id: 1, exerciseName: 'Cycling', duration: 20, caloriesBurned: 180, date: '2026-06-29' }] }], null, 2));
  process.env.USER_DATA_FILE = tempFile;

  const { editWorkout } = loadController();
  const req = makeReq({ id: '1', exerciseName: 'Cycling', duration: 45, caloriesBurned: 300, date: '2026-06-29' });
  const res = makeRes();

  editWorkout(req, res);

  assert.equal(res.statusCode, 200);
  const storedUsers = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
  assert.equal(storedUsers[0].workouts[0].duration, 45);
  assert.equal(storedUsers[0].workouts[0].caloriesBurned, 300);

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.USER_DATA_FILE;
});

test('deleteWorkout removes a workout record', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workouts-'));
  const tempFile = path.join(tempDir, 'users.json');
  fs.writeFileSync(tempFile, JSON.stringify([{ email: 'student@myrp.edu.sg', workouts: [{ id: 2, exerciseName: 'Yoga', duration: 15, caloriesBurned: 90, date: '2026-06-29' }] }], null, 2));
  process.env.USER_DATA_FILE = tempFile;

  const { deleteWorkout } = loadController();
  const req = makeReq({ id: '2' });
  const res = makeRes();

  deleteWorkout(req, res);

  assert.equal(res.statusCode, 200);
  const storedUsers = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
  assert.equal(storedUsers[0].workouts.length, 0);

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.USER_DATA_FILE;
});

test('getWorkouts returns workout history for the current user', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'workouts-'));
  const tempFile = path.join(tempDir, 'users.json');
  fs.writeFileSync(tempFile, JSON.stringify([{ email: 'student@myrp.edu.sg', workouts: [{ id: 3, exerciseName: 'Swimming', duration: 25, caloriesBurned: 220, date: '2026-06-30' }] }], null, 2));
  process.env.USER_DATA_FILE = tempFile;

  const { getWorkouts } = loadController();
  const req = makeReq();
  const res = makeRes();

  getWorkouts(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.success, true);
  assert.equal(res.payload.workouts.length, 1);
  assert.equal(res.payload.workouts[0].exerciseName, 'Swimming');

  fs.rmSync(tempDir, { recursive: true, force: true });
  delete process.env.USER_DATA_FILE;
});
