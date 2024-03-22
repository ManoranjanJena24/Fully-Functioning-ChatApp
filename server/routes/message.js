const express = require('express');

// const userController = require('../controllers/user');
const messageController = require('../controllers/message');
// const expenseController = require('../controllers/expense');

const router = express.Router();

const userAuthentication = require('../middlewares/auth')



router.post('/add-message', userAuthentication.authenticate, messageController.postAddMessage);

// router.get('/logout', userAuthentication.authenticate, userController.getLogoutUser);


module.exports = router;
