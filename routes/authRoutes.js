import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/password-reset', authController.sendPasswordResetEmail);
router.post(
    '/password-reset/:confirm_token',
    authController.confirmPasswordReset
);

export default router;
