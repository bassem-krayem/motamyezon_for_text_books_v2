import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const filterFields = (obj, allowedFields) => {
  if (!Array.isArray(allowedFields) || allowedFields.length === 0) return obj;

  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) filtered[key] = obj[key];
  });
  return filtered;
};

// CREATE
export const createOne = (Model, allowedFields = []) =>
  catchAsync(async (req, res, next) => {
    const filteredBody = filterFields(req.body, allowedFields);
    const doc = await Model.create(filteredBody);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

// READ - GET ONE
export const getOne = (Model, popOptions, resourceName = 'document') =>
  catchAsync(async (req, res, next) => {
    let query = Model.findOne({ id: req.params.id });

    if (Array.isArray(popOptions)) {
      popOptions.forEach((popOption) => {
        query = query.populate(popOption);
      });
    } else if (popOptions) {
      query = query.populate(popOptions);
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

// READ - GET ALL
export const getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (Array.isArray(popOptions)) {
      popOptions.forEach((popOption) => {
        features.query = features.query.populate(popOption);
      });
    } else if (popOptions) {
      features.query = features.query.populate(popOptions);
    }

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: doc,
    });
  });

// UPDATE
export const updateOne = (
  Model,
  resourceName = 'document',
  allowedFields = [],
) =>
  catchAsync(async (req, res, next) => {
    const filteredBody = filterFields(req.body, allowedFields);
    const doc = await Model.findOneAndUpdate(
      { id: req.params.id },
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!doc) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

// DELETE
export const deleteOne = (Model, resourceName = 'document') =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ id: req.params.id });

    if (!doc) {
      return next(new AppError(`No ${resourceName} found with that ID`, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
