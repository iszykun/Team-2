const express = require('express');
const workoutController = require('../controllers/workoutController');
const { requireSession } = require('../middleware/helpers');

const router = express.Router();

router.get('/', requireSession, workoutController.getWorkouts);
router.post('/', requireSession, workoutController.addWorkout);
router.put('/:id', requireSession, (req, res, next) => { req.body.id = req.params.id; workoutController.editWorkout(req, res, next); });
router.delete('/:id', requireSession, (req, res, next) => { req.body.id = req.params.id; workoutController.deleteWorkout(req, res, next); });

module.exports = router;
