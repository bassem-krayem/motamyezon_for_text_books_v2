import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) Update user document
  const updatedUser = await User.findOneAndUpdate(
    { id: req.user.id },
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findOneAndUpdate({ id: req.user.id }, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
// Do NOT update passwords with this!
export const updateUser = factory.updateOne(User, 'user', [
  'firstName',
  'lastName',
  'email',
  'role',
]);
export const deleteUser = factory.deleteOne(User);
