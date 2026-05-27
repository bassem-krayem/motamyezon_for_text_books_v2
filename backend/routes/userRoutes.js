import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// login and signup routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// logout route
router.get('/logout', authController.logout);

// forgot password route
router.post('/forgotPassword', authController.forgotPassword);

// reset password route
router.patch('/resetPassword/:token', authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

// update password route
router.patch('/updateMyPassword', authController.updatePassword);

export default router;
