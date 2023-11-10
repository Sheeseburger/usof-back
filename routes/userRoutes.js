import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:user_id', userController.getUserById);

router.use(authController.protect);

router.patch('/avatar', userController.uploadAvatar);

router.use(authController.restrictTo('admin'));
router.post('/', userController.createUser);
router
    .route('/:user_id')
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

export default router;
