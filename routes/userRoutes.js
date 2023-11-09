const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:user_id', userController.getUserById);

router.use(authController.protected);

router.patch('/avatar', userController.uploadAvatar);

router.use(authController.restrictTo('admin'));
router.post('/', userController.createUser);
router
    .route('/:user_id')
    .patch(userController.updateUser)
    .delete(userController.deleteUser);
module.exports = router;
