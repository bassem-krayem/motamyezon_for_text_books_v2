import express from 'express';
import * as seriesController from '../controllers/seriesController.js';

const router = express.Router();

router
  .route('/')
  .get(seriesController.getAllSeries)
  .post(seriesController.createSeries);

router
  .route('/:id')
  .get(seriesController.getSeries)
  .patch(seriesController.updateSeries)
  .delete(seriesController.deleteSeries);

export default router;
