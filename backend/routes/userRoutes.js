import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// login and signup routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// logout route
router.get('/logout', authController.logout);

export default router;
