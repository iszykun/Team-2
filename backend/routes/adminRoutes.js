const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/users', adminController.getUsers);
router.post('/users/overview', adminController.userOverview);
router.delete('/users/:email', adminController.deleteUser);

module.exports = router;
