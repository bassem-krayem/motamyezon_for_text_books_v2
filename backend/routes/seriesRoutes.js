import express from 'express';
import * as seriesController from '../controllers/seriesController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .get(seriesController.getAllSeries)
  .post(protect, restrictTo(['admin']), seriesController.createSeries);

router
  .route('/:id')
  .get(seriesController.getSeries)
  .patch(
    protect,
    restrictTo(['admin', 'uploader']),
    seriesController.updateSeries,
  )
  .delete(protect, restrictTo(['admin']), seriesController.deleteSeries);

export default router;
