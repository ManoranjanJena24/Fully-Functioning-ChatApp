const express = require('express');

// const userController = require('../controllers/user');
const groupController = require('../controllers/group');
// const expenseController = require('../controllers/expense');

const router = express.Router();

const userAuthentication = require('../middlewares/auth')



router.post('/join', userAuthentication.authenticate, groupController.joinGroup);
router.post('/create', userAuthentication.authenticate, groupController.createGroup);

router.get('/get-groups', userAuthentication.authenticate, groupController.getGroups);
// router.post('/addUser', userAuthentication.authenticate, groupController.postAddUserToGroup); // todo-in frotnend..pass token in headers
router.post('/addUser', groupController.postAddUserToGroup);

module.exports = router;
