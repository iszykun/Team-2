<<<<<<< HEAD
﻿const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();
router.get('/users', adminController.getUsers);
router.delete('/users/:email', (req, res, next) => { req.body.email = req.params.email; adminController.deleteUser(req, res, next); });
router.post('/users/delete', adminController.deleteUser);
router.post('/users/overview', adminController.userOverview);
=======
const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/users', adminController.getUsers);
router.post('/users/overview', adminController.userOverview);
router.delete('/users/:email', adminController.deleteUser);

>>>>>>> 8bc3a3c (feat: implement workout tracker - add, edit, delete, dashboard, validation)
module.exports = router;
