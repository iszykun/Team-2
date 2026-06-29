const express = require('express');
const goalController = require('../controllers/goalController');
const { requireSession } = require('../middleware/helpers');
const router = express.Router();

router.get('/', requireSession, goalController.getGoal);
router.post('/', requireSession, goalController.setGoal);
router.get('/calendar', requireSession, goalController.getCalendar);

module.exports = router;
