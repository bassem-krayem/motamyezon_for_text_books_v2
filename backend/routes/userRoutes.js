import express from 'express';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import validate from '../utils/validate.js';
import * as userRoutesValidationSchemas from '../utils/validationSchemas/userRoutesValidationSchemas.js';

const router = express.Router();

// login and signup routes
router.post(
  '/signup',
  validate(userRoutesValidationSchemas.signupSchema),
  authController.signup,
);
router.post(
  '/login',
  validate(userRoutesValidationSchemas.loginSchema),
  authController.login,
);

// logout route
router.get('/logout', authController.logout);

// forgot password route
router.post(
  '/forgotPassword',
  validate(userRoutesValidationSchemas.forgotPasswordSchema),
  authController.forgotPassword,
);

// reset password route
router.patch(
  '/resetPassword/:token',
  validate(userRoutesValidationSchemas.resetPasswordSchema),
  authController.resetPassword,
);

// protect all routes after this middleware
router.use(authController.protect);

// update password route
router.patch(
  '/updateMyPassword',
  validate(userRoutesValidationSchemas.updatePasswordSchema),
  authController.updatePassword,
);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  validate(userRoutesValidationSchemas.updateMeSchema),
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

// restrict to admin only for the routes after this middleware
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    validate(userRoutesValidationSchemas.adminUpdateUserSchema),
    userController.updateUser,
  )
  .delete(userController.deleteUser);

export default router;
