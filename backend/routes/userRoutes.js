const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:email', userController.getUser);
router.delete('/:email', userController.deleteUser);

module.exports = router;
