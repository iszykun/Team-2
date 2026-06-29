const express = require('express');
const goalController = require('../controllers/goalController');
const { requireSession } = require('../middleware/helpers');
const router = express.Router();

router.get('/', requireSession, goalController.getGoal);
<<<<<<< HEAD
router.post('/', requireSession, goalController.setGoal);
router.get('/calendar', requireSession, goalController.getCalendar);
=======
router.post('/', requireSession, goalController.saveGoal);
router.get('/calendar', requireSession, goalController.calendar);
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)

module.exports = router;
