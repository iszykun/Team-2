<<<<<<< HEAD
﻿const express = require('express');
const userController = require('../controllers/userController');
const { requireSession } = require('../middleware/helpers');
const router = express.Router();
router.get('/me', requireSession, userController.getCurrentUser);
router.get('/', userController.listUsers);
=======
const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:email', userController.getUser);
router.delete('/:email', userController.deleteUser);

>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
module.exports = router;
