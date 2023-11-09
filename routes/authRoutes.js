const express = require('express');

const authController = require('../controllers/authController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/password-reset', authController.sendPasswordResetEmail);
router.post(
    '/password-reset/:confirm_token',
    authController.confirmPasswordReset
);

module.exports = router;
