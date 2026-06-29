<<<<<<< HEAD
﻿const express = require('express');
=======
const express = require('express');
>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
const calorieController = require('../controllers/calorieController');
const { requireSession } = require('../middleware/helpers');
const router = express.Router();
router.get('/profile', requireSession, calorieController.getProfile);
router.post('/', requireSession, calorieController.addFood);
router.put('/:id', requireSession, (req, res, next) => { req.body.id = req.params.id; calorieController.editFood(req, res, next); });
router.delete('/:id', requireSession, (req, res, next) => { req.body.id = req.params.id; calorieController.deleteFood(req, res, next); });
router.post('/reset', requireSession, calorieController.resetFoods);
module.exports = router;
