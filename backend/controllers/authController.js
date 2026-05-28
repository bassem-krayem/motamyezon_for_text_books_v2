import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Sign up a new user
export const signup = catchAsync(async (req, res, next) => {
  // verify fields
  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.email ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    // tell what the feilds are needed

    return next(
      new AppError(
        'Please provide firstName, lastName, email, password, and passwordConfirm fields',
        400,
      ),
    );
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

// Login user
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // If everything is ok, send token to client
  createSendToken(user, 200, res);
});

// Logout user
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // SECURITY ADDITION: Reject access if account has been deactivated
  if (currentUser.active === false) {
    return next(new AppError('This user account has been deactivated.', 401));
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };

export const forgotPassword = catchAsync(async (req, res, next) => {
  // check if the email field is provided
  if (!req.body.email) {
    return next(new AppError('Please provide your email address', 400));
  }

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/resetPassword/${resetToken}`;
    // if there is no credentials for sending email, log the reset URL to the console (for development) and send a success response
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USERNAME ||
      !process.env.EMAIL_PASSWORD
    ) {
      console.log(
        'Email credentials are not set. For testing purposes, here is the password reset URL:',
        resetURL,
      );
      return res.status(200).json({
        status: 'success',
        message:
          'Token sent to email! (Note: Email credentials are not set, so the reset URL is logged to the console for testing purposes)',
      });
    }

    await new Email(user, resetURL).sendPasswordReset();

    // for testing purposes log the reset URL to the console as well later i will comment this out
    console.log('Password reset URL (also sent to email):', resetURL);
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500,
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  // check if the token is provided
  if (!req.params.token) {
    return next(new AppError('Please provide the reset token', 400));
  }

  // check if the password and passwordConfirm fields are provided
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(
      new AppError(
        'Please provide both password and passwordConfirm fields',
        400,
      ),
    );
  }

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // if the password provided in the request body does not match the passwordConfirm field, return an error
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // if the password provided is the same as the current password, return an error
  if (await user.correctPassword(req.body.password, user.password)) {
    return next(
      new AppError(
        "You are using the same password as before. why don't you try to log in with it? Or choose a different one.",
        400,
      ),
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3)the property changedPasswordAt will be set in userModel pre save middleware
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // check if the passwordCurrent, password, and passwordConfirm fields are provided
  if (
    !req.body.currentPassword ||
    !req.body.password ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        'Please provide currentPassword, password, and passwordConfirm fields',
        400,
      ),
    );
  }

  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // if the new password provided in the request body does not match the passwordConfirm field, return an error
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // if the new password provided is the same as the current password, return an error
  if (await user.correctPassword(req.body.password, user.password)) {
    return next(
      new AppError(
        "You are using the same password as before. why don't you try to log in with it? Or choose a different one.",
        400,
      ),
    );
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
