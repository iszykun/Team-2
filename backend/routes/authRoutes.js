<<<<<<< HEAD
﻿const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/session', authController.checkSession);
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);
=======
const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/check-session', authController.checkSession);

>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
module.exports = router;
