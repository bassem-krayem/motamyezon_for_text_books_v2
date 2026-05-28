import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import * as factory from './handlerFactory.js';

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findOneAndUpdate(
    { id: req.user.id },
    req.body,
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

export const updateUser = factory.updateOne(User, 'user');
export const deleteUser = factory.deleteOne(User);
