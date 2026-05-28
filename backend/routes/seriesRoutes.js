import express from 'express';
import * as seriesController from '../controllers/seriesController.js';
import { protect, restrictTo } from '../controllers/authController.js';
import validate from '../utils/validate.js';
import * as seriesRoutesValidationSchemas from '../utils/validationSchemas/seriesRoutesValidationSchemas.js';

const router = express.Router();

router
  .route('/')
  .get(seriesController.getAllSeries)
  .post(
    protect,
    restrictTo('admin'),
    validate(seriesRoutesValidationSchemas.createSeriesSchema),
    seriesController.createSeries,
  );

router
  .route('/:id')
  .get(seriesController.getSeries)
  .patch(
    protect,
    restrictTo('admin', 'uploader'),
    validate(seriesRoutesValidationSchemas.updateSeriesSchema),
    seriesController.updateSeries,
  )
  .delete(protect, restrictTo('admin'), seriesController.deleteSeries);

export default router;
